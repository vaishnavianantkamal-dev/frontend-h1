import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../../context/BookingContext";
import { customerService } from "../../api/services/customer";
import StepProgress from "../../components/booking/StepProgress";
import MonthlySubscriptionInfo from "../../components/booking/MonthlySubscriptionInfo";
import BookingInstructionsModal from "../../components/booking/BookingInstructionsModal";
import {
  ArrowRight,
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  XCircle,
  CreditCard,
  Info,
} from "lucide-react";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const SLOT_INTERVAL_MINUTES = 30;
const DISABLED_TIME_SLOTS = new Set(["09:00"]);

// Convert a backend time value (e.g. "9:00", "09:00:00", "2:30 PM") into 24h "HH:mm".
const toHHmm = (value) => {
  if (value == null) return null;
  const match = String(value)
    .trim()
    .match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
  if (!match) return null;
  let hour = parseInt(match[1], 10);
  const minute = match[2];
  const period = match[3]?.toUpperCase();
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  if (Number.isNaN(hour) || hour > 23) return null;
  return `${String(hour).padStart(2, "0")}:${minute}`;
};

// Normalise the /api/slots response into
// [{ id, time: "HH:mm", label, available, reason, price }].
// Tolerates several backend shapes (bare array, { data }, { slots }, strings,
// or objects keyed by display_label/time/start_time/slot). The live backend
// returns objects like:
//   { id, display_label: "3:30 PM", price, is_available, reason }
const normalizeSlots = (raw) => {
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.data)
      ? raw.data
      : Array.isArray(raw?.slots)
        ? raw.slots
        : Array.isArray(raw?.data?.slots)
          ? raw.data.slots
          : [];

  const seen = new Set();
  const result = [];
  list.forEach((item) => {
    if (typeof item === "string") {
      const time = toHHmm(item);
      if (time && !seen.has(time)) {
        seen.add(time);
        result.push({ id: null, time, label: item, available: true, reason: null, price: null });
      }
      return;
    }
    if (!item || typeof item !== "object") return;

    const rawLabel =
      item.display_label ??
      item.time ??
      item.start_time ??
      item.slot ??
      item.start ??
      item.label;
    const time = toHHmm(rawLabel);
    if (!time || seen.has(time)) return;

    let available = true;
    const rawAvailable =
      item.is_available ?? item.available ?? item.isAvailable;
    if (rawAvailable != null) {
      available = Boolean(rawAvailable);
    } else if (item.status != null) {
      available =
        Number(item.status) === 1 ||
        String(item.status).toLowerCase() === "available";
    }

    seen.add(time);
    result.push({
      id: item.id ?? null,
      time,
      label: rawLabel != null ? String(rawLabel).trim() : time,
      available,
      reason: item.reason ?? null,
      price: item.price ?? null,
    });
  });
  return result.sort((a, b) => a.time.localeCompare(b.time));
};

