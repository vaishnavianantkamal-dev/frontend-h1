import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../../context/BookingContext";
import StepProgress from "../../components/booking/StepProgress";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { computeCharges } from "../../utils/charges";
import { useRainCharge } from "../../hooks/api/useRainCharge";
import {
  ArrowRight,
  ArrowLeft,
  Edit,
  CheckCircle2,
  MapPin,
  X,
} from "lucide-react";

/** Matches DateTime / booking policy: service hours 9:00 AM – 6:00 PM (6:00 PM start allowed; nothing after). */
const RANGE_SLOT_IDS = ["9-12", "12-3", "3-6"];
const RANGE_END_HOUR = { "9-12": 12, "12-3": 15, "3-6": 18 };

const SCHEDULE_ISSUE_COPY = {
  invalid_date: {
    title: "Invalid date",
    detail:
      "The selected date could not be read. Please go back and choose a valid date.",
  },
  past_date: {
    title: "This date is not available",
    detail:
      "This date has already passed. Please pick a new date to continue.",
  },
  outside_hours: {
    title: "Time is outside service hours",
    detail:
      "Bookings are only available between 9:00 AM and 6:00 PM. Please choose a time within this window.",
  },
  past_time: {
    title: "This time slot is no longer available",
    detail:
      "The selected time has already passed. Please pick a new date or a time between 9:00 AM and 6:00 PM.",
  },
};

function startOfLocalDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function parseMinutesFromTime24(str) {
  if (!str || !/^\d{1,2}:\d{2}$/.test(String(str).trim())) return null;
  const [h, m] = String(str).trim().split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

function parseMinutesFromTwelveOr24Slot(slot) {
  const s = String(slot);
  const twelve = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (twelve) {
    let hh = parseInt(twelve[1], 10);
    const mm = parseInt(twelve[2], 10);
    const ap = twelve[3].toUpperCase();
    if (ap === "PM" && hh !== 12) hh += 12;
    if (ap === "AM" && hh === 12) hh = 0;
    return hh * 60 + mm;
  }
  if (/^\d{1,2}:\d{2}$/.test(s)) {
    const [h, m] = s.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
  }
  return null;
}

function isOutsideServiceHours(totalMinutes) {
  if (totalMinutes == null) return false;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h < 9) return true;
  if (h > 18) return true;
  if (h === 18 && m > 0) return true;
  return false;
}

/**
 * @returns {"invalid_date"|"past_date"|"outside_hours"|"past_time"|null}
 */
function getScheduleIssue(scheduleDateValue, timeSlot, time24) {
  if (!scheduleDateValue || !timeSlot) return null;

  const sched =
    scheduleDateValue instanceof Date
      ? new Date(scheduleDateValue)
      : new Date(scheduleDateValue);
  if (Number.isNaN(sched.getTime())) return "invalid_date";

  const now = new Date();
  const todayStart = startOfLocalDay(now);
  const schedDayStart = startOfLocalDay(sched);

  if (schedDayStart < todayStart) return "past_date";

  const slotStr = String(timeSlot);
  const isRangeSlot = RANGE_SLOT_IDS.includes(slotStr);

  let minutes = null;
  if (time24 && /^\d{1,2}:\d{2}$/.test(String(time24).trim())) {
    minutes = parseMinutesFromTime24(time24);
  } else if (!isRangeSlot) {
    minutes = parseMinutesFromTwelveOr24Slot(slotStr);
  }

  if (minutes != null && isOutsideServiceHours(minutes)) {
    return "outside_hours";
  }

  const isToday = schedDayStart.getTime() === todayStart.getTime();
  if (!isToday) return null;

  if (time24 && /^\d{1,2}:\d{2}$/.test(String(time24).trim())) {
    const [h, m] = String(time24).trim().split(":").map(Number);
    const candidate = new Date(sched);
    candidate.setHours(h, m, 0, 0);
    const nowBaseline = new Date(now);
    nowBaseline.setSeconds(0, 0);
    if (candidate < nowBaseline) return "past_time";
    return null;
  }

  const rangeEndHour = RANGE_END_HOUR[slotStr];
  if (rangeEndHour != null) {
    const slotEnd = new Date(sched);
    slotEnd.setHours(rangeEndHour, 0, 0, 0);
    if (now >= slotEnd) return "past_time";
    return null;
  }

  const twelve = slotStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (twelve) {
    let hh = parseInt(twelve[1], 10);
    const mm = parseInt(twelve[2], 10);
    const ap = twelve[3].toUpperCase();
    if (ap === "PM" && hh !== 12) hh += 12;
    if (ap === "AM" && hh === 12) hh = 0;
    const candidate = new Date(sched);
    candidate.setHours(hh, mm, 0, 0);
    const nowBaseline = new Date(now);
    nowBaseline.setSeconds(0, 0);
    if (candidate < nowBaseline) return "past_time";
    return null;
  }

  if (/^\d{1,2}:\d{2}$/.test(slotStr)) {
    const [h, m] = slotStr.split(":").map(Number);
    const candidate = new Date(sched);
    candidate.setHours(h, m, 0, 0);
    const nowBaseline = new Date(now);
    nowBaseline.setSeconds(0, 0);
    if (candidate < nowBaseline) return "past_time";
    return null;
  }

  return null;
}

