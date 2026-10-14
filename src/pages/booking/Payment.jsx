import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../../context/BookingContext";
import { useBookingApi } from "../../hooks/api/useBookingApi";
import { paymentService } from "../../api/services/payment";
import { customerService } from "../../api/services/customer";
import { computeCharges } from "../../utils/charges";
import { useRainCharge } from "../../hooks/api/useRainCharge";
import StepProgress from "../../components/booking/StepProgress";
import toast from "react-hot-toast";
import {
  ArrowRight,
  ArrowLeft,
  CreditCard,
  Smartphone,
  Wallet,
  Repeat,
  Tag,
  Info,
  Check,
  Ticket,
} from "lucide-react";

import upiImage from "../../../public/upi.png";
import creditImage from "../../../public/credit-card.png";
import walletImage from "../../../public/wallet.png";
import subscriptionWallet from "../../../public/subscription-wallet.png";

// Subscription plan IDs expected by the /web_booking API.
// Instant Help → 5, Monthly (Cook / Cleaner) → 4.
const SUBSCRIPTION_ID_BY_SERVICE_TYPE = {
  instant: 5,
  monthly: 4,
};

const paymentMethods = [
  {
    id: "upi",
    name: "UPI",
    icon: Smartphone,
    img: upiImage,
    description: "Pay via UPI apps",
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "card",
    name: "Credit/Debit Card",
    icon: CreditCard,
    img: creditImage,
    description: "Visa, Mastercard, RuPay",
    color: "from-purple-500 to-purple-600",
  },
  {
    id: "wallet",
    name: "Wallet",
    icon: Wallet,
    img: walletImage,
    description: "Paytm, PhonePe, etc.",
    color: "from-green-500 to-green-600",
  },
  {
    id: "subscription-wallet",
    name: "Subscription Wallet",
    icon: Repeat,
    img: subscriptionWallet,
    description: "Use subscription credits",
    color: "from-orange-500 to-orange-600",
  },
];

