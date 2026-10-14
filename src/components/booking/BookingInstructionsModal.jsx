import { motion } from "framer-motion";
import { X, Info, AlertTriangle, CheckCircle2 } from "lucide-react";

const splitTextToLines = (text) => {
  if (!text) return [];
  return String(text)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
};

// Popup that shows the subscription-specific booking instructions fetched from
// GET /app/booking-instructions?subscription_id=<id>.
function BookingInstructionsModal({ isOpen, onClose, loading, error, data }) {
  if (!isOpen) return null;

  const payload = data?.data || data || {};
  const heading = payload.heading || "Booking Instructions";
  const instructions = Array.isArray(payload.instructions)
    ? [...payload.instructions].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0),
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-4 py-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 rounded-full p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-slate-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#3d8bff] mb-1">
            Please read before booking
          </p>
          <h2 className="flex items-center gap-2 text-base sm:text-lg font-bold text-slate-900">
            <Info className="w-5 h-5 text-[#3d8bff] shrink-0" />
            {heading}
          </h2>
        </div>

        <div className="px-5 sm:px-6 py-4 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-[#3d8bff]/20 border-t-[#3d8bff] animate-spin" />
              <p className="text-sm text-zinc-600">
                Fetching booking instructions...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
              <p className="text-sm text-zinc-700 font-medium">
                We couldn&apos;t load the booking instructions right now.
              </p>
              <p className="text-xs text-zinc-500 max-w-md">{error}</p>
            </div>
          ) : instructions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
              <Info className="w-7 h-7 text-zinc-400" />
              <p className="text-sm text-zinc-600">
                No specific booking instructions have been added for this
                service yet.
              </p>
            </div>
          ) : (
            <ol className="space-y-3">
              {instructions.map((item, idx) => {
                const lines = splitTextToLines(item.text);
                if (lines.length === 0) return null;
                return (
                  <li
                    key={item.id ?? idx}
                    className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#3d8bff]/10 text-xs font-bold text-[#3d8bff]">
                      {item.order ?? idx + 1}
                    </span>
                    <div className="space-y-1 text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
                      {lines.map((line, i) => (
                        <p key={i}>{line.replace(/^\d+[).]\s*/, "")}</p>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <div className="px-5 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <p className="text-[11px] sm:text-xs text-zinc-600 leading-snug">
              By continuing your booking, you confirm that you have read and
              understood these instructions.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-[#3d8bff] hover:bg-[#1f6fe6] shadow-md shadow-[#3d8bff]/20 transition-colors"
          >
            Got it
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default BookingInstructionsModal;
