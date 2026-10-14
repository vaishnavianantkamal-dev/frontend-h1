import { motion } from "framer-motion";
import { useBooking } from "../../context/BookingContext";
import { useLocation } from "react-router-dom";

function StepProgress() {
  const { bookingSteps } = useBooking();
  const location = useLocation();

  // No need to filter manually as bookingSteps in context is already updated
  const visibleSteps = bookingSteps;

  // Find the index of the current path in the visible steps
  let currentIndex = visibleSteps.findIndex(
    (step) => step.path === location.pathname,
  );

  // If the current path is not in visible steps (e.g., it's the hidden "Service Type" page),
  // fall back to the last visible step index
  if (currentIndex === -1) {
    const actualIndex = bookingSteps.findIndex(
      (step) => step.path === location.pathname,
    );
    if (actualIndex !== -1) {
      // Iterate backwards from the current visible steps to find the preceding step
      for (let i = visibleSteps.length - 1; i >= 0; i--) {
        const vStep = visibleSteps[i];
        const vOriginalIndex = bookingSteps.findIndex(
          (s) => s.path === vStep.path,
        );
        if (vOriginalIndex < actualIndex) {
          currentIndex = i;
          break;
        }
      }
    }
  }

  return (
    <div className="w-full px-3 sm:px-4 bg-white border-b border-zinc-100">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between relative py-3 sm:py-4">
          {/* Progress line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-zinc-200 -z-10 -translate-y-1/2">
            <motion.div
              className="h-full bg-[#3d8bff]"
              initial={{ width: 0 }}
              animate={{
                width: `${(currentIndex / (visibleSteps.length - 1)) * 100}%`,
              }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {visibleSteps.map((step, index) => (
            <div
              key={step.path}
              className="flex flex-col items-center gap-1 sm:gap-2 relative z-10 flex-1"
            >
              <motion.div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm transition ${
                  index <= currentIndex
                    ? "bg-[#3d8bff] text-white shadow-lg shadow-[#3d8bff]/30"
                    : "bg-zinc-100 text-zinc-400"
                }`}
                whileHover={{ scale: 1.1 }}
              >
                {index + 1}
              </motion.div>
              <span
                className={`text-[10px] sm:text-xs font-medium text-center ${
                  index <= currentIndex ? "text-[#3d8bff]" : "text-zinc-400"
                } hidden sm:block`}
              >
                {step.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StepProgress;
