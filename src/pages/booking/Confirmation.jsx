import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../../context/BookingContext";
import { customerService } from "../../api/services/customer";
import toast from "react-hot-toast";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Navigation,
  Calendar,
  XCircle,
  AlertTriangle,
  X,
} from "lucide-react";

function Confirmation() {
  const { bookingData, resetBooking } = useBooking();
  const navigate = useNavigate();
  const [showOtp, setShowOtp] = useState(false);
  const [serviceOtp] = useState(
    Math.floor(100000 + Math.random() * 900000).toString(),
  );

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);

  const booking = bookingData.bookingResult;
  const bookingId = booking?.id;
  const bookingAmount = booking?.amount
    ? Number(booking.amount)
    : bookingData.finalAmount || bookingData.totalPrice || 0;
  const bookingDate = booking?.booking_date
    ? new Date(booking.booking_date)
    : bookingData.date
      ? new Date(bookingData.date)
      : null;
  const bookingTimeSlot = booking?.time_slot || null;
  const bookingStatus = booking?.status;
  const paymentStatus = booking?.payment_status;
  const paidAt = booking?.paid_at ? new Date(booking.paid_at) : null;
  const razorpayOrderId = booking?.razorpay_order_id;
  const razorpayPaymentId = booking?.razorpay_payment_id;

  useEffect(() => { }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-2">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
          {/* Success/Cancelled Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6 ${isCancelled ? "bg-red-100" : "bg-green-100"
              }`}
          >
            {isCancelled ? (
              <XCircle className="w-16 h-16 text-red-600" />
            ) : (
              <CheckCircle2 className="w-16 h-16 text-green-600" />
            )}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-slate-900 mb-4"
          >
            {isCancelled ? "Booking Cancelled" : "Booking Confirmed!"}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-zinc-600 mb-8"
          >
            {isCancelled
              ? "Your booking has been cancelled successfully. Refund will be initiated shortly."
              : "Helper will be assigned shortly. You'll receive a confirmation call within a few minutes."}
          </motion.p>

          {/* Booking Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-zinc-50 rounded-2xl p-6 mb-6 text-left"
          >
            <h3 className="font-semibold text-slate-900 mb-4">
              Booking Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-600">Booking ID</span>
                <span className="font-semibold text-slate-900">
                  {bookingId
                    ? `#${bookingId}`
                    : `#${Math.floor(Math.random() * 1000000)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Service Type</span>
                <span className="font-semibold text-slate-900 capitalize">
                  {bookingData.serviceType?.replace("-", " ")}
                </span>
              </div>
              {bookingDate && (
                <div className="flex justify-between">
                  <span className="text-zinc-600">Date</span>
                  <span className="font-semibold text-slate-900">
                    {bookingDate.toLocaleDateString()}
                  </span>
                </div>
              )}
              {bookingTimeSlot && (
                <div className="flex justify-between">
                  <span className="text-zinc-600">Time Slot</span>
                  <span className="font-semibold text-slate-900">
                    {bookingTimeSlot}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-zinc-600">Total Amount</span>
                <span className="font-semibold text-[#3d8bff]">
                  ₹{bookingAmount.toLocaleString()}
                </span>
              </div>
              {bookingStatus && (
                <div className="flex justify-between">
                  <span className="text-zinc-600">Status</span>
                  <span className="font-semibold text-slate-900 capitalize">
                    {bookingStatus}
                  </span>
                </div>
              )}
              {paymentStatus && (
                <div className="flex justify-between">
                  <span className="text-zinc-600">Payment Status</span>
                  <span className="font-semibold text-slate-900 capitalize">
                    {paymentStatus}
                  </span>
                </div>
              )}
              {paidAt && (
                <div className="flex justify-between">
                  <span className="text-zinc-600">Paid At</span>
                  <span className="font-semibold text-slate-900">
                    {paidAt.toLocaleString()}
                  </span>
                </div>
              )}
              {razorpayOrderId && (
                <div className="flex justify-between">
                  <span className="text-zinc-600">Razorpay Order ID</span>
                  <span className="font-mono text-xs text-slate-900">
                    {razorpayOrderId}
                  </span>
                </div>
              )}
              {razorpayPaymentId && (
                <div className="flex justify-between">
                  <span className="text-zinc-600">Razorpay Payment ID</span>
                  <span className="font-mono text-xs text-slate-900">
                    {razorpayPaymentId}
                  </span>
                </div>
              )}
              {isCancelled && (
                <div className="flex justify-between mt-2 pt-2 border-t border-zinc-200">
                  <span className="text-red-600 font-medium">Status</span>
                  <span className="font-bold text-red-600">Cancelled</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Action Buttons */}
          {!isCancelled && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/dashboard")}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#3d8bff] text-white px-6 py-3.5 rounded-xl font-semibold shadow-lg shadow-[#3d8bff]/30 hover:bg-[#3f5ce6] transition"
                >
                  <Navigation className="w-5 h-5" />
                  Track Helper
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/dashboard")}
                  className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-zinc-200 text-slate-700 px-6 py-3.5 rounded-xl font-semibold hover:border-[#3d8bff] hover:bg-[#3d8bff]/5 transition"
                >
                  <Calendar className="w-5 h-5" />
                  View Booking
                </motion.button>
              </div>
              <button
                onClick={() => setShowCancelModal(true)}
                className="text-red-500 hover:text-red-600 font-medium text-sm hover:underline"
              >
                Cancel Booking
              </button>
            </motion.div>
          )}

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            onClick={() => {
              resetBooking();
              navigate("/");
            }}
            className="mt-6 text-sm text-zinc-600 hover:text-[#3d8bff] transition"
          >
            Back to Home
          </motion.button>
        </div>
      </motion.div>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full relative"
          >
            <button
              onClick={() => setShowCancelModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                Cancel Booking?
              </h2>
              <p className="text-zinc-600 mt-2">
                Are you sure you want to cancel your booking? Please review the
                cancellation policy below.
              </p>
            </div>

            <div className="bg-zinc-50 rounded-xl p-4 mb-6 text-left text-sm text-zinc-600">
              <h4 className="font-semibold text-slate-900 mb-2">
                Cancellation Policy
              </h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>Free cancellation within 1 minutes of booking.</li>
                {/* <li>
                  A cancellation fee of ₹50 applies if cancelled after 30
                  minutes.
                </li> */}
                <li>
                  Refunds will be processed to your original payment method
                  within 5-7 business days.
                </li>
              </ul>
            </div>

            <div className="flex items-start gap-3 mb-6">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  id="agree-policy"
                  checked={agreedToPolicy}
                  onChange={(e) => setAgreedToPolicy(e.target.checked)}
                  className="w-5 h-5 border-zinc-300 rounded text-[#3d8bff] focus:ring-[#3d8bff]"
                />
              </div>
              <label
                htmlFor="agree-policy"
                className="text-sm text-zinc-600 text-left"
              >
                I have read and agree to the cancellation policy.
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 border border-zinc-200 rounded-xl font-semibold text-slate-700 hover:bg-zinc-50 transition"
              >
                Keep Booking
              </button>
              <button
                onClick={() => {
                  const handleCancel = async () => {
                    if (!bookingId) return;

                    try {
                      await customerService.cancelBooking(bookingId);
                      setIsCancelled(true);
                      setShowCancelModal(false);
                      toast.success("Booking cancelled successfully.");
                    } catch (error) {
                      console.error("Failed to cancel booking:", error);
                      toast.error("Failed to cancel booking: " + error.message);
                    }
                  };
                  handleCancel();
                }}
                disabled={!agreedToPolicy}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default Confirmation;
