import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ChevronRight,
  XCircle,
  CheckCircle2,
  Repeat,
  PauseCircle,
} from "lucide-react";

// Is today inside the booking's pause window?
function isCurrentlyPaused(booking) {
  if (!booking?.pause_from || !booking?.pause_until) return false;
  const today = new Date().toISOString().split("T")[0];
  return today >= booking.pause_from && today <= booking.pause_until;
}

function prettyDate(dateStr) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

const formatDate = (dateString) => {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return String(dateString || "");
  }
};

// Deterministic color per category name, so the same category always
// looks the same across cards.
const CATEGORY_COLORS = [
  { bg: "bg-violet-50", text: "text-violet-600" },
  { bg: "bg-emerald-50", text: "text-emerald-600" },
  { bg: "bg-amber-50", text: "text-amber-600" },
  { bg: "bg-rose-50", text: "text-rose-600" },
  { bg: "bg-cyan-50", text: "text-cyan-600" },
  { bg: "bg-indigo-50", text: "text-indigo-600" },
  { bg: "bg-orange-50", text: "text-orange-600" },
  { bg: "bg-teal-50", text: "text-teal-600" },
];

export function getCategoryColor(name) {
  if (!name) return CATEGORY_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return CATEGORY_COLORS[hash % CATEGORY_COLORS.length];
}

