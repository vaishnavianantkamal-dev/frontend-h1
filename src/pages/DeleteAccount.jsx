import { motion } from "framer-motion";
import { Mail, ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { customerService } from "../api/services/customer";

export default function DeleteAccount() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    phone: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.fullName || !formData.phone) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        email: formData.email,
        full_name: formData.fullName,
        phone: formData.phone,
      };
      const res = await customerService.requestDeleteAccount(payload);
      toast.success(
        res?.message ||
          "Request submitted successfully. We will respond promptly.",
      );
      setFormData({ email: "", fullName: "", phone: "" });
    } catch (error) {
      toast.error(error?.message || "Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full text-center space-y-8"
      >
        <h1 className="text-4xl md:text-4xl font-black text-slate-900 tracking-tight">
          Delete Account
        </h1>

        <div className="space-y-6 text-zinc-600 text-lg md:text-lg leading-relaxed max-w-xl mx-auto">
          <p>
            To delete your account, please submit your phone number associated
            with your Hobit1 (mobile app or web) account below or email{" "}
            <a
              href="mailto:support@hobit.com"
              className="text-[#3d8bff] hover:underline"
            >
              support@hobit.club
            </a>{" "}
            with your request for account deletion.
          </p>
          <p>
            We will respond promptly. User data including name, phone number,
            and address will be deleted from our database.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-w-lg mx-auto pt-8"
        >
          <div className="relative">
            <input
              type="email"
              required
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-4 rounded-xl border border-zinc-200 focus:border-[#3d8bff] focus:ring-2 focus:ring-[#3d8bff]/10 outline-none transition bg-zinc-50/50"
            />
            <span className="absolute right-4 top-2 text-zinc-400 text-xs">
              *
            </span>
          </div>

          <div className="relative">
            <input
              type="text"
              required
              placeholder="Full name"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className="w-full px-4 py-4 rounded-xl border border-zinc-200 focus:border-[#3d8bff] focus:ring-2 focus:ring-[#3d8bff]/10 outline-none transition bg-zinc-50/50"
            />
            <span className="absolute right-4 top-2 text-zinc-400 text-xs">
              *
            </span>
          </div>

          <div className="relative">
            <input
              type="tel"
              required
              placeholder="Phone number"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full px-4 py-4 rounded-xl border border-zinc-200 focus:border-[#3d8bff] focus:ring-2 focus:ring-[#3d8bff]/10 outline-none transition bg-zinc-50/50"
            />
            <span className="absolute right-4 top-2 text-zinc-400 text-xs">
              *
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#3d8bff] text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-zinc-800 transition disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Submit"
              )}
              <ArrowRight className="w-5 h-5" />
            </button>

            <div className="px-4 py-2 border border-zinc-200 rounded-lg bg-zinc-50/50 flex items-center gap-2 text-xs font-medium text-zinc-500">
              Made with Hobit1 <span className="text-[#3d8bff]">✦</span>
            </div>
          </div>
        </form>

        <div className="pt-16 space-y-4">
          <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
            Feel free to reach us at:
          </p>
          <a
            href="mailto:support@hobit.club"
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100 transition group mx-auto"
          >
            <Mail className="w-5 h-5 text-zinc-600 group-hover:text-[#3d8bff] transition-colors" />
            <span className="font-medium text-slate-900 underline underline-offset-4 decoration-zinc-200 group-hover:decoration-[#3d8bff]">
              support@hobit.club
            </span>
          </a>
        </div>
      </motion.div>
    </div>
  );
}
