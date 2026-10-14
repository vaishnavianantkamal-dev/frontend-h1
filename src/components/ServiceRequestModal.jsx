import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, MapPin, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { apiClient } from "../api/client";

// Hobit1: booking request form opened from a service card. Saves to
// POST /api/service-requests; the request then shows in Admin > Service Requests.

const TIME_SLOTS = [
  { value: "morning", label: "Morning (8 AM – 12 PM)" },
  { value: "afternoon", label: "Afternoon (12 PM – 4 PM)" },
  { value: "evening", label: "Evening (4 PM – 8 PM)" },
];

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash after service" },
  { value: "upi", label: "UPI after service" },
  { value: "online", label: "Online payment (we'll send a link)" },
];

const EMPTY_FORM = {
  name: "",
  phone: "",
  email: "",
  address: "",
  locality: "",
  landmark: "",
  city: "Nashik",
  pincode: "",
  preferred_date: "",
  preferred_time: "",
  payment_method: "cash",
  notes: "",
};

const todayISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

const inputClass = (hasError) =>
  `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-[#3d8bff]/20 ${
    hasError ? "border-red-400" : "border-zinc-200 focus:border-[#3d8bff]"
  }`;

const Field = ({ label, required, error, children, className = "" }) => (
  <label className={`block ${className}`}>
    <span className="mb-1.5 block text-sm font-medium text-slate-700">
      {label}
      {required && <span className="text-red-500"> *</span>}
    </span>
    {children}
    {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
  </label>
);

const ServiceRequestModal = ({ isOpen, onClose, service }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submittedId, setSubmittedId] = useState(null);

  // Fresh form each time a (different) service is opened; keep contact details
  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setSubmittedId(null);
    }
  }, [isOpen, service?.id]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Location is not supported on this device.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: Number(pos.coords.latitude.toFixed(7)),
          longitude: Number(pos.coords.longitude.toFixed(7)),
        });
        setLocating(false);
        toast.success("Location added");
      },
      () => {
        setLocating(false);
        toast.error("Could not get your location. Please allow location access.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const validateForm = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Please enter your name";
    if (!/^[6-9]\d{9}$/.test(form.phone.trim()))
      e.phone = "Enter a valid 10-digit mobile number";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      e.email = "Enter a valid email address";
    if (!form.address.trim()) e.address = "Please enter your address";
    if (!form.city.trim()) e.city = "Please enter your city";
    if (!/^\d{6}$/.test(form.pincode.trim())) e.pincode = "Pincode must be 6 digits";
    if (!form.payment_method) e.payment_method = "Choose a payment method";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        service_id: String(service.id),
        service_name: service.name,
        category: service.category || "",
        sub_category: service.serviceGroup || null,
        ...Object.fromEntries(
          Object.entries(form).map(([k, v]) => [k, v.trim() === "" ? null : v.trim()]),
        ),
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
      };
      const response = await apiClient("/service-requests", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setSubmittedId(response?.data?.id ?? true);
      setForm((f) => ({ ...f, preferred_date: "", preferred_time: "", notes: "" }));
    } catch (error) {
      toast.error(error.message || "Could not send your request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!service) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-request-title"
            className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-zinc-100 bg-[#3d8bff]/5 px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#3d8bff]">
                  {service.category}
                  {service.serviceGroup ? ` · ${service.serviceGroup}` : ""}
                </p>
                <h2 id="service-request-title" className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">
                  {service.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-full p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {submittedId ? (
              <div className="flex flex-col items-center px-6 py-12 text-center">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
                <h3 className="mt-4 text-xl font-bold text-slate-900">Request received!</h3>
                {typeof submittedId === "number" && (
                  <p className="mt-1 text-sm font-medium text-zinc-500">Request ID #{submittedId}</p>
                )}
                <p className="mt-3 max-w-sm text-zinc-600">
                  Our team will call you on <span className="font-semibold">{form.phone}</span> shortly
                  to confirm your booking for {service.name}.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-8 rounded-full bg-[#3d8bff] px-8 py-3 font-semibold text-white shadow-md shadow-[#3d8bff]/30 transition hover:bg-[#3f5ce6]"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
                <div className="space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
                  {/* Contact */}
                  <section className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Your details</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Full name" required error={errors.name}>
                        <input
                          className={inputClass(errors.name)}
                          value={form.name}
                          onChange={(e) => setField("name", e.target.value)}
                          autoComplete="name"
                          maxLength={100}
                        />
                      </Field>
                      <Field label="Mobile number" required error={errors.phone}>
                        <div className="flex">
                          <span className="inline-flex items-center rounded-l-xl border border-r-0 border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-500">
                            +91
                          </span>
                          <input
                            className={`${inputClass(errors.phone)} rounded-l-none`}
                            value={form.phone}
                            onChange={(e) => setField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                            inputMode="numeric"
                            autoComplete="tel-national"
                          />
                        </div>
                      </Field>
                      <Field label="Email (optional)" error={errors.email} className="sm:col-span-2">
                        <input
                          type="email"
                          className={inputClass(errors.email)}
                          value={form.email}
                          onChange={(e) => setField("email", e.target.value)}
                          autoComplete="email"
                          maxLength={100}
                        />
                      </Field>
                    </div>
                  </section>

                  {/* Address */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Service address</h3>
                      <button
                        type="button"
                        onClick={useMyLocation}
                        disabled={locating}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#3d8bff]/30 px-3 py-1 text-xs font-semibold text-[#3d8bff] transition hover:bg-[#3d8bff]/5 disabled:opacity-60"
                      >
                        {locating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MapPin className="h-3.5 w-3.5" />}
                        {coords ? "Location added ✓" : "Use my current location"}
                      </button>
                    </div>
                    <Field label="House / flat no., building, street" required error={errors.address}>
                      <textarea
                        rows={2}
                        className={inputClass(errors.address)}
                        value={form.address}
                        onChange={(e) => setField("address", e.target.value)}
                        autoComplete="street-address"
                        maxLength={1000}
                      />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Area / locality">
                        <input
                          className={inputClass(false)}
                          value={form.locality}
                          onChange={(e) => setField("locality", e.target.value)}
                          maxLength={150}
                        />
                      </Field>
                      <Field label="Landmark">
                        <input
                          className={inputClass(false)}
                          value={form.landmark}
                          onChange={(e) => setField("landmark", e.target.value)}
                          maxLength={150}
                        />
                      </Field>
                      <Field label="City" required error={errors.city}>
                        <input
                          className={inputClass(errors.city)}
                          value={form.city}
                          onChange={(e) => setField("city", e.target.value)}
                          autoComplete="address-level2"
                          maxLength={100}
                        />
                      </Field>
                      <Field label="Pincode" required error={errors.pincode}>
                        <input
                          className={inputClass(errors.pincode)}
                          value={form.pincode}
                          onChange={(e) => setField("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                          inputMode="numeric"
                          autoComplete="postal-code"
                        />
                      </Field>
                    </div>
                  </section>

                  {/* Visit + payment */}
                  <section className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Visit & payment</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Preferred date">
                        <input
                          type="date"
                          min={todayISO()}
                          className={inputClass(false)}
                          value={form.preferred_date}
                          onChange={(e) => setField("preferred_date", e.target.value)}
                        />
                      </Field>
                      <Field label="Preferred time">
                        <select
                          className={inputClass(false)}
                          value={form.preferred_time}
                          onChange={(e) => setField("preferred_time", e.target.value)}
                        >
                          <option value="">Any time</option>
                          {TIME_SLOTS.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    <div>
                      <span className="mb-1.5 block text-sm font-medium text-slate-700">
                        Payment method <span className="text-red-500">*</span>
                      </span>
                      <div className="grid gap-2 sm:grid-cols-3">
                        {PAYMENT_METHODS.map((p) => (
                          <label
                            key={p.value}
                            className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition ${
                              form.payment_method === p.value
                                ? "border-[#3d8bff] bg-[#3d8bff]/5 font-semibold text-[#3d8bff]"
                                : "border-zinc-200 text-zinc-700 hover:border-[#3d8bff]/50"
                            }`}
                          >
                            <input
                              type="radio"
                              name="payment_method"
                              value={p.value}
                              checked={form.payment_method === p.value}
                              onChange={() => setField("payment_method", p.value)}
                              className="accent-[#3d8bff]"
                            />
                            {p.label}
                          </label>
                        ))}
                      </div>
                      {errors.payment_method && (
                        <span className="mt-1 block text-xs text-red-500">{errors.payment_method}</span>
                      )}
                    </div>
                    <Field label="Anything we should know? (optional)">
                      <textarea
                        rows={2}
                        className={inputClass(false)}
                        value={form.notes}
                        onChange={(e) => setField("notes", e.target.value)}
                        placeholder="e.g. 2 fans to install, ladder not available"
                        maxLength={2000}
                      />
                    </Field>
                  </section>
                </div>

                {/* Footer */}
                <div className="border-t border-zinc-100 bg-white px-5 py-4 sm:px-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3d8bff] py-3 font-bold text-white shadow-lg shadow-[#3d8bff]/20 transition hover:bg-[#3f5ce6] disabled:opacity-70"
                  >
                    {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                    {loading ? "Sending..." : "Request Booking"}
                  </button>
                  <p className="mt-2 text-center text-xs text-zinc-500">
                    No payment now. We'll call you to confirm the price and time.
                  </p>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ServiceRequestModal;
