import { motion } from "framer-motion";
import { X, KeyRound, Loader2 } from "lucide-react";

export default function CloseOtpModal({
  isOpen,
  onClose,
  closeOtp,
  setCloseOtp,
  closeOtpVerifying,
  closeOtpError,
  handleVerifyCloseOtp,
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
          <h3 className="text-xl font-bold text-slate-900">Enter OTP</h3>
          <p className="text-sm text-zinc-500 mt-2">
            Enter the OTP received by the Expert to complete the service.
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            value={closeOtp}
            onChange={(e) => setCloseOtp(e.target.value)}
            placeholder="Enter 6-digit OTP"
            className="w-full px-4 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-center text-2xl font-bold tracking-[0.5em] focus:outline-none focus:border-[#3d8bff] focus:bg-white transition-all"
            maxLength={6}
          />

          {closeOtpError && (
            <p className="text-xs text-red-400 text-center font-medium">
              {closeOtpError}
            </p>
          )}

          <button
            onClick={handleVerifyCloseOtp}
            disabled={closeOtpVerifying || closeOtp.length < 4}
            className="w-full py-4 bg-[#3d8bff] text-white rounded-2xl font-bold hover:bg-[#3f5ce6] transition shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center"
          >
            {closeOtpVerifying ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Verify & Complete"
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
