import { motion } from "framer-motion";
import { X, Calendar, Clock, Loader2 } from "lucide-react";
import { useEffect, useMemo } from "react";

// ─── Slot generation helpers ─────────────────────────────────────────────────

const SLOT_START_MINUTES = 9 * 60;   // 09:00
const SLOT_END_MINUTES   = 18 * 60;  // 18:00  (6:00 PM)
const SLOT_INTERVAL      = 30;       // 30-minute intervals

/** Convert total minutes from midnight → "HH:MM AM/PM" display string */
function minutesToDisplay(totalMinutes) {
  const h24 = Math.floor(totalMinutes / 60);
  const m   = totalMinutes % 60;
  const ampm = h24 >= 12 ? "PM" : "AM";
  const h12  = h24 % 12 || 12;
  const mm   = String(m).padStart(2, "0");
  return `${String(h12).padStart(2, "0")}:${mm} ${ampm}`;
}

/** Convert "HH:MM AM/PM" → total minutes from midnight */
function displayToMinutes(timeStr) {
  if (!timeStr) return -1;
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return -1;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

/**
 * Generate all 30-min start slots between 09:00 and 18:00.
 * A slot is DISABLED if   startMinutes + durationMinutes > SLOT_END_MINUTES
 */
function generateSlots(durationMinutes) {
  const slots = [];
  for (
    let start = SLOT_START_MINUTES;
    start < SLOT_END_MINUTES;
    start += SLOT_INTERVAL
  ) {
    const end = start + durationMinutes;
    slots.push({
      value:    minutesToDisplay(start),                // stored in rescheduleData.time_slot
      label:    minutesToDisplay(start),                // shown to user
      endLabel: minutesToDisplay(Math.min(end, SLOT_END_MINUTES)),
      disabled: end > SLOT_END_MINUTES,
    });
  }
  return slots;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RescheduleModal({
  isOpen,
  onClose,
  selectedBooking,
  rescheduleData,
  setRescheduleData,
  rescheduleLoading,
  rescheduleError,
  handleRescheduleMonthly,
}) {
  // Derive service duration from the booking object (minutes).
  // Falls back to 60 min if the API doesn't return a duration field.
  const serviceDurationMinutes = useMemo(() => {
    if (!selectedBooking) return 60;
    return (
      Number(selectedBooking.service_duration_minutes) ||
      Number(selectedBooking.duration_minutes) ||
      Number(selectedBooking.duration) ||
      60
    );
  }, [selectedBooking]);

  // Pre-generated slot list (recalculated only when duration changes)
  const slots = useMemo(
    () => generateSlots(serviceDurationMinutes),
    [serviceDurationMinutes]
  );

  // Sync selectedBooking → rescheduleData when modal opens
  useEffect(() => {
    if (!isOpen || !selectedBooking) return;

    let formattedDate = "";
    if (selectedBooking.booking_date) {
      try {
        formattedDate = new Date(selectedBooking.booking_date)
          .toISOString()
          .split("T")[0];
      } catch {
        formattedDate = selectedBooking.booking_date;
      }
    }

    // Normalise the current slot value to the start-time format we now use.
    // Legacy values were ranges like "09:00 AM - 12:00 PM"; extract the start.
    let currentSlot = selectedBooking.time_slot || "";
    if (currentSlot.includes(" - ")) {
      currentSlot = currentSlot.split(" - ")[0].trim();
    }
    // Zero-pad if needed ("9:00 AM" → "09:00 AM")
    currentSlot = currentSlot.replace(/^(\d):/, "0$1:");

    // Verify it's actually one of our slots; if not, leave blank so user picks
    const isValid = slots.some((s) => s.value === currentSlot);

    setRescheduleData((prev) => ({
      ...prev,
      date:      formattedDate,
      time_slot: isValid ? currentSlot : "",
      reason:    prev.reason || "",
    }));
  }, [isOpen, selectedBooking, slots, setRescheduleData]);

  if (!isOpen) return null;

  // ── Formatted current slot display ─────────────────────────────────────────
  const currentSlotDisplay = (() => {
    if (!selectedBooking?.time_slot) return null;
    const raw = selectedBooking.time_slot;
    if (raw.includes(" - ")) return raw; // already a range
    const startMin = displayToMinutes(raw);
    if (startMin === -1) return raw;
    const endMin = startMin + serviceDurationMinutes;
    return `${minutesToDisplay(startMin)} – ${minutesToDisplay(Math.min(endMin, SLOT_END_MINUTES))}`;
  })();

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        className="bg-white rounded-[32px] p-8 max-w-lg w-full relative shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6 text-[#3d8bff]" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900">
              Reschedule Service
            </h3>
            <p className="text-sm text-zinc-500 font-medium">
              Pick a new start time for your visit
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Current slot info banner */}
          {selectedBooking && (
            <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#3d8bff] uppercase tracking-widest">
                Current Time Slot
              </span>
              <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#3d8bff] shrink-0" />
                {selectedBooking.booking_date
                  ? new Date(selectedBooking.booking_date).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" }
                    )
                  : ""}
                {currentSlotDisplay ? ` • ${currentSlotDisplay}` : ""}
              </p>
            </div>
          )}

          {/* Duration badge */}
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
            <Clock className="w-3.5 h-3.5" />
            Service duration:&nbsp;
            <span className="text-[#3d8bff]">
              {serviceDurationMinutes >= 60
                ? `${serviceDurationMinutes / 60} hr${serviceDurationMinutes > 60 ? "s" : ""}`
                : `${serviceDurationMinutes} mins`}
            </span>
            <span className="ml-auto text-zinc-400 font-normal">
              9:00 AM – 6:00 PM
            </span>
          </div>

          {/* ── Time Slot Grid ──────────────────────────────────────────────── */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
              Choose New Start Time
            </label>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.map((slot) => {
                const isSelected = rescheduleData.time_slot === slot.value;
                const isDisabled = slot.disabled;

                return (
                  <button
                    key={slot.value}
                    type="button"
                    disabled={isDisabled}
                    onClick={() =>
                      !isDisabled &&
                      setRescheduleData((prev) => ({
                        ...prev,
                        time_slot: slot.value,
                      }))
                    }
                    title={
                      isDisabled
                        ? `Service would end after 6:00 PM`
                        : `${slot.value} – ${slot.endLabel}`
                    }
                    className={`
                      relative py-2.5 px-2 rounded-xl text-xs font-semibold text-center
                      transition-all duration-150 border-2
                      ${
                        isDisabled
                          ? "border-zinc-100 bg-zinc-50 text-zinc-300 cursor-not-allowed"
                          : isSelected
                          ? "border-[#3d8bff] bg-[#3d8bff] text-white shadow-md shadow-blue-400/25"
                          : "border-zinc-200 bg-white text-zinc-700 hover:border-[#3d8bff] hover:text-[#3d8bff] hover:bg-blue-50/40 cursor-pointer"
                      }
                    `}
                  >
                    {slot.label}
                    {isDisabled && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="w-full h-px bg-zinc-200 rotate-12" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected slot → shows end time */}
            {rescheduleData.time_slot && (
              <p className="text-xs text-zinc-500 font-medium ml-1 mt-1">
                Selected:{" "}
                <span className="text-[#3d8bff] font-bold">
                  {rescheduleData.time_slot}
                  {" – "}
                  {minutesToDisplay(
                    Math.min(
                      displayToMinutes(rescheduleData.time_slot) +
                        serviceDurationMinutes,
                      SLOT_END_MINUTES
                    )
                  )}
                </span>
              </p>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
              Reason (Optional)
            </label>
            <textarea
              value={rescheduleData.reason}
              onChange={(e) =>
                setRescheduleData((prev) => ({
                  ...prev,
                  reason: e.target.value,
                }))
              }
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:border-[#3d8bff] focus:bg-white transition-all font-medium resize-none"
              placeholder="Why are you rescheduling?"
              rows={3}
            />
          </div>

          {/* Error */}
          {rescheduleError && (
            <p className="text-xs text-red-500 font-bold bg-red-50 p-3 rounded-xl border border-red-100">
              {rescheduleError}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-4 bg-zinc-100 text-zinc-700 rounded-2xl font-bold hover:bg-zinc-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleRescheduleMonthly}
              disabled={
                rescheduleLoading ||
                !rescheduleData.date ||
                !rescheduleData.time_slot
              }
              className="flex-1 py-4 bg-[#3d8bff] text-white rounded-2xl font-bold hover:bg-[#3f5ce6] transition shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {rescheduleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Confirm"
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