// Normalise the /customer/services/<id>/plans response into
// [{ id, days, label, price }]. Tolerates the wrapped ({ plans: [...] }) and
// bare-array shapes and the duration_days/days field variants.
const normalizePlans = (raw) => {
  const list = Array.isArray(raw?.plans)
    ? raw.plans
    : Array.isArray(raw?.data?.plans)
      ? raw.data.plans
      : Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw)
          ? raw
          : [];

  return list
    .map((p) => {
      const days = Number(p?.duration_days ?? p?.days ?? p?.duration);
      if (!Number.isFinite(days) || days <= 0) return null;
      const price = Number(p?.price ?? p?.original_price ?? p?.amount);
      return {
        id: p?.id ?? days,
        days,
        label: p?.name || `${days} Days`,
        price: Number.isFinite(price) ? price : null,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.days - b.days);
};

function DateTime() {
  const { bookingData, updateBookingData } = useBooking();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(bookingData.date || null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showCalendar, setShowCalendar] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState("idle"); // idle, checking, available, unavailable, contact_office
  const [availabilityMsg, setAvailabilityMsg] = useState("");
  // Monthly subscription duration: 15 or 30 days (default 30 — matches existing flow)
  const [selectedDuration, setSelectedDuration] = useState(
    bookingData.subscriptionDurationDays || 30,
  );

  const [selectedTime, setSelectedTime] = useState(bookingData.time || ""); // New state for specific time input

  // Live availability from GET /api/slots?date=&category_id=&service_id=
  const [apiSlots, setApiSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [slotsError, setSlotsError] = useState("");

  // Subscription plans from GET /customer/services/<id>/plans (monthly only).
  const [plans, setPlans] = useState([]);
  const [servicePricing, setServicePricing] = useState(null);
  const [serviceMeta, setServiceMeta] = useState(null);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansFetched, setPlansFetched] = useState(false);

  // Category id for the slots API — taken from the first selected service that
  // carries one (all services in a booking share a category).
  const slotCategoryId =
    bookingData.selectedServices?.find((s) => s.categoryId != null)
      ?.categoryId ?? null;

  // Service id for the slots API — availability is scoped per service, not just
  // per category. Uses the main (non add-on) selected service; group cards carry
  // a synthetic string id ("group-<name>") until a variant is picked on the
  // home-type step, so only real numeric ids are sent.
  const slotServiceId = useMemo(() => {
    const services = bookingData.selectedServices || [];
    const numericId = (s) => {
      const id = s?.backendId ?? s?.id;
      const num = Number(id);
      return id != null && id !== "" && !Number.isNaN(num) ? num : null;
    };
    const main = services.find((s) => !s.isStandardAddon && numericId(s) != null);
    return numericId(main) ?? numericId(services.find((s) => numericId(s) != null));
  }, [bookingData.selectedServices]);

  // Whether the booking is for a Cook service (Instant Cook or Monthly Cook),
  // matched against every name-ish field the selected services carry.
  const isCookService = useMemo(() => {
    const services = bookingData.selectedServices || [];
    const text = services
      .map((s) =>
        [s.name, s.category, s.categoryKey, s.subscriptionName]
          .filter(Boolean)
          .join(" "),
      )
      .join(" ")
      .toLowerCase();
    return /cook/.test(text);
  }, [bookingData.selectedServices]);

  // Subscription (type) id for the booking-instructions API. Normally taken from
  // the first selected service that carries one (all services in a booking share
  // a subscription type), so instructions are shown subscription-id-wise.
  // Cook services (Instant Cook / Monthly Cook) always use the dedicated "Cook"
  // subscription type (id 9) instead of their Instant/Monthly type.
  const COOK_SUBSCRIPTION_ID = 9;
  const subscriptionId = isCookService
    ? COOK_SUBSCRIPTION_ID
    : (bookingData.selectedServices?.find((s) => s.subscriptionId != null)
        ?.subscriptionId ?? null);

  // Booking instructions popup (GET /app/booking-instructions?subscription_id=).
  const [instructions, setInstructions] = useState(null);
  const [instructionsLoading, setInstructionsLoading] = useState(false);
  const [instructionsError, setInstructionsError] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);
  // Auto-open the popup only once per subscription, so returning to this step
  // (or changing the date/time) doesn't keep re-opening it.
  const [autoShownForSub, setAutoShownForSub] = useState(null);

  const isMonthly = bookingData.serviceType === "monthly";
  const isInstant = bookingData.serviceType === "instant";
  const isCommercial = bookingData.selectedServices?.some(
    (s) => s.categoryKey === "commercial",
  );
  const isMonthlyEligible = isMonthly && !isCommercial;

  // The monthly service used for the plans API. Prefers a standard/commercial/
  // monthly-priced service, but falls back to the first selected service so the
  // plans call fires for ANY monthly service (cook, cleaning, week day, etc.)
  // regardless of how its category is keyed.
  const monthlyService = useMemo(() => {
    const services = bookingData.selectedServices || [];
    return (
      services.find(
        (s) =>
          s.categoryKey === "standard" ||
          s.categoryKey === "commercial" ||
          s.monthlyPrice != null,
      ) ||
      services[0] ||
      null
    );
  }, [bookingData.selectedServices]);

  const monthlyServiceId =
    monthlyService?.backendId ?? monthlyService?.id ?? null;

  // Whether the selected monthly service is the "Hobit Week Day" plan, which
  // runs on weekdays only (Sat/Sun off). Matched against every name-ish field
  // the service carries (service name, category name/key, subscription name)
  // since "Week Day" usually lives on the category / subscription.
  const isWeekdayService = useMemo(() => {
    const text = [
      serviceMeta?.name,
      monthlyService?.name,
      monthlyService?.category,
      monthlyService?.categoryKey,
      monthlyService?.subscriptionName,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return /week\s*day|weekday/.test(text);
  }, [serviceMeta, monthlyService]);

  // Duration (in days) for the fallback plan when the backend has no plans.
  // Week Day → 22 working days; everything else → 30.
  const fallbackDurationDays = isWeekdayService ? 22 : 30;

  // Content type for the subscription-info APIs: Monthly Cook → "cook",
  // Hobit Every Day / Hobit Week Day (and other monthly services) → "cleaner".
  const subscriptionContentType = useMemo(() => {
    const text = [
      serviceMeta?.name,
      monthlyService?.name,
      monthlyService?.category,
      monthlyService?.categoryKey,
      monthlyService?.subscriptionName,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return /cook/.test(text) ? "cook" : "cleaner";
  }, [serviceMeta, monthlyService]);

  // Local monthly price from the selected services, used as a last-resort
  // fallback when the API returns neither plans nor service_pricing.
  const localMonthlyPrice = useMemo(() => {
    const services = bookingData.selectedServices || [];
    if (!services.length) return null;
    const total = services.reduce((sum, s) => {
      const price = s.monthlyPrice || s.oneTimePrice || s.instantPrice || 0;
      return sum + Number(price);
    }, 0);
    return total > 0 ? total : null;
  }, [bookingData.selectedServices]);

  // Effective plans used by the UI:
  //  - if the backend returned plans, use them (fully dynamic 15/30 etc.)
  //  - otherwise (backend hasn't added them yet, e.g. Monthly Cook / Hobit
  //    Week Day) always show a single fallback subscription option — 30 days
  //    for most services, 22 for "Hobit Week Day" — priced from service_pricing
  //    when available, else the local monthly price. The service stays bookable
  //    and we never show an error notice.
  const effectivePlans = useMemo(() => {
    if (plans.length > 0) return plans;
    const sp = servicePricing;
    const apiPrice = Number(sp?.price ?? sp?.member_price ?? sp?.original_price);
    const price =
      Number.isFinite(apiPrice) && apiPrice > 0 ? apiPrice : localMonthlyPrice;
    return [
      {
        id: "monthly",
        days: fallbackDurationDays,
        label:
          fallbackDurationDays === 30
            ? "Monthly Subscription"
            : `${fallbackDurationDays} Days`,
        price: price ?? null,
      },
    ];
  }, [plans, servicePricing, localMonthlyPrice, fallbackDurationDays]);

  // Duration buttons are driven by the effective plans.
  const durationOptions = effectivePlans.map((p) => ({
    days: p.days,
    label: p.label,
  }));

  useEffect(() => {
    if (!selectedDate) {
      // Auto-select today's date for all booking types
      setSelectedDate(new Date());
      return;
    }

    // Normalize persisted date values if they come as strings
    if (!(selectedDate instanceof Date)) {
      const parsed = new Date(selectedDate);
      if (!Number.isNaN(parsed.getTime())) {
        setSelectedDate(parsed);
      }
    }
  }, [selectedDate]);

  useEffect(() => {
    // Only restore a time the user has already chosen (e.g. when returning to
    // this step). Never auto-select a default time — the picker must start empty
    // so the Continue button begins disabled until the user taps a slot.
    if (bookingData.time) {
      setSelectedTime(bookingData.time);
      if (isInstant) checkAvailability(bookingData.time);
    }
  }, []); // Run once on mount

  // When the user changes the calendar date, re-check availability for the time
  // they have already picked. Never auto-select a time here — selection only
  // happens when the user taps a slot, so the Continue button stays disabled
  // until they do.
  useEffect(() => {
    if (!isInstant || !selectedDate || !selectedTime) return;
    checkAvailability(selectedTime);
  }, [isInstant, selectedDate?.getTime?.() ?? selectedDate]);

  const isDisabledTimeSlot = (timeStr) => DISABLED_TIME_SLOTS.has(timeStr);

  const checkAvailability = async (timeStr) => {
    if (!selectedDate) return;
    setAvailabilityStatus("checking");
    setAvailabilityMsg("");

    try {
      // Check working hours 9 AM to 6 PM (09:00 - 18:00)
      const hour = parseInt(timeStr.split(":")[0]);
      if (
        hour < 9 ||
        hour > 18 ||
        (hour === 18 && parseInt(timeStr.split(":")[1]) > 0)
      ) {
        setAvailabilityStatus("unavailable");
        setAvailabilityMsg("Worker not available");
        return;
      }

      if (isDisabledTimeSlot(timeStr)) {
        setAvailabilityStatus("unavailable");
        setAvailabilityMsg("Worker not available");
        return;
      }

      // Format date as YYYY-MM-DD for the API
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      // Call the instant workers API with the selected date
      const response = await customerService.checkInstantWorkers(dateStr);

      if (response && response.available) {
        setAvailabilityStatus("available");
        setAvailabilityMsg(response.message || "Worker is available");
      } else {
        setAvailabilityStatus("contact_office");
        setAvailabilityMsg(
          response.message ||
          "Our office staff will contact you shortly. Thank you for your patience.",
        );
      }
    } catch (error) {
      console.error("Error checking instant workers availability:", error);
      setAvailabilityStatus("contact_office");
      setAvailabilityMsg(
        "Our office staff will contact you shortly. Thank you for your patience.",
      );
    }
  };

  useEffect(() => {
    if (isInstant && !selectedTime) {
      // Logic removed as it is now handled in the main mount useEffect
    }
  }, [isInstant, selectedTime]);

  // Fetch live time-slot availability whenever the date or service category
  // changes. Falls back silently to the default generated slots on failure.
  useEffect(() => {
    if (!(selectedDate instanceof Date) || Number.isNaN(selectedDate.getTime())) {
      return;
    }

    let cancelled = false;

    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    const loadSlots = async () => {
      setSlotsLoading(true);
      setSlotsError("");
      try {
        const response = await customerService.getSlots(
          dateStr,
          slotCategoryId,
          slotServiceId,
        );
        if (cancelled) return;
        setApiSlots(normalizeSlots(response));
      } catch (error) {
        if (cancelled) return;
        console.error("Error loading time slots:", error);
        setApiSlots([]);
        setSlotsError(
          "Couldn't load live availability. Showing standard time slots.",
        );
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    };

    loadSlots();

    return () => {
      cancelled = true;
    };
  }, [selectedDate?.getTime?.() ?? selectedDate, slotCategoryId, slotServiceId]);

  // Load the booking instructions for the selected subscription type and open
  // the popup automatically the first time they're available for that
  // subscription.
  useEffect(() => {
    if (subscriptionId == null) {
      setInstructions(null);
      setInstructionsError("");
      return;
    }

    let cancelled = false;

    const loadInstructions = async () => {
      setInstructionsLoading(true);
      setInstructionsError("");
      try {
        const response =
          await customerService.getBookingInstructions(subscriptionId);
        if (cancelled) return;
        setInstructions(response);

        const list = response?.data?.instructions;
        const hasInstructions = Array.isArray(list) && list.length > 0;
        // Auto-open once per subscription when there's something to show.
        if (hasInstructions && autoShownForSub !== subscriptionId) {
          setShowInstructions(true);
          setAutoShownForSub(subscriptionId);
        }
      } catch (error) {
        if (cancelled) return;
        console.error("Error loading booking instructions:", error);
        setInstructions(null);
        setInstructionsError(
          error?.message || "Couldn't load booking instructions.",
        );
      } finally {
        if (!cancelled) setInstructionsLoading(false);
      }
    };

    loadInstructions();

    return () => {
      cancelled = true;
    };
  }, [subscriptionId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load subscription plans for the selected monthly service.
  useEffect(() => {
    if (!isMonthly || monthlyServiceId == null) {
      setPlans([]);
      setServicePricing(null);
      setServiceMeta(null);
      setPlansFetched(false);
      return;
    }

    let cancelled = false;

    const loadPlans = async () => {
      setPlansLoading(true);
      setPlansFetched(false);
      try {
        const response = await customerService.getServicePlans(monthlyServiceId);
        if (cancelled) return;
        setPlans(normalizePlans(response));
        setServicePricing(response?.service_pricing ?? null);
        setServiceMeta(response?.service ?? null);
      } catch (error) {
        if (cancelled) return;
        console.error("Error loading service plans:", error);
        setPlans([]);
        setServicePricing(null);
        setServiceMeta(null);
      } finally {
        if (!cancelled) {
          setPlansLoading(false);
          setPlansFetched(true);
        }
      }
    };

    loadPlans();

    return () => {
      cancelled = true;
    };
  }, [isMonthly, monthlyServiceId]);

  // Once plans load, make sure the chosen duration is one the API offers.
  // Prefer 30 days (the previous default) when it exists, else the first plan.
  useEffect(() => {
    if (effectivePlans.length === 0) return;
    if (effectivePlans.some((p) => p.days === selectedDuration)) return;
    const preferred =
      effectivePlans.find((p) => p.days === 30) || effectivePlans[0];
    setSelectedDuration(preferred.days);
  }, [effectivePlans]); // eslint-disable-line react-hooks/exhaustive-deps

  // Week Day plan: Sat/Sun are off, so the subscription can't start on a
  // weekend. If the (auto-selected) start date lands on Sat/Sun, move it to the
  // next weekday.
  useEffect(() => {
    if (!isWeekdayService || !(selectedDate instanceof Date)) return;
    if (!isWeekend(selectedDate)) return;
    const next = new Date(selectedDate);
    while (isWeekend(next)) {
      next.setDate(next.getDate() + 1);
    }
    setSelectedDate(next);
  }, [isWeekdayService, selectedDate]);

  const parseTime = (timeStr) => {
    if (!timeStr) {
      const now = new Date();
      let h = now.getHours();
      let m = Math.ceil(now.getMinutes() / SLOT_INTERVAL_MINUTES) * SLOT_INTERVAL_MINUTES;
      if (m === 60) {
        m = 0;
        h = (h + 1) % 24;
      }
      const period = h >= 12 ? "PM" : "AM";
      const hour = h % 12 || 12;
      return { hour: String(hour), minute: String(m).padStart(2, "0"), period };
    }
    const [h, m] = timeStr.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return { hour: String(hour), minute: String(m).padStart(2, "0"), period };
  };

  const formatTime = (h, m, p) => {
    let hour = parseInt(h);
    if (p === "PM" && hour !== 12) hour += 12;
    if (p === "AM" && hour === 12) hour = 0;
    return `${String(hour).padStart(2, "0")}:${m}`;
  };

  const formatTime12Hour = (time24) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${minutes} ${period}`;
  };

  const getInstantServiceDurationMinutes = () => {
    const instantServices = bookingData.selectedServices?.filter(
      (s) => s.categoryKey === "instantHelp",
    );
    if (!instantServices || instantServices.length === 0) return 30;

    let totalDuration = 0;
    instantServices.forEach((instantService) => {
      let serviceDuration = 30;
      const directDuration = Number(instantService.durationMinutes);
      if (Number.isFinite(directDuration) && directDuration > 0) {
        serviceDuration = directDuration;
      } else {
        const text = `${instantService.name || ""} ${instantService.description || ""}`;
        const hrMatch = text.match(/(\d+)\s*hr/i);
        if (hrMatch) {
          serviceDuration = Number(hrMatch[1]) * 60;
        } else {
          const minMatch = text.match(/(\d+)\s*min/i);
          if (minMatch) {
            serviceDuration = Number(minMatch[1]);
          }
        }
      }
      const quantity = Number(instantService.quantity) || 1;
      totalDuration += serviceDuration * quantity;
    });
    return totalDuration;
  };

  const getMonthlyServiceDurationMinutes = () => {
    const monthlyService = bookingData.selectedServices?.find(
      (s) => s.categoryKey === "standard" || s.categoryKey === "commercial" || s.monthlyPrice != null,
    );
    if (!monthlyService) return 60;

    const directDuration = Number(monthlyService.durationMinutes);
    if (Number.isFinite(directDuration) && directDuration > 0) {
      return directDuration;
    }

    const text = `${monthlyService.name || ""} ${monthlyService.description || ""}`;
    const hrMatch = text.match(/(\d+)\s*hr/i);
    if (hrMatch) {
      return Number(hrMatch[1]) * 60;
    }
    const minMatch = text.match(/(\d+)\s*min/i);
    if (minMatch) {
      return Number(minMatch[1]);
    }

    return 60;
  };

  const timeParts = parseTime(selectedTime);

  // 30-min slots from 9:00 AM to 6:00 PM for instant clock UI
  const instantTimeSlots = (() => {
    const slots = [];
    for (let h = 9; h <= 18; h++) {
      for (let m = 0; m < 60; m += SLOT_INTERVAL_MINUTES) {
        if (h === 18 && m > 0) break;
        slots.push(
          `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
        );
      }
    }
    return slots;
  })();

  // Lookup of time -> full slot object from the API, for O(1) access to
  // availability / label / reason in the picker.
  const slotByTime = useMemo(() => {
    const map = new Map();
    apiSlots.forEach((s) => map.set(s.time, s));
    return map;
  }, [apiSlots]);

  const usingApiSlots = apiSlots.length > 0;

  // Drive the picker entirely from the backend when it responded; otherwise fall
  // back to the generated grid. Each entry carries { time, label } so we can show
  // the backend's own display_label ("3:30 PM") verbatim.
  const displaySlots = usingApiSlots
    ? apiSlots.map((s) => ({ time: s.time, label: s.label }))
    : instantTimeSlots.map((time) => ({
        time,
        label: formatTime12Hour(time),
      }));

  const isTimeUnavailableByApi = (time24) =>
    slotByTime.get(time24)?.available === false;

  // Human-friendly reason a backend slot is disabled (for tooltips / hints).
  const slotReasonText = (time24) => {
    const reason = slotByTime.get(time24)?.reason;
    if (reason === "passed") return "This time has already passed";
    if (reason === "blocked") return "This slot is unavailable";
    if (reason) return "This slot is unavailable";
    return "This slot is fully booked";
  };

  const slotIntervalMinutes = SLOT_INTERVAL_MINUTES;
  const serviceDurationMinutes = isInstant
    ? getInstantServiceDurationMinutes()
    : isMonthlyEligible
      ? getMonthlyServiceDurationMinutes()
      : 0;
  // Keep a 1-slot buffer after service duration for both instant and monthly jobs.
  const requiredConsecutiveSlots = serviceDurationMinutes > 0
    ? Math.ceil(serviceDurationMinutes / slotIntervalMinutes) + 1
    : 0;

  const isDurationBlocked = (time24) => {
    if (!isInstant && !isMonthlyEligible) return false;
    const slotIndex = instantTimeSlots.indexOf(time24);
    if (slotIndex < 0) return false;
    const remainingSlots = instantTimeSlots.length - slotIndex;
    return remainingSlots < requiredConsecutiveSlots;
  };

  const isOutsideWorkingHours = (time24) => {
    if (!time24 || typeof time24 !== "string") return false;
    if (isDisabledTimeSlot(time24)) return true;
    const parts = time24.split(":");
    const hour = parseInt(parts[0], 10);
    const minute = parseInt(parts[1], 10) || 0;
    if (Number.isNaN(hour)) return true;
    if (hour < 9) return true;
    if (hour > 18) return true;
    if (hour === 18 && minute > 0) return true;
    return false;
  };

  const isInstantPastTime = (time24) => {
    if (!selectedDate) return false;
    const [h, m] = time24.split(":").map(Number);

    const now = new Date();
    const candidate = new Date(selectedDate);
    candidate.setHours(h, m, 0, 0);

    // Normalise now for comparison
    const nowBaseline = new Date();
    nowBaseline.setSeconds(0, 0);

    return candidate < nowBaseline;
  };

  const isSelectedTimeInvalid = (() => {
    if (!selectedDate || !selectedTime) return false;
    // When the backend drives the slots, it is the single source of truth for
    // availability (it already accounts for passed/blocked/working hours).
    if (usingApiSlots) {
      return !slotByTime.has(selectedTime) || isTimeUnavailableByApi(selectedTime);
    }
    if (isOutsideWorkingHours(selectedTime)) return true;
    if (isInstantPastTime(selectedTime)) return true;
    return isDurationBlocked(selectedTime);
  })();

  /** Local date/time validation messages (worker availability is separate for instant/monthly). */
  const dateTimeLocalHint = (() => {
    if (!selectedDate) {
      return { kind: "error", text: "Please select a date to continue." };
    }
    if (!selectedTime) {
      return { kind: "error", text: "Please select a start time to continue." };
    }
    if (usingApiSlots) {
      if (!slotByTime.has(selectedTime) || isTimeUnavailableByApi(selectedTime)) {
        return {
          kind: "error",
          text: `${slotReasonText(selectedTime)}. Please pick another available time.`,
        };
      }
      if (!isInstant) {
        return {
          kind: "success",
          text: "Date and time look good. You can continue.",
        };
      }
      return null;
    }
    if (isOutsideWorkingHours(selectedTime)) {
      return {
        kind: "error",
        text: "Bookings are available between 9:00 AM and 6:00 PM. Please pick a time in this range.",
      };
    }
    if (isInstantPastTime(selectedTime)) {
      return {
        kind: "error",
        text: "That time slot has already passed. Please pick a new date and time that works for you.",
      };
    }
    if ((isInstant || isMonthlyEligible) && isDurationBlocked(selectedTime)) {
      return {
        kind: "error",
        text: `Not enough time is left in this day for a ${serviceDurationMinutes}-minute service. Please choose an earlier slot or a future date.`,
      };
    }
    if (!isInstant) {
      return {
        kind: "success",
        text: "Date and time look good. You can continue.",
      };
    }
    return null;
  })();

  const handleInstantTimeSlotSelect = (time24) => {
    setSelectedTime(time24);
    if (isInstant) {
      checkAvailability(time24);
    }
  };

  const handleTimePartChange = (part, value) => {
    const newParts = { ...timeParts, [part]: value };
    const newTime = formatTime(newParts.hour, newParts.minute, newParts.period);
    setSelectedTime(newTime);
    if (isInstant) {
      checkAvailability(newTime);
    }
  };

  const handleTimeChange = (e) => {
    const time = e.target.value;
    setSelectedTime(time);
    if (isInstant && time) {
      checkAvailability(time);
    }
  };

  const handleNext = () => {
    if (!selectedDate) {
      toast.error("Please select a date to continue");
      return;
    }
    if (!selectedTime) {
      toast.error("Please select a start time to continue");
      return;
    }
    if (
      isSelectedTimeInvalid ||
      (isInstant && availabilityStatus !== "available")
    ) {
      return;
    }

    const updates = {
      date: selectedDate,
      startDate: selectedDate,
      timeSlot: formatTime12Hour(selectedTime),
      time: selectedTime,
    };

    if (isMonthly && selectedDate) {
      const endDate = getEndDate();
      updates.subscriptionEndDate = endDate;
      updates.endDate = endDate;
      updates.subscriptionDurationDays = selectedDuration;
      // Dynamic price for the chosen duration (e.g. 15 vs 30 days), sourced
      // from the /plans API — carried forward so Summary/Payment use the
      // real backend price instead of a locally-scaled estimate.
      updates.subscriptionPlanPrice = getMonthlyDisplayPrice();
      updates.subscriptionPlanServiceId = monthlyService?.id ?? null;
    }

    updateBookingData(updates);
    navigate("/book/address");
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sun or Sat
  };

  const getEndDate = (durationDays = selectedDuration) => {
    if (!isMonthly || !selectedDate) return null;

    // Week Day plan: the duration counts WORKING days only (Sat/Sun off), so
    // walk the calendar and stop on the Nth weekday. 22 weekdays span ~1 month.
    if (isWeekdayService) {
      const endDate = new Date(selectedDate);
      let counted = 0;
      while (true) {
        if (!isWeekend(endDate)) {
          counted += 1;
          if (counted >= durationDays) break;
        }
        endDate.setDate(endDate.getDate() + 1);
      }
      return endDate;
    }

    // Default: consecutive calendar days including the start date.
    const endDate = new Date(selectedDate);
    endDate.setDate(endDate.getDate() + (durationDays - 1));
    return endDate;
  };

  // Price helper for monthly duration display (does NOT touch booking/payment flow)
  const getMonthlyDisplayPrice = () => {
    // Prefer the real price from the plans API for the chosen duration.
    const activePlan = effectivePlans.find((p) => p.days === selectedDuration);
    if (activePlan?.price != null) return activePlan.price;

    if (!bookingData.selectedServices?.length) return null;
    const total30Days = bookingData.selectedServices.reduce((sum, service) => {
      const price =
        (service.monthlyPrice ||
          service.oneTimePrice ||
          service.instantPrice ||
          0);
      return sum + Number(price);
    }, 0);

    if (!total30Days) return null;
    return selectedDuration === 15 ? Math.floor(total30Days * 0.5) : total30Days;
  };

  // Calendar functions
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const isDateDisabled = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;
    // Week Day plan: Saturdays and Sundays are off — cannot be picked.
    if (isWeekdayService && isWeekend(date)) return true;
    return false;
  };

  const handleDateSelect = (day) => {
    const date = new Date(currentYear, currentMonth, day);
    if (!isDateDisabled(date)) {
      setSelectedDate(date);
      setShowCalendar(false);
    }
  };

  const navigateMonth = (direction) => {
    if (direction === "prev") {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];
    const today = new Date();

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
      const isSelected =
        selectedDate &&
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear();
      const isDisabled = isDateDisabled(date);

      days.push({
        day,
        date,
        isToday,
        isSelected,
        isDisabled,
      });
    }

    return days;
  };

  // Whether we have booking instructions worth surfacing a "View" button for.
  const hasInstructions =
    Array.isArray(instructions?.data?.instructions) &&
    instructions.data.instructions.length > 0;

  return (
    <div className="min-h-screen pb-32 sm:pb-36">
      <StepProgress />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">
            {isInstant ? "When Do You Need Help?" : "Select Date & Start Time"}
          </h1>
          <p className="text-base sm:text-lg text-zinc-600">
            {isInstant
              ? "Choose date and time for your on-demand visit"
              : "Choose your preferred start time"}
          </p>

          {(hasInstructions || instructionsLoading) && (
            <button
              type="button"
              onClick={() => setShowInstructions(true)}
              disabled={instructionsLoading}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#3d8bff]/30 bg-[#3d8bff]/5 px-4 py-2 text-sm font-semibold text-[#3d8bff] hover:bg-[#3d8bff]/10 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {instructionsLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Info className="w-4 h-4" />
              )}
              View booking instructions
            </button>
          )}
        </motion.div>

        {isInstant && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-8 rounded-2xl border border-[#3d8bff]/25 bg-[#3d8bff]/5 px-4 py-4 sm:px-6 flex items-start gap-3 text-left"
          >
            <CreditCard className="w-5 h-5 text-[#3d8bff] shrink-0 mt-0.5" aria-hidden />
            <p className="text-sm sm:text-base text-slate-800 leading-relaxed">
              <span className="font-semibold text-slate-900">
                services are prepaid.
              </span>{" "}

            </p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-[#3d8bff]" />
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
                  Select Date
                </h2>
              </div>
              {selectedDate && !isInstant && (
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="text-sm text-[#3d8bff] hover:underline cursor-pointer font-semibold"
                >
                  {showCalendar ? "Hide" : "Change Date"}
                </button>
              )}
            </div>

            {/* Selected Date Display */}
            {selectedDate && !showCalendar && !isInstant && (
              <div className="mb-4 space-y-3">
                <div className="bg-[#3d8bff]/5 border border-[#3d8bff]/20 rounded-xl p-4 text-center">
                  <p className="text-sm text-zinc-600 mb-1">Selected Date</p>
                  <p className="text-xl font-bold text-[#3d8bff]">
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {/* Duration selector — only for Monthly Subscription */}
                {isMonthly && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Subscription Duration
                    </p>
                    {plansLoading || !plansFetched ? (
                      <div className="flex items-center justify-center gap-2 py-2 text-sm text-zinc-500">
                        <Loader2 className="w-4 h-4 text-[#3d8bff] animate-spin" />
                        Loading plans…
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        {durationOptions.map(({ days, label }) => (
                          <button
                            key={days}
                            type="button"
                            onClick={() => setSelectedDuration(days)}
                            className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold border transition-all ${
                              selectedDuration === days
                                ? "bg-[#3d8bff] text-white border-[#3d8bff] shadow-md shadow-[#3d8bff]/20"
                                : "bg-white text-slate-600 border-slate-200 hover:border-[#3d8bff]/50 hover:bg-[#3d8bff]/5"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {isMonthly && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm">
                    <p className="font-semibold text-blue-900 mb-2">
                      Monthly subscription period
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-blue-800">
                      <div>
                        <span className="text-blue-600">Start:</span>{" "}
                        {formatDate(selectedDate)}
                      </div>
                      <div>
                        <span className="text-blue-600">End:</span>{" "}
                        {formatDate(getEndDate())}
                      </div>
                    </div>
                    {/* Dynamic pricing preview */}
                    {(() => {
                      const displayPrice = getMonthlyDisplayPrice();
                      return displayPrice != null ? (
                        <div className="mt-2 pt-2 border-t border-blue-200 flex items-center justify-between">
                          <span className="text-blue-700 text-xs">
                            {selectedDuration === 30
                              ? "Monthly price"
                              : `${selectedDuration}-day price`}
                          </span>
                          <span className="font-bold text-blue-900 text-sm">
                            ₹{displayPrice.toLocaleString()}
                            {selectedDuration === 30 && (
                              <span className="text-xs text-blue-600 font-normal">/month</span>
                            )}
                          </span>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* Calendar */}
            {(!selectedDate || showCalendar || isInstant) && (
              <div>
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => navigateMonth("prev")}
                    className="p-2 hover:bg-zinc-100 rounded-lg transition"
                  >
                    <ChevronLeft className="w-5 h-5 text-zinc-600" />
                  </button>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {months[currentMonth]} {currentYear}
                  </h3>
                  <button
                    onClick={() => navigateMonth("next")}
                    className="p-2 hover:bg-zinc-100 rounded-lg transition"
                  >
                    <ChevronRight className="w-5 h-5 text-zinc-600" />
                  </button>
                </div>

                {/* Week Days */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                  {weekDays.map((day) => (
                    <div
                      key={day}
                      className="text-center text-xs sm:text-sm font-semibold text-zinc-500 py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {renderCalendar().map((dayData, index) => {
                    if (!dayData) {
                      return (
                        <div key={`empty-${index}`} className="aspect-square" />
                      );
                    }

                    return (
                      <motion.button
                        key={dayData.day}
                        whileHover={!dayData.isDisabled ? { scale: 1.1 } : {}}
                        whileTap={!dayData.isDisabled ? { scale: 0.95 } : {}}
                        onClick={() => handleDateSelect(dayData.day)}
                        disabled={dayData.isDisabled}
                        className={`aspect-square rounded-lg text-sm sm:text-base font-semibold transition ${dayData.isSelected
                          ? "bg-[#3d8bff] text-white shadow-lg"
                          : dayData.isToday
                            ? "bg-[#3d8bff]/10 text-[#3d8bff] border-2 border-[#3d8bff]"
                            : dayData.isDisabled
                              ? "text-zinc-300 cursor-not-allowed"
                              : "text-zinc-700 hover:bg-zinc-100"
                          }`}
                      >
                        {dayData.day}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>

          {/* Time Slots Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-4 sm:p-6"
          >
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <Clock className="w-5 h-5 text-[#3d8bff]" />
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
                Select Start Time
              </h2>
            </div>

            <div className="flex flex-col items-center justify-center">
              {/* Selected date from calendar */}
              <div className="mb-4 w-full text-center">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">
                  Selected date
                </p>
                <div className="inline-flex items-center gap-2 text-lg font-semibold text-slate-800 bg-slate-100/80 px-4 py-2 rounded-xl border border-slate-200/80">
                  <CalendarIcon className="w-5 h-5 text-[#3d8bff]" />
                  {selectedDate ? (
                    <span>
                      {selectedDate.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year:
                          selectedDate.getFullYear() !==
                            new Date().getFullYear()
                            ? "numeric"
                            : undefined,
                      })}
                    </span>
                  ) : (
                    <span>Pick a date</span>
                  )}
                </div>
              </div>

              {/* Clock-style time picker for all bookings */}
              <div className="relative w-full max-w-sm mx-auto">
                <div className="relative rounded-[2rem] bg-gradient-to-br from-slate-50 to-slate-100/90 border-2 border-slate-200/80 shadow-inner p-8 overflow-hidden">
                  {/* Decorative clock ring */}
                  <div className="absolute inset-0 rounded-[2rem] border-[12px] border-slate-200/40 pointer-events-none" />
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#3d8bff]/60 shadow-sm" />
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#3d8bff]/40" />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#3d8bff]/40" />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#3d8bff]/40" />

                  <p className="text-center text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
                    Pick time
                  </p>
                  <div className="text-center mb-6">
                    {selectedTime && (
                      <span className="text-4xl sm:text-5xl font-bold tabular-nums text-slate-900 tracking-tight drop-shadow-sm">
                        {formatTime12Hour(selectedTime)}
                      </span>
                    )}
                  </div>

                  {slotsLoading && !usingApiSlots ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-8 text-zinc-500">
                      <Loader2 className="w-6 h-6 text-[#3d8bff] animate-spin" />
                      <p className="text-sm">Loading available times…</p>
                    </div>
                  ) : !usingApiSlots && !slotsError ? (
                    <div className="py-8 text-center text-sm text-zinc-500">
                      No time slots available for this date. Please pick another
                      date.
                    </div>
                  ) : (
                    <div className="flex flex-wrap justify-center gap-2 max-h-44 overflow-y-auto py-2">
                      {displaySlots.map(({ time: time24, label }) => {
                        const isSelected = selectedTime === time24;
                        // When the backend drives slots it is authoritative; only
                        // apply the local heuristics for the fallback grid.
                        const isBooked = usingApiSlots
                          ? isTimeUnavailableByApi(time24)
                          : false;
                        const isPastTime = usingApiSlots
                          ? false
                          : isInstantPastTime(time24);
                        const isSlotBlocked = usingApiSlots
                          ? false
                          : isDurationBlocked(time24);
                        const isLocallyDisabled =
                          !usingApiSlots && isDisabledTimeSlot(time24);
                        const isDisabled =
                          isPastTime ||
                          isSlotBlocked ||
                          isBooked ||
                          isLocallyDisabled;
                        return (
                          <motion.button
                            key={time24}
                            type="button"
                            whileHover={isDisabled ? {} : { scale: 1.05 }}
                            whileTap={isDisabled ? {} : { scale: 0.98 }}
                            disabled={isDisabled}
                            onClick={() => handleInstantTimeSlotSelect(time24)}
                            className={`min-w-[4rem] py-2 px-3 rounded-xl text-sm font-semibold transition shadow-sm ${isDisabled
                              ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-70"
                              : isSelected
                                ? "bg-[#3d8bff] text-white shadow-[#3d8bff]/40 ring-2 ring-[#3d8bff]/50"
                                : "bg-white/90 text-slate-700 border border-slate-200 hover:border-[#3d8bff]/50 hover:bg-[#3d8bff]/5"
                              }`}
                            title={
                              isBooked
                                ? slotReasonText(time24)
                                : isSlotBlocked
                                  ? `Not enough time left in this day for ${serviceDurationMinutes} min service`
                                  : undefined
                            }
                          >
                            {label || formatTime12Hour(time24)}
                          </motion.button>
                        );
                      })}
                    </div>
                  )}

                  {slotsError && (
                    <p className="mt-3 text-center text-xs text-amber-600">
                      {slotsError}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {isMonthly && selectedDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 sm:mb-8"
          >
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Subscription Period:</span>{" "}
              {formatDate(selectedDate)} – {formatDate(getEndDate())} ({selectedDuration} Days)
            </p>
          </motion.div>
        )}

        {isInstant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`rounded-xl p-6 mb-6 sm:mb-8 text-center border ${availabilityStatus === "available"
              ? "bg-green-50 border-green-200"
              : availabilityStatus === "unavailable"
                ? "bg-red-50 border-red-200"
                : "bg-yellow-50 border-yellow-200"
              }`}
          >
            {availabilityStatus === "idle" && (
              <p className="text-zinc-600">
                Select a time to check availability
              </p>
            )}

            {availabilityStatus === "checking" && (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 text-[#3d8bff] animate-spin" />
                <p className="text-zinc-600">Checking worker availability...</p>
              </div>
            )}

            {availabilityStatus === "available" && (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <p className="text-zinc-600">Worker available!</p>
              </div>
            )}

            {availabilityStatus === "unavailable" && (
              <div className="flex flex-col items-center gap-2">
                <XCircle className="w-6 h-6 text-red-600" />
                <p className="text-zinc-600">
                  {availabilityMsg || "Worker not available at this time"}
                </p>
              </div>
            )}

            {availabilityStatus === "contact_office" && (
              <div className="flex flex-col items-center gap-2">
                <Clock className="w-6 h-6 text-yellow-600" />
                <p className="text-zinc-600">{availabilityMsg}</p>
              </div>
            )}
          </motion.div>
        )}

        {dateTimeLocalHint && (
          <div
            className={`mb-4 rounded-xl border px-4 py-3 text-center text-sm ${dateTimeLocalHint.kind === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-900"
              }`}
          >
            {dateTimeLocalHint.text}
          </div>
        )}

        {isMonthlyEligible && (
          <MonthlySubscriptionInfo serviceType={subscriptionContentType} />
        )}

        {/* Sticky Action Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] py-4 px-4 sm:px-6 z-50 transition-all duration-300">
          <div className="max-w-5xl mx-auto flex flex-row justify-between items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const hasGroupedService = bookingData.selectedServices?.some(
                  (s) => s.isGroup || s.serviceGroup,
                );
                if (hasGroupedService) {
                  navigate("/book/home-type");
                } else {
                  navigate("/book/service");
                }
              }}
              className="flex items-center gap-2 text-slate-500 hover:text-[#3d8bff] transition font-semibold py-2.5 px-4 rounded-xl cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              aria-disabled={
                !selectedDate ||
                !selectedTime ||
                isSelectedTimeInvalid ||
                (isInstant && availabilityStatus !== "available")
              }
              className={`flex items-center gap-2 bg-[#3d8bff] text-white px-6 sm:px-10 py-3 rounded-xl font-bold shadow-lg shadow-[#3d8bff]/20 transition text-base tracking-wide ${
                !selectedDate ||
                !selectedTime ||
                isSelectedTimeInvalid ||
                (isInstant && availabilityStatus !== "available")
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer hover:bg-[#2f75e2]"
              }`}
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      <BookingInstructionsModal
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
        loading={instructionsLoading}
        error={instructionsError}
        data={instructions}
      />
    </div>
  );
}

export default DateTime;
