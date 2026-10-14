import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLoadScript } from "@react-google-maps/api";
import {
  Clock,
  Repeat,
  Sparkles,
  CreditCard,
  Package,
  History,
  LayoutDashboard,
  Menu,
  XCircle,
  MapPin,
} from "lucide-react";

import { customerService } from "../api/services/customer";
import { paymentService } from "../api/services/payment";
import { useApi } from "../hooks/api/useApi";
import { bookingCloseService } from "../api/services/bookingClose";
import toast from "react-hot-toast";

// New Components
import Sidebar from "../components/dashboard/Sidebar";
import Stats from "../components/dashboard/Stats";
import DashboardTabs from "../components/dashboard/DashboardTabs";
import {
  ActiveBookingCard,
  PastBookingCard,
  SubscriptionCard,
} from "../components/dashboard/BookingCard";
import BookingDetailsModal from "../components/dashboard/BookingDetailsModal";
import AddressTab from "../components/dashboard/AddressTab";
import TrackingModal from "../components/dashboard/TrackingModal";
import CloseOtpModal from "../components/dashboard/CloseOtpModal";
import ActiveCodeModal from "../components/dashboard/ActiveCodeModal";
import RescheduleModal from "../components/dashboard/RescheduleModal";
import PauseModal from "../components/dashboard/PauseModal";

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-zinc-100 shadow-sm">
      <div className="w-12 h-12 border-4 border-[#3d8bff]/20 border-t-[#3d8bff] rounded-full animate-spin mb-4" />
      <p className="text-zinc-500 font-medium">Loading your bookings...</p>
    </div>
  );
}

