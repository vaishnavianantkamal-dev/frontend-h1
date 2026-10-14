import { motion } from "framer-motion";
import { ArrowRight, Trash2, Info } from "lucide-react";
import { useBooking } from "../../context/BookingContext";
import { computeCharges } from "../../utils/charges";

const CartSidebar = ({
  selectedServices,
  onRemove,
  onContinue,
  totalPrice,
}) => {
  const { bookingData, charges } = useBooking();
  const duration = bookingData.subscriptionDurationDays || 30;
  const isMonthly = bookingData.serviceType === "monthly";

  // Members don't pay the subscription fee; non-members do (monthly plans only).
  const isMember = (() => {
    try {
      return !!JSON.parse(localStorage.getItem("user") || "{}").is_member;
    } catch {
      return false;
    }
  })();
  const includeSubscriptionFee = isMonthly && !isMember;

  const {
    platformFee,
    travellingCharge,
    gstPercent,
    gst,
    subscriptionFee,
    total: totalPay,
  } = computeCharges(totalPrice, charges, { includeSubscriptionFee });

  const getServiceTitle = (service) => {
    const baseName =
      service.name ||
      service.title ||
      service.service_name ||
      service.service?.name ||
      service.serviceName ||
      "Selected service";
    if (service.serviceGroup && service.name) {
      return `${service.serviceGroup} — ${service.name}`;
    }
    return baseName;
  };

  return (
    <div className="hidden lg:block lg:col-span-1 h-full">
      <div className="sticky top-28 bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          Your Cart
          <span className="text-sm font-normal text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">
            {selectedServices.length}
          </span>
        </h2>

        {selectedServices.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            <p>No services selected yet.</p>
            <p className="text-sm mt-2">Add services to proceed.</p>
          </div>
        ) : (
          <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {selectedServices.map((service) => (
              <motion.div
                key={service.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-start justify-between gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-100"
              >
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {getServiceTitle(service)}
                    {service.quantity > 1 && (
                      <span className="ml-1 text-zinc-400">
                        x{service.quantity}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    {service.monthlyPrice
                      ? "Monthly"
                      : service.instantPrice
                        ? "Instant"
                        : "One-time"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-sm font-bold text-[#3d8bff]">
                    ₹
                    {(() => {
                      let price =
                        service.monthlyPrice ||
                        service.oneTimePrice ||
                        service.instantPrice ||
                        0;
                      if (isMonthly && service.monthlyPrice) {
                        price = (price * duration) / 30;
                      }
                      return Math.floor(price * (service.quantity || 1)).toLocaleString();
                    })()}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemove(service)}
                    className="text-zinc-400 cursor-pointer hover:text-red-500 transition-colors p-1"
                    title="Remove service"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="border-t border-zinc-100 pt-4 space-y-3">
          <div className="flex justify-between items-center text-zinc-600">
            <span>Item Total</span>
            <span>₹{totalPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-zinc-600">
            <span className="flex items-center gap-1">
              Platform Fee <Info className="w-3 h-3 text-zinc-400" />
            </span>
            <span>₹{platformFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-zinc-600">
            <span>Travelling Charge</span>
            <span>₹{travellingCharge.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-zinc-600">
            <span>GST{gstPercent > 0 ? ` (${gstPercent}%)` : ""}</span>
            <span>₹{gst.toLocaleString()}</span>
          </div>
          {includeSubscriptionFee && subscriptionFee > 0 && (
            <div className="flex justify-between items-center text-zinc-600">
              <span>Subscription Fee</span>
              <span>₹{subscriptionFee.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between items-center text-lg font-bold text-slate-900">
            <span>Total Pay</span>
            <span>₹{totalPay.toLocaleString()}</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onContinue}
            disabled={selectedServices.length === 0}
            className="w-full cursor-pointer  flex items-center justify-center gap-2 bg-[#3d8bff] text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-[#3d8bff]/30 hover:bg-[#3f5ce6] transition disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            Book
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;
