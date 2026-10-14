import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../../context/BookingContext";
import StepProgress from "../../components/booking/StepProgress";
import { GoogleMap, useLoadScript, MarkerF } from "@react-google-maps/api";
import {
  ArrowRight,
  ArrowLeft,
  Plus,
  MapPin,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import { customerService } from "../../api/services/customer";
import AddressForm from "../../components/booking/AddressForm";
import toast from "react-hot-toast";

const libraries = ["places"];
const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

function Address() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const { bookingData, updateBookingData } = useBooking();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(
    bookingData.address || null,
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState(null);

  const [pincodeMsg, setPincodeMsg] = useState("");
  const [pincodeAvailable, setPincodeAvailable] = useState(true);
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  // city_id resolved from the pincode /check response, forwarded to
  // web_booking and create-order.
  const [cityId, setCityId] = useState(bookingData.cityId ?? null);

  const checkPincodeAvailability = async (pincode) => {
    if (!pincode || pincode.length !== 6) {
      setPincodeMsg("");
      setPincodeAvailable(true);
      setCityId(null);
      return;
    }
    setIsCheckingPincode(true);
    try {
      const res = await customerService.checkPincode(pincode);
      if (res) {
        setPincodeMsg(res.message);
        setPincodeAvailable(Boolean(res.available));
        setCityId(res.data?.city_id ?? res.city_id ?? null);
      }
    } catch (err) {
      console.error("Pincode check failed:", err);
      setPincodeMsg("");
      setPincodeAvailable(true);
      setCityId(null);
    } finally {
      setIsCheckingPincode(false);
    }
  };

  useEffect(() => {
    if (selectedAddress?.pincode) {
      checkPincodeAvailability(selectedAddress.pincode);
    } else {
      setPincodeMsg("");
      setPincodeAvailable(true);
      setCityId(null);
    }
  }, [selectedAddress]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await customerService.getAddresses();
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];
        setAddresses(list);
        const def = list.find((a) => a.is_default) || list[0] || null;
        setSelectedAddress(def);
      } catch {
        setAddresses([]);
      }
    };
    load();
  }, []);

  const handleSaveSuccess = (saved, id) => {
    const updated = {
      id: saved.id || id || Date.now(),
      customer_id: saved.customer_id,
      house_no: saved.house_no,
      building: saved.building,
      locality: saved.locality,
      landmark: saved.landmark,
      city: saved.city,
      state: saved.state,
      pincode: saved.pincode,
      label: saved.label,
      is_default: Boolean(saved.is_default),
      latitude: String(saved.latitude),
      longitude: String(saved.longitude),
      formatted_address:
        saved.formatted_address ||
        `${saved.house_no}, ${saved.building}, ${saved.locality}, Near ${saved.landmark}, ${saved.city} - ${saved.pincode}`,
    };

    if (id) {
      setAddresses((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a)),
      );
    } else {
      setAddresses((prev) => [...prev, updated]);
    }

    setSelectedAddress(updated);
    setShowAddForm(false);
    setEditingId(null);
    setEditingData(null);
  };

  const handleNext = () => {
    if (selectedAddress) {
      updateBookingData({ address: selectedAddress, cityId });
      navigate("/book/summary");
    }
  };

  return (
    <div className="min-h-screen pb-12">
      <StepProgress />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Delivery Address
          </h1>
          <p className="text-lg text-zinc-600">
            Where should we send the Expert?
          </p>
        </motion.div>

        {/* Saved Addresses */}
        <div className="space-y-4 mb-6">
          {isCheckingPincode && (
            <div className="flex items-center justify-center gap-2 p-3 bg-blue-50 text-[#3d8bff] rounded-xl border border-blue-100 mb-4 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">
                Verifying location availability...
              </span>
            </div>
          )}
          {!isCheckingPincode && pincodeMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className={`p-3 rounded-xl text-sm font-medium text-center border mb-4 ${
                pincodeAvailable
                  ? "bg-green-50 text-green-700 border-green-100"
                  : "bg-red-50 text-red-700 border-red-100"
              }`}
            >
              {pincodeMsg}
            </motion.div>
          )}
          {addresses.map((address) => (
            <motion.div
              key={address.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={async () => {
                try {
                  const res = await customerService.getAddressById(address.id);
                  const a = res?.data || address;
                  setSelectedAddress(a);
                } catch {
                  setSelectedAddress(address);
                }
              }}
              className={`relative cursor-pointer rounded-2xl border-2 p-6 bg-white transition ${
                selectedAddress?.id === address.id
                  ? "border-[#3d8bff] shadow-xl shadow-[#3d8bff]/20 bg-[#3d8bff]/5"
                  : "border-zinc-200 hover:border-[#3d8bff]/50"
              }`}
            >
              {selectedAddress?.id === address.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-[#3d8bff] rounded-full flex items-center justify-center"
                >
                  <span className="text-white text-sm">✓</span>
                </motion.div>
              )}

              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-[#3d8bff]/10 text-[#3d8bff] rounded-full text-xs font-semibold">
                      {address.label}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-900 mb-1">
                    {address.formatted_address ||
                      `${address.house_no}, ${address.building}, ${address.locality}`}
                  </p>
                  <p className="text-sm text-zinc-600 mb-1">
                    {address.landmark}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {address.city} - {address.pincode}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    className="p-2 hover:bg-zinc-100 rounded-lg transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(address.id);
                      setEditingData({
                        type: address.label || "Home",
                        house_no: address.house_no || "",
                        building: address.building || "",
                        locality: address.locality || "",
                        landmark: address.landmark || "",
                        city: address.city || "",
                        state: address.state || "",
                        pincode: address.pincode || "",
                        latitude: address.latitude || "",
                        longitude: address.longitude || "",
                        is_default: Boolean(address.is_default),
                      });
                      setShowAddForm(true);
                    }}
                  >
                    <Edit className="w-4 h-4 text-zinc-600" />
                  </button>
                  <button
                    className="p-2 hover:bg-red-50 rounded-lg transition"
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        await customerService.deleteAddress(address.id);
                        setAddresses((prev) =>
                          prev.filter((a) => a.id !== address.id),
                        );
                        setSelectedAddress((sel) =>
                          sel?.id === address.id ? null : sel,
                        );
                        toast.success("Address deleted successfully");
                      } catch (err) {
                        toast.error(err?.message || "Failed to delete address");
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add New Address Button */}
        {!showAddForm && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddForm(true)}
            className="w-full rounded-2xl my-3 border-2 border-dashed border-zinc-300 p-6 bg-white hover:border-[#3d8bff] hover:bg-[#3d8bff]/5 transition flex items-center justify-center gap-3 text-zinc-600 hover:text-[#3d8bff]"
          >
            <Plus className="w-5 h-5" />
            <span className="font-semibold">Add New Address</span>
          </motion.button>
        )}

        {/* Add Address Form */}
        {showAddForm && (
          <AddressForm
            initialData={editingData}
            editingId={editingId}
            isLoaded={isLoaded}
            loadError={loadError}
            onCancel={() => {
              setShowAddForm(false);
              setEditingId(null);
              setEditingData(null);
            }}
            onSave={handleSaveSuccess}
          />
        )}

        <div className="flex justify-between items-center mt-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/book/date-time")}
            className="cursor-pointer flex items-center gap-2 text-zinc-600 hover:text-[#3d8bff] transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            disabled={!selectedAddress || !pincodeAvailable}
            className="cursor-pointer flex items-center gap-2 bg-[#3d8bff] text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg shadow-[#3d8bff]/30 hover:bg-[#3f5ce6] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default Address;
