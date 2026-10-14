import {
  MapPin,
  Clock,
  IndianRupee,
  CheckCircle,
  Wifi,
  KeyRound,
  X,
  Navigation,
  History,
  Calendar,
  Repeat,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { workerService } from "../../api/services/worker";
import { bookingService } from "../../api/services/booking";

const MOCK_JOBS = [
  {
    id: 1,
    serviceType: "Cleaning",
    homeSize: "2 BHK",
    distance: "2.3 km",
    timeSlot: "Morning",
    earnings: 450,
    status: "Approved",
  },
  {
    id: 2,
    serviceType: "Plumbing",
    homeSize: "3 BHK",
    distance: "5.1 km",
    timeSlot: "Afternoon",
    earnings: 800,
    status: "Approved",
  },
  {
    id: 3,
    serviceType: "Cleaning",
    homeSize: "1 BHK",
    distance: "1.8 km",
    timeSlot: "Evening",
    earnings: 350,
    status: "Approved",
  },
];

export default function DashboardWithJobs() {
  const [isOnline] = useState(true);
  const profile = JSON.parse(
    localStorage.getItem("worker_profile_data") || "{}",
  );
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpBookingId, setOtpBookingId] = useState(null);
  const [otpCode, setOtpCode] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState(null);
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [endingServiceId, setEndingServiceId] = useState(null);
  const [workerLocation, setWorkerLocation] = useState(null);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [rescheduleHistory, setRescheduleHistory] = useState(null);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleError, setRescheduleError] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({});
  const [statusUpdating, setStatusUpdating] = useState({});
  const [statusError, setStatusError] = useState({});
  const [statusMessage, setStatusMessage] = useState({});
  const [extensionsModalOpen, setExtensionsModalOpen] = useState(false);
  const [extensions, setExtensions] = useState([]);
  const [extensionsLoading, setExtensionsLoading] = useState(false);
  const [extensionsError, setExtensionsError] = useState(null);
  const [activeSection, setActiveSection] = useState("bookings");
  const [servicesExpanded, setServicesExpanded] = useState(false);
  const [expandedAddressIds, setExpandedAddressIds] = useState({});
  const [expandedAddonIds, setExpandedAddonIds] = useState({});
  const [expandedServiceNameIds, setExpandedServiceNameIds] = useState({});
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [mapBooking, setMapBooking] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);
  const mapRef = useRef(null);
  const mapInitializedRef = useRef(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setHistoryError(null);
        setHistoryLoading(true);
        const res = await workerService.getBookings(
          filterStatus === "all" ? undefined : filterStatus,
        );
        const list = res?.data || res;
        const bookings = Array.isArray(list) ? list : [];
        setHistory(bookings);
      } catch (e) {
        setHistoryError(e?.message || "Failed to load booking history");
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, [filterStatus]);

  // Get worker's current location
  const getWorkerLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setWorkerLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting worker location:", error);
          // Use default location if geolocation fails
          setWorkerLocation({ lat: 19.997454, lng: 73.789803 }); // Mumbai default
        },
        { enableHighAccuracy: true },
      );
    } else {
      // Use default location if geolocation not supported
      setWorkerLocation({ lat: 19.997454, lng: 73.789803 }); // Mumbai default
    }
  };

  const isInstantBooking = (booking) =>
    booking?.service?.subscription?.name
      ?.toLowerCase()
      .includes("instant") || booking?.service?.category_id === 6;

  const loadGoogleMaps = useCallback(() => {
    if (window.google?.maps) {
      setMapLoaded(true);
      return;
    }
    const existing = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existing) {
      existing.addEventListener("load", () => setMapLoaded(true));
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=geometry`;
    script.async = true;
    script.onload = () => setMapLoaded(true);
    document.body.appendChild(script);
  }, []);

  const initMapWithRoute = useCallback(async (booking) => {
    if (!window.google?.maps || !booking?.latitude || !booking?.longitude) return;

    let wLat = workerLocation?.lat;
    let wLng = workerLocation?.lng;
    try {
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true, timeout: 5000, maximumAge: 0,
        }),
      );
      wLat = pos.coords.latitude;
      wLng = pos.coords.longitude;
    } catch { }

    if (wLat && wLng) {
      try {
        await workerService.updateLocation(booking.id, wLat, wLng);
      } catch { }
    }

    const customerPos = { lat: Number(booking.latitude), lng: Number(booking.longitude) };
    const center = wLat && wLng ? { lat: (wLat + customerPos.lat) / 2, lng: (wLng + customerPos.lng) / 2 } : customerPos;

    const map = new window.google.maps.Map(document.getElementById("worker-direction-map"), {
      center,
      zoom: 13,
      styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }],
      disableDefaultUI: true,
      zoomControl: true,
    });
    mapRef.current = map;

    new window.google.maps.Marker({
      position: customerPos,
      map,
      title: "Customer Location",
      icon: {
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="white" stroke="#3d8bff" stroke-width="2"/><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#3d8bff"/><circle cx="12" cy="9" r="2.5" fill="white"/></svg>`),
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 40),
      },
    });

    if (wLat && wLng) {
      const workerPos = { lat: wLat, lng: wLng };
      new window.google.maps.Marker({
        position: workerPos,
        map,
        title: "Your Location",
        icon: {
          url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="white" stroke="#10b981" stroke-width="2"/><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#10b981"/><circle cx="12" cy="9" r="2.5" fill="white"/></svg>`),
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 40),
        },
      });

      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: workerPos,
          destination: customerPos,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            const leg = result.routes[0].legs[0];
            setRouteInfo({ distance: leg.distance.text, duration: leg.duration.text });
            new window.google.maps.Polyline({
              path: result.routes[0].overview_path,
              geodesic: true, strokeColor: "#3d8bff", strokeOpacity: 0.3, strokeWeight: 10, map,
            });
            new window.google.maps.Polyline({
              path: result.routes[0].overview_path,
              geodesic: true, strokeColor: "#3d8bff", strokeOpacity: 1.0, strokeWeight: 4, map,
            });
            const bounds = new window.google.maps.LatLngBounds();
            result.routes[0].overview_path.forEach((p) => bounds.extend(p));
            map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
          } else {
            new window.google.maps.Polyline({
              path: [workerPos, customerPos],
              geodesic: true, strokeColor: "#3d8bff", strokeOpacity: 0.8, strokeWeight: 4, map,
            });
          }
        },
      );
    }
    setMapLoading(false);
    mapInitializedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openMapModal = (booking) => {
    mapInitializedRef.current = false;
    setMapBooking(booking);
    setMapModalOpen(true);
    setRouteInfo(null);
    setMapLoading(true);
    loadGoogleMaps();
  };

  useEffect(() => {
    if (mapModalOpen && mapLoaded && mapBooking && !mapInitializedRef.current) {
      const timer = setTimeout(() => initMapWithRoute(mapBooking), 100);
      return () => clearTimeout(timer);
    }
  }, [mapModalOpen, mapLoaded, mapBooking, initMapWithRoute]);

  const closeMapModal = () => {
    setMapModalOpen(false);
    setMapBooking(null);
    setRouteInfo(null);
    mapRef.current = null;
    mapInitializedRef.current = false;
  };

  const refreshMapLocation = () => {
    if (mapBooking) {
      mapInitializedRef.current = false;
      setMapLoading(true);
      setRouteInfo(null);
      initMapWithRoute(mapBooking);
    }
  };

  // Get worker location on component mount
  useEffect(() => {
    getWorkerLocation();
  }, []);

  const handleStartService = async (bookingId) => {
    setOtpError(null);
    setOtpSuccess(false);
    setOtpCode("");
    setOtpBookingId(bookingId);
    try {
      setOtpSending(true);
      await workerService.generateCodes(bookingId);
      setOtpModalOpen(true);
    } catch (e) {
      setOtpError(e?.message || "Failed to send OTP");
      setOtpModalOpen(true);
    } finally {
      setOtpSending(false);
    }
  };

  const handleResendOtp = async () => {
    if (!otpBookingId) return;
    try {
      setOtpSending(true);
      setOtpError(null);
      await workerService.generateCodes(otpBookingId);
    } catch (e) {
      setOtpError(e?.message || "Failed to resend OTP");
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpBookingId || !otpCode) return;
    try {
      setOtpError(null);
      setOtpVerifying(true);
      await workerService.verifyStartCode(otpBookingId, otpCode);
      setOtpSuccess(true);
      setHistory((prev) =>
        prev.map((h) =>
          h.id === otpBookingId ? { ...h, status: "inprogress" } : h,
        ),
      );
      setTimeout(() => {
        setOtpModalOpen(false);
        setOtpCode("");
        setOtpBookingId(null);
        setOtpSuccess(false);
      }, 800);
    } catch (e) {
      setOtpError(e?.message || "Invalid OTP");
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleEndService = async (bookingId) => {
    if (!bookingId) return;
    try {
      setEndingServiceId(bookingId);
      await workerService.endService(bookingId);
      setHistory((prev) =>
        prev.map((h) =>
          h.id === bookingId ? { ...h, status: "completed" } : h,
        ),
      );
    } catch (e) {
      setStatusError((prev) => ({
        ...prev,
        [bookingId]: e?.message || "Failed to end service",
      }));
      setTimeout(() => {
        setStatusError((prev) => ({ ...prev, [bookingId]: "" }));
      }, 3000);
    } finally {
      setEndingServiceId(null);
    }
  };

  const handleRescheduleHistory = async (bookingId) => {
    try {
      setRescheduleError(null);
      setRescheduleLoading(true);
      const response = await workerService.getRescheduleHistory(bookingId);
      setRescheduleHistory(response?.data || response);
      setRescheduleModalOpen(true);
    } catch (e) {
      setRescheduleError(e?.message || "Failed to load reschedule history");
    } finally {
      setRescheduleLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    if (!bookingId) return;

    setStatusUpdating(prev => ({ ...prev, [bookingId]: true }));
    setStatusError(prev => ({ ...prev, [bookingId]: "" }));
    setStatusMessage(prev => ({ ...prev, [bookingId]: "" }));

    try {
      const response = await bookingService.updateBookingStatus(bookingId, newStatus);

      setStatusMessage(prev => ({ ...prev, [bookingId]: "Status updated successfully!" }));

      // Update local state to reflect the change
      setHistory(prev =>
        prev.map(h => h.id === bookingId ? { ...h, status: newStatus } : h)
      );

      setTimeout(() => {
        setStatusMessage(prev => ({ ...prev, [bookingId]: "" }));
      }, 3000);
    } catch (error) {
      setStatusError(prev => ({ ...prev, [bookingId]: error?.message || "Failed to update status" }));
      setTimeout(() => {
        setStatusError(prev => ({ ...prev, [bookingId]: "" }));
      }, 3000);
    } finally {
      setStatusUpdating(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const handleViewExtensions = async (bookingId) => {
    try {
      setExtensionsError(null);
      setExtensionsLoading(true);
      setExtensions([]);
      const res = await workerService.getInstantExtensions(bookingId);
      const data = res?.data || res;

      let list = [];

      // New API format: { success, booking: { ..., extensions: [...] } }
      if (Array.isArray(data?.booking?.extensions)) {
        list = data.booking.extensions;
      }
      // Older / alternate format: { extensions: [...] }
      else if (Array.isArray(data?.extensions)) {
        list = data.extensions;
      }
      // Fallback: API directly returns an array
      else if (Array.isArray(data)) {
        list = data;
      }

      setExtensions(list);
      setExtensionsModalOpen(true);
    } catch (e) {
      setExtensionsError(e?.message || "Failed to load extension history");
      setExtensionsModalOpen(true);
    } finally {
      setExtensionsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Booking History
            </h2>
            {!historyLoading && (
              <p className="text-xs text-gray-500 mt-0.5">
                {history.length} records
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-md text-xs font-medium">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              Online
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md font-semibold bg-[#3d8bff] text-white">
              <IndianRupee className="w-3.5 h-3.5" />
              <span>₹{profile.walletBalance || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-sm font-semibold text-gray-900">Your Services</h3>
        </div>
        {(() => {
          const allItems = [
            ...(profile.categories || []).map((c) => ({ type: "cat", label: c })),
            ...(profile.services || []).map((s) => ({ type: "srv", label: s })),
          ];
          const SHOW_LIMIT = 4;
          const visible = servicesExpanded ? allItems : allItems.slice(0, SHOW_LIMIT);
          const hasMore = allItems.length > SHOW_LIMIT;

          return (
            <>
              <div className="flex flex-wrap gap-2">
                {visible.map((item, index) => (
                  <span
                    key={`${item.type}-${index}`}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold border ${item.type === "cat"
                      ? "bg-blue-50 text-[#3d8bff] border-blue-100"
                      : "bg-gray-50 text-gray-600 border-gray-200 font-medium"
                      }`}
                  >
                    {item.label}
                  </span>
                ))}
              </div>
              {hasMore && (
                <button
                  onClick={() => setServicesExpanded((p) => !p)}
                  className="mt-2 text-xs font-semibold text-[#3d8bff] hover:underline"
                >
                  {servicesExpanded
                    ? "Show less"
                    : `+${allItems.length - SHOW_LIMIT} more`}
                </button>
              )}
            </>
          );
        })()}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSection("bookings")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition ${activeSection === "bookings"
              ? "bg-[#3d8bff] text-white border-[#3d8bff]"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
          >
            <History className="w-3.5 h-3.5" />
            Bookings
          </button>
          <button
            onClick={() => setActiveSection("subscriptions")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition ${activeSection === "subscriptions"
              ? "bg-[#3d8bff] text-white border-[#3d8bff]"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
          >
            <Repeat className="w-3.5 h-3.5" />
            Subscriptions
          </button>
        </div>
      </div>

      {activeSection === "subscriptions" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Subscription Bookings
          </h3>
          {historyLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={`sub-sk-${i}`} className="border border-gray-200 rounded-lg p-3">
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-3 w-32 bg-gray-200 rounded animate-pulse mb-1" />
                  <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : (() => {
            const subBookings = history.filter(
              (h) =>
                h.service?.subscription?.name?.toLowerCase().includes("monthly"),
            );
            return subBookings.length === 0 ? (
              <p className="text-xs text-gray-500">No subscription bookings found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {subBookings.map((h) => (
                  <div
                    key={h.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="space-y-1">
                        <select
                          value={h.status}
                          onChange={(e) => handleStatusChange(h.id, e.target.value)}
                          disabled={statusUpdating[h.id]}
                          className={`px-2 py-0.5 rounded text-xs font-medium border focus:outline-none focus:border-[#3d8bff] disabled:opacity-50 ${h.status === "completed"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : h.status === "assigned"
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                              : h.status === "inprogress"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-gray-50 text-gray-700 border-gray-200"
                            }`}
                        >
                          <option value="assigned">Assigned</option>
                          <option value="inprogress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        {statusUpdating[h.id] && (
                          <div className="flex items-center gap-1 text-xs text-[#3d8bff]">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            Updating...
                          </div>
                        )}
                        {statusError[h.id] && (
                          <p className="text-xs text-red-500">{statusError[h.id]}</p>
                        )}
                        {statusMessage[h.id] && (
                          <p className="text-xs text-green-600">{statusMessage[h.id]}</p>
                        )}
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                        {h.service?.subscription?.name || "Monthly"}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-[#3d8bff] mb-2 truncate">
                      {h.service?.name || "Service"}
                    </h4>
                    <div className="space-y-1 mb-3">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <span className="text-xs">👤</span>
                        <span className="text-xs truncate">{h.customer_name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Calendar className="w-3 h-3" />
                        <span className="text-xs">{h.booking_date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">{h.time_slot}</span>
                      </div>
                      {(h.start_date || h.services?.[0]?.start_date) && (
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Calendar className="w-3 h-3" />
                          <span className="text-xs">
                            {h.start_date || h.services?.[0]?.start_date}
                            {(h.end_date || h.services?.[0]?.end_date) &&
                              (h.end_date || h.services?.[0]?.end_date) !==
                              (h.start_date || h.services?.[0]?.start_date) &&
                              ` → ${h.end_date || h.services?.[0]?.end_date}`}
                          </span>
                        </div>
                      )}
                      <div className="flex items-start gap-1.5 text-gray-600">
                        <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                        <span className={`text-xs ${expandedAddressIds[`sub-${h.id}`] ? "" : "line-clamp-1"}`}>
                          {h.address}
                        </span>
                        {h.address && h.address.length > 40 && (
                          <button
                            onClick={() =>
                              setExpandedAddressIds((prev) => ({
                                ...prev,
                                [`sub-${h.id}`]: !prev[`sub-${h.id}`],
                              }))
                            }
                            className="text-[10px] font-semibold text-[#3d8bff] hover:underline shrink-0"
                          >
                            {expandedAddressIds[`sub-${h.id}`] ? "less" : "more"}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {h.latitude && h.longitude && h.status !== "completed" && (
                        <button
                          onClick={() => openMapModal(h)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-md font-semibold bg-green-600 text-white hover:bg-green-700"
                        >
                          <Navigation className="w-3 h-3" />
                          Direction
                        </button>
                      )}
                      {String(h.status).toLowerCase() === "assigned" && (
                        <button
                          onClick={() => handleStartService(h.id)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-md font-semibold bg-[#3d8bff] text-white hover:bg-[#4060EE]"
                          disabled={otpSending && otpBookingId === h.id}
                        >
                          <KeyRound className="w-3 h-3" />
                          {otpSending && otpBookingId === h.id ? "Sending..." : "Start Service"}
                        </button>
                      )}
                      {String(h.status).toLowerCase() === "inprogress" && (
                        <button
                          onClick={() => handleEndService(h.id)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-md font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                          disabled={endingServiceId === h.id}
                        >
                          <CheckCircle className="w-3 h-3" />
                          {endingServiceId === h.id ? "Ending..." : "End Service"}
                        </button>
                      )}

                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {activeSection === "bookings" && (
        <>
          {historyLoading ? null : history.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-600">No bookings found.</p>
            </div>
          ) : null}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col gap-2 mb-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                Booking History
              </h3>
              <div className="flex flex-wrap items-center gap-1">
                {["all", "assigned", "inprogress", "completed"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border transition ${filterStatus === s
                      ? "bg-[#3d8bff] text-white border-[#3d8bff]"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      }`}
                  >
                    {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
                {!historyLoading && (
                  <span className="text-xs text-gray-500 ml-auto">
                    {history.length} records
                  </span>
                )}
              </div>
            </div>
            {historyLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={`sk-${i}`}
                    className="border border-gray-200 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="space-y-2 mb-2">
                      <div className="h-3 w-40 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-56 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : historyError ? (
              <p className="text-xs text-red-600">{historyError}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {history.map((h) => {
                  const addons = Array.isArray(h.services)
                    ? h.services.filter(
                      (s) => s.is_addon || s.booking_type === "addon",
                    )
                    : [];
                  const hasAddons = addons.length > 0;

                  return (
                    <div
                      key={h.id}
                      className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="space-y-1">
                          <select
                            value={h.status}
                            onChange={(e) => handleStatusChange(h.id, e.target.value)}
                            disabled={statusUpdating[h.id]}
                            className={`px-2 py-0.5 rounded text-xs font-medium border focus:outline-none focus:border-[#3d8bff] disabled:opacity-50 ${h.status === "completed"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : h.status === "assigned"
                                ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                : h.status === "inprogress"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-gray-50 text-gray-700 border-gray-200"
                              }`}
                          >
                            <option value="assigned">Assigned</option>
                            <option value="inprogress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          {statusUpdating[h.id] && (
                            <div className="flex items-center gap-1 text-xs text-[#3d8bff]">
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              Updating...
                            </div>
                          )}
                          {statusError[h.id] && (
                            <p className="text-xs text-red-500">{statusError[h.id]}</p>
                          )}
                          {statusMessage[h.id] && (
                            <p className="text-xs text-green-600">{statusMessage[h.id]}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`text-xs font-semibold text-[#3d8bff] ${expandedServiceNameIds[h.id] ? "" : "line-clamp-1"
                              }`}
                          >
                            {h.service?.name || h.bot_payload?.service || "Service"}
                          </span>
                          {(h.service?.name || h.bot_payload?.service) &&
                            (h.service?.name || h.bot_payload?.service).length > 40 && (
                              <button
                                type="button"
                                className="text-[10px] font-semibold text-[#3d8bff] hover:underline shrink-0"
                                onClick={() =>
                                  setExpandedServiceNameIds((prev) => ({
                                    ...prev,
                                    [h.id]: !prev[h.id],
                                  }))
                                }
                              >
                                {expandedServiceNameIds[h.id] ? "less" : "more"}
                              </button>
                            )}
                          {h.service?.subscription?.name && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
                              {h.service.subscription.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1 mb-2">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <span className="text-xs">👤</span>
                          <span className="text-xs truncate">
                            {h.customer_name}
                            {/* {h.customer_phone ? ` • ${h.customer_phone}` : ""} */}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Clock className="w-3 h-3" />
                          <span className="text-xs">{h.time_slot}</span>
                        </div>
                        {(h.start_date || h.services?.[0]?.start_date) && (
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Calendar className="w-3 h-3" />
                            <span className="text-xs">
                              {h.start_date || h.services?.[0]?.start_date}
                              {(h.end_date || h.services?.[0]?.end_date) &&
                                (h.end_date || h.services?.[0]?.end_date) !==
                                (h.start_date || h.services?.[0]?.start_date) &&
                                ` → ${h.end_date || h.services?.[0]?.end_date}`}
                            </span>
                          </div>
                        )}
                        <div className="flex items-start gap-1.5 text-gray-600">
                          <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                          <span
                            className={`text-xs ${expandedAddressIds[h.id] ? "" : "line-clamp-1"
                              }`}
                          >
                            {h.address}
                          </span>
                          {h.address && h.address.length > 40 && (
                            <button
                              onClick={() =>
                                setExpandedAddressIds((prev) => ({
                                  ...prev,
                                  [h.id]: !prev[h.id],
                                }))
                              }
                              className="text-[10px] font-semibold text-[#3d8bff] hover:underline shrink-0"
                            >
                              {expandedAddressIds[h.id] ? "less" : "more"}
                            </button>
                          )}
                        </div>

                        {hasAddons && (
                          <div className="mt-1 text-purple-700">
                            <div className="flex items-start gap-1.5">
                              <span className="text-xs mt-0.5">➕</span>
                              <div className="text-[10px] leading-snug flex-1">
                                {expandedAddonIds[h.id] ? (
                                  <ul className="space-y-0.5">
                                    {addons.map((a) => (
                                      <li key={a.id}>
                                        <span className="font-semibold">
                                          {a.addon_name ||
                                            a.addon?.name ||
                                            a.service?.name}
                                        </span>
                                        <span className="text-purple-800/80">

                                          {` • Qty ${a.addon_qty ?? a.quantity ?? 1
                                            }`}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <>
                                    <span className="font-semibold">
                                      Add-ons:
                                    </span>{" "}
                                    <span>
                                      {addons[0].addon_name ||
                                        addons[0].addon?.name ||
                                        addons[0].service?.name}
                                    </span>
                                    {addons.length > 1 && (
                                      <span>{` +${addons.length - 1} more`}</span>
                                    )}
                                  </>
                                )}
                                <button
                                  type="button"
                                  className="ml-1 text-[10px] font-semibold text-[#3d8bff] hover:underline"
                                  onClick={() =>
                                    setExpandedAddonIds((prev) => ({
                                      ...prev,
                                      [h.id]: !prev[h.id],
                                    }))
                                  }
                                >
                                  {expandedAddonIds[h.id] ? "Hide" : "Read more"}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {h.latitude && h.longitude && h.status !== "completed" && (
                            <button
                              onClick={() => openMapModal(h)}
                              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-md font-semibold bg-green-600 text-white hover:bg-green-700"
                              aria-label="Get Directions"
                            >
                              <Navigation className="w-3 h-3" />
                              Direction
                            </button>
                          )}
                          {/* Reschedule History Button - Only show if reschedule data is available */}
                          {(h.reschedule_count > 0 || h.last_rescheduled_at) && (
                            <button
                              onClick={() => handleRescheduleHistory(h.id)}
                              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-md font-semibold bg-purple-600 text-white hover:bg-purple-700"
                              aria-label="View Reschedule History"
                            >
                              <History className="w-3 h-3" />
                              Reschedule
                            </button>
                          )}
                          {isInstantBooking(h) && h.extension_count > 0 && (
                            <button
                              onClick={() => handleViewExtensions(h.id)}
                              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-md font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                              <History className="w-3 h-3" />
                              Extensions
                            </button>
                          )}
                          {String(h.status).toLowerCase() === "assigned" && (
                            <button
                              onClick={() => handleStartService(h.id)}
                              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-md font-semibold bg-[#3d8bff] text-white hover:bg-[#4060EE]"
                              disabled={otpSending && otpBookingId === h.id}
                              aria-label="Start Service"
                            >
                              <KeyRound className="w-3 h-3" />
                              {otpSending && otpBookingId === h.id
                                ? "Sending..."
                                : "Start Service"}
                            </button>
                          )}
                          {String(h.status).toLowerCase() === "inprogress" && (
                            <button
                              onClick={() => handleEndService(h.id)}
                              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-md font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                              disabled={endingServiceId === h.id}
                              aria-label="End Service"
                            >
                              <CheckCircle className="w-3 h-3" />
                              {endingServiceId === h.id ? "Ending..." : "End Service"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
      {otpModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-gray-200 w-full max-w-sm p-4 relative">
            <button
              className="absolute top-3 right-3 p-2 text-gray-400 hover:text-gray-700"
              onClick={() => {
                setOtpModalOpen(false);
                setOtpCode("");
                setOtpBookingId(null);
                setOtpError(null);
                setOtpSuccess(false);
              }}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <KeyRound className="w-4 h-4 text-[#3d8bff]" />
              <h4 className="text-sm font-semibold text-gray-900">
                Verify Start OTP
              </h4>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              Enter the OTP received by the customer to start the service.
            </p>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={otpCode}
              onChange={(e) =>
                setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#3d8bff]"
              placeholder="Enter 4-digit OTP"
            />
            {otpError && (
              <p className="text-xs text-red-600 mt-2">{otpError}</p>
            )}
            {otpSuccess && (
              <p className="text-xs text-green-600 mt-2">Verified</p>
            )}
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={handleResendOtp}
                disabled={otpSending}
                className="px-3 py-1.5 text-xs rounded-md font-semibold border border-gray-200 text-[#3d8bff] hover:bg-blue-50 disabled:opacity-60"
              >
                {otpSending ? "Sending..." : "Resend OTP"}
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOtpModalOpen(false)}
                  className="px-3 py-1.5 text-xs rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyOtp}
                  disabled={otpVerifying || !otpCode}
                  className="px-3 py-1.5 text-xs rounded-md font-semibold bg-[#3d8bff] text-white hover:bg-[#4060EE] disabled:opacity-60"
                >
                  {otpVerifying ? "Verifying..." : "Verify"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {rescheduleModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-gray-200 w-full max-w-md p-4 relative max-h-[80vh] overflow-y-auto">
            <button
              className="absolute top-3 right-3 p-2 text-gray-400 hover:text-gray-700"
              onClick={() => {
                setRescheduleModalOpen(false);
                setRescheduleHistory(null);
                setRescheduleError(null);
              }}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-purple-600" />
              <h4 className="text-sm font-semibold text-gray-900">
                Reschedule History
              </h4>
            </div>

            {rescheduleLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={`sk-${i}`} className="border border-gray-200 rounded-lg p-3">
                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-3 w-32 bg-gray-200 rounded animate-pulse mb-1" />
                    <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : rescheduleError ? (
              <p className="text-xs text-red-600">{rescheduleError}</p>
            ) : rescheduleHistory ? (
              <div className="space-y-3">
                {/* Current Booking Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h5 className="text-xs font-semibold text-blue-900 mb-2">Current Booking</h5>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-blue-700">
                      <Calendar className="w-3 h-3" />
                      <span className="text-xs">{rescheduleHistory.current_booking_date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-700">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">{rescheduleHistory.current_time_slot}</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-700">
                      <span className="text-xs font-medium">Reschedule Count:</span>
                      <span className="text-xs">{rescheduleHistory.reschedule_count}</span>
                    </div>
                    {rescheduleHistory.last_rescheduled_at && (
                      <div className="text-xs text-blue-600">
                        Last rescheduled: {new Date(rescheduleHistory.last_rescheduled_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                {/* History List */}
                {rescheduleHistory.history && rescheduleHistory.history.length > 0 ? (
                  <>
                    <h5 className="text-xs font-semibold text-gray-700">Previous Changes</h5>
                    {rescheduleHistory.history.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-900">
                              Change #{item.id}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(item.created_at).toLocaleString()}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-500">From:</span>
                              <div className="font-medium">{item.old_date}</div>
                              <div>{item.old_time_slot}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">To:</span>
                              <div className="font-medium">{item.new_date}</div>
                              <div>{item.new_time_slot}</div>
                            </div>
                          </div>

                          {item.reason && (
                            <div className="bg-gray-50 rounded p-2">
                              <span className="text-gray-500 text-xs">Reason:</span>
                              <p className="text-xs text-gray-700 mt-1">{item.reason}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="text-xs text-gray-500">No reschedule history available.</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No reschedule data available.</p>
            )}

            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setRescheduleModalOpen(false);
                  setRescheduleHistory(null);
                  setRescheduleError(null);
                }}
                className="px-3 py-1.5 text-xs rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {extensionsModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-gray-200 w-full max-w-md p-4 relative max-h-[80vh] overflow-y-auto">
            <button
              className="absolute top-3 right-3 p-2 text-gray-400 hover:text-gray-700"
              onClick={() => {
                setExtensionsModalOpen(false);
                setExtensions([]);
                setExtensionsError(null);
              }}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-semibold text-gray-900">
                Extension History
              </h4>
            </div>
            {extensionsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={`ext-sk-${i}`}
                    className="border border-gray-200 rounded-lg p-3"
                  >
                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-3 w-32 bg-gray-200 rounded animate-pulse mb-1" />
                    <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : extensionsError ? (
              <p className="text-xs text-red-600">{extensionsError}</p>
            ) : extensions.length === 0 ? (
              <p className="text-xs text-gray-500">
                No extension history available.
              </p>
            ) : (
              <div className="space-y-3">
                {extensions.map((ext) => (
                  <div
                    key={ext.id}
                    className="border border-gray-200 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div className="space-y-1 text-xs">
                      <div className="font-semibold text-gray-900">
                        Extended by {ext.duration_minutes} Min
                      </div>
                      <div className="text-gray-600">
                        {ext.created_at &&
                          new Date(ext.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <div className="font-semibold text-gray-900">
                        ₹{Number(ext.amount || 0).toLocaleString()}
                      </div>
                      {ext.payment_status && (
                        <div
                          className={`font-bold uppercase tracking-wider ${String(ext.payment_status).toLowerCase() === "paid"
                            ? "text-green-600"
                            : "text-amber-600"
                            }`}
                        >
                          {ext.payment_status}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Map Direction Modal */}
      {mapModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                  <Navigation className="w-4.5 h-4.5 text-[#3d8bff]" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-gray-900">Direction</h2>
                  {mapBooking?.address && (
                    <p className="text-xs text-gray-500 truncate">{mapBooking.address}</p>
                  )}
                </div>
              </div>
              <button
                onClick={closeMapModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition shrink-0"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 min-h-0">
              <div className="flex-1 bg-gray-100 relative min-h-[300px] lg:min-h-0">
                <div id="worker-direction-map" className="w-full h-full min-h-[300px] lg:min-h-[450px]" />
                {mapLoading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-7 h-7 border-3 border-[#3d8bff]/20 border-t-[#3d8bff] rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-xs text-gray-600">Loading map...</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="w-full lg:w-72 p-4 bg-white border-t lg:border-t-0 lg:border-l border-gray-100 shrink-0 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#3d8bff]" />
                      Customer Location
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs font-medium text-gray-900">
                        {mapBooking?.address || "Address not available"}
                      </p>
                    </div>
                  </div>

                  {routeInfo && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                        <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mb-0.5">
                          Distance
                        </p>
                        <p className="text-sm font-bold text-gray-900">{routeInfo.distance}</p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                        <p className="text-[9px] font-bold text-green-600 uppercase tracking-widest mb-0.5">
                          ETA
                        </p>
                        <p className="text-sm font-bold text-gray-900">{routeInfo.duration}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={refreshMapLocation}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-200 transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Refresh Location
                    </button>
                    <button
                      onClick={() => {
                        const cLat = mapBooking?.latitude;
                        const cLng = mapBooking?.longitude;
                        if (cLat && cLng) {
                          const dest = `${cLat},${cLng}`;
                          const wLat = workerLocation?.lat;
                          const wLng = workerLocation?.lng;
                          const url = wLat && wLng
                            ? `https://www.google.com/maps/dir/${wLat},${wLng}/${dest}`
                            : `https://www.google.com/maps/search/?api=1&query=${dest}`;
                          window.open(url, "_blank");
                        }
                      }}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#3d8bff] text-white rounded-xl text-xs font-bold hover:bg-[#3570d4] transition"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      Open in Google Maps
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
