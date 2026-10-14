import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { MapPin, Loader2, Search } from "lucide-react";
import { GoogleMap, MarkerF, Autocomplete } from "@react-google-maps/api";
import { customerService } from "../../api/services/customer";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

function AddressForm({
  initialData,
  editingId,
  isLoaded,
  loadError,
  onCancel,
  onSave,
}) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(
    initialData || {
      type: "Home",
      house_no: "",
      building: "",
      locality: "",
      landmark: "",
      city: "Nashik",
      state: "Maharashtra",
      pincode: "",
      latitude: "19.9975", // Default Nashik
      longitude: "73.7898",
      is_default: true,
    },
  );
  const [locationLoading, setLocationLoading] = useState(false);
  const [resolvedAddress, setResolvedAddress] = useState("");
  const [pincodeMsg, setPincodeMsg] = useState("");
  const [pincodeAvailable, setPincodeAvailable] = useState(true);
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [user, setUser] = useState(null);
  const autocompleteRef = useRef(null);
  const locationSearchInputRef = useRef(null);

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      setUser(null);
    }
  }, []);

  const checkPincodeAvailability = useCallback(async (pincode) => {
    if (!pincode || pincode.length !== 6) {
      setPincodeMsg("");
      setPincodeAvailable(true);
      return;
    }
    setIsCheckingPincode(true);
    try {
      const res = await customerService.checkPincode(pincode);
      if (res) {
        setPincodeMsg(res.message);
        setPincodeAvailable(Boolean(res.available));
      }
    } catch (err) {
      console.error("Pincode check failed:", err);
      setPincodeMsg("");
      setPincodeAvailable(true);
    } finally {
      setIsCheckingPincode(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.pincode && formData.pincode.length === 6) {
        checkPincodeAvailability(formData.pincode);
      } else {
        setPincodeMsg("");
        setPincodeAvailable(true);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.pincode, checkPincodeAvailability]);

  const reverseGeocode = useCallback((lat, lng, onUpdate) => {
    try {
      if (window.google && window.google.maps) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK" && results && results[0]) {
            const result = results[0];
            const components = result.address_components || [];
            const getComponent = (type) =>
              components.find((c) => c.types.includes(type));

            const streetNumber = getComponent("street_number")?.long_name || "";
            const route = getComponent("route")?.long_name || "";
            const premise = getComponent("premise")?.long_name || "";
            const sublocality =
              getComponent("sublocality_level_1")?.long_name ||
              getComponent("sublocality")?.long_name ||
              "";
            const neighborhood = getComponent("neighborhood")?.long_name || "";
            const localityComp =
              getComponent("locality")?.long_name ||
              sublocality ||
              neighborhood ||
              "";
            const stateComp =
              getComponent("administrative_area_level_1")?.long_name || "";
            const postalCode = getComponent("postal_code")?.long_name || "";

            setResolvedAddress(result.formatted_address || "");

            if (onUpdate) {
              onUpdate({
                house_no: streetNumber || "",
                building: premise || route || "",
                locality: localityComp || "",
                city: localityComp || "",
                state: stateComp || "",
                pincode: postalCode || "",
                latitude: lat,
                longitude: lng,
              });
            }
          } else {
            setResolvedAddress("");
          }
        });
      }
    } catch {
      setResolvedAddress("");
    }
  }, []);

  const updateLocation = useCallback(
    (lat, lng) => {
      setFormData((prev) => ({
        ...prev,
        latitude: lat.toString(),
        longitude: lng.toString(),
      }));

      // Reverse geocode to get address details
      reverseGeocode(lat, lng, (updates) => {
        setFormData((prev) => ({ ...prev, ...updates }));
      });
    },
    [reverseGeocode],
  );

  const handleSave = async () => {
    // Check if user is authenticated
    if (!user) {
      toast.error("Please login to save your address");
      navigate("/login", { state: { from: "/book/address" } });
      return;
    }

    const required =
      formData.house_no &&
      formData.building &&
      formData.locality &&
      formData.landmark &&
      formData.city &&
      formData.state &&
      formData.pincode;

    if (!required) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const payload = {
      house_no: formData.house_no,
      building: formData.building,
      locality: formData.locality,
      landmark: formData.landmark,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      latitude: String(formData.latitude),
      longitude: String(formData.longitude),
      label: formData.type,
      is_default: Boolean(formData.is_default),
    };

    try {
      let res;
      if (editingId) {
        res = await customerService.updateAddress(editingId, payload);
      } else {
        res = await customerService.createAddress(payload);
      }
      onSave(res?.data || res || payload, editingId);
      toast.success("Address saved successfully!");
    } catch (e) {
      toast.error(e?.message || "Failed to save address");
    }
  };

  const center = {
    lat: Number(formData.latitude),
    lng: Number(formData.longitude),
  };

  const handlePlaceChanged = useCallback(() => {
    const ac = autocompleteRef.current;
    if (!ac) return;
    const place = ac.getPlace();
    const loc = place?.geometry?.location;
    if (!loc) {
      toast.error("Could not find that location. Try another search.");
      return;
    }
    const lat = typeof loc.lat === "function" ? loc.lat() : loc.lat;
    const lng = typeof loc.lng === "function" ? loc.lng() : loc.lng;
    updateLocation(lat, lng);
    if (locationSearchInputRef.current) {
      locationSearchInputRef.current.value = "";
    }
    toast.success("Location updated from search");
  }, [updateLocation]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-zinc-200 p-6 mb-6 shadow-sm"
    >
      <h3 className="text-lg font-semibold text-slate-900 mb-4">
        {editingId ? "Edit Address" : "Add New Address"}
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Address Type
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-[#3d8bff] focus:ring-2 focus:ring-[#3d8bff]/20 outline-none"
          >
            <option>Home</option>
            <option>Work</option>
            <option>Other</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              House No <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.house_no}
              onChange={(e) =>
                setFormData({ ...formData, house_no: e.target.value })
              }
              placeholder="07"
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-[#3d8bff] focus:ring-2 focus:ring-[#3d8bff]/20 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Building <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.building}
              onChange={(e) =>
                setFormData({ ...formData, building: e.target.value })
              }
              placeholder="Vitthal Park"
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-[#3d8bff] focus:ring-2 focus:ring-[#3d8bff]/20 outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Locality <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.locality}
            onChange={(e) =>
              setFormData({ ...formData, locality: e.target.value })
            }
            placeholder="Vrundavan Nagar"
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-[#3d8bff] focus:ring-2 focus:ring-[#3d8bff]/20 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Landmark <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.landmark}
            onChange={(e) =>
              setFormData({ ...formData, landmark: e.target.value })
            }
            placeholder="Near ABC School"
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-[#3d8bff] focus:ring-2 focus:ring-[#3d8bff]/20 outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-[#3d8bff] focus:ring-2 focus:ring-[#3d8bff]/20 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              State <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) =>
                setFormData({ ...formData, state: e.target.value })
              }
              placeholder="Maharashtra"
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-[#3d8bff] focus:ring-2 focus:ring-[#3d8bff]/20 outline-none"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Pincode <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.pincode}
              onChange={(e) =>
                setFormData({ ...formData, pincode: e.target.value })
              }
              placeholder="Enter pincode..."
              className={`w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none transition ${pincodeMsg
                ? pincodeAvailable
                  ? "border-green-200 focus:border-green-500 focus:ring-green-500/20"
                  : "border-red-200 focus:border-red-500 focus:ring-red-500/20"
                : "border-zinc-200 focus:border-[#3d8bff] focus:ring-[#3d8bff]/20"
                }`}
            />
            {isCheckingPincode && (
              <div className="flex items-center gap-1.5 mt-1">
                <Loader2 className="w-3 h-3 animate-spin text-[#3d8bff]" />
                <span className="text-[10px] text-zinc-500 font-medium">
                  Checking availability...
                </span>
              </div>
            )}
            {!isCheckingPincode && pincodeMsg && (
              <p
                className={`text-[10px] mt-1 font-semibold ${pincodeAvailable ? "text-green-600" : "text-red-600"
                  }`}
              >
                {pincodeMsg}
              </p>
            )}
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <input
                type="checkbox"
                checked={formData.is_default}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    is_default: e.target.checked,
                  })
                }
              />
              Set as default
            </label>
          </div>
        </div>

        {/* Map Display */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Select Location on Map
          </label>
          {isLoaded && !loadError && (
            <div className="relative mb-3">
              <Autocomplete
                onLoad={(ac) => {
                  autocompleteRef.current = ac;
                }}
                onPlaceChanged={handlePlaceChanged}
                options={{
                  fields: ["geometry", "formatted_address", "address_components"],
                  componentRestrictions: { country: "in" },
                }}
              >
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    ref={locationSearchInputRef}
                    type="text"
                    placeholder="Search area, street, landmark…"
                    className="w-full rounded-xl border border-zinc-200 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-zinc-400 focus:border-[#3d8bff] focus:outline-none focus:ring-2 focus:ring-[#3d8bff]/20"
                    autoComplete="off"
                  />
                </div>
              </Autocomplete>
              <p className="mt-1 text-xs text-zinc-500">
                Type to search, then pick a suggestion to move the pin
              </p>
            </div>
          )}
          <div className="relative">
            {!isLoaded ? (
              <div className="w-full h-64 flex items-center justify-center bg-zinc-100 rounded-xl">
                <div className="text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-[#3d8bff] mx-auto mb-2" />
                  <p className="text-sm text-zinc-600">Loading map...</p>
                </div>
              </div>
            ) : loadError ? (
              <div className="w-full h-64 flex items-center justify-center bg-red-50 text-red-500 rounded-xl">
                Error loading map
              </div>
            ) : (
              <div className="w-full h-64 rounded-xl border border-zinc-200 overflow-hidden">
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  zoom={15}
                  center={center}
                  options={{
                    disableDefaultUI: true,
                    zoomControl: true,
                  }}
                  onClick={(e) => {
                    updateLocation(e.latLng.lat(), e.latLng.lng());
                  }}
                >
                  <MarkerF
                    position={center}
                    draggable={true}
                    onDragEnd={(e) => {
                      updateLocation(e.latLng.lat(), e.latLng.lng());
                    }}
                  />
                </GoogleMap>
              </div>
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            Click on the map or drag the marker to select your location
          </p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => {
              if (!navigator.geolocation) {
                toast.error("Geolocation is not supported by your browser");
                return;
              }

              setLocationLoading(true);
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  const { latitude, longitude } = pos.coords;
                  updateLocation(latitude, longitude);
                  setLocationLoading(false);
                  toast.success("Location detected!");
                },
                (error) => {
                  console.error("Geolocation error:", error);
                  toast.error(
                    "Failed to get your location. Please enable location services.",
                  );
                  setLocationLoading(false);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
              );
            }}
            disabled={locationLoading}
            className={`px-4 py-2 rounded-xl border font-semibold transition flex items-center gap-2 ${locationLoading
              ? "border-zinc-200 text-zinc-400 bg-zinc-50 cursor-not-allowed"
              : "border-zinc-200 text-zinc-700 hover:bg-zinc-50"
              }`}
          >
            {locationLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Getting Location...
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4" />
                Use My Location
              </>
            )}
          </button>
          <span className="text-xs text-zinc-500 max-w-[200px] text-right">
            {resolvedAddress
              ? `Detected: ${resolvedAddress}`
              : "Tap map or use my location to detect address"}
          </span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 text-zinc-700 font-semibold hover:bg-zinc-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!pincodeAvailable}
            className={`flex-1 px-4 py-3 rounded-xl text-white font-semibold transition ${pincodeAvailable
              ? "bg-[#3d8bff] hover:bg-[#3f5ce6]"
              : "bg-zinc-300 cursor-not-allowed"
              }`}
          >
            Save Address
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default AddressForm;
