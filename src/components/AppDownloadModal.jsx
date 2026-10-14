import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Logo from "../assets/hobitLogo.png";
import AppStoreBadge from "../assets/appstore.png";
import PlayStoreBadge from "../assets/playstore.png";

export default function AppDownloadModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
          onClick={onClose}
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
          className="relative bg-white rounded-[32px] p-7 sm:p-9 max-w-[420px] w-full shadow-2xl overflow-hidden text-center z-10"
        >
          {/* Top-left decorative light blue shape */}
          <div className="absolute -top-12 -left-12 w-40 h-40 rounded-full bg-[#d0e6ff] opacity-80 pointer-events-none" />

          {/* Bottom-right decorative light blue shape */}
          <div className="absolute -bottom-14 -right-14 w-44 h-44 rounded-full bg-[#d0e6ff] opacity-80 pointer-events-none" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 flex items-center justify-center transition-colors z-20 cursor-pointer shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Modal Body */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Hobit Logo */}
            <img
              src={Logo}
              alt="Hobit1"
              className="h-10 sm:h-12 w-auto object-contain mb-3"
            />

            {/* Heading - guaranteed single line */}
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 tracking-tight whitespace-nowrap">
              Download the Hobit1 App
            </h3>

            {/* Action Buttons using complete badge images */}
            <div className="w-full flex flex-col items-center gap-3.5">
              {/* App Store Button */}
              <a
                href="https://apps.apple.com/in/app/hobit/id6761460845"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex justify-center transition hover:scale-[1.02] active:scale-[0.98]"
              >
                <img
                  src={AppStoreBadge}
                  alt="Download on the App Store"
                  className="h-14 sm:h-16 w-full object-contain rounded-2xl"
                />
              </a>

              {/* Google Play Button */}
              <a
                href="https://play.google.com/store/apps/details?id=com.hobit.hobitt&pcampaignid=web_share"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex justify-center transition hover:scale-[1.02] active:scale-[0.98]"
              >
                <img
                  src={PlayStoreBadge}
                  alt="Get it on Google Play"
                  className="h-14 sm:h-16 w-full object-contain rounded-2xl"
                />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