function Summary() {
  const { bookingData, updateBookingData, charges } = useBooking();
  const navigate = useNavigate();
  const [missingModalOpen, setMissingModalOpen] = useState(false);
  const [scheduleExpiredModalOpen, setScheduleExpiredModalOpen] =
    useState(false);
  const [user, setUser] = useState(null);

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      setUser(null);
    }
  }, []);

  const scheduleDateValue = bookingData.date || bookingData.startDate;
  const hasSchedule = Boolean(scheduleDateValue && bookingData.timeSlot);
  const hasAddress = Boolean(bookingData.address);

  const scheduleIssueKey = getScheduleIssue(
    scheduleDateValue,
    bookingData.timeSlot,
    bookingData.time,
  );
  const isScheduleBlocked = scheduleIssueKey != null;
  const scheduleIssueCopy = scheduleIssueKey
    ? SCHEDULE_ISSUE_COPY[scheduleIssueKey]
    : null;

  const calculateServicePrice = (service) => {
    const duration = bookingData.subscriptionDurationDays || 30;

    // Prefer the exact dynamic plan price fetched on the Date & Time step
    // (from the backend's /plans endpoint) over a locally recomputed
    // estimate — that endpoint is the source of truth for non-30-day
    // durations (e.g. 15 days), and matches what BookingContext uses to
    // compute the payload total.
    if (
      bookingData.serviceType === "monthly" &&
      bookingData.subscriptionPlanPrice != null &&
      bookingData.subscriptionPlanServiceId != null &&
      service.id === bookingData.subscriptionPlanServiceId &&
      !service.isVariantPrice &&
      !service.isStandardAddon
    ) {
      return Math.floor(
        Number(bookingData.subscriptionPlanPrice) * (service.quantity || 1),
      );
    }

    if (service.isVariantPrice && service.basePrice != null) {
      let basePrice = Number(service.basePrice);
      if (bookingData.serviceType === "monthly") {
        basePrice = (basePrice * duration) / 30;
      }
      return Math.floor(basePrice * (service.quantity || 1));
    }

    let price =
      bookingData.serviceType === "monthly" && service.monthlyPrice
        ? service.monthlyPrice
        : bookingData.serviceType === "instant" && service.instantPrice
          ? service.instantPrice
          : service.oneTimePrice ||
          service.monthlyPrice ||
          service.instantPrice ||
          0;

    if (bookingData.serviceType === "monthly") {
      price = (price * duration) / 30;
    }

    let multiplier = 1.0;

    if (
      bookingData.serviceType !== "instant" &&
      bookingData.serviceType !== "demo"
    ) {
      if (service.categoryKey === "commercial") {
        multiplier = 1.0;
      } else if (
        typeof service.id === "string" &&
        service.id === "sofa-cleaning"
      ) {
        const count =
          bookingData.sofaSeatCount ||
          (bookingData.homeType?.includes("seat")
            ? bookingData.homeType
            : "1seat");
        if (count === "2seat") multiplier = 2.0;
        else if (count === "3seat") multiplier = 3.0;
        else if (count === "4seat") multiplier = 4.0;
        else if (count === "5seat") multiplier = 5.0;
      } else if (
        typeof service.id === "string" &&
        service.id === "carpet-cleaning"
      ) {
        const count =
          bookingData.carpetCount ||
          (bookingData.homeType?.includes("carpet")
            ? bookingData.homeType
            : "1carpet");
        if (count === "2carpet") multiplier = 2.0;
        else if (count === "3carpet") multiplier = 3.0;
        else if (count === "4carpet") multiplier = 4.0;
      } else if (
        typeof service.id === "string" &&
        service.id.includes("bathroom")
      ) {
        const count =
          bookingData.bathroomCount ||
          (bookingData.homeType?.includes("bathroom")
            ? bookingData.homeType
            : "1bathroom");
        if (count === "2bathroom") multiplier = 2.0;
        else if (count === "3bathroom") multiplier = 3.0;
        else if (count === "4bathroom") multiplier = 4.0;
      } else if (
        typeof service.id === "string" &&
        (service.id === "utensils-washing" || service.id === "clothes-washing")
      ) {
        const count =
          bookingData.familySize ||
          (bookingData.homeType?.includes("person")
            ? bookingData.homeType
            : "4person");
        if (count === "8person") multiplier = 1.5;
        else if (count === "12person") multiplier = 2.0;
      } else if (
        typeof service.id === "string" &&
        service.id === "full-house-deep-cleaning"
      ) {
        const bhk =
          !bookingData.homeType ||
            bookingData.homeType.includes("seat") ||
            bookingData.homeType.includes("carpet") ||
            bookingData.homeType.includes("person") ||
            bookingData.homeType.includes("bathroom")
            ? "1bhk"
            : bookingData.homeType;
        if (bhk === "2bhk") multiplier = 1.2;
        else if (bhk === "3bhk") multiplier = 1.6;
        else if (bhk === "4bhk+") multiplier = 2.0;
      } else {
        const bhk =
          !bookingData.homeType ||
            bookingData.homeType.includes("seat") ||
            bookingData.homeType.includes("carpet") ||
            bookingData.homeType.includes("person") ||
            bookingData.homeType.includes("bathroom")
            ? "2bhk"
            : bookingData.homeType;

        if (bhk === "3bhk") multiplier = 1.154;
        else if (bhk === "4bhk+") multiplier = 1.462;
      }
    }

    const quantity = service.quantity || 1;
    return Math.floor(price * multiplier * quantity);
  };

  const formatHomeType = (type) => {
    if (!type) return "Not selected";

    // BHK formatting
    if (type.includes("bhk")) {
      return type.toUpperCase().replace("PLUS", "+");
    }

    // Person formatting
    if (type.includes("person")) {
      const count = type.replace("person", "");
      return `${count} Person${count > 1 ? "s" : ""}`;
    }

    // Bathroom formatting
    if (type.includes("bathroom")) {
      const count = type.replace("bathroom", "");
      return `${count} Bathroom${count > 1 ? "s" : ""}`;
    }

    // Sofa Seat formatting
    if (type.includes("seat")) {
      const count = type.replace("seat", "");
      return `${count} Seat${count > 1 ? "s" : ""}`;
    }

    // Carpet formatting
    if (type.includes("carpet")) {
      const count = type.replace("carpet", "");
      return `${count} Carpet${count > 1 ? "s" : ""}`;
    }

    return type.toUpperCase();
  };

  const getDynamicDescription = (service) => {
    // Sofa
    if (typeof service.id === "string" && service.id === "sofa-cleaning") {
      const count =
        bookingData.sofaSeatCount ||
        (bookingData.homeType?.includes("seat")
          ? bookingData.homeType
          : "1seat");
      return formatHomeType(count);
    }

    // Carpet
    if (typeof service.id === "string" && service.id === "carpet-cleaning") {
      const count =
        bookingData.carpetCount ||
        (bookingData.homeType?.includes("carpet")
          ? bookingData.homeType
          : "1carpet");
      return formatHomeType(count);
    }

    // Bathroom
    if (typeof service.id === "string" && service.id.includes("bathroom")) {
      const count =
        bookingData.bathroomCount ||
        (bookingData.homeType?.includes("bathroom")
          ? bookingData.homeType
          : "1bathroom");
      return formatHomeType(count);
    }

    // Utensils/Clothes
    if (
      typeof service.id === "string" &&
      (service.id === "utensils-washing" || service.id === "clothes-washing")
    ) {
      const count =
        bookingData.familySize ||
        (bookingData.homeType?.includes("person")
          ? bookingData.homeType
          : "4person");
      return `For ${formatHomeType(count)}`;
    }

    // Deep Cleaning / Standard
    if (
      (typeof service.id === "string" &&
        service.id === "full-house-deep-cleaning") ||
      (typeof service.id === "string" &&
        !service.id.includes("kitchen") &&
        service.categoryKey !== "commercial")
    ) {
      // If it's a standard service that relies on BHK
      const bhk =
        !bookingData.homeType ||
          bookingData.homeType.includes("seat") ||
          bookingData.homeType.includes("carpet") ||
          bookingData.homeType.includes("person") ||
          bookingData.homeType.includes("bathroom")
          ? null
          : bookingData.homeType;

      if (bhk) return formatHomeType(bhk);
    }

    return service.description;
  };

  const calculateTotal = () => {
    if (!bookingData.selectedServices) return 0;
    return bookingData.selectedServices.reduce((total, service) => {
      return total + calculateServicePrice(service);
    }, 0);
  };

  const calculatedTotal = calculateTotal();

  // Instant Help bookings can be served by multiple workers; the base price is
  // multiplied by the number of workers. Other service types are unaffected.
  // workerCount lives in the shared booking context so the multiplied price
  // flows through to the Payment step.
  const isInstantHelp = bookingData.serviceType === "instant";
  const workerCount = isInstantHelp ? Number(bookingData.workerCount) || 1 : 1;
  const displayTotal = isInstantHelp
    ? calculatedTotal * workerCount
    : calculatedTotal;

  // Rain charge applies only to instant bookings and only when it is actually
  // raining at the service location (resolved from the weather API).
  const rainAddress = bookingData.address || {};
  const { rainCharge: weatherRainCharge } = useRainCharge({
    lat: rainAddress.latitude ?? rainAddress.lat ?? null,
    long: rainAddress.longitude ?? rainAddress.long ?? null,
    enabled: isInstantHelp,
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

  const priceBreakdown = computeCharges(displayTotal, charges, {
    rainCharge: weatherRainCharge,
    includeSubscriptionFee,
  });

  const setWorkerCount = (next) => {
    const value =
      typeof next === "function" ? next(workerCount) : next;
    updateBookingData({ workerCount: Math.max(1, value) });
  };

  const handleNext = () => {
    // Check if user is authenticated
    if (!user) {
      toast.error("Please login to continue with your booking");
      navigate("/login", { state: { from: "/book/summary" } });
      return;
    }

    if (!hasAddress) {
      setMissingModalOpen(true);
      return;
    }

    if (!scheduleDateValue || !bookingData.timeSlot) {
      setMissingModalOpen(true);
      return;
    }

    const scheduleIssueOnClick = getScheduleIssue(
      scheduleDateValue,
      bookingData.timeSlot,
      bookingData.time,
    );

    if (scheduleIssueOnClick != null) {
      const copy = SCHEDULE_ISSUE_COPY[scheduleIssueOnClick];
      toast.error(
        copy?.detail ||
        copy?.title ||
        "This date and time are not valid. Please update your schedule.",
      );
      setScheduleExpiredModalOpen(true);
      return;
    }

    updateBookingData({ totalPrice: displayTotal });
    navigate("/book/payment");
  };

  const handleEditPlan = () => {
    navigate("/book/service");
  };

  const handleRemoveService = (serviceToRemove) => {
    const list = bookingData.selectedServices || [];
    const removingStandardMainService =
      !serviceToRemove?.isStandardAddon &&
      (serviceToRemove?.categoryKey === "standard" ||
        serviceToRemove?.isGroup ||
        Boolean(serviceToRemove?.serviceGroup));

    let updatedServices = list.filter(
      (service) => service.id !== serviceToRemove.id,
    );

    if (removingStandardMainService) {
      updatedServices = updatedServices.filter((s) => !s.isStandardAddon);
      updateBookingData({
        selectedServices: updatedServices,
        standardAddons: [],
      });
      return;
    }

    updateBookingData({ selectedServices: updatedServices });
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "Not selected";
    const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "Invalid date";

    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getTimeSlotLabel = (slotId) => {
    if (!slotId) return "Not selected";
    const slots = {
      "9-12": "Morning (9:00 AM - 12:00 PM)",
      "12-3": "Afternoon (12:00 PM - 3:00 PM)",
      "3-6": "Evening (3:00 PM - 6:00 PM)",
    };
    if (slots[slotId]) return slots[slotId];
    if (String(slotId).match(/^\d{1,2}:\d{2}$/)) {
      const [h, m] = String(slotId).split(":").map(Number);
      const period = h >= 12 ? "PM" : "AM";
      const hour = h % 12 || 12;
      return `${hour}:${String(m).padStart(2, "0")} ${period}`;
    }
    return slotId;
  };

  const getServiceDisplayName = (service) => {
    if (service.serviceGroup && service.name) {
      return `${service.serviceGroup} — ${service.name}`;
    }
    return service.name || "Service";
  };

  const subscriptionTypeLabel =
    bookingData.selectedServices?.[0]?.subscriptionName ||
    (bookingData.serviceType === "monthly" ? "Monthly Subscription" : null);

  return (
    <div className="min-h-screen pb-12">
      <StepProgress />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Review Your Booking
          </h1>
          <p className="text-lg text-zinc-600">
            Please review all details before proceeding
          </p>
        </motion.div>

        <div className="space-y-6 mb-8">
          {/* Missing data warnings */}
          {hasSchedule && isScheduleBlocked && scheduleIssueCopy && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-rose-200 bg-rose-50 p-5"
            >
              <p className="text-sm font-semibold text-rose-900">
                {scheduleIssueCopy.title}
              </p>
              <p className="text-xs text-rose-800/90 mt-1">
                {scheduleIssueCopy.detail}
              </p>
              {(scheduleIssueKey === "outside_hours" ||
                scheduleIssueKey === "past_time") && (
                  <p className="text-[11px] text-rose-700/80 mt-2">
                    Service hours: 9:00 AM – 6:00 PM.
                  </p>
                )}
              <button
                type="button"
                onClick={() => navigate("/book/date-time")}
                className="mt-3 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition"
              >
                Update schedule
              </button>
            </motion.div>
          )}

          {(!hasSchedule || !hasAddress) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-amber-200 bg-amber-50 p-5"
            >
              <p className="text-sm font-semibold text-amber-900">
                Please complete your booking details
              </p>
              <p className="text-xs text-amber-800/80 mt-1">
                {[
                  !hasSchedule ? "Date & time" : null,
                  !hasAddress ? "Address" : null,
                ]
                  .filter(Boolean)
                  .join(" • ")}{" "}
                is missing. Fill it to continue.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {!hasSchedule && (
                  <button
                    type="button"
                    onClick={() => navigate("/book/date-time")}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 transition"
                  >
                    Fill Date & Time
                  </button>
                )}
                {!hasAddress && (
                  <button
                    type="button"
                    onClick={() => navigate("/book/address")}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-amber-800 border border-amber-200 hover:bg-amber-100 transition"
                  >
                    Fill Address
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Selected Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-zinc-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900">
                Selected Services
              </h2>
              <button
                onClick={handleEditPlan}
                className="flex items-center gap-2 text-sm text-[#3d8bff] hover:underline"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            </div>
            <div className="space-y-2">
              {bookingData.selectedServices?.map((service) => {
                const servicePrice = calculateServicePrice(service);
                const dynamicDescription = getDynamicDescription(service);
                const displayName = getServiceDisplayName(service);

                return (
                  <div
                    key={service.id}
                    className="flex items-center justify-between py-3 border-b border-zinc-100 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-zinc-800 font-semibold block">
                        {displayName}
                        {service.quantity > 1 && ` × ${service.quantity}`}
                      </span>
                      {dynamicDescription && !service.serviceGroup && (
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {dynamicDescription}
                        </p>
                      )}
                      {service.subscriptionName && (
                        <span className="inline-block mt-1 text-xs font-medium text-[#3d8bff] bg-[#3d8bff]/10 px-2 py-0.5 rounded">
                          {service.subscriptionName}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 shrink-0">
                        ₹{servicePrice.toLocaleString()}
                        {bookingData.serviceType === "monthly" &&
                          (service.monthlyPrice || service.isVariantPrice) && (
                            <span className="text-xs text-zinc-500 font-normal">
                              {bookingData.subscriptionDurationDays === 15 ? "/15 days" : "/month"}
                            </span>
                          )}
                      </span>
                      <button
                        onClick={() => handleRemoveService(service)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove service"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Workers (Instant Help only) */}
          {isInstantHelp && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-2xl border border-zinc-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Workers
                  </h2>
                  <p className="text-sm text-zinc-500 mt-1">
                    Number of workers for your service
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setWorkerCount((count) => Math.max(1, count - 1))
                    }
                    disabled={workerCount <= 1}
                    aria-label="Decrease workers"
                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-zinc-200 text-slate-900 hover:border-[#3d8bff] hover:text-[#3d8bff] transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-zinc-200 disabled:hover:text-slate-900"
                  >
                    <span className="text-xl font-semibold leading-none">−</span>
                  </button>
                  <span className="w-8 text-center text-lg font-semibold text-slate-900 tabular-nums">
                    {workerCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setWorkerCount((count) => count + 1)}
                    aria-label="Increase workers"
                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-zinc-200 text-slate-900 hover:border-[#3d8bff] hover:text-[#3d8bff] transition"
                  >
                    <span className="text-xl font-semibold leading-none">+</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Service Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-zinc-200 p-6"
          >
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Service Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {/* Show Home Type if selected (BHK) */}
              {bookingData.homeType &&
                !bookingData.homeType.includes("seat") &&
                !bookingData.homeType.includes("person") &&
                !bookingData.homeType.includes("bathroom") &&
                !bookingData.homeType.includes("carpet") && (
                  <div>
                    <p className="text-sm text-zinc-500 mb-1">Home Type</p>
                    <p className="font-semibold text-slate-900">
                      {formatHomeType(bookingData.homeType)}
                    </p>
                  </div>
                )}

              {/* Show specialized counts if they exist */}
              {bookingData.familySize && (
                <div>
                  <p className="text-sm text-zinc-500 mb-1">Family Size</p>
                  <p className="font-semibold text-slate-900">
                    {formatHomeType(bookingData.familySize)}
                  </p>
                </div>
              )}

              {bookingData.bathroomCount && (
                <div>
                  <p className="text-sm text-zinc-500 mb-1">No. of Bathrooms</p>
                  <p className="font-semibold text-slate-900">
                    {formatHomeType(bookingData.bathroomCount)}
                  </p>
                </div>
              )}

              {bookingData.sofaSeatCount && (
                <div>
                  <p className="text-sm text-zinc-500 mb-1">No. of Seats</p>
                  <p className="font-semibold text-slate-900">
                    {formatHomeType(bookingData.sofaSeatCount)}
                  </p>
                </div>
              )}

              {bookingData.carpetCount && (
                <div>
                  <p className="text-sm text-zinc-500 mb-1">No. of Carpets</p>
                  <p className="font-semibold text-slate-900">
                    {formatHomeType(bookingData.carpetCount)}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-zinc-500 mb-1">Service Type</p>
                <p className="font-semibold text-slate-900 capitalize">
                  {bookingData.serviceType?.replace("-", " ") || "Not selected"}
                </p>
              </div>
              {subscriptionTypeLabel && (
                <div>
                  <p className="text-sm text-zinc-500 mb-1">
                    Subscription type
                  </p>
                  <p className="font-semibold text-slate-900">
                    {subscriptionTypeLabel}
                  </p>
                </div>
              )}
              {/* <div>
                <p className="text-sm text-zinc-500 mb-1">Total Duration</p>
                <p className="font-semibold text-slate-900">
                  {bookingData.serviceType === "monthly"
                    ? (() => {
                        const days =
                          bookingData.date && bookingData.subscriptionEndDate
                            ? Math.ceil(
                                (new Date(bookingData.subscriptionEndDate) -
                                  new Date(bookingData.date)) /
                                  (1000 * 60 * 60 * 24),
                              )
                            : bookingData.totalDays || 30;
                        return days > 0
                          ? `1 month (${days} day${days !== 1 ? "s" : ""})`
                          : "1 month";
                      })()
                    : `${bookingData.totalDays ?? 1} ${(bookingData.totalDays ?? 1) === 1 ? "day" : "days"}`}
                </p>
              </div> */}
            </div>
          </motion.div>

          {/* Date & Time */}
          {bookingData.serviceType && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-zinc-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-900">
                  Schedule
                </h2>
                <button
                  type="button"
                  onClick={() => navigate("/book/date-time")}
                  className="flex items-center gap-2 text-sm text-[#3d8bff] hover:underline"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              </div>
              <div className="space-y-2">
                {bookingData.serviceType === "monthly" &&
                  bookingData.subscriptionEndDate && (
                    <div>
                      <p className="text-sm text-zinc-500 mb-1">
                        Subscription period
                      </p>
                      <p className="font-semibold text-slate-900">
                        {formatDate(bookingData.date || bookingData.startDate)} —{" "}
                        {formatDate(bookingData.subscriptionEndDate || bookingData.endDate)}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {bookingData.subscriptionDurationDays || 30} Days Subscription
                      </p>
                    </div>
                  )}
                <div>
                  <p className="text-sm text-zinc-500 mb-1">
                    {bookingData.serviceType === "monthly"
                      ? "Start date"
                      : "Date"}
                  </p>
                  <p className="font-semibold text-slate-900">
                    {hasSchedule
                      ? formatDate(scheduleDateValue)
                      : "Not selected"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500 mb-1">Time slot</p>
                  <p className="font-semibold text-slate-900">
                    {hasSchedule
                      ? getTimeSlotLabel(bookingData.timeSlot)
                      : "Not selected"}
                  </p>
                  {hasSchedule && isScheduleBlocked && scheduleIssueCopy && (
                    <p className="text-xs text-rose-600 font-medium mt-1">
                      {scheduleIssueCopy.detail}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Address Details */}
          {bookingData.address ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl border border-zinc-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-900">
                  Address
                </h2>
                <button
                  onClick={() => navigate("/book/address")}
                  className="flex items-center gap-2 text-sm text-[#3d8bff] hover:underline"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 bg-blue-50 rounded-full">
                  <MapPin className="w-5 h-5 text-[#3d8bff]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-900">
                      {bookingData.address.label || bookingData.address.type}
                    </span>
                  </div>
                  <p className="text-zinc-600">
                    {bookingData.address.formatted_address ||
                      `${bookingData.address.house_no || ""}${bookingData.address.house_no ? ", " : ""}${bookingData.address.building || ""}${bookingData.address.building ? ", " : ""}${bookingData.address.locality || ""}`}
                  </p>
                  {bookingData.address.landmark && (
                    <p className="text-sm text-zinc-500 mt-1">
                      Near {bookingData.address.landmark}
                    </p>
                  )}
                  <p className="text-sm text-zinc-500 mt-1">
                    {bookingData.address.city} - {bookingData.address.pincode}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl border border-zinc-200 p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-slate-900">Address</h2>
                <button
                  type="button"
                  onClick={() => navigate("/book/address")}
                  className="flex items-center gap-2 text-sm text-[#3d8bff] hover:underline"
                >
                  <Edit className="w-4 h-4" />
                  Add
                </button>
              </div>
              <p className="text-sm text-zinc-600">
                Address is not selected yet. Please add your service address.
              </p>
            </motion.div>
          )}

          {/* Price Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-linear-to-br from-[#3d8bff] to-[#3f5ce6] rounded-2xl p-6 text-white"
          >
            <h2 className="text-xl font-semibold mb-4">Price Summary</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-blue-100">
                <span>
                  {bookingData.serviceType === "monthly"
                    ? "Monthly Price"
                    : "Item Total"}
                </span>
                <span className="font-medium text-white">
                  ₹{priceBreakdown.itemTotal.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between text-blue-100">
                <span>Platform Fee</span>
                <span className="font-medium text-white">
                  ₹{priceBreakdown.platformFee.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between text-blue-100">
                <span>Travelling Charge</span>
                <span className="font-medium text-white">
                  ₹{priceBreakdown.travellingCharge.toLocaleString()}
                </span>
              </div>

              {priceBreakdown.rainCharge > 0 && (
                <div className="flex items-center justify-between text-blue-100">
                  <span>Rain Charge</span>
                  <span className="font-medium text-white">
                    ₹{priceBreakdown.rainCharge.toLocaleString()}
                  </span>
                </div>
              )}

              {priceBreakdown.subscriptionFee > 0 && (
                <div className="flex items-center justify-between text-blue-100">
                  <span>Subscription Fee</span>
                  <span className="font-medium text-white">
                    ₹{priceBreakdown.subscriptionFee.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-blue-100">
                <span>
                  GST
                  {priceBreakdown.gstPercent > 0 && (
                    <span className="text-xs text-blue-200 ml-1">
                      ({priceBreakdown.gstPercent}%)
                    </span>
                  )}
                </span>
                <span className="font-medium text-white">
                  ₹{priceBreakdown.gst.toLocaleString()}
                </span>
              </div>

              <div className="border-t border-white/20 pt-3 flex items-center justify-between">
                <span className="text-blue-100">
                  {bookingData.serviceType === "monthly"
                    ? "Total Price"
                    : "Total Pay"}
                </span>
                <span className="font-semibold text-2xl">
                  ₹{priceBreakdown.total.toLocaleString()}
                  {bookingData.serviceType === "monthly" && (
                    <span className="text-sm font-normal text-blue-200 ml-1">
                      /month
                    </span>
                  )}
                </span>
              </div>
            </div>
          </motion.div>

          <div className="flex justify-between items-center">
            <motion.button
              whileHover={{ x: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/book/address")}
              className="flex items-center text-zinc-500 hover:text-slate-900 transition font-medium"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              className="cursor-pointer bg-[#3d8bff] text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-[#3d8bff]/20 hover:shadow-xl hover:shadow-[#3d8bff]/30 transition flex items-center"
            >
              Continue
              <ArrowRight className="w-5 h-5 ml-2" />
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {scheduleExpiredModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={() => setScheduleExpiredModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="w-full max-w-sm rounded-2xl bg-white border border-zinc-200 shadow-2xl p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-base font-bold text-slate-900">
                {scheduleIssueCopy?.title ?? "Schedule not valid"}
              </p>
              <p className="text-sm text-zinc-600 mt-1">
                {scheduleIssueCopy?.detail ??
                  "Please update your date and time to continue."}
              </p>
              {scheduleIssueKey === "outside_hours" ||
                scheduleIssueKey === "past_time" ? (
                <p className="text-xs text-zinc-500 mt-2">
                  Allowed window: 9:00 AM – 6:00 PM.
                </p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setScheduleExpiredModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setScheduleExpiredModalOpen(false);
                    navigate("/book/date-time");
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-rose-600 text-white hover:bg-rose-700"
                >
                  Pick new date & time
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {missingModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={() => setMissingModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="w-full max-w-sm rounded-2xl bg-white border border-zinc-200 shadow-2xl p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-base font-bold text-slate-900">
                Complete your details
              </p>
              <p className="text-sm text-zinc-600 mt-1">
                Please fill the missing information to continue.
              </p>

              <div className="mt-3 space-y-2">
                {!hasSchedule && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                    Date & time is missing.
                  </div>
                )}
                {!hasAddress && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                    Address is missing.
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setMissingModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                >
                  Close
                </button>
                {!hasSchedule && (
                  <button
                    type="button"
                    onClick={() => {
                      setMissingModalOpen(false);
                      navigate("/book/date-time");
                    }}
                    className="px-4 py-2 rounded-xl text-sm font-semibold bg-amber-600 text-white hover:bg-amber-700"
                  >
                    Fill Date &Time
                  </button>
                )}
                {!hasAddress && (
                  <button
                    type="button"
                    onClick={() => {
                      setMissingModalOpen(false);
                      navigate("/book/address");
                    }}
                    className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#3d8bff] text-white hover:bg-[#2f77ea]"
                  >
                    Fill Address
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Summary;
