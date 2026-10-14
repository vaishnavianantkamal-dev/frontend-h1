import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { adminService } from "../../api/services/admin";
import { workerService } from "../../api/services/worker";
import toast from "react-hot-toast";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Lock,
  Mail,
  MapPin,
  Phone,
  Plus,
  User,
  X,
  ChevronDown,
} from "lucide-react";

// MultiSelect Component
const MultiSelect = ({
  label,
  options,
  selectedValues,
  onChange,
  placeholder,
  loading,
  disabled,
  icon: Icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSelection = (value) => {
    const newSelection = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onChange(newSelection);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-700 ml-1">
        {label}
      </label>
      <div className="relative group">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-[#3d8bff] transition-colors" />
        )}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full text-left min-h-[54px] ${
            Icon ? "pl-12" : "px-4"
          } pr-10 py-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:border-[#3d8bff] focus:ring-4 focus:ring-[#3d8bff]/10 outline-none transition-all font-medium text-slate-700 relative ${
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          {selectedValues.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedValues.map((val) => {
                const option = options.find((o) => o.value == val);
                return (
                  <span
                    key={val}
                    className="bg-[#3d8bff]/10 text-[#3d8bff] text-xs px-2 py-1 rounded-full flex items-center gap-1"
                  >
                    {option?.label || val}
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelection(val);
                      }}
                      className="hover:bg-[#3d8bff]/20 rounded-full p-0.5 cursor-pointer"
                    >
                      <X size={12} />
                    </span>
                  </span>
                );
              })}
            </div>
          ) : (
            <span className="text-zinc-400">
              {loading ? "Loading..." : placeholder}
            </span>
          )}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown className="w-5 h-5 text-zinc-400" />
          </div>
        </button>

        {isOpen && !disabled && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute z-20 w-full mt-2 bg-white border border-zinc-100 rounded-xl shadow-xl max-h-60 overflow-auto p-2">
              {options.length === 0 ? (
                <div className="p-2 text-center text-sm text-zinc-500">
                  No options available
                </div>
              ) : (
                options.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => toggleSelection(option.value)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedValues.includes(option.value)
                        ? "bg-[#3d8bff]/5 text-[#3d8bff]"
                        : "hover:bg-zinc-50 text-slate-700"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        selectedValues.includes(option.value)
                          ? "bg-[#3d8bff] border-[#3d8bff]"
                          : "border-zinc-300"
                      }`}
                    >
                      {selectedValues.includes(option.value) && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      )}
                    </div>
                    <span className="text-sm font-medium">{option.label}</span>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

function PartnerRegister({ onBack, onClose }) {
  const [formData, setFormData] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      name: "",
      email: "",
      phone: "",
      ref: params.get("ref") || "",
      category: [],
      service: [],
      status: 0,
      city: "",
      zone: "",
      area: "",
      password: "",
    };
  });

  const [unavailableDates, setUnavailableDates] = useState([]); // Stores dates that are marked as unavailable
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [cities, setCities] = useState([]);
  const [zones, setZones] = useState([]);
  const [areas, setAreas] = useState([]);
  const [filteredZones, setFilteredZones] = useState([]);
  const [filteredAreas, setFilteredAreas] = useState([]);

  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingCategories(true);
      setLoadingLocations(true);
      try {
        const [catsData, citiesData, zonesData, areasData] = await Promise.all([
          adminService.getServiceCategories(),
          adminService.getCities(),
          adminService.getZones(),
          adminService.getAreas(),
        ]);
        setCategories(catsData);
        setCities(citiesData);
        setZones(zonesData);
        setAreas(areasData);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setLoadingCategories(false);
        setLoadingLocations(false);
      }
    };

    fetchInitialData();
  }, []);

  // Filter zones when city changes
  useEffect(() => {
    if (formData.city) {
      const cityId = parseInt(formData.city);
      const cityZones = zones.filter((zone) => zone.city_id === cityId);
      setFilteredZones(cityZones);
      // Reset dependent fields if they don't belong to new city
      if (
        formData.zone &&
        !cityZones.find((z) => z.id === parseInt(formData.zone))
      ) {
        setFormData((prev) => ({ ...prev, zone: "", area: "" }));
      }
    } else {
      setFilteredZones([]);
    }
  }, [formData.city, zones]);

  // Filter areas when zone changes
  useEffect(() => {
    if (formData.zone) {
      const zoneId = parseInt(formData.zone);
      const zoneAreas = areas.filter((area) => area.zone_id === zoneId);
      setFilteredAreas(zoneAreas);
      // Reset dependent field
      if (
        formData.area &&
        !zoneAreas.find((a) => a.id === parseInt(formData.area))
      ) {
        setFormData((prev) => ({ ...prev, area: "" }));
      }
    } else {
      setFilteredAreas([]);
    }
  }, [formData.zone, areas]);

  useEffect(() => {
    if (formData.category && formData.category.length > 0) {
      const fetchServices = async () => {
        setLoadingServices(true);
        try {
          const data = await adminService.getServices();
          // Filter services where service.category_id is included in formData.category array
          // formData.category contains category IDs
          const selectedCategoryIds = formData.category.map((id) =>
            parseInt(id),
          );
          const filteredServices = data.filter((service) =>
            selectedCategoryIds.includes(service.category_id),
          );
          setServices(filteredServices);
        } catch (error) {
          console.error("Error fetching services:", error);
        } finally {
          setLoadingServices(false);
        }
      };

      fetchServices();
    } else {
      setServices([]);
    }
  }, [formData.category]);

  const [timeSlots, setTimeSlots] = useState([]);
  const [newSlot, setNewSlot] = useState({
    start: "09:00",
    startPeriod: "AM",
    end: "05:00",
    endPeriod: "PM",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSlot = () => {
    setTimeSlots([...timeSlots, { ...newSlot }]);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const month = "" + (d.getMonth() + 1);
    const day = "" + d.getDate();
    const year = d.getFullYear();
    return [year, month.padStart(2, "0"), day.padStart(2, "0")].join("-");
  };

  // Calendar Logic: show current month, but availability defaults to 1 year
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const getDaysArray = () => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay(); // 0 (Sun) - 6 (Sat)
    const startOffset = firstDay === 0 ? 6 : firstDay - 1; // Monday as first column
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const slots = [];
    for (let i = 0; i < startOffset; i++) slots.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
      slots.push(formatDate(new Date(currentYear, currentMonth, i)));
    }
    return slots;
  };

  const days = getDaysArray();

  const toggleDateAvailability = (day) => {
    if (!day) return;
    setUnavailableDates((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day);
      } else {
        return [...prev, day];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const convertTime = (time, period) => {
      let [hours, minutes] = time.split(":");
      hours = parseInt(hours);
      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
      return `${hours.toString().padStart(2, "0")}:${minutes}`;
    };

    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.city ||
      !formData.zone ||
      !formData.area ||
      formData.category.length === 0 ||
      formData.service.length === 0
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    // Default availability: all dates from today for 1 year, minus explicitly unavailable dates
    const allDates = [];
    const end = new Date(today);
    end.setFullYear(end.getFullYear() + 1);
    for (let d = new Date(today); d <= end; d.setDate(d.getDate() + 1)) {
      allDates.push(formatDate(d));
    }

    const availableDates = allDates.filter(
      (d) => !unavailableDates.includes(d),
    );

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      category_ids: formData.category.map(Number),
      service_ids: formData.service.map(Number),
      city_id: parseInt(formData.city),
      zone_id: parseInt(formData.zone),
      area_id: parseInt(formData.area),
      is_active: parseInt(formData.status),
      available_dates: availableDates,
      available_times: timeSlots.map((slot) => ({
        start: convertTime(slot.start, slot.startPeriod),
        end: convertTime(slot.end, slot.endPeriod),
      })),
    };

    if (formData.ref?.trim()) {
      payload.ref = formData.ref.trim();
    }

    try {
      console.log("Submitting payload:", payload);
      await workerService.register(payload);
      toast.success("Registration Successful! Please login.");
      if (onBack) onBack();
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error("Registration failed: " + error.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full h-full flex flex-col bg-white"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-zinc-100 sticky top-0 bg-white z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2.5 hover:bg-zinc-100 rounded-full transition text-zinc-500 hover:text-zinc-800"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Partner Registration
            </h2>
            <p className="text-sm text-zinc-500 font-medium">
              Create your profile to start working
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-zinc-100 rounded-full transition text-zinc-400 hover:text-zinc-700"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
        <form onSubmit={handleSubmit} className="space-y-10 max-w-7xl mx-auto">
          {/* Section: Personal Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#3d8bff]">
                <User className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Personal Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">
                  Name
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-[#3d8bff] transition-colors" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:border-[#3d8bff] focus:ring-4 focus:ring-[#3d8bff]/10 outline-none transition-all placeholder:text-zinc-400 font-medium text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">
                  Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-[#3d8bff] transition-colors" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:border-[#3d8bff] focus:ring-4 focus:ring-[#3d8bff]/10 outline-none transition-all placeholder:text-zinc-400 font-medium text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">
                  Phone
                </label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-[#3d8bff] transition-colors" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:border-[#3d8bff] focus:ring-4 focus:ring-[#3d8bff]/10 outline-none transition-all placeholder:text-zinc-400 font-medium text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">
                  Referral Code <span className="text-zinc-400 text-xs font-normal">(optional)</span>
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-[#3d8bff] transition-colors" />
                  <input
                    type="text"
                    name="ref"
                    value={formData.ref}
                    onChange={handleChange}
                    placeholder="e.g. HOBIT-3-2199"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:border-[#3d8bff] focus:ring-4 focus:ring-[#3d8bff]/10 outline-none transition-all placeholder:text-zinc-400 font-medium text-slate-700"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-zinc-100 w-full" />

          {/* Section: Professional Details */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#3d8bff]">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Professional Details
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <MultiSelect
                label="Categories"
                options={categories.map((cat) => ({
                  label: cat.name,
                  value: cat.id,
                }))}
                selectedValues={formData.category}
                onChange={(newValues) =>
                  setFormData((prev) => ({ ...prev, category: newValues }))
                }
                placeholder="Select Categories"
                loading={loadingCategories}
              />

              <MultiSelect
                label="Services"
                options={services.map((service) => ({
                  label: service.name,
                  value: service.id,
                }))}
                selectedValues={formData.service}
                onChange={(newValues) =>
                  setFormData((prev) => ({ ...prev, service: newValues }))
                }
                placeholder={
                  formData.category.length === 0
                    ? "Select Category First"
                    : "Select Services"
                }
                loading={loadingServices}
                disabled={formData.category.length === 0}
              />

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">
                  Availability Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:border-[#3d8bff] focus:ring-4 focus:ring-[#3d8bff]/10 outline-none transition-all text-slate-700 font-medium appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: `right 1rem center`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "1.5em 1.5em",
                  }}
                >
                  <option value={0}>Available</option>
                  <option value={1}>Unavailable</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">
                  City
                </label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-[#3d8bff] transition-colors" />
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:border-[#3d8bff] focus:ring-4 focus:ring-[#3d8bff]/10 outline-none transition-all text-slate-700 font-medium appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: `right 1rem center`,
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "1.5em 1.5em",
                    }}
                    disabled={loadingLocations}
                  >
                    <option value="">Select City</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">
                  Zone
                </label>
                <select
                  name="zone"
                  value={formData.zone}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:border-[#3d8bff] focus:ring-4 focus:ring-[#3d8bff]/10 outline-none transition-all text-slate-700 font-medium appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: `right 1rem center`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "1.5em 1.5em",
                  }}
                  disabled={!formData.city}
                >
                  <option value="">
                    {!formData.city ? "Select City First" : "Select Zone"}
                  </option>
                  {filteredZones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">
                  Serviceable Area
                </label>
                <select
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:border-[#3d8bff] focus:ring-4 focus:ring-[#3d8bff]/10 outline-none transition-all text-slate-700 font-medium appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: `right 1rem center`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "1.5em 1.5em",
                  }}
                  disabled={!formData.zone}
                >
                  <option value="">
                    {!formData.zone ? "Select Zone First" : "Select Area"}
                  </option>
                  {filteredAreas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2 max-w-md">
            <label className="text-sm font-semibold text-slate-700 ml-1">
              Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-[#3d8bff] transition-colors" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:border-[#3d8bff] focus:ring-4 focus:ring-[#3d8bff]/10 outline-none transition-all placeholder:text-zinc-400 font-medium text-slate-700"
              />
            </div>
          </div>

          <div className="h-px bg-zinc-100 w-full" />

          {/* Section: Availability & Slots */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#3d8bff]">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Availability & Schedule
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Calendar */}
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-semibold text-slate-700">Select Dates</h4>
                  <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
                    1 Year Active by Default
                  </span>
                </div>

                <div className="bg-white rounded-xl">
                  <div className="flex justify-between items-center mb-6 px-2">
                    <button
                      type="button"
                      className="p-1 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-600 transition"
                    >
                      «
                    </button>
                    <button
                      type="button"
                      className="p-1 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-600 transition"
                    >
                      ‹
                    </button>
                    <span className="font-bold text-slate-800 text-lg">
                      {today.toLocaleString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    <button
                      type="button"
                      className="p-1 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-600 transition"
                    >
                      ›
                    </button>
                    <button
                      type="button"
                      className="p-1 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-600 transition"
                    >
                      »
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-2 text-center mb-3">
                    {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(
                      (d) => (
                        <div
                          key={d}
                          className="text-[11px] font-bold text-zinc-400 tracking-wider"
                        >
                          {d}
                        </div>
                      ),
                    )}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {days.map((d, i) => (
                      <div
                        key={i}
                        onClick={() => toggleDateAvailability(d)}
                        className={`h-10 flex items-center justify-center rounded-xl text-sm font-semibold transition cursor-pointer border-2 ${
                          !d
                            ? "invisible border-transparent"
                            : !unavailableDates.includes(d)
                              ? "bg-[#3d8bff] text-white border-[#3d8bff] shadow-md shadow-blue-500/30"
                              : "text-zinc-600 border-zinc-200 bg-zinc-50 hover:bg-zinc-100"
                        }`}
                      >
                        {d ? new Date(d).getDate() : ""}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Time Slots */}
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <h4 className="font-semibold text-slate-700">
                    Daily Time Slots
                  </h4>
                  <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded-full self-start sm:self-auto">
                    {timeSlots.length} Slots Added
                  </span>
                </div>

                <div className="flex-1 flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-end gap-3 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                    <div className="flex-1 w-full sm:w-auto">
                      <label className="text-xs font-semibold text-zinc-500 mb-1.5 block uppercase tracking-wide">
                        Start
                      </label>
                      <div className="flex bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-[#3d8bff]/20 focus-within:border-[#3d8bff] transition-all">
                        <select
                          className="flex-1 py-2.5 px-2 text-sm outline-none bg-transparent font-medium text-slate-700 cursor-pointer"
                          value={newSlot.start}
                          onChange={(e) =>
                            setNewSlot({ ...newSlot, start: e.target.value })
                          }
                        >
                          <option>09:00</option>
                          <option>10:00</option>
                        </select>
                        <div className="border-l border-zinc-100"></div>
                        <select
                          className="w-16 py-2.5 px-2 text-sm outline-none bg-transparent font-medium text-zinc-500 bg-zinc-50 cursor-pointer"
                          value={newSlot.startPeriod}
                          onChange={(e) =>
                            setNewSlot({
                              ...newSlot,
                              startPeriod: e.target.value,
                            })
                          }
                        >
                          <option>AM</option>
                          <option>PM</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex-1 w-full sm:w-auto">
                      <label className="text-xs font-semibold text-zinc-500 mb-1.5 block uppercase tracking-wide">
                        End
                      </label>
                      <div className="flex bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-[#3d8bff]/20 focus-within:border-[#3d8bff] transition-all">
                        <select
                          className="flex-1 py-2.5 px-2 text-sm outline-none bg-transparent font-medium text-slate-700 cursor-pointer"
                          value={newSlot.end}
                          onChange={(e) =>
                            setNewSlot({ ...newSlot, end: e.target.value })
                          }
                        >
                          <option>05:00</option>
                          <option>06:00</option>
                        </select>
                        <div className="border-l border-zinc-100"></div>
                        <select
                          className="w-16 py-2.5 px-2 text-sm outline-none bg-transparent font-medium text-zinc-500 bg-zinc-50 cursor-pointer"
                          value={newSlot.endPeriod}
                          onChange={(e) =>
                            setNewSlot({
                              ...newSlot,
                              endPeriod: e.target.value,
                            })
                          }
                        >
                          <option>PM</option>
                          <option>AM</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSlot}
                      className="bg-[#3d8bff] text-white p-3 rounded-lg hover:bg-[#3f5ce6] transition shadow-lg shadow-[#3d8bff]/20 active:scale-95 sm:self-end"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto max-h-[200px] pr-1 custom-scrollbar">
                    {timeSlots.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-zinc-400 py-8 border-2 border-dashed border-zinc-100 rounded-xl">
                        <Clock className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-sm font-medium">
                          No time slots added yet
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {timeSlots.map((slot, i) => (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={i}
                            className="flex flex-col sm:flex-row sm:items-center justify-between bg-white px-4 py-3 rounded-xl border border-zinc-100 shadow-sm group hover:border-blue-100 transition-colors gap-2 sm:gap-0"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="w-2 h-2 rounded-full bg-[#3d8bff] flex-shrink-0"></div>
                              <span className="font-semibold text-slate-700 text-sm truncate">
                                {slot.start}{" "}
                                <span className="text-xs text-zinc-500 font-medium">
                                  {slot.startPeriod}
                                </span>
                                <span className="mx-2 text-zinc-300">→</span>
                                {slot.end}{" "}
                                <span className="text-xs text-zinc-500 font-medium">
                                  {slot.endPeriod}
                                </span>
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setTimeSlots(
                                  timeSlots.filter((_, idx) => idx !== i),
                                )
                              }
                              className="text-zinc-300 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 pb-2">
            <button
              type="submit"
              className="w-full bg-[#3d8bff] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#3f5ce6] transition shadow-xl shadow-[#3d8bff]/20 flex items-center justify-center gap-3 active:scale-[0.99]"
            >
              <span>Complete Registration</span>
              <div className="bg-white/20 p-1 rounded-full">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </button>
            <p className="text-center text-zinc-400 text-sm mt-4">
              By registering, you agree to our{" "}
              <a href="#" className="text-[#3d8bff] hover:underline">
                Terms of Service
              </a>{" "}
              &{" "}
              <a href="#" className="text-[#3d8bff] hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </form>
      </div>
    </motion.div>
  );
}

export default PartnerRegister;
