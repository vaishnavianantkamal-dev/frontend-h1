import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Plus,
  Star,
  Edit,
  Trash2,
  Sparkles,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import AddressForm from "../booking/AddressForm";
import { customerService } from "../../api/services/customer";
import toast from "react-hot-toast";

export default function AddressTab({
  showAddressForm,
  setShowAddressForm,
  editingAddress,
  setEditingAddress,
  addresses,
  handleSetDefaultAddress,
  handleDeleteAddress,
  loadAddresses,
  isLoaded,
  loadError,
}) {
  const [pincodeAvailability, setPincodeAvailability] = useState({});

  useEffect(() => {
    const checkAllPincodes = async () => {
      const results = {};
      for (const addr of addresses) {
        if (addr.pincode && !results[addr.pincode]) {
          try {
            const res = await customerService.checkPincode(addr.pincode);
            results[addr.pincode] = res?.available || false;
          } catch {
            results[addr.pincode] = true; // Default to true on error
          }
        }
      }
      setPincodeAvailability(results);
    };

    if (addresses.length > 0) {
      checkAllPincodes();
    }
  }, [addresses]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-[32px] border border-zinc-100 p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
            <MapPin className="w-6 h-6 text-[#3d8bff]" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900">Saved Address</h2>
            <p className="text-zinc-500 font-medium text-sm">
              Manage your service locations
            </p>
          </div>
          <button
            onClick={() => {
              setEditingAddress(null);
              setShowAddressForm(true);
            }}
            className="p-2 rounded-lg hover:bg-blue-50 transition"
            aria-label="Add Address"
          >
            <Plus className="w-5 h-5 text-[#3d8bff]" />
          </button>
        </div>

        {showAddressForm ? (
          <AddressForm
            editingId={editingAddress?.id}
            isLoaded={isLoaded}
            loadError={loadError}
            initialData={
              editingAddress
                ? {
                    type: editingAddress.label || "Home",
                    house_no: editingAddress.house_no || "",
                    building: editingAddress.building || "",
                    locality: editingAddress.locality || "",
                    landmark: editingAddress.landmark || "",
                    city: editingAddress.city || "",
                    state: editingAddress.state || "",
                    pincode: editingAddress.pincode || "",
                    latitude: editingAddress.latitude || "",
                    longitude: editingAddress.longitude || "",
                    is_default: Boolean(editingAddress.is_default),
                  }
                : null
            }
            onCancel={() => {
              setShowAddressForm(false);
              setEditingAddress(null);
            }}
            onSave={() => {
              setShowAddressForm(false);
              setEditingAddress(null);
              loadAddresses();
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((addr) => (
              <motion.div
                key={addr.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100 hover:border-[#3d8bff]/30 transition group relative"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-[#3d8bff] text-[10px] font-bold uppercase tracking-wider rounded-lg">
                    {addr.label || "Address"}
                  </span>
                  <div className="flex gap-1">
                    <button
                      className={`p-2 rounded-lg transition ${
                        addr.is_default
                          ? "bg-amber-50 text-amber-600"
                          : "hover:bg-white text-zinc-400 hover:text-[#3d8bff]"
                      }`}
                      onClick={() => handleSetDefaultAddress(addr.id)}
                      aria-label="Make Default"
                      title={addr.is_default ? "Default" : "Make Default"}
                    >
                      <Star className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 hover:bg-white rounded-lg transition text-zinc-400 hover:text-[#3d8bff]"
                      onClick={() => {
                        setEditingAddress(addr);
                        setShowAddressForm(true);
                      }}
                      aria-label="Edit Address"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 hover:bg-red-50 rounded-lg transition text-red-500 hover:text-red-600"
                      onClick={() => handleDeleteAddress(addr.id)}
                      aria-label="Delete Address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-slate-900 font-bold mb-2">
                  {addr.formatted_address ||
                    `${addr.house_no}, ${addr.building}, ${addr.locality}`}
                </p>
                <p className="text-xs text-zinc-500 mb-4">
                  {addr.city} - {addr.pincode}
                </p>

                <div className="flex items-center gap-2 mt-auto">
                  {pincodeAvailability[addr.pincode] === false ? (
                    <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-2 py-1 rounded-lg border border-red-100">
                      <XCircle className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase">
                        Not Available
                      </span>
                    </div>
                  ) : pincodeAvailability[addr.pincode] === true ? (
                    <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                      <CheckCircle2 className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase">
                        Serviceable
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-zinc-400 bg-zinc-100 px-2 py-1 rounded-lg animate-pulse">
                      <div className="w-3 h-3 rounded-full bg-zinc-200" />
                      <span className="text-[10px] font-bold uppercase">
                        Checking...
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            <button
              onClick={() => {
                setEditingAddress(null);
                setShowAddressForm(true);
              }}
              className="border-2 border-dashed border-zinc-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:border-[#3d8bff]/30 hover:bg-blue-50/30 transition group"
            >
              <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center group-hover:bg-blue-100 transition">
                <Sparkles className="w-5 h-5 text-zinc-400 group-hover:text-[#3d8bff]" />
              </div>
              <span className="text-sm font-bold text-zinc-500 group-hover:text-[#3d8bff]">
                Add New Address
              </span>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
