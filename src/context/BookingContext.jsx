import { createContext, useContext, useState, useEffect } from "react";
import { settingsService } from "../api/services/settings";
import { DEFAULT_CHARGES } from "../utils/charges";

const BookingContext = createContext();

const BOOKING_DRAFT_KEY = "hobit_booking_draft_v1";

const defaultBookingData = {
  selectedServices: [],
  grouped_services: null,
  homeType: null,
  questions: {},
  serviceType: null,
  date: null,
  time: null,
  timeSlot: null,
  address: null,
  cityId: null,
  paymentMethod: null,
  totalPrice: 0,
  workerCount: 1,
  helperHoursPerDay: 2,
  totalDays: 1,
  bookingResult: null,
  startDate: null,
  endDate: null,
  subscriptionEndDate: null,
  subscriptionDurationDays: null,
  subscriptionPlanPrice: null,
  subscriptionPlanServiceId: null,
  isSelectingGroup: false,
  sofaSeatCount: null,
  carpetCount: null,
  bathroomCount: null,
  familySize: null,
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within BookingProvider");
  }
  return context;
};

const bookingSteps = [
  { path: "/book/service", name: "Service" },
  { path: "/book/home-type", name: "Home Type" },
  { path: "/book/date-time", name: "Date & Time" },
  { path: "/book/address", name: "Address" },
  { path: "/book/summary", name: "Summary" },
  { path: "/book/payment", name: "Payment" },
];