function ErrorState({ error }) {
  return (
    <div className="bg-red-50 rounded-2xl border border-red-100 p-6 text-center mb-8">
      <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
      <p className="text-red-700 font-semibold mb-1">
        Oops! Something went wrong
      </p>
      <p className="text-red-600/70 text-sm mb-4">{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-200 transition"
      >
        Try Again
      </button>
    </div>
  );
}

function EmptyState({ icon: Icon, title, message, onAction, actionLabel }) {
  return (
    <div className="lg:col-span-2 bg-white rounded-3xl border border-dashed border-zinc-300 p-20 text-center">
      <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <Icon className="w-10 h-10 text-zinc-300" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-zinc-500 mb-8 max-w-sm mx-auto">{message}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="bg-[#3d8bff] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#3f5ce6] transition shadow-xl shadow-blue-500/20"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function Dashboard() {
  const [activeTab, setActiveTab] = useState("active");
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [closingBookingId, setClosingBookingId] = useState(null);
  const [closeOtpMessage, setCloseOtpMessage] = useState("");
  const [closeOtpBookingId, setCloseOtpBookingId] = useState(null);
  const [closeOtp, setCloseOtp] = useState("");
  const [closeOtpVerifying, setCloseOtpVerifying] = useState(false);
  const [closeOtpError, setCloseOtpError] = useState("");
  const [closeOtpModalOpen, setCloseOtpModalOpen] = useState(false);
  const [ratingValue, setRatingValue] = useState("5");
  const [ratingDescription, setRatingDescription] = useState("");
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingError, setRatingError] = useState("");
  const [ratingMessage, setRatingMessage] = useState("");
  const [trackingBookingId, setTrackingBookingId] = useState(null);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [activeCodeModalOpen, setActiveCodeModalOpen] = useState(false);
  const [activeCode, setActiveCode] = useState("");
  const [activeCodeLoading, setActiveCodeLoading] = useState(false);
  const [activeCodeError, setActiveCodeError] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isExtending, setIsExtending] = useState(false);
  const [extensionOptions, setExtensionOptions] = useState([]);
  const [extensionHistory, setExtensionHistory] = useState(null);
  const [rescheduleHistory, setRescheduleHistory] = useState(null);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    date: "",
    time_slot: "",
    reason: "",
  });
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleError, setRescheduleError] = useState("");
  const [pauseModalOpen, setPauseModalOpen] = useState(false);
  const [pauseData, setPauseData] = useState({
    pause_from: "",
    pause_until: "",
    reason: "",
  });
  const [pauseLoading, setPauseLoading] = useState(false);
  const [pauseError, setPauseError] = useState("");
  const [referralLoading, setReferralLoading] = useState(false);
  const [referralStats, setReferralStats] = useState(null);
  const [referralStatsError, setReferralStatsError] = useState("");

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const navigate = useNavigate();
  const { data, loading, error, execute } = useApi(customerService.getBookings);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event("logout"));
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const handleReferralClick = async () => {
    try {
      setReferralLoading(true);
      const res = await customerService.getReferralLink();
      const data = res?.data || res || {};

      const referralCode = data.referral_code;
      const referralLink = data.referral_link || data.worker_referral_link;

      if (referralLink && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(referralLink);
        toast.success(
          referralCode
            ? `Referral link copied: ${referralCode}`
            : "Referral link copied to clipboard",
        );
      } else if (referralLink) {
        window.open(referralLink, "_blank");
      } else if (referralCode) {
        toast.success(`Your referral code: ${referralCode}`);
      } else {
        toast.error("Referral information not available");
      }
    } catch (e) {
      toast.error(e?.message || "Failed to load referral link");
    } finally {
      setReferralLoading(false);
    }
  };

  const loadAddresses = async () => {
    try {
      const res = await customerService.getAddresses();
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
          ? res
          : [];
      setAddresses(list);
    } catch {
      setAddresses([]);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await execute();
        if (Array.isArray(res?.data)) {
          setBookings(res.data);
        } else if (Array.isArray(res)) {
          setBookings(res);
        }
      } catch {
        // error handled below
      }
    };
    load();

    // Load referral stats once when dashboard mounts
    const loadReferralStats = async () => {
      try {
        // Some APIs require an explicit token query param
        const token = localStorage.getItem("token");
        const res = await customerService.getReferralStats(token);
        const payload = res?.data || res || null;
        setReferralStats(payload);
        setReferralStatsError("");
      } catch (e) {
        setReferralStats(null);
        setReferralStatsError(e?.message || "Failed to load referral stats");
      }
    };
    loadReferralStats();
  }, [execute]);

  useEffect(() => {
    if (activeTab === "address") {
      loadAddresses();
    }
  }, [activeTab]);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const inactiveBookings = bookings.filter((b) => {
    const status = String(b.status || "").toLowerCase();
    const paymentStatus = String(b.payment_status || "").toLowerCase();
    const hasUnpaid =
      paymentStatus === "unpaid" || paymentStatus === "payment_pending";
    const bookingDate = b.booking_date ? new Date(b.booking_date) : null;
    const isPast =
      bookingDate && bookingDate.setHours(0, 0, 0, 0) < todayStart.getTime();

    return status === "pending" && hasUnpaid && isPast;
  });

  const activeBookings = bookings.filter((b) => {
    if (b.status === "completed" || b.status === "cancelled") return false;
    // Exclude inactive ones from active list
    return !inactiveBookings.some((ib) => ib.id === b.id);
  });
  const pastBookings = bookings.filter(
    (b) => b.status === "completed" || b.status === "cancelled",
  );
  const subscriptionBookings = bookings.filter((b) =>
    b.services?.some(
      (s) =>
        s.subscription_type?.name?.toLowerCase().includes("monthly") ||
        s.booking_type?.toLowerCase().includes("monthly"),
    ),
  );

  const totalSpent = bookings.reduce((sum, b) => {
    const isPaid =
      String(b.payment_status || "")
        .toLowerCase()
        .trim() === "paid";
    if (!isPaid) return sum;
    return sum + Number(b.amount || 0);
  }, 0);

  const stats = [
    {
      label: "Total Bookings",
      value: bookings.length,
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Active Services",
      value: activeBookings.length,
      icon: Clock,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Subscriptions",
      value: subscriptionBookings.length,
      icon: Repeat,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Total Spent",
      value: `₹${totalSpent.toLocaleString()}`,
      icon: CreditCard,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  const tabs = [
    {
      id: "active",
      label: "Active",
      icon: Clock,
      count: activeBookings.length,
    },
    {
      id: "past",
      label: "History",
      icon: History,
      count: pastBookings.length,
    },
    {
      id: "inactive",
      label: "Inactive",
      icon: XCircle,
      count: inactiveBookings.length,
    },
    {
      id: "subscriptions",
      label: "Subscriptions",
      icon: Repeat,
      count: subscriptionBookings.length,
    },
    {
      id: "referrals",
      label: "Referrals",
      icon: LayoutDashboard,
    },
    {
      id: "address",
      label: "My Address",
      icon: MapPin,
    },
  ];

  const openBookingDetails = async (id) => {
    setDetailLoading(true);
    setDetailError(null);
    setExtensionOptions([]);
    setExtensionHistory(null);
    setRescheduleHistory(null);
    try {
      const res = await customerService.getBookingById(id);
      const booking = res?.data || res;
      setSelectedBooking(booking);

      const isInstant = booking.services?.some(
        (s) =>
          s.service?.category_id === 6 || s.service?.slug?.includes("instant"),
      );
      if (isInstant) {
        if (booking.status === "inprogress") {
          try {
            const extRes = await customerService.getBookingExtensionOptions(id);
            setExtensionOptions(extRes?.data || extRes || []);
          } catch (err) {
            console.error("Failed to fetch extension options:", err);
          }
        }
        try {
          const histRes = await customerService.getInstantExtensionHistory(id);
          setExtensionHistory(histRes?.booking || histRes || null);
        } catch (err) {
          console.error("Failed to fetch extension history:", err);
        }
      }
      try {
        const rescheduleRes = await customerService.getRescheduleHistory(id);
        setRescheduleHistory(rescheduleRes?.data || rescheduleRes || null);
      } catch (err) {
        console.error("Failed to fetch reschedule history:", err);
      }
    } catch (e) {
      setDetailError(e?.message || "Failed to load booking details.");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleViewActiveCode = async (id) => {
    if (!id) return;
    setActiveCodeModalOpen(true);
    setActiveCode("");
    setActiveCodeError("");
    try {
      setActiveCodeLoading(true);
      const res = await customerService.getActiveCode(id, "customer");
      const payload = res?.data || res || {};
      const code =
        payload.code ||
        payload.active_code ||
        payload.start_code ||
        payload.otp ||
        "";
      if (code) {
        setActiveCode(String(code));
      } else {
        setActiveCodeError(
          res?.message || "No active code yet. Please wait for the Expert to start.",
        );
      }
    } catch (e) {
      setActiveCodeError(e?.message || "Failed to fetch service code.");
    } finally {
      setActiveCodeLoading(false);
    }
  };

  const handleSendCloseOtp = async (id, type = "whatsapp") => {
    if (!id) return;
    try {
      setClosingBookingId(id);
      setCloseOtpMessage("");
      setCloseOtpBookingId(null);
      setCloseOtp("");
      setCloseOtpError("");
      const res = await bookingCloseService.sendCloseOtp(id, type);
      if (res?.success) {
        setCloseOtpMessage(
          `Close OTP sent via ${type === "whatsapp" ? "WhatsApp" : "SMS"}. Please enter it to complete the service.`,
        );
        setCloseOtpBookingId(id);
        setCloseOtpModalOpen(true);
      } else {
        setCloseOtpMessage(
          "OTP request sent. Please contact support if it is not received.",
        );
        setCloseOtpBookingId(id);
        setCloseOtpModalOpen(true);
      }
    } catch (e) {
      setCloseOtpMessage(e?.message || "Failed to send close OTP.");
    } finally {
      setClosingBookingId(null);
    }
  };

  const handleVerifyCloseOtp = async () => {
    if (!closeOtpBookingId || !closeOtp) return;
    try {
      setCloseOtpError("");
      setCloseOtpVerifying(true);
      const res = await bookingCloseService.verifyCloseOtp(
        closeOtpBookingId,
        closeOtp,
      );
      if (res?.success) {
        setCloseOtpMessage(res.message || "Service marked as completed.");
        setBookings((prev) =>
          prev.map((b) =>
            b.id === closeOtpBookingId ? { ...b, status: "completed" } : b,
          ),
        );
        setSelectedBooking((prev) =>
          prev && prev.id === closeOtpBookingId
            ? { ...prev, status: "completed" }
            : prev,
        );
        setCloseOtp("");
        setCloseOtpBookingId(null);
        setCloseOtpModalOpen(false);
        setRatingValue("5");
        setRatingDescription("");
        setRatingError("");
        setRatingMessage("");
      } else {
        setCloseOtpError(res.message || "Invalid OTP. Please try again.");
      }
    } catch (e) {
      setCloseOtpError(e?.message || "Failed to verify OTP.");
    } finally {
      setCloseOtpVerifying(false);
    }
  };

  const handleBookingStatusUpdated = (bookingId, nextStatus) => {
    const normalizedStatus = String(nextStatus || "").toLowerCase();

    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === bookingId
          ? { ...booking, status: normalizedStatus }
          : booking,
      ),
    );

    setSelectedBooking((prev) =>
      prev && prev.id === bookingId
        ? { ...prev, status: normalizedStatus }
        : prev,
    );
  };

  const handleExtendService = async (bookingId, serviceId = 30) => {
    try {
      setIsExtending(true);
      const res = await customerService.extendBooking(bookingId, serviceId);
      if (res?.success && res.payment_link) {
        window.location.href = res.payment_link;
      } else {
        toast.error(
          res?.message || "Failed to generate extension payment link.",
        );
      }
    } catch (e) {
      toast.error(e?.message || "Failed to extend service.");
    } finally {
      setIsExtending(false);
    }
  };

  const handleContinuePayment = async (bookingId) => {
    const loadRazorpayScript = () =>
      new Promise((resolve) => {
        if (window.Razorpay) {
          resolve(true);
          return;
        }

        const existingScript = document.querySelector(
          'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
        );
        if (existingScript) {
          existingScript.addEventListener("load", () => resolve(true), {
            once: true,
          });
          existingScript.addEventListener("error", () => resolve(false), {
            once: true,
          });
          return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });

    try {
      const response = await paymentService.createOrder(bookingId);
      if (response?.success && response?.order_id && response?.razorpay_key) {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded || !window.Razorpay) {
          toast.error("Unable to load Razorpay checkout. Please try again.");
          return;
        }

        const booking = bookings.find((b) => b.id === bookingId);
        const options = {
          key: response.razorpay_key,
          amount: response.amount * 100,
          currency: response.currency || "INR",
          name: "Hobit",
          description: `Payment for Booking #${bookingId}`,
          order_id: response.order_id,
          handler: function (razorpayResponse) {
            const verifyPayment = async () => {
              try {
                const verificationResponse = await paymentService.verifyPayment(
                  {
                    razorpay_order_id: response.order_id,
                    razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                    razorpay_signature: razorpayResponse.razorpay_signature,
                    booking_id: bookingId,
                  },
                );
                if (verificationResponse?.success) {
                  toast.success(
                    "Payment successful! Your booking is confirmed.",
                  );
                  window.location.reload();
                } else {
                  toast.error(
                    "Payment verification failed. Please contact support.",
                  );
                }
              } catch (error) {
                console.error("Payment verification error:", error);
                toast.error(
                  "Payment verification failed. Please contact support.",
                );
              }
            };
            verifyPayment();
          },
          prefill: {
            name: booking?.customer_name || "Customer",
            contact: booking?.customer_phone || "",
          },
          theme: { color: "#3d8bff" },
        };
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        toast.error("Payment initiated but unexpected response format.");
      }
    } catch (error) {
      toast.error("Failed to initiate payment: " + error.message);
    }
  };

  const handleRescheduleMonthly = async () => {
    if (
      !selectedBooking?.id ||
      !rescheduleData.date ||
      !rescheduleData.time_slot
    )
      return;
    try {
      setRescheduleLoading(true);
      setRescheduleError("");
      const res = await customerService.rescheduleMonthly(
        selectedBooking.id,
        rescheduleData,
      );
      if (res?.success) {
        setRescheduleModalOpen(false);
        setRescheduleData({ date: "", time_slot: "", reason: "" });
        const freshRes = await execute();
        if (Array.isArray(freshRes?.data)) setBookings(freshRes.data);
        toast.success(res.message || "Rescheduled successfully!");
      } else {
        setRescheduleError(res.message || "Failed to reschedule.");
      }
    } catch (e) {
      setRescheduleError(e?.message || "An error occurred.");
    } finally {
      setRescheduleLoading(false);
    }
  };

  const handlePauseSubscription = async () => {
    if (!selectedBooking?.id || !pauseData.pause_from || !pauseData.pause_until)
      return;
    try {
      setPauseLoading(true);
      setPauseError("");
      const payload = {
        pause_from: pauseData.pause_from,
        pause_until: pauseData.pause_until,
        ...(pauseData.reason ? { reason: pauseData.reason } : {}),
      };
      const res = await customerService.pauseSubscription(
        selectedBooking.id,
        payload,
      );
      if (res?.success) {
        // Update booking status to "paused" and store pause range
        const pauseInfo = {
          status: "paused",
          pause_from: pauseData.pause_from,
          pause_until: pauseData.pause_until,
        };
        setBookings((prev) =>
          prev.map((b) =>
            b.id === selectedBooking.id ? { ...b, ...pauseInfo } : b,
          ),
        );
        setSelectedBooking((prev) =>
          prev ? { ...prev, ...pauseInfo } : prev,
        );
        setPauseModalOpen(false);
        setPauseData({ pause_from: "", pause_until: "", reason: "" });
        toast.success(res.message || "Subscription paused successfully!");
      } else {
        setPauseError(res?.message || "Failed to pause subscription.");
      }
    } catch (e) {
      setPauseError(e?.message || "An error occurred.");
    } finally {
      setPauseLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!selectedBooking) return;
    const fromList = bookings.find((b) => b.id === selectedBooking.id);
    const workerId =
      selectedBooking.worker_id ||
      fromList?.worker_id ||
      selectedBooking.worker?.id;
    if (!workerId) {
      setRatingError("Worker not found for this booking.");
      return;
    }
    try {
      setRatingSubmitting(true);
      setRatingError("");
      const payload = {
        booking_id: selectedBooking.id,
        worker_id: workerId,
        rating: ratingValue,
        description: ratingDescription,
      };
      const res = await customerService.submitRating(payload);
      if (res?.success === false) {
        setRatingError(res?.message || "Failed to submit rating.");
      } else {
        setRatingMessage(res?.message || "Rating submitted successfully");
      }
    } catch (e) {
      setRatingError(e?.message || "Failed to submit rating.");
    } finally {
      setRatingSubmitting(false);
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      const res = await customerService.setDefaultAddress(id);
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, is_default: a.id === id })),
      );
      toast.success(res?.message || "Default address updated");
    } catch (err) {
      toast.error(err?.message || "Failed to set default address");
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const res = await customerService.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success(res?.message || "Address deleted successfully");
    } catch (err) {
      toast.error(err?.message || "Failed to delete address");
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6fb] lg:p-6">
      <div className="max-w-7xl mx-auto bg-white lg:rounded-[32px] lg:shadow-2xl lg:shadow-blue-500/10 lg:border lg:border-zinc-100 flex overflow-hidden min-h-screen lg:min-h-[calc(100vh-3rem)]">
        <Sidebar
          user={user}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
          mobileOpen={isSidebarOpen}
          onMobileClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {/* Mobile Header */}
          <div className="lg:hidden bg-white border-b border-zinc-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-zinc-100 rounded-lg transition"
              >
                <Menu className="w-6 h-6 text-slate-700" />
              </button>
              <h1 className="font-bold text-lg text-slate-900">Dashboard</h1>
            </div>
            <button
              onClick={() => navigate("/book")}
              className="bg-[#3d8bff] text-white p-2 rounded-lg shadow-lg shadow-blue-500/20"
            >
              <Sparkles className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 md:p-8 lg:p-10">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
                  Welcome back, {user.name?.split(" ")[0] || "User"}!
                </h1>
                <p className="text-zinc-500 font-medium">
                  You have {activeBookings.length} active services scheduled.
                </p>
              </div>
              <div className="hidden md:flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleReferralClick}
                  disabled={referralLoading}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 hover:border-[#3d8bff] hover:text-[#3d8bff] bg-white transition disabled:opacity-60"
                >
                  Share Referral Code
                </button>
                <button
                  onClick={() => navigate("/book")}
                  className="flex items-center justify-center gap-2 bg-[#3d8bff] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#3f5ce6] transition shadow-lg shadow-blue-500/20"
                >
                  <Sparkles className="w-5 h-5" />
                  Book New Service
                </button>
              </div>
            </div>

            <Stats stats={stats} />
          </div>

          <div className="px-4 md:px-8 lg:px-10">
            <DashboardTabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            {loading && <LoadingState />}
            {error && !loading && <ErrorState error={error} />}

            {!loading && !error && (
              <div className="min-h-[400px]">
                {activeTab === "active" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                  >
                    {activeBookings.length === 0 ? (
                      <EmptyState
                        icon={Sparkles}
                        title="No active services yet"
                        message="Book your first cleaning service and experience the magic of a clean home."
                        onAction={() => navigate("/book")}
                        actionLabel="Book a Service"
                      />
                    ) : (
                      activeBookings.map((booking, index) => (
                        <ActiveBookingCard
                          key={booking.id}
                          booking={booking}
                          index={index}
                          onDetails={() => openBookingDetails(booking.id)}
                          onTrack={() => {
                            setTrackingBookingId(booking.id);
                            setTrackingModalOpen(true);
                          }}
                          onPayment={() => handleContinuePayment(booking.id)}
                          onViewCode={() => handleViewActiveCode(booking.id)}
                        />
                      ))
                    )}
                  </motion.div>
                )}

                {activeTab === "past" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    {pastBookings.length === 0 ? (
                      <EmptyState
                        icon={History}
                        title="No service history found"
                        message="Your completed and cancelled services will appear here."
                      />
                    ) : (
                      pastBookings.map((booking, index) => (
                        <PastBookingCard
                          key={booking.id}
                          booking={booking}
                          index={index}
                          onDetails={() => openBookingDetails(booking.id)}
                        />
                      ))
                    )}
                  </motion.div>
                )}

                {activeTab === "inactive" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                  >
                    {inactiveBookings.length === 0 ? (
                      <EmptyState
                        icon={History}
                        title="No inactive bookings"
                        message="Expired unpaid bookings will appear here."
                      />
                    ) : (
                      inactiveBookings.map((booking, index) => (
                        <ActiveBookingCard
                          key={booking.id}
                          booking={booking}
                          index={index}
                          onDetails={() => openBookingDetails(booking.id)}
                          onTrack={() => {}}
                          onPayment={() => {}}
                        />
                      ))
                    )}
                  </motion.div>
                )}

                {activeTab === "subscriptions" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {subscriptionBookings.length === 0 ? (
                      <EmptyState
                        icon={Repeat}
                        title="No active subscriptions"
                        message="Check out our monthly plans for regular cleaning services."
                        onAction={() => navigate("/book")}
                        actionLabel="Browse monthly plans"
                      />
                    ) : (
                      subscriptionBookings.map((booking, index) => (
                        <SubscriptionCard
                          key={booking.id}
                          booking={booking}
                          index={index}
                          onDetails={() => openBookingDetails(booking.id)}
                          onReschedule={() => {
                            setSelectedBooking(booking);
                            setRescheduleModalOpen(true);
                          }}
                          onPause={() => {
                            setSelectedBooking(booking);
                            setPauseData({ pause_from: "", pause_until: "", reason: "" });
                            setPauseError("");
                            setPauseModalOpen(true);
                          }}
                        />
                      ))
                    )}
                  </motion.div>
                )}

                {activeTab === "referrals" && (
                  <div className="space-y-4">
                    {referralStats ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                              Referral Points
                            </p>
                            <p className="text-2xl font-black text-slate-900">
                              {referralStats.referral_points ?? 0}
                            </p>
                          </div>
                          <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                              Total Referrals
                            </p>
                            <p className="text-2xl font-black text-slate-900">
                              {referralStats.referrals_count ?? 0}
                            </p>
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                            Referral History
                          </p>

                          {Array.isArray(referralStats.referrals) &&
                          referralStats.referrals.length > 0 ? (
                            <div className="space-y-3 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                              {referralStats.referrals.map((ref, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-50"
                                >
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                      {ref.name || `Referral ${idx + 1}`}
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                      {ref.phone || "Phone not provided"}
                                    </p>
                                    {ref.created_at && (
                                      <p className="text-[11px] text-zinc-400 mt-1">
                                        {new Date(
                                          ref.created_at,
                                        ).toLocaleString("en-IN", {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </p>
                                    )}
                                  </div>
                                  <p className="text-sm font-bold text-emerald-600">
                                    +{ref.points ?? 0} pts
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-zinc-500">
                              No referrals yet.
                            </p>
                          )}
                        </div>

                        {referralStatsError && (
                          <p className="text-xs text-red-500">
                            {referralStatsError}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-zinc-500">
                        Referral data not available.
                      </p>
                    )}
                  </div>
                )}

                {activeTab === "address" && (
                  <AddressTab
                    showAddressForm={showAddressForm}
                    setShowAddressForm={setShowAddressForm}
                    editingAddress={editingAddress}
                    setEditingAddress={setEditingAddress}
                    addresses={addresses}
                    handleSetDefaultAddress={handleSetDefaultAddress}
                    handleDeleteAddress={handleDeleteAddress}
                    loadAddresses={loadAddresses}
                    isLoaded={isLoaded}
                    loadError={loadError}
                  />
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      <BookingDetailsModal
        selectedBooking={selectedBooking}
        onStatusUpdated={handleBookingStatusUpdated}
        onClose={() => {
          setSelectedBooking(null);
          setExtensionOptions([]);
          setRescheduleHistory(null);
        }}
        detailLoading={detailLoading}
        detailError={detailError}
        extensionOptions={extensionOptions}
        extensionHistory={extensionHistory}
        rescheduleHistory={rescheduleHistory}
        isExtending={isExtending}
        handleExtendService={handleExtendService}
        handleSendCloseOtp={handleSendCloseOtp}
        closingBookingId={closingBookingId}
        closeOtpMessage={closeOtpMessage}
        setRescheduleModalOpen={setRescheduleModalOpen}
        onOpenPauseModal={() => {
          setPauseData({ pause_from: "", pause_until: "", reason: "" });
          setPauseError("");
          setPauseModalOpen(true);
        }}
        ratingValue={ratingValue}
        setRatingValue={setRatingValue}
        ratingDescription={ratingDescription}
        setRatingDescription={setRatingDescription}
        ratingError={ratingError}
        ratingMessage={ratingMessage}
        ratingSubmitting={ratingSubmitting}
        handleSubmitRating={handleSubmitRating}
      />

      <TrackingModal
        isOpen={trackingModalOpen}
        onClose={() => setTrackingModalOpen(false)}
        bookingId={trackingBookingId}
      />

      <CloseOtpModal
        isOpen={closeOtpModalOpen}
        onClose={() => setCloseOtpModalOpen(false)}
        closeOtp={closeOtp}
        setCloseOtp={setCloseOtp}
        closeOtpVerifying={closeOtpVerifying}
        closeOtpError={closeOtpError}
        handleVerifyCloseOtp={handleVerifyCloseOtp}
      />

      <ActiveCodeModal
        isOpen={activeCodeModalOpen}
        onClose={() => setActiveCodeModalOpen(false)}
        loading={activeCodeLoading}
        error={activeCodeError}
        code={activeCode}
      />

      <RescheduleModal
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        selectedBooking={selectedBooking}
        rescheduleData={rescheduleData}
        setRescheduleData={setRescheduleData}
        rescheduleLoading={rescheduleLoading}
        rescheduleError={rescheduleError}
        handleRescheduleMonthly={handleRescheduleMonthly}
      />

      <PauseModal
        isOpen={pauseModalOpen}
        onClose={() => setPauseModalOpen(false)}
        pauseData={pauseData}
        setPauseData={setPauseData}
        pauseLoading={pauseLoading}
        pauseError={pauseError}
        handlePauseSubscription={handlePauseSubscription}
      />
    </div>
  );
}

export default Dashboard;
