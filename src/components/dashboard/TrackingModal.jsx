import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, MapPin, Navigation, Clock, User } from "lucide-react";
import { bookingService } from "../../api/services/booking";
import toast from "react-hot-toast";

function TrackingModal({ bookingId, isOpen, onClose }) {
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [animationFinished, setAnimationFinished] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);

  useEffect(() => {
    if (isOpen && bookingId) {
      fetchTrackingData();
    } else if (!isOpen) {
      setAnimationFinished(false);
      setTrackingData(null);
    }
  }, [isOpen, bookingId]);

  const fetchTrackingData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingService.getTrackingData(bookingId);
      setTrackingData(data);
      if (data?.worker?.is_live) {
        toast.success("Live tracking active!");
      } else {
        toast("Worker is currently offline", { icon: "ℹ️" });
      }
    } catch (err) {
      setError("Failed to load tracking data");
      toast.error("Could not fetch tracking data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !mapLoaded) {
      loadGoogleMaps();
    }
  }, [isOpen, mapLoaded]);

  useEffect(() => {
    if (isOpen && trackingData && mapLoaded && animationFinished) {
      initializeMap();
    }
  }, [isOpen, trackingData, mapLoaded, animationFinished]);

  const loadGoogleMaps = () => {
    if (window.google && window.google.maps) {
      setMapLoaded(true);
      return;
    }

    // Check if script is already in document
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com/maps/api/js"]',
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => setMapLoaded(true));
      return;
    }

    const script = document.createElement("script");
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
    script.async = true;
    script.onload = () => {
      setMapLoaded(true);
    };
    document.body.appendChild(script);
  };

  const initializeMap = () => {
    if (!trackingData || !window.google || !trackingData.customer) return;

    const mapOptions = {
      center: {
        lat: trackingData.customer.latitude,
        lng: trackingData.customer.longitude,
      },
      zoom: 14,
      styles: [
        {
          featureType: "poi",
          stylers: [{ visibility: "off" }],
        },
      ],
      disableDefaultUI: true,
      zoomControl: true,
    };

    const map = new window.google.maps.Map(
      document.getElementById("tracking-map"),
      mapOptions,
    );

    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer({
      map: map,
      suppressMarkers: true,
      suppressPolylines: true,
    });

    // Customer marker
    new window.google.maps.Marker({
      position: {
        lat: trackingData.customer.latitude,
        lng: trackingData.customer.longitude,
      },
      map: map,
      title: "Customer Location",
      icon: {
        url:
          "data:image/svg+xml;charset=UTF-8," +
          encodeURIComponent(`
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="white" stroke="#3d8bff" stroke-width="2"/>
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#3d8bff"/>
            <circle cx="12" cy="9" r="2.5" fill="white"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 40),
      },
    });

    // Worker marker
    if (trackingData.worker?.is_live) {
      const workerPos = {
        lat: trackingData.worker.latitude,
        lng: trackingData.worker.longitude,
      };

      new window.google.maps.Marker({
        position: workerPos,
        map: map,
        title: "Worker Location",
        icon: {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="white" stroke="#10b981" stroke-width="2"/>
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#10b981"/>
              <circle cx="12" cy="9" r="2.5" fill="white"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 40),
        },
      });

      // Calculate and display road route
      directionsService.route(
        {
          origin: workerPos,
          destination: {
            lat: trackingData.customer.latitude,
            lng: trackingData.customer.longitude,
          },
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);
            const leg = result.routes[0].legs[0];
            setRouteInfo({
              distance: leg.distance.text,
              duration: leg.duration.text,
            });

            // Styled Glow Polyline (Background)
            new window.google.maps.Polyline({
              path: result.routes[0].overview_path,
              geodesic: true,
              strokeColor: "#3d8bff",
              strokeOpacity: 0.3,
              strokeWeight: 10,
              map: map,
            });

            // Main Active Polyline (Foreground)
            new window.google.maps.Polyline({
              path: result.routes[0].overview_path,
              geodesic: true,
              strokeColor: "#3d8bff",
              strokeOpacity: 1.0,
              strokeWeight: 4,
              map: map,
            });

            // Adjust map bounds to show entire route
            const bounds = new window.google.maps.LatLngBounds();
            result.routes[0].overview_path.forEach((point) =>
              bounds.extend(point),
            );
            map.fitBounds(bounds, {
              top: 50,
              right: 50,
              bottom: 50,
              left: 50,
            });
          } else {
            console.error("Directions request failed due to " + status);
            // Fallback to simple line if directions fail
            new window.google.maps.Polyline({
              path: [
                workerPos,
                {
                  lat: trackingData.customer.latitude,
                  lng: trackingData.customer.longitude,
                },
              ],
              geodesic: true,
              strokeColor: "#3d8bff",
              strokeOpacity: 0.8,
              strokeWeight: 4,
              map: map,
            });
          }
        },
      );
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 300,
        }}
        onAnimationComplete={() => setAnimationFinished(true)}
        className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Navigation className="w-5 h-5 text-[#3d8bff]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Live Tracking
              </h2>
              <p className="text-sm text-zinc-500">Booking ID: #{bookingId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row h-[600px]">
          {/* Map */}
          <div className="flex-1 bg-zinc-100">
            <div id="tracking-map" className="w-full h-full" />
            {loading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-[#3d8bff]/20 border-t-[#3d8bff] rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm text-zinc-600">Loading map...</p>
                </div>
              </div>
            )}
            {error && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-zinc-400 mx-auto mb-2" />
                  <p className="text-sm text-zinc-600">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Info Panel */}
          <div className="w-full lg:w-80 p-6 bg-white border-t lg:border-t-0 lg:border-l border-zinc-100">
            {trackingData && (
              <div className="space-y-6">
                {/* Customer Info */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-[#3d8bff]" />
                    Customer Location
                  </h3>
                  <div className="bg-zinc-50 rounded-xl p-3">
                    <p className="text-sm font-medium text-slate-900 mb-1">
                      {trackingData.customer?.address ||
                        "Address not available"}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {trackingData.customer?.city || "City not available"} -{" "}
                      {trackingData.customer?.pincode}
                    </p>
                  </div>
                </div>

                {/* Worker Info */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-green-500" />
                    Worker Status
                  </h3>
                  <div
                    className={`rounded-xl p-3 ${
                      trackingData.worker?.is_live
                        ? "bg-green-50"
                        : "bg-zinc-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-sm font-medium ${
                          trackingData.worker?.is_live
                            ? "text-green-700"
                            : "text-zinc-700"
                        }`}
                      >
                        {trackingData.worker?.is_live
                          ? "Live Tracking"
                          : "Offline"}
                      </span>
                      {trackingData.worker?.is_live && (
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      )}
                    </div>
                    {trackingData.worker?.last_ping_at && (
                      <p className="text-xs text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Last seen:{" "}
                        {new Date(
                          trackingData.worker.last_ping_at,
                        ).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Route Info */}
                {routeInfo && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">
                        Distance
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        {routeInfo.distance}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                      <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">
                        Arrival
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        {routeInfo.duration}
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2">
                  {/* <button
                    onClick={() => window.open(`tel:+919876543210`)}
                    className="w-full bg-[#3d8bff] text-white px-4 py-2 rounded-xl font-medium hover:bg-[#3f5ce6] transition"
                  >
                    Call Worker
                  </button> */}
                  <button
                    onClick={fetchTrackingData}
                    className="w-full bg-zinc-100 text-zinc-700 px-4 py-2 rounded-xl font-medium hover:bg-zinc-200 transition"
                  >
                    Refresh Location
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default TrackingModal;