export const BookingProvider = ({ children }) => {
  // No localStorage draft: refresh clears cart and booking draft (fresh session).
  const [bookingData, setBookingData] = useState(() => ({
    ...defaultBookingData,
  }));

  // Platform-wide charges (platform fee, GST %, travelling & rain charge).
  // Fetched once and shared with the cart, summary and payment screens.
  const [charges, setCharges] = useState(DEFAULT_CHARGES);

  useEffect(() => {
    let active = true;
    settingsService
      .getCharges()
      .then((res) => {
        if (active && res?.charges) {
          setCharges({ ...DEFAULT_CHARGES, ...res.charges });
        }
      })
      .catch((err) => {
        console.error("Failed to fetch charges:", err);
      });
    return () => {
      active = false;
    };
  }, []);

  // Get current step index based on pathname
  const getCurrentStepIndex = (pathname) => {
    return bookingSteps.findIndex((step) => step.path === pathname);
  };

  // Check if user can access a step
  const canAccessStep = (stepPath) => {
    const stepIndex = getCurrentStepIndex(stepPath);
    if (stepIndex === 0) return true;

    // Check if previous steps are completed
    for (let i = 0; i < stepIndex; i++) {
      const step = bookingSteps[i];
      if (
        step.path === "/book/service" &&
        bookingData.selectedServices.length === 0 &&
        !bookingData.isSelectingGroup
      ) {
        return false;
      }
      if (step.path === "/book/home-type") {
        if (bookingData.isSelectingGroup) return true;
        if (bookingData.selectedServices?.length === 0) return false;
        // No group placeholders: user skipped home-type (e.g. only ungrouped like Free Demo)
        if (!bookingData.selectedServices?.some((s) => s.isGroup)) return true;
        if (bookingData.grouped_services?.length > 0) return true;
        const hasHomeType = !!bookingData.homeType;
        const hasSofaSeats = !!bookingData.sofaSeatCount;
        const hasCarpetCount = !!bookingData.carpetCount;
        const hasBathroomCount = !!bookingData.bathroomCount;
        const hasFamilySize = !!bookingData.familySize;
        const hasAnySelection =
          hasHomeType ||
          hasSofaSeats ||
          hasCarpetCount ||
          hasBathroomCount ||
          hasFamilySize;
        const isKitchenCleaningOnly =
          bookingData.selectedServices?.length === 1 &&
          (bookingData.selectedServices[0].id === "kitchen-cleaning" ||
            bookingData.selectedServices[0].id === "kitchen-deep-cleaning");
        const isCommercial = bookingData.selectedServices?.some(
          (s) => s.categoryKey === "commercial",
        );
        const isInstant =
          bookingData.selectedServices?.some(
            (s) => s.categoryKey === "instantHelp",
          ) || bookingData.serviceType === "instant";
        if (
          !hasAnySelection &&
          !isKitchenCleaningOnly &&
          !isCommercial &&
          !isInstant
        ) {
          return false;
        }
      }

      // if (step.path === "/book/service-type" && !bookingData.serviceType) {
      //   return false;
      // }
      if (
        step.path === "/book/date-time" &&
        bookingData.serviceType !== "instant" &&
        (!bookingData.date || !bookingData.timeSlot)
      ) {
        return false;
      }
      if (step.path === "/book/address" && !bookingData.address) {
        return false;
      }
    }
    return true;
  };

  const updateBookingData = (updates) => {
    setBookingData((prev) => {
      const updated = { ...prev, ...updates };

      // Cart cleared: remove stale schedule, address, and home-type data
      const cartCleared =
        Object.prototype.hasOwnProperty.call(updates, "selectedServices") &&
        Array.isArray(updates.selectedServices) &&
        updates.selectedServices.length === 0;
      if (cartCleared) {
        Object.assign(updated, {
          date: null,
          startDate: null,
          endDate: null,
          subscriptionEndDate: null,
          subscriptionDurationDays: null,
          subscriptionPlanPrice: null,
          subscriptionPlanServiceId: null,
          time: null,
          timeSlot: null,
          address: null,
          cityId: null,
          homeType: null,
          grouped_services: null,
          isSelectingGroup: false,
          sofaSeatCount: null,
          carpetCount: null,
          bathroomCount: null,
          familySize: null,
          serviceType: null,
          questions: {},
          totalPrice: 0,
          workerCount: 1,
          totalDays: 1,
          bookingResult: null,
          paymentMethod: null,
        });
      }

      // Calculate price based on selections and service type
      let totalPrice = 0;
      const duration = updated.subscriptionDurationDays || 30;

      updated.selectedServices?.forEach((service) => {
        if (service.isGroup) {
          totalPrice += Number(service.fromPrice) || 0;
          return;
        }
        // Use the exact dynamic plan price fetched from the backend's /plans
        // endpoint (set on the Date & Time step) instead of a locally scaled
        // estimate — the plans endpoint is the source of truth for
        // non-30-day durations (e.g. 15 days).
        if (
          updated.serviceType === "monthly" &&
          updated.subscriptionPlanPrice != null &&
          updated.subscriptionPlanServiceId != null &&
          service.id === updated.subscriptionPlanServiceId &&
          !service.isVariantPrice &&
          !service.isStandardAddon
        ) {
          totalPrice += Number(updated.subscriptionPlanPrice) * (service.quantity || 1);
          return;
        }
        if (service.isVariantPrice && service.basePrice != null) {
          let basePrice = Number(service.basePrice);
          if (updated.serviceType === "monthly") {
            basePrice = (basePrice * duration) / 30;
          }
          totalPrice += basePrice * (service.quantity || 1);
          return;
        }
        if (service.isStandardAddon) {
          const addonPrice =
            Number(service.monthlyPrice) ||
            Number(service.basePrice) ||
            Number(service.oneTimePrice) ||
            0;
          let price = addonPrice;
          if (updated.serviceType === "monthly") {
            price = (price * duration) / 30;
          }
          totalPrice += price * (service.quantity || 1);
          return;
        }

        let servicePrice = 0;

        // Get price based on selected service type
        if (updated.serviceType === "monthly" && service.monthlyPrice != null) {
          servicePrice = (service.monthlyPrice * duration) / 30;
        } else if (updated.serviceType === "instant" && service.instantPrice != null) {
          servicePrice = service.instantPrice;
        } else if (
          updated.serviceType === "scheduled" &&
          service.oneTimePrice != null
        ) {
          servicePrice = service.oneTimePrice;
        } else if (updated.serviceType === "demo") {
          // Free demo: use actual price from API (e.g. 1) so payment screen shows it
          servicePrice =
            (service.oneTimePrice != null ? Number(service.oneTimePrice) : null) ??
            (service.monthlyPrice != null ? Number(service.monthlyPrice) : null) ??
            (service.instantPrice != null ? Number(service.instantPrice) : null) ??
            (service.basePrice != null ? Number(service.basePrice) : null) ??
            0;
        } else {
          // Fallback to first available price
          servicePrice =
            service.monthlyPrice ??
            service.oneTimePrice ??
            service.instantPrice ??
            service.basePrice ??
            0;
          if (updated.serviceType === "monthly") {
            servicePrice = (servicePrice * duration) / 30;
          }
        }

        let multiplier = 1.0;
        if (
          updated.serviceType !== "instant" &&
          updated.serviceType !== "demo"
        ) {
          if (service.categoryKey === "commercial") {
            multiplier = 1.0;
          } else if (
            service.id === "sofa-cleaning" ||
            service.id === 16 ||
            service.backendId === 16
          ) {
            const count =
              updated.sofaSeatCount ||
              (updated.homeType?.includes("seat") ? updated.homeType : "1seat");
            if (count === "2seat") multiplier = 2.0;
            else if (count === "3seat") multiplier = 3.0;
            else if (count === "4seat") multiplier = 4.0;
            else if (count === "5seat") multiplier = 5.0;
          } else if (
            typeof service.id === "string" &&
            service.id === "carpet-cleaning"
          ) {
            const count =
              updated.carpetCount ||
              (updated.homeType?.includes("carpet")
                ? updated.homeType
                : "1carpet");
            if (count === "2carpet") multiplier = 2.0;
            else if (count === "3carpet") multiplier = 3.0;
            else if (count === "4carpet") multiplier = 4.0;
          } else if (
            (typeof service.id === "string" &&
              service.id.includes("bathroom")) ||
            service.id === 15 ||
            service.id === 9 ||
            service.backendId === 15 ||
            service.backendId === 9
          ) {
            const count =
              updated.bathroomCount ||
              (updated.homeType?.includes("bathroom")
                ? updated.homeType
                : "1bathroom");
            if (count === "2bathroom") multiplier = 2.0;
            else if (count === "3bathroom") multiplier = 3.0;
            else if (count === "4bathroom") multiplier = 4.0;
          } else if (
            (typeof service.id === "string" &&
              (service.id === "utensils-washing" ||
                service.id === "clothes-washing")) ||
            service.id === 25 ||
            service.backendId === 25
          ) {
            const count =
              updated.familySize ||
              (updated.homeType?.includes("person")
                ? updated.homeType
                : "4person");
            if (count === "8person") multiplier = 1.5;
            else if (count === "12person") multiplier = 2.0;
          } else if (
            service.id === 14 ||
            service.id === 31 ||
            service.backendId === 14 ||
            service.backendId === 31 ||
            (typeof service.id === "string" && service.id.includes("kitchen"))
          ) {
            multiplier = 1.0;
          } else if (
            typeof service.id === "string" &&
            service.id === "full-house-deep-cleaning"
          ) {
            const bhk =
              !updated.homeType ||
                updated.homeType.includes("seat") ||
                updated.homeType.includes("carpet") ||
                updated.homeType.includes("person") ||
                updated.homeType.includes("bathroom")
                ? "1bhk"
                : updated.homeType;
            if (bhk === "2bhk") multiplier = 1.2;
            else if (bhk === "3bhk") multiplier = 1.6;
            else if (bhk === "4bhk+") multiplier = 2.0;
          } else {
            // Standard services (Sweep & Mop, etc.)
            // Fallback to 2bhk if homeType is not a BHK type (e.g. if mixed with sofa but no BHK selected?)
            // Automatically use BHK checking logic to ensure valid homeType is present.
            const bhk =
              !updated.homeType ||
                updated.homeType.includes("seat") ||
                updated.homeType.includes("carpet") ||
                updated.homeType.includes("person") ||
                updated.homeType.includes("bathroom")
                ? "2bhk"
                : updated.homeType;

            if (bhk === "3bhk") multiplier = 1.154;
            else if (bhk === "4bhk+") multiplier = 1.462;
          }
        }

        totalPrice += servicePrice * multiplier * (service.quantity || 1);
      });

      // Instant Help can be served by multiple workers; the base total is
      // multiplied by the worker count. Other service types are unaffected.
      if (updated.serviceType === "instant") {
        totalPrice *= Number(updated.workerCount) || 1;
      }

      // Calculate total days for subscription
      if (updated.serviceType === "monthly") {
        if (updated.subscriptionDurationDays) {
          updated.totalDays = updated.subscriptionDurationDays;
        } else if (updated.date && updated.subscriptionEndDate) {
          const start = new Date(updated.date);
          const end = new Date(updated.subscriptionEndDate);
          start.setHours(0, 0, 0, 0);
          end.setHours(0, 0, 0, 0);
          updated.totalDays = Math.max(
            1,
            Math.ceil((end - start) / (1000 * 60 * 60 * 24)),
          );
        } else {
          updated.totalDays = 30;
        }
      } else {
        updated.totalDays = 1;
      }

      updated.totalPrice = Math.floor(totalPrice);

      return updated;
    });
  };

  const resetBooking = () => {
    try {
      localStorage.removeItem(BOOKING_DRAFT_KEY);
    } catch {
      /* ignore */
    }
    setBookingData({ ...defaultBookingData });
  };

  return (
    <BookingContext.Provider
      value={{
        bookingData,
        updateBookingData,
        resetBooking,
        bookingSteps,
        getCurrentStepIndex,
        canAccessStep,
        charges,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};
