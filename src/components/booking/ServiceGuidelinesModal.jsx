import { motion } from "framer-motion";
import { X, CheckCircle2, AlertTriangle } from "lucide-react";

const splitTextToLines = (text) => {
  if (!text) return [];
  return String(text)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
};

function ServiceGuidelinesModal({
  isOpen,
  onClose,
  loading,
  error,
  data,
  serviceName,
  onAccept,
}) {
  if (!isOpen) return null;

  const payload = data?.data || data || {};
  const dos = Array.isArray(payload.dos) ? payload.dos : [];
  const donts = Array.isArray(payload.donts) ? payload.donts : [];

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
            Important guidelines
          </p>
          <h2 className="text-base sm:text-base font-bold text-slate-900">
            Do&apos;s &amp; Don&apos;ts{" "} <br />
            <span className="text-[#3d8bff]">
              {serviceName || "this service"}
            </span>
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-zinc-600">
            Please read these carefully before confirming your selection.
          </p>
        </div>

        <div className="px-5 sm:px-6 py-4 max-h-[55vh] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-[#3d8bff]/20 border-t-[#3d8bff] animate-spin" />
              <p className="text-sm text-zinc-600">
                Fetching service guidelines...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
              <p className="text-sm text-zinc-700 font-medium">
                We couldn&apos;t load the Do&apos;s &amp; Don&apos;ts right now.
              </p>
              <p className="text-xs text-zinc-500 max-w-md">{error}</p>
            </div>
          ) : dos.length === 0 && donts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
              <AlertTriangle className="w-7 h-7 text-zinc-400" />
              <p className="text-sm text-zinc-600">
                No specific Do&apos;s &amp; Don&apos;ts have been added for this
                service yet.
              </p>
            </div>
          ) : (
            // Show Do's first, then Don'ts vertically (no side‑by‑side columns)
            <div className="flex flex-col gap-4 sm:gap-5">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                      Do&apos;s
                    </p>
                    <p className="text-[11px] text-emerald-800/80">
                      Things you should ensure before service
                    </p>
                  </div>
                </div>
                <div className="space-y-2 mt-2">
                  {dos.map((item) => {
                    const lines = splitTextToLines(item.text);
                    if (lines.length === 0) return null;
                    return (
                      <ul
                        key={item.id}
                        className="space-y-1.5 text-xs sm:text-sm text-emerald-900"
                      >
                        {lines.map((line, idx) => {
                          const cleaned = line.replace(/^\d+\)\s*/, "");
                          return (
                            <li
                              key={idx}
                              className="flex gap-2 text-justify leading-relaxed"
                            >
                              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <span>{cleaned}</span>
                            </li>
                          );
                        })}
                      </ul>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-rose-100 bg-rose-50/80 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">
                      Don&apos;ts
                    </p>
                    <p className="text-[11px] text-rose-800/80">
                      What is not covered in this service
                    </p>
                  </div>
                </div>
                <div className="space-y-2 mt-2">
                  {donts.map((item) => {
                    const lines = splitTextToLines(item.text);
                    if (lines.length === 0) return null;
                    return (
                      <ul
                        key={item.id}
                        className="space-y-1.5 text-xs sm:text-sm text-rose-900"
                      >
                        {lines.map((line, idx) => {
                          const cleaned = line.replace(/^\d+\)\s*/, "");
                          return (
                            <li
                              key={idx}
                              className="flex gap-2 text-justify leading-relaxed"
                            >
                              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                              <span>{cleaned}</span>
                            </li>
                          );
                        })}
                      </ul>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-5 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <div className="mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-[11px] sm:text-xs text-zinc-600 leading-snug">
              By clicking <span className="font-semibold">Accept &amp; Continue</span>,
              you confirm that you have read and understood these guidelines.
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-zinc-600 border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={onAccept}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-[#3d8bff] hover:bg-[#1f6fe6] disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-[#3d8bff]/20 transition-colors"
            >
              Accept &amp; Continue
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ServiceGuidelinesModal;

