import { motion } from "framer-motion";
import {
  XCircle,
  Package,
  Calendar,
  MapPin,
  Sparkles,
  Clock,
  History,
  Loader2,
  Star,
  PauseCircle,
} from "lucide-react";
import { CategoryPill } from "./BookingCard";

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

// Helper: is today inside [pause_from, pause_until]?
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

export default function BookingDetailsModal({
  selectedBooking,
  onClose,
  detailLoading,
  detailError,
  extensionOptions,
  extensionHistory,
  rescheduleHistory,
  isExtending,
  handleExtendService,
  setRescheduleModalOpen,
  onOpenPauseModal,
  ratingValue,
  setRatingValue,
  ratingDescription,
  setRatingDescription,
  ratingError,
  ratingMessage,
  ratingSubmitting,
  handleSubmitRating,
}) {
  if (!selectedBooking) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-start sm:items-center justify-center z-50 p-4 sm:pt-0 pt-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl sm:rounded-[32px] p-4 sm:p-8 max-w-lg w-full max-h-[90vh] relative shadow-2xl overflow-y-auto"
      >
        <div className="absolute top-0 left-0 right-0 h-2 bg-[#3d8bff]" />

        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-full transition"
        >
          <XCircle className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
            <Package className="w-6 h-6 text-[#3d8bff]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Booking Details
            </h2>
          </div>
        </div>

        {detailLoading ? (
          <div className="flex flex-col items-center py-12">
            <div className="w-10 h-10 border-4 border-[#3d8bff]/20 border-t-[#3d8bff] rounded-full animate-spin mb-4" />
            <p className="text-zinc-500 text-sm">Fetching details...</p>
          </div>
        ) : detailError ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-center">
            <p className="text-sm font-bold mb-2">Error</p>
            <p className="text-xs">{detailError}</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-50 rounded-2xl">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                  Status
                </p>
                <p className="font-bold text-slate-900 capitalize">
                  {selectedBooking.status === "inprogress"
                    ? "In Progress"
                    : selectedBooking.status}
                </p>
              </div>
              <div className="p-4 bg-zinc-50 rounded-2xl">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                  Payment
                </p>
                <p className="font-bold text-slate-900 capitalize">
                  {selectedBooking.payment_status}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Calendar className="w-5 h-5 text-zinc-400 mt-0.5" />
                <div>
                  <p className="text-xs text-zinc-500 font-medium mb-0.5">
                    Date & Time
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {formatDate(selectedBooking.booking_date)} •{" "}
                    {selectedBooking.time_slot}
                  </p>
                  {Array.isArray(selectedBooking.services) &&
                    selectedBooking.services.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {selectedBooking.services.map((service, index) => (
                          <div key={index} className="text-xs text-zinc-500">
                            <span className="font-medium">
                              Service {index + 1}:
                            </span>{" "}
                            {service.start_date && (
                              <>
                                <span>
                                  Start: {formatDate(service.start_date)}
                                </span>
                                {service.end_date && (
                                  <span>
                                    {" "}
                                    • End: {formatDate(service.end_date)}
                                  </span>
                                )}
                              </>
                            )}
                            {!service.start_date && (
                              <span>Same as booking date</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-zinc-400 mt-0.5" />
                <div>
                  <p className="text-xs text-zinc-500 font-medium mb-0.5">
                    Service Address
                  </p>
                  <p className="text-sm font-bold text-slate-900 leading-relaxed">
                    {selectedBooking.address}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    {selectedBooking.city}
                  </p>
                </div>
              </div>
            </div>

            {Array.isArray(selectedBooking.services) &&
              selectedBooking.services.length > 0 && (
                <div className="pt-6 border-t border-zinc-100">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">
                    Services Included
                  </p>
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {selectedBooking.services.map((s) => {
                      const isAddon = Boolean(s.is_addon || s.booking_type === "addon");
                      const displayName = isAddon
                        ? s.addon_name || s.addon?.name || s.service?.name
                        : s.service?.name;
                      const qty = isAddon
                        ? s.addon_qty ?? s.quantity
                        : s.quantity;
                      const metaLine =
                        (s.service?.service_group ||
                          s.service?.size_type ||
                          s.service?.size_value) &&
                          !isAddon
                          ? [
                            s.service?.service_group,
                            [s.service?.size_value, s.service?.size_type]
                              .filter(Boolean)
                              .join(" "),
                          ]
                            .filter(Boolean)
                            .join(" • ")
                          : null;

                      return (
                        <div
                          key={s.id}
                          className={`flex items-center justify-between p-3 rounded-xl ${isAddon
                              ? "bg-violet-50 border border-violet-100"
                              : "bg-slate-50"
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${isAddon ? "bg-violet-100" : "bg-white"
                                }`}
                            >
                              <Sparkles
                                className={`w-4 h-4 ${isAddon ? "text-violet-600" : "text-[#3d8bff]"
                                  }`}
                              />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                {displayName}
                              </p>
                              {!isAddon && s.service?.category?.name && (
                                <div className="mt-0.5">
                                  <CategoryPill name={s.service.category.name} />
                                </div>
                              )}
                              <p className="text-[10px] text-zinc-500 font-medium capitalize">
                                {isAddon ? "Add-on" : s.booking_type}
                                {s.unit_type && !isAddon
                                  ? ` • ${s.unit_value} ${s.unit_type}`
                                  : ""}
                                {qty > 1 ? ` • Qty ${qty}` : ""}
                              </p>
                              {metaLine && (
                                <p className="text-[10px] text-zinc-400 mt-0.5">
                                  {metaLine}
                                </p>
                              )}
                            </div>
                          </div>
                          <p className="text-sm font-bold text-slate-900">
                            ₹{Number(s.total || s.price || 0).toLocaleString()}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            {extensionOptions && extensionOptions.length > 0 && (
              <div className="pt-6 border-t border-zinc-100">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">
                  Available Extensions
                </p>
                <div className="space-y-3">
                  {extensionOptions.map((opt) => (
                    <div
                      key={opt.id}
                      className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100 group hover:border-amber-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          <Clock className="w-4 h-4 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {opt.name}
                          </p>
                          <p className="text-[10px] text-amber-600 font-medium">
                            {opt.duration_minutes} Minutes extension
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-sm font-bold text-slate-900">
                          ₹{Number(opt.price || 0).toLocaleString()}
                        </p>
                        <button
                          onClick={() =>
                            handleExtendService(selectedBooking.id, opt.id)
                          }
                          disabled={isExtending}
                          className="px-4 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-xl hover:bg-amber-600 transition shadow-lg shadow-amber-500/20 disabled:opacity-50"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {extensionHistory &&
              extensionHistory.extensions &&
              extensionHistory.extensions.length > 0 && (
                <div className="pt-6 border-t border-zinc-100">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">
                    Extension History
                  </p>
                  <div className="space-y-3">
                    {extensionHistory.extensions.map((ext) => (
                      <div
                        key={ext.id}
                        className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            <History className="w-4 h-4 text-zinc-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              Extended by {ext.duration_minutes} Min
                            </p>
                            <p className="text-[10px] text-zinc-500 font-medium">
                              {new Date(ext.created_at).toLocaleString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-900">
                            ₹{Number(ext.amount || 0).toLocaleString()}
                          </p>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider ${String(ext.payment_status).toLowerCase() ===
                              "paid"
                              ? "text-green-600"
                              : "text-amber-600"
                              }`}
                          >
                            {ext.payment_status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {rescheduleHistory &&
              rescheduleHistory.history &&
              rescheduleHistory.history.length > 0 && (
                <div className="pt-6 border-t border-zinc-100">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">
                    Reschedule History
                  </p>
                  <div className="space-y-3">
                    {rescheduleHistory.history.map((reschedule) => (
                      <div
                        key={reschedule.id}
                        className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            <Calendar className="w-4 h-4 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              Rescheduled from {reschedule.old_time_slot} to{" "}
                              {reschedule.new_time_slot}
                            </p>
                            <p className="text-[10px] text-blue-600 font-medium">
                              {new Date(reschedule.created_at).toLocaleString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                            <p className="text-[10px] text-zinc-500 font-medium mt-1">
                              Reason: {reschedule.reason}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            <div className="pt-6 border-t border-zinc-100 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    Grand Total
                  </p>
                  <p className="text-2xl font-black text-slate-900">
                    ₹{Number(selectedBooking.amount || 0).toLocaleString()}
                  </p>
                </div>
                {/* <button
                  onClick={onClose}
                  className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-slate-800 transition shadow-lg"
                >
                  Close
                </button> */}
              </div>

              {selectedBooking.status !== "completed" &&
                selectedBooking.status !== "cancelled" && (
                  <div className="flex flex-col gap-3">
                    {selectedBooking.status === "inprogress" &&
                      selectedBooking.services?.some(
                        (s) =>
                          s.service?.category_id === 6 ||
                          s.service?.slug?.includes("instant"),
                      ) && (
                        <button
                          type="button"
                          disabled={isExtending}
                          onClick={() =>
                            handleExtendService(selectedBooking.id)
                          }
                          className="w-full inline-flex items-center justify-center px-4 py-3 rounded-2xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed transition shadow-lg shadow-amber-500/20"
                        >
                          {isExtending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Sparkles className="w-4 h-4 mr-2" />
                          )}
                          Extend Service (30 Min)
                        </button>
                      )}

                    {selectedBooking.services?.some(
                      (s) =>
                        s.subscription_type?.name
                          ?.toLowerCase()
                          .includes("monthly") ||
                        s.booking_type?.toLowerCase().includes("monthly"),
                    ) && (() => {
                        const paused = isCurrentlyPaused(selectedBooking);
                        return (
                          <>
                            {/* Paused banner */}
                            {(selectedBooking.status === "paused" ||
                              selectedBooking.pause_from) && (
                              <div className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-200 rounded-2xl">
                                <PauseCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-xs font-bold text-rose-700">
                                    {paused
                                      ? "Subscription Paused"
                                      : "Pause Scheduled"}
                                  </p>
                                  {selectedBooking.pause_from &&
                                    selectedBooking.pause_until && (
                                      <p className="text-[11px] text-rose-500 font-medium mt-0.5">
                                        {prettyDate(selectedBooking.pause_from)}
                                        {" → "}
                                        {prettyDate(selectedBooking.pause_until)}
                                      </p>
                                    )}
                                </div>
                              </div>
                            )}

                            {/* Reschedule — disabled during active pause */}
                            <button
                              type="button"
                              disabled={paused}
                              onClick={() =>
                                !paused && setRescheduleModalOpen(true)
                              }
                              title={
                                paused
                                  ? "Reschedule is disabled during pause period"
                                  : undefined
                              }
                              className="w-full inline-flex items-center justify-center px-4 py-3 rounded-2xl border border-zinc-200 text-zinc-700 font-semibold text-sm hover:bg-zinc-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <Calendar className="w-4 h-4 mr-2" />
                              Reschedule Monthly
                            </button>

                            {/* Pause button */}
                            <button
                              type="button"
                              onClick={onOpenPauseModal}
                              className="w-full inline-flex items-center justify-center px-4 py-3 rounded-2xl border border-rose-200 text-rose-600 font-semibold text-sm hover:bg-rose-50 transition"
                            >
                              <PauseCircle className="w-4 h-4 mr-2" />
                              Pause Subscription
                            </button>
                          </>
                        );
                      })()}
                  </div>
                )}

              {selectedBooking.status === "completed" && (
                <div className="pt-4 border-t border-zinc-100 space-y-3">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    Rate Your Service
                  </p>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRatingValue(String(n))}
                        className={`p-1 rounded-full ${Number(ratingValue) >= n
                          ? "text-yellow-400"
                          : "text-zinc-300"
                          }`}
                      >
                        <Star
                          className="w-4 h-4"
                          fill={Number(ratingValue) >= n ? "#facc15" : "none"}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-xs text-zinc-500">
                      {ratingValue}/5
                    </span>
                  </div>

                  <textarea
                    rows={3}
                    value={ratingDescription}
                    onChange={(e) => setRatingDescription(e.target.value)}
                    className="w-full border border-zinc-200 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:border-[#3d8bff] resize-none"
                    placeholder="Share your experience (optional)"
                  />

                  {ratingError && (
                    <p className="text-xs text-red-500">{ratingError}</p>
                  )}
                  {ratingMessage && (
                    <p className="text-xs text-green-600">{ratingMessage}</p>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSubmitRating}
                      disabled={ratingSubmitting}
                      className="inline-flex items-center justify-center px-4 py-2 rounded-2xl bg-[#3d8bff] text-white text-sm font-semibold hover:bg-[#3f5ce6] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {ratingSubmitting ? "Submitting..." : "Submit Rating"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