function Payment() {
  const { bookingData, updateBookingData, charges } = useBooking();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const {
    createBooking,
    loading: bookingLoading,
    error: bookingError,
    data: bookingResponse,
  } = useBookingApi();
  const [selectedMethod, setSelectedMethod] = useState(
    bookingData.paymentMethod || null,
  );
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);

  useEffect(() => {
    const fetchCoupons = async () => {
      setIsLoadingCoupons(true);
      try {
        const res = await customerService.getCoupons();
        setAvailableCoupons(res?.data || []);
      } catch (err) {
        console.error("Failed to fetch coupons:", err);
      } finally {
        setIsLoadingCoupons(false);
      }
    };
    fetchCoupons();
  }, []);

  const itemTotal = Number(bookingData.totalPrice) || 0;

  // Rain charge: instant bookings only, and only when it is raining at the
  // service location (resolved from the weather API).
  const isInstant = bookingData.serviceType === "instant";
  const rainAddress = bookingData.address || {};
  const { rainCharge: weatherRainCharge } = useRainCharge({
    lat: rainAddress.latitude ?? rainAddress.lat ?? null,
    long: rainAddress.longitude ?? rainAddress.long ?? null,
    enabled: isInstant,
  });

  // Members don't pay the subscription fee; non-members do (monthly plans only).
  const isMemberCustomer = (() => {
    try {
      return !!JSON.parse(localStorage.getItem("user") || "{}").is_member;
    } catch {
      return false;
    }
  })();
  const includeSubscriptionFee =
    bookingData.serviceType === "monthly" && !isMemberCustomer;

  const {
    platformFee: PLATFORM_FEE,
    travellingCharge,
    rainCharge,
    subscriptionFee,
    gstPercent,
    gst,
    total: totalPayable,
  } = computeCharges(itemTotal, charges, {
    discount,
    rainCharge: weatherRainCharge,
    includeSubscriptionFee,
  });

  const handleApplyCoupon = (manualCode = null) => {
    setCouponError("");
    const codeToApply = (manualCode || couponCode).toUpperCase().trim();
    if (!codeToApply) return;

    const coupon = availableCoupons.find(
      (c) => c.code.toUpperCase() === codeToApply,
    );

    if (!coupon) {
      setCouponError("Invalid coupon code");
      setTimeout(() => setCouponError(""), 3000);
      return;
    }

    if (coupon.already_used) {
      setCouponError("This coupon has already been used");
      return;
    }

    if (itemTotal < Number(coupon.min_order_amount)) {
      setCouponError(
        `Minimum order amount for this coupon is ₹${coupon.min_order_amount}`,
      );
      return;
    }

    let calcDiscount = 0;
    if (coupon.type === "percentage") {
      calcDiscount = Math.round((itemTotal * Number(coupon.value)) / 100);
      if (coupon.max_discount) {
        calcDiscount = Math.min(calcDiscount, Number(coupon.max_discount));
      }
    } else {
      calcDiscount = Number(coupon.value);
    }

    setDiscount(calcDiscount);
    setAppliedCoupon(coupon);
    setCouponCode("");
    toast.success(`Coupon '${coupon.code}' applied!`);
  };

  const removeCoupon = () => {
    setDiscount(0);
    setAppliedCoupon(null);
  };

  const formatDateYMD = (value) => {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    // Use local date parts to avoid UTC shift issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const mapTimeSlot = () => {
    if (bookingData.serviceType === "instant") {
      return bookingData.timeSlot; // e.g. "10:30"
    }
    const map = {
      "9-12": "09:00 AM - 12:00 PM",
      "12-3": "12:00 PM - 3:00 PM",
      "3-6": "3:00 PM - 6:00 PM",
    };
    return map[bookingData.timeSlot] || bookingData.timeSlot || "";
  };

  const parseUnit = (value) => {
    if (!value || typeof value !== "string") {
      return { unit_type: null, unit_value: null };
    }
    const match = value.match(/^(\d+)([a-zA-Z+]+)$/);
    if (!match) return { unit_type: null, unit_value: null };
    return { unit_value: match[1], unit_type: match[2] };
  };

  const buildServicesPayload = () => {
    if (!bookingData.selectedServices?.length) return [];

    const mainServices = bookingData.selectedServices.filter(
      (s) => !s.isStandardAddon,
    );
    const addonServices = bookingData.selectedServices.filter(
      (s) => s.isStandardAddon && (s.quantity || 0) > 0,
    );
    const addonsTotal = addonServices.reduce(
      (sum, s) =>
        sum +
        (Number(s.monthlyPrice) || Number(s.basePrice) || 0) *
        (s.quantity || 1),
      0,
    );
    const mainTotal = Math.max(0, itemTotal - addonsTotal);
    const mainCount = mainServices.length;
    const perServicePrice =
      mainCount > 0 ? Math.round(mainTotal / mainCount) : mainTotal;

    return mainServices.map((service) => {
      // Try to derive unit info from booking context depending on service
      let rawUnit = bookingData.homeType;
      if (typeof service.id === "string") {
        if (service.id === "sofa-cleaning") {
          rawUnit = bookingData.sofaSeatCount || bookingData.homeType;
        } else if (service.id === "carpet-cleaning") {
          rawUnit = bookingData.carpetCount || bookingData.homeType;
        } else if (service.id.includes("bathroom")) {
          rawUnit = bookingData.bathroomCount || bookingData.homeType;
        } else if (
          service.id === "utensils-washing" ||
          service.id === "clothes-washing"
        ) {
          rawUnit = bookingData.familySize || bookingData.homeType;
        }
      }

      const { unit_type, unit_value } = parseUnit(rawUnit);

      // Simple mapping for booking type / subscription id
      let booking_type = "one_time";
      let subscription_type_id = service.subscriptionId || null;

      if (bookingData.serviceType === "monthly") {
        booking_type = "Monthly Subscription";
        subscription_type_id =
          subscription_type_id || SUBSCRIPTION_ID_BY_SERVICE_TYPE.monthly;
      } else if (bookingData.serviceType === "instant") {
        booking_type = "instant";
        subscription_type_id =
          subscription_type_id || SUBSCRIPTION_ID_BY_SERVICE_TYPE.instant;
      }

      return {
        service_id: service.backendId || service.id, // string id for now
        quantity: 1,
        booking_type,
        subscription_type_id,
        start_date:
          bookingData.serviceType === "monthly"
            ? formatDateYMD(bookingData.startDate || bookingData.date)
            : null,
        end_date:
          bookingData.serviceType === "monthly"
            ? formatDateYMD(
              bookingData.endDate || bookingData.subscriptionEndDate,
            )
            : null,
        unit_type,
        unit_value,
        price: perServicePrice,
      };
    });
  };

  const buildAddonsPayload = () => {
    if (!bookingData.selectedServices?.length) return [];
    return bookingData.selectedServices
      .filter((s) => s.isStandardAddon && (s.quantity || 0) > 0)
      .map((s) => ({
        addon_id: Number(s.backendId ?? s.id),
        quantity: s.quantity || 1,
      }));
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setIsProcessing(true);

    // Save payment breakdown to context
    updateBookingData({
      paymentMethod: "razorpay",
      finalAmount: totalPayable,
      breakdown: {
        itemTotal,
        platformFee: PLATFORM_FEE,
        gst,
        discount,
      },
    });

    // Build booking payload for API
    const addressObj = bookingData.address || {};
    const fullAddress =
      addressObj.formatted_address ||
      [
        addressObj.address,
        addressObj.landmark && `Near ${addressObj.landmark}`,
        addressObj.pincode,
      ]
        .filter(Boolean)
        .join(", ");

    let customerId = null;
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed && parsed.id) {
          customerId = parsed.id;
        }
      }
    } catch {
      // ignore parse errors
    }

    const payload = {
      booking_date:
        formatDateYMD(bookingData.date) || formatDateYMD(new Date()),
      start_date:
        formatDateYMD(bookingData.startDate || bookingData.date) ||
        formatDateYMD(new Date()),
      end_date:
        bookingData.endDate || bookingData.subscriptionEndDate
          ? formatDateYMD(
            bookingData.endDate || bookingData.subscriptionEndDate,
          )
          : null,
      time_slot: mapTimeSlot(),
      address: fullAddress,
      formatted_address: addressObj.formatted_address || fullAddress,
      lat: addressObj.latitude || addressObj.lat,
      long: addressObj.longitude || addressObj.long,
      city: addressObj.city,
      source: "web",
      amount: String(totalPayable),
      workers: bookingData.workerCount || 1,
      services: buildServicesPayload(),
      addons: buildAddonsPayload(),
    };

    // Subscription plan for this booking: Instant Help → 5, Monthly → 4.
    const subscriptionId =
      SUBSCRIPTION_ID_BY_SERVICE_TYPE[bookingData.serviceType] ?? null;
    if (subscriptionId != null) {
      payload.subscription_id = subscriptionId;
    }

    if (bookingData.cityId != null && bookingData.cityId !== "") {
      payload.city_id = bookingData.cityId;
    }

    if (customerId) {
      payload.customer_id = customerId;
    }

    try {
      // 1) Create booking in backend
      const bookingRes = await createBooking(payload);
      const bookingId = bookingRes?.booking_id;

      if (!bookingId) {
        throw new Error("Booking created but booking_id missing in response.");
      }

      // 2) Create Razorpay order for this booking
      const orderRes = await paymentService.createOrder(
        bookingId,
        appliedCoupon?.code,
        bookingData.cityId,
      );
      const razorOrderId =
        orderRes?.razorpay_order_id || orderRes?.order_id || orderRes?.id;
      const orderAmount =
        orderRes?.amount || bookingRes?.amount || totalPayable;
      const orderCurrency = orderRes?.currency || "INR";

      if (!razorOrderId) {
        throw new Error("Failed to create payment order.");
      }

      // 3) Load Razorpay SDK
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Unable to load Razorpay payment SDK.");
      }

      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        throw new Error(
          "Missing Razorpay key. Please check VITE_RAZORPAY_KEY_ID.",
        );
      }

      const user = (() => {
        try {
          const storedUser = localStorage.getItem("user");
          return storedUser ? JSON.parse(storedUser) : null;
        } catch {
          return null;
        }
      })();

      const options = {
        key: razorpayKey,
        amount: orderAmount, // backend should send in paise; otherwise adjust
        currency: orderCurrency,
        name: "Hobit",
        description: "Cleaning Services Booking",
        order_id: razorOrderId,
        prefill: {
          name: user?.name || "",
          contact: user?.phone || "",
        },
        notes: {
          booking_id: bookingId,
        },
        handler: async function (response) {
          try {
            const verifyRes = await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (verifyRes?.booking) {
              updateBookingData({ bookingResult: verifyRes.booking });
            }
            navigate("/book/confirmation");
          } catch (err) {
            console.error("Payment verification failed:", err);
            toast.error("Payment verification failed. Please contact support.");
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Failed to create booking:", error);
      toast.error(
        error.message || "Failed to start payment. Please try again.",
      );
      setIsProcessing(false);
    }
  };

  const totalAmount = bookingData.totalPrice;

  return (
    <div className="min-h-screen pb-12">
      <StepProgress />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Payment</h1>
          <p className="text-lg text-zinc-600">
            Choose your preferred payment method
          </p>
        </motion.div>

        {/* Offers Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-4 sm:p-6 mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-5 h-5 text-[#3d8bff]" />
            <h2 className="text-lg font-semibold text-slate-900">
              Offers & Benefits
            </h2>
          </div>

          {appliedCoupon ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-green-50 border border-green-200 rounded-xl p-3 sm:p-4 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Tag className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-green-900">
                    '{appliedCoupon.code}' Applied
                  </p>
                  <p className="text-sm text-green-700">
                    You saved ₹{discount} on this booking
                  </p>
                </div>
              </div>
              <button
                onClick={removeCoupon}
                className="text-sm font-semibold text-red-600 hover:text-red-700 mt-3 sm:mt-0"
              >
                Remove
              </button>
            </div>
          ) : (
            <div>
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <input
                  type="text"
                  placeholder="Enter Coupon Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-[#3d8bff] focus:border-[#3d8bff] outline-none transition uppercase min-w-0"
                />
                <button
                  onClick={() => handleApplyCoupon()}
                  disabled={!couponCode || isLoadingCoupons}
                  className="px-6 py-3 bg-zinc-900 text-white font-semibold rounded-xl hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Apply
                </button>
              </div>
              {couponError && (
                <p className="text-sm text-red-600 mb-4">{couponError}</p>
              )}

              {/* Real Coupons List */}
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 scrollbar-thin scrollbar-thumb-zinc-200">
                <AnimatePresence>
                  {isLoadingCoupons ? (
                    <div className="flex gap-2">
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-32 h-16 bg-zinc-100 animate-pulse rounded-xl"
                        />
                      ))}
                    </div>
                  ) : (
                    availableCoupons.map((coupon) => (
                      <motion.button
                        key={coupon.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={
                          coupon.already_used ||
                          itemTotal < Number(coupon.min_order_amount)
                        }
                        onClick={() => handleApplyCoupon(coupon.code)}
                        className={`shrink-0 flex flex-col items-start p-3 border-2 border-dashed rounded-xl transition min-w-[160px] text-left ${coupon.already_used ||
                            itemTotal < Number(coupon.min_order_amount)
                            ? "bg-zinc-50 border-zinc-200 opacity-60 cursor-not-allowed"
                            : "bg-blue-50/50 border-blue-200 hover:border-[#3d8bff] hover:bg-blue-50"
                          }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <Ticket
                            className={`w-3.5 h-3.5 ${coupon.already_used ||
                                itemTotal < Number(coupon.min_order_amount)
                                ? "text-zinc-400"
                                : "text-[#3d8bff]"
                              }`}
                          />
                          <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                            {coupon.code}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500 line-clamp-1">
                          {coupon.description}
                        </p>
                        {itemTotal < Number(coupon.min_order_amount) && (
                          <p className="text-[9px] text-orange-600 mt-1 font-medium">
                            Min order ₹{coupon.min_order_amount}
                          </p>
                        )}
                      </motion.button>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </motion.div>

        {/* Bill Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-[#3d8bff]" />
            <h2 className="text-lg font-semibold text-slate-900">
              Bill Details
            </h2>
          </div>

          <div className="space-y-3">
            {bookingData.serviceType === "demo" &&
              bookingData.selectedServices?.[0] && (
                <div className="flex justify-between text-zinc-600">
                  <span>
                    {bookingData.selectedServices[0].name ||
                      "Free Demo (1 Hour)"}
                  </span>
                  <span className="font-medium text-slate-900">
                    ₹{itemTotal.toLocaleString()}
                  </span>
                </div>
              )}
            <div className="flex justify-between text-zinc-600">
              <span>Item Total</span>
              <span>₹{itemTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span className="flex items-center gap-1">
                Platform Fee <Info className="w-3 h-3 text-zinc-400" />
              </span>
              <span>₹{PLATFORM_FEE.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Travelling Charge</span>
              <span>₹{travellingCharge.toLocaleString()}</span>
            </div>
            {rainCharge > 0 && (
              <div className="flex justify-between text-zinc-600">
                <span>Rain Charge</span>
                <span>₹{rainCharge.toLocaleString()}</span>
              </div>
            )}
            {subscriptionFee > 0 && (
              <div className="flex justify-between text-zinc-600">
                <span>Subscription Fee</span>
                <span>₹{subscriptionFee.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-600">
              <span>GST{gstPercent > 0 ? ` (${gstPercent}%)` : ""}</span>
              <span>₹{gst.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Discount ({appliedCoupon?.code})</span>
                <span>-₹{discount.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t border-dashed border-zinc-200 my-2 pt-2 flex justify-between items-center">
              <span className="font-bold text-slate-900">To Pay</span>
              <span className="font-bold text-slate-900 text-xl">
                ₹{totalPayable.toLocaleString()}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Removed Payment Methods Selection - Direct Razorpay Flow */}

        {/* Payment Summary - Updated to just show Total Amount nicely if needed, or remove since we have Bill Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-linear-to-br from-[#3d8bff] to-[#3f5ce6] rounded-2xl p-6 mb-8 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 mb-1">Total Payable</p>
              <p className="text-3xl font-bold">
                ₹{totalPayable.toLocaleString()}
              </p>
            </div>
            {discount > 0 && (
              <div className="text-right">
                <p className="text-sm text-blue-100">You Saved</p>
                <p className="text-lg font-semibold text-[#ffe75a]">
                  ₹{discount.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Processing Overlay */}
        {bookingLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-2xl p-8 text-center max-w-sm mx-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-[#3d8bff] border-t-transparent rounded-full mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Processing Payment...
              </h3>
              <p className="text-zinc-600">Please wait</p>
            </motion.div>
          </motion.div>
        )}

        <div className="flex justify-between items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/book/address")}
            disabled={bookingLoading}
            className="flex items-center gap-2 text-zinc-600 hover:text-[#3d8bff] transition disabled:opacity-50"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePayment}
            disabled={bookingLoading}
            className="flex items-center gap-2 bg-[#3d8bff] text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg shadow-[#3d8bff]/30 hover:bg-[#3f5ce6] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {bookingLoading ? "Processing..." : "Book & Pay Securely"}
            {!bookingLoading && <ArrowRight className="w-5 h-5" />}
          </motion.button>
        </div>

        {/* Booking API result */}
        {/* {bookingResponse && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-6"
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-green-900 mb-1">
                  {bookingResponse.message || "Booking created successfully"}
                </h2>
                <p className="text-sm text-green-800 mb-2">
                  Your booking is created. We will guide you to payment once it&apos;s ready.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-green-900">
                  <div>
                    <p className="font-medium">Booking ID</p>
                    <p className="text-green-800">
                      #{bookingResponse.booking_id}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Amount</p>
                    <p className="text-green-800">
                      ₹{bookingResponse.amount?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Status</p>
                    <p className="capitalize text-green-800">
                      {bookingResponse.status}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )} */}

        {bookingError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-800"
          >
             {bookingError}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Payment;
