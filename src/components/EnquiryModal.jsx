import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, User, Phone, Mail, FileText, Loader2, Share2 } from "lucide-react";
import { apiClient } from "../api/client";
import { toast } from "react-hot-toast";

const EnquiryModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    contact_no: "",
    email: "",
    requirements: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    
    if (!formData.contact_no.trim()) {
      newErrors.contact_no = "Contact number is required";
    } else if (!/^\d{10}$/.test(formData.contact_no.trim())) {
      newErrors.contact_no = "Please enter a valid 10-digit number";
    }

    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    if (!formData.requirements.trim()) {
      newErrors.requirements = "Please enter your requirements";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        ...formData,
        contact_no: `+91 ${formData.contact_no.trim()}`,
      };
      const response = await apiClient("/deep-cleaning-enquiries", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      toast.success(
        response?.message || "Enquiry submitted successfully. We will get back to you soon!",
      );
      setFormData({ name: "", contact_no: "", email: "", requirements: "" });
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to submit enquiry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?enquiry=open`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Deep Cleaning Enquiry",
          text: "Submit your deep cleaning enquiry with Hobit1.",
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Enquiry link copied to clipboard!");
      }
    } catch {
      toast.error("Could not share the link. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrs = { ...prev };
        delete newErrs[name];
        return newErrs;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="bg-[#3d8bff] px-6 py-8 text-white relative">
            <div className="absolute top-4 right-4 flex items-center gap-1">
              <button
                onClick={handleShare}
                title="Share enquiry link"
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <Share2 className="h-5 w-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <h2 className="text-2xl font-bold">Deep Cleaning Enquiry</h2>
            <p className="mt-2 text-white/80">Share your details and we&apos;ll get back to you shortly.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
                  <User className="h-4 w-4 text-[#3d8bff]" /> Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className={`w-full px-4 py-3 rounded-xl border bg-zinc-50 outline-none transition-all ${
                    errors.name ? "border-red-500 ring-1 ring-red-500" : "border-zinc-200 focus:border-[#3d8bff] focus:ring-1 focus:ring-[#3d8bff]"
                  }`}
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
              </div>

              {/* Contact Number */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#3d8bff]" /> Contact Number
                </label>
                <input
                  type="tel"
                  name="contact_no"
                  value={formData.contact_no}
                  onChange={handleChange}
                  placeholder="Enter 10-digit number"
                  maxLength={10}
                  className={`w-full px-4 py-3 rounded-xl border bg-zinc-50 outline-none transition-all ${
                    errors.contact_no ? "border-red-500 ring-1 ring-red-500" : "border-zinc-200 focus:border-[#3d8bff] focus:ring-1 focus:ring-[#3d8bff]"
                  }`}
                />
                {errors.contact_no && <p className="text-xs text-red-500">{errors.contact_no}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#3d8bff]" /> Email Address (Optional)
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={`w-full px-4 py-3 rounded-xl border bg-zinc-50 outline-none transition-all ${
                    errors.email ? "border-red-500 ring-1 ring-red-500" : "border-zinc-200 focus:border-[#3d8bff] focus:ring-1 focus:ring-[#3d8bff]"
                  }`}
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>

              {/* Requirements */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#3d8bff]" /> Requirements
                </label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  placeholder="Describe what you are looking for..."
                  rows={4}
                  className={`w-full px-4 py-3 rounded-xl border bg-zinc-50 outline-none transition-all resize-none ${
                    errors.requirements ? "border-red-500 ring-1 ring-red-500" : "border-zinc-200 focus:border-[#3d8bff] focus:ring-1 focus:ring-[#3d8bff]"
                  }`}
                />
                {errors.requirements && <p className="text-xs text-red-500">{errors.requirements}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#3d8bff] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#3d8bff]/20 hover:bg-[#3f5ce6] transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" /> Send Enquiry
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EnquiryModal;
