import { motion } from "framer-motion";
import { X, PauseCircle, Calendar, Loader2 } from "lucide-react";

// Returns today's date as YYYY-MM-DD string (local time)
function todayString() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Format YYYY-MM-DD → "May 20, 2026"
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

// Diff in days between two YYYY-MM-DD strings (to - from)
function daysDiff(from, to) {
  if (!from || !to) return 0;
  const a = new Date(from + "T00:00:00");
  const b = new Date(to + "T00:00:00");
  return Math.round((b - a) / 86400000);
}

const MIN_PAUSE_DAYS = 7;

export default function PauseModal({
  isOpen,
  onClose,
  pauseData,
  setPauseData,
  pauseLoading,
  pauseError,
  handlePauseSubscription,
}) {
  if (!isOpen) return null;

  const today = todayString();

  // Validate
  const diff = daysDiff(pauseData.pause_from, pauseData.pause_until);
  const fromValid = pauseData.pause_from >= today;
  const untilValid =
    pauseData.pause_until &&
    pauseData.pause_until >= pauseData.pause_from &&
    diff >= MIN_PAUSE_DAYS;

  const canSubmit =
    !pauseLoading &&
    pauseData.pause_from &&
    pauseData.pause_until &&
    fromValid &&
    untilValid;

  // Inline validation messages
  let fromError = "";
  let untilError = "";
  if (pauseData.pause_from && pauseData.pause_from < today) {
    fromError = "Pause From date cannot be in the past.";
  }
  if (pauseData.pause_until) {
    if (pauseData.pause_until < pauseData.pause_from) {
      untilError = "Pause Until must be on or after Pause From.";
    } else if (diff < MIN_PAUSE_DAYS) {
      untilError = `Minimum pause duration is ${MIN_PAUSE_DAYS} days (${diff} day${diff !== 1 ? "s" : ""} selected).`;
    }
  }

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
          <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center shrink-0">
            <PauseCircle className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900">
              Pause Subscription
            </h3>
            <p className="text-sm text-zinc-500 font-medium">
              Minimum pause duration is {MIN_PAUSE_DAYS} days
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Pause From */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
              Pause From
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              <input
                type="date"
                min={today}
                value={pauseData.pause_from}
                onChange={(e) =>
                  setPauseData((prev) => ({
                    ...prev,
                    pause_from: e.target.value,
                    // Reset until if it becomes invalid
                    pause_until:
                      prev.pause_until < e.target.value
                        ? ""
                        : prev.pause_until,
                  }))
                }
                className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm font-medium text-slate-800 focus:outline-none focus:border-rose-400 focus:bg-white transition-all"
              />
            </div>
            {fromError && (
              <p className="text-xs text-red-500 font-semibold ml-1">
                {fromError}
              </p>
            )}
          </div>

          {/* Pause Until */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
              Pause Until
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              <input
                type="date"
                min={pauseData.pause_from || today}
                value={pauseData.pause_until}
                onChange={(e) =>
                  setPauseData((prev) => ({
                    ...prev,
                    pause_until: e.target.value,
                  }))
                }
                className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm font-medium text-slate-800 focus:outline-none focus:border-rose-400 focus:bg-white transition-all"
              />
            </div>
            {untilError && (
              <p className="text-xs text-red-500 font-semibold ml-1">
                {untilError}
              </p>
            )}
          </div>

          {/* Duration preview badge */}
          {pauseData.pause_from &&
            pauseData.pause_until &&
            !untilError &&
            !fromError && (
              <div className="flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-100 rounded-2xl">
                <PauseCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <p className="text-sm font-bold text-rose-700">
                  Paused for{" "}
                  <span className="text-rose-600">
                    {diff} day{diff !== 1 ? "s" : ""}
                  </span>
                  {" · "}
                  <span className="font-semibold text-rose-500">
                    {prettyDate(pauseData.pause_from)} →{" "}
                    {prettyDate(pauseData.pause_until)}
                  </span>
                </p>
              </div>
            )}

          {/* Reason */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
              Reason (Optional)
            </label>
            <textarea
              value={pauseData.reason}
              onChange={(e) =>
                setPauseData((prev) => ({
                  ...prev,
                  reason: e.target.value,
                }))
              }
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:border-rose-400 focus:bg-white transition-all font-medium resize-none text-sm"
              placeholder="e.g. Going on vacation"
              rows={3}
            />
          </div>

          {/* API Error */}
          {pauseError && (
            <p className="text-xs text-red-500 font-bold bg-red-50 p-3 rounded-xl border border-red-100">
              {pauseError}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-4 bg-zinc-100 text-zinc-700 rounded-2xl font-bold hover:bg-zinc-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={handlePauseSubscription}
              disabled={!canSubmit}
              className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-bold hover:bg-rose-600 transition shadow-lg shadow-rose-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {pauseLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <PauseCircle className="w-4 h-4" />
                  Pause Subscription
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
