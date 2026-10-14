import { motion } from "framer-motion";
import { X, KeyRound, Loader2 } from "lucide-react";

export default function ActiveCodeModal({
  isOpen,
  onClose,
  loading,
  error,
  code,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-8 max-w-sm w-full relative shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-8 h-8 text-[#3d8bff]" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Your Service Code</h3>
          <p className="text-sm text-zinc-500 mt-2">
            Share this code with the Expert to start your service.
          </p>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-6 h-6 text-[#3d8bff] animate-spin" />
            </div>
          ) : error ? (
            <p className="text-sm text-red-400 text-center font-medium">
              {error}
            </p>
          ) : code ? (
            <div className="w-full px-4 py-5 bg-zinc-50 border border-zinc-200 rounded-2xl text-center text-3xl font-bold tracking-[0.4em] text-slate-900">
              {code}
            </div>
          ) : (
            <p className="text-sm text-zinc-500 text-center font-medium">
              No active code yet. Please wait for the Expert to start.
            </p>
          )}

          <button
            onClick={onClose}
            className="w-full py-4 bg-[#3d8bff] text-white rounded-2xl font-bold hover:bg-[#3f5ce6] transition shadow-lg shadow-blue-500/20"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}