export function CategoryPill({ name, className = "" }) {
  if (!name) return null;
  const { bg, text } = getCategoryColor(name);
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${bg} ${text} ${className}`}
    >
      {name}
    </span>
  );
}

export function ActiveBookingCard({
  booking,
  index,
  onDetails,
  onTrack,
  onPayment,
  onViewCode,
}) {
  const firstService = booking.services?.[0];
  const serviceName = firstService?.service?.name || "Cleaning Service";
  const categoryName = firstService?.service?.category?.name;
  const moreCount = (booking.services?.length || 1) - 1;

  const isPastDate = booking.booking_date
    ? new Date(booking.booking_date).setHours(0, 0, 0, 0) <
    new Date().setHours(0, 0, 0, 0)
    : false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group bg-white rounded-3xl border border-zinc-100 p-6 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRight className="w-6 h-6 text-zinc-300" />
      </div>

      <div className="flex items-start gap-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h3 className="text-xl font-bold text-slate-900 truncate max-w-[200px]">
              {serviceName}
            </h3>
            <span
              className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${booking.status === "Assigned"
                ? "bg-green-100 text-green-700"
                : "bg-blue-100 text-blue-700"
                }`}
            >
              {booking.status}
            </span>
          </div>
          {categoryName && (
            <div className="mb-2">
              <CategoryPill name={categoryName} />
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 mt-4">
            <div className="flex items-center gap-2.5 text-zinc-600 bg-zinc-50 p-2.5 rounded-xl">
              <Calendar className="w-4 h-4 text-[#3d8bff]" />
              <span className="text-sm font-medium">
                {formatDate(booking.booking_date)}
              </span>
              <div className="w-1 h-1 bg-zinc-300 rounded-full mx-1" />
              <Clock className="w-4 h-4 text-[#3d8bff]" />
              <span className="text-sm font-medium">{booking.time_slot}</span>
            </div>

            <div className="flex items-start gap-2.5 text-zinc-600 px-2.5">
              <MapPin className="w-4 h-4 text-[#3d8bff] mt-0.5 shrink-0" />
              <span className="text-sm font-medium line-clamp-1">
                {booking.address}
              </span>
            </div>
          </div>

          {moreCount > 0 && (
            <div className="mt-4 flex items-center gap-2">
              <div className="flex -space-x-2">
                {[...Array(Math.min(moreCount, 3))].map((_, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center"
                  >
                    <Sparkles className="w-3 h-3 text-[#3d8bff]" />
                  </div>
                ))}
              </div>
              <p className="text-xs text-zinc-500 font-medium">
                + {moreCount} more service{moreCount > 1 ? "s" : ""}
              </p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-zinc-50 flex items-center justify-between gap-4">
            <p className="text-lg font-bold text-slate-900">
              ₹{Number(booking.amount || 0).toLocaleString()}
            </p>
            <div className="flex gap-2">
              <button
                className="px-5 py-2.5 bg-[#3d8bff] text-white rounded-xl text-sm font-bold hover:bg-[#3f5ce6] transition shadow-lg shadow-blue-500/10"
                onClick={onDetails}
              >
                Details
              </button>

              {booking.status === "assigned" && (
                <button
                  className="px-5 py-2.5 bg-white border border-zinc-200 text-zinc-700 rounded-xl text-sm font-bold hover:border-[#3d8bff] hover:text-[#3d8bff] transition"
                  onClick={onTrack}
                >
                  Track
                </button>
              )}

              {booking.status === "assigned" && onViewCode && (
                <button
                  className="px-5 py-2.5 bg-white border border-[#3d8bff] text-[#3d8bff] rounded-xl text-sm font-bold hover:bg-[#3d8bff] hover:text-white transition"
                  onClick={onViewCode}
                >
                  View Code
                </button>
              )}

              {(booking.payment_status === "unpaid" ||
                booking.payment_status === "payment_pending") &&
                !isPastDate && (
                  <button
                    className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition shadow-lg shadow-green-500/10"
                    onClick={onPayment}
                  >
                    Continue Payment
                  </button>
                )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function PastBookingCard({ booking, index, onDetails }) {
  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onDetails}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onDetails?.();
        }
      }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl border border-zinc-100 p-5 hover:border-[#3d8bff]/30 transition group cursor-pointer"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${booking.status === "cancelled" ? "bg-red-50" : "bg-green-50"
              }`}
          >
            {booking.status === "cancelled" ? (
              <XCircle className="w-6 h-6 text-red-500" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            )}
          </div>

          <div>
            <h3 className="font-bold text-slate-900 group-hover:text-[#3d8bff] transition">
              {booking.services?.[0]?.service?.name || "Cleaning Service"}
            </h3>
            {booking.services?.[0]?.service?.category?.name && (
              <div className="mt-1">
                <CategoryPill
                  name={booking.services[0].service.category.name}
                />
              </div>
            )}
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(booking.booking_date)}
              </span>
              <div className="w-1 h-1 bg-zinc-300 rounded-full" />
              <span className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                <Clock className="w-3.5 h-3.5" />
                {booking.time_slot}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  booking.status === "cancelled"
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {booking.status || "Completed"}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  booking.payment_status === "paid"
                    ? "bg-emerald-100 text-emerald-700"
                    : booking.payment_status === "payment_pending"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-zinc-100 text-zinc-600"
                }`}
              >
                {booking.payment_status === "paid"
                  ? "Paid"
                  : booking.payment_status === "payment_pending"
                    ? "Pending"
                    : (booking.payment_status || "Unpaid").replace(/_/g, " ")}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 mt-4 md:mt-0">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-900">
              ₹{Number(booking.amount || 0).toLocaleString()}
            </p>
            <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">
              Total Paid
            </p>
          </div>
          <div className="p-2 hover:bg-zinc-50 rounded-lg transition pointer-events-none">
            <ChevronRight className="w-5 h-5 text-zinc-400" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function SubscriptionCard({
  booking,
  index,
  onDetails,
  onReschedule,
  onPause,
}) {
  const sub = booking.services?.[0];
  const serviceName = sub?.service?.name || "Subscription";
  const categoryName = sub?.service?.category?.name;
  const startDate = sub?.start_date || booking.booking_date;
  const endDate = sub?.end_date;

  const paused = isCurrentlyPaused(booking);
  const isPaused =
    paused ||
    String(booking.status || "").toLowerCase() === "paused";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm relative overflow-hidden group hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center justify-between mb-6">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            isPaused ? "bg-rose-50" : "bg-[#3d8bff]/10"
          }`}
        >
          {isPaused ? (
            <PauseCircle className="w-6 h-6 text-rose-500" />
          ) : (
            <Repeat className="w-6 h-6 text-[#3d8bff]" />
          )}
        </div>
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
            isPaused
              ? "bg-rose-50 text-rose-600 border-rose-200"
              : "bg-green-50 text-green-700 border-green-200"
          }`}
        >
          {isPaused ? "Paused" : booking.status}
        </span>
      </div>

      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-1">{serviceName}</h3>
        {categoryName && (
          <div className="mb-1">
            <CategoryPill name={categoryName} />
          </div>
        )}
        <div className="flex items-center gap-2 text-zinc-600 text-sm mb-3">
          <Calendar className="w-4 h-4" />
          <span>
            {startDate && formatDate(startDate)}{" "}
            {endDate && `- ${formatDate(endDate)}`}
          </span>
        </div>

        {/* Paused date range banner */}
        {booking.pause_from && booking.pause_until && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-rose-50 border border-rose-100 rounded-xl">
            <PauseCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <p className="text-[11px] font-bold text-rose-600">
              {paused ? "Paused" : "Pause Scheduled"}:{" "}
              {prettyDate(booking.pause_from)} →{" "}
              {prettyDate(booking.pause_until)}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-200">
          <div>
            <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">
              Location
            </p>
            <p className="font-bold text-sm text-slate-900 truncate">
              {booking.city}
            </p>
          </div>
          <div>
            <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">
              Monthly
            </p>
            <p className="font-bold text-sm text-slate-900">
              ₹{Number(booking.amount || 0).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-2 flex-wrap">
          <button
            onClick={onDetails}
            className="flex-1 min-w-[80px] px-4 py-3 bg-[#3d8bff] text-white rounded-2xl text-sm font-bold hover:bg-[#3f5ce6] transition"
          >
            Details
          </button>
          <button
            onClick={onReschedule}
            disabled={paused}
            title={paused ? "Reschedule is disabled during pause" : undefined}
            className="flex-1 min-w-[80px] px-4 py-3 bg-zinc-100 text-zinc-700 rounded-2xl text-sm font-bold hover:bg-zinc-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Reschedule
          </button>
          <button
            onClick={onPause}
            className="flex-1 min-w-[80px] px-4 py-3 bg-rose-50 text-rose-600 border border-rose-200 rounded-2xl text-sm font-bold hover:bg-rose-100 transition"
          >
            Pause
          </button>
        </div>
      </div>
    </motion.div>
  );
}
