import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useBooking } from "../../context/BookingContext";
import StepProgress from "../../components/booking/StepProgress";
import {
  ArrowRight,
  Minus,
  Plus,
  X,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { serviceTypeBadges } from "../../data/services";
import { hobit1Categories, PRICE_TYPES } from "../../data/hobit1Services";
import CartSidebar from "../../components/booking/CartSidebar";
import ServiceGuidelinesModal from "../../components/booking/ServiceGuidelinesModal";
import AppDownloadModal from "../../components/AppDownloadModal";
import ServiceRequestModal from "../../components/ServiceRequestModal";
import { adminService } from "../../api/services/admin";
import { customerService } from "../../api/services/customer";
// import { useQuery } from "@tanstack/react-query"; // Hobit1: old backend catalogue not used
import { getImageUrl } from "../../config/mediaUrls";

// Used by the old backend catalogue only (commented out for Hobit1).
// eslint-disable-next-line no-unused-vars
const mapSlugToKey = (slug) => {
  if (!slug) return "standard";
  if (slug.includes("instant")) return "instantHelp";
  if (slug.includes("deep")) return "deepCleaning";
  if (slug.includes("commercial")) return "commercial";
  return "standard";
};

const getServiceIconImg = (name, categoryKey) => {
  if (!name) return null;
  const lower = name.toLowerCase();
  if (categoryKey === "instantHelp" || lower.includes("instant")) {
    return "/instant-cleaning.png";
  }
  if (lower.includes("sofa") || lower.includes("couch")) {
    return "/sofa-cleaning.png";
  }
  if (lower.includes("carpet") || lower.includes("rug")) {
    return "/carpet-cleaning.png";
  }
  if (lower.includes("utensils")) return "/wash.png";
  if (lower.includes("sweep") || lower.includes("mop")) return "/sweeping.png";
  if (lower.includes("bathroom")) return "/shower.png";
  if (lower.includes("kitchen")) return "/kitchen.png";
  if (lower.includes("clothes") || lower.includes("laundry"))
    return "/laundry-machine.png";
  if (lower.includes("full house") || lower.includes("home"))
    return "/home.png";
  return null;
};

const mapBackendService = (
  service,
  categoryMeta,
  subscriptionTypeMap,
  isMember = false,
) => {
  const originalPrice = Number(service.price || 0);
  const categoryKey = categoryMeta.categoryKey;
  const subId = Number(service.subscription_id);

  // Membership pricing: when the logged-in user is a member and this service
  // has a member_price, the member price becomes the effective price. Keep the
  // original price around (regularPrice) so the card can strike it through.
  const memberPrice =
    service.member_price != null && Number(service.member_price) > 0
      ? Number(service.member_price)
      : null;
  const memberPriceApplies = isMember && memberPrice != null;
  let priceNumber = memberPriceApplies ? memberPrice : originalPrice;

  // Handle Free Demo - if price is 1.00 it's effectively a token/free
  const isDemo =
    service.name.toLowerCase().includes("demo") ||
    service.name.toLowerCase().includes("free");

  let monthlyPrice = null;
  let oneTimePrice = null;
  let instantPrice = null;

  const subMeta = subscriptionTypeMap?.get(subId);
  const kind = subMeta?.kind;

  if (kind === "instant") {
    instantPrice = priceNumber;
  } else if (kind === "oneTime") {
    oneTimePrice = priceNumber;
  } else if (kind === "monthly" || kind === "daily") {
    monthlyPrice = priceNumber;
  } else {
    if (categoryKey === "instantHelp") {
      instantPrice = priceNumber;
    } else if (categoryKey === "deepCleaning") {
      oneTimePrice = priceNumber;
    } else {
      monthlyPrice = priceNumber;
    }
  }

  const subscriptionName =
    service.subscription?.name ??
    service.subscription_name?.name ??
    (typeof service.subscription_name === "string"
      ? service.subscription_name
      : null);

  const apiIcons = Array.isArray(service.icons)
    ? service.icons.map((path) => getImageUrl(path))
    : [];

  const festivalPrice =
    service.festival_price != null && Number(service.festival_price) > 0
      ? Number(service.festival_price)
      : null;

  return {
    id: service.id,
    backendId: service.id,
    name: service.name,
    description: service.description,
    durationMinutes: Number(service.duration_minutes) || null,
    category: categoryMeta.name,
    categoryId: categoryMeta.id,
    categoryKey,
    serviceGroup: service.service_group || null,
    monthlyPrice,
    oneTimePrice,
    instantPrice,
    basePrice: priceNumber,
    festivalPrice,
    memberPrice,
    // Original (non-member) price to strike through when a member price applies.
    regularPrice: memberPriceApplies ? originalPrice : null,
    isMemberPrice: memberPriceApplies,
    isDemo,
    subscriptionId: service.subscription_id,
    subscriptionName,
    icons: apiIcons,
    iconImgSrc:
      apiIcons.length > 0
        ? apiIcons[0]
        : getServiceIconImg(service.name, categoryKey),
    status: Number(service.status),
  };
};

// Hobit1: map a catalogue item from src/data/hobit1Services.js to the same
// shape the service cards already use. The "Read more" text carries the
// details (included, excluded, duration, FAQs).
const getHobit1PriceNote = (item) => {
  if (item.priceType === PRICE_TYPES.perUnit) return item.unit || "Per unit";
  if (item.priceType === PRICE_TYPES.inspection) {
    return item.price != null ? "Inspection charge · quote after visit" : "Quote after visit";
  }
  return "Fixed price";
};

const buildHobit1Details = (item, sub) => {
  const lines = [item.description, ""];
  lines.push(`Pricing: ${getHobit1PriceNote(item)}`);
  if (sub.duration) lines.push(`Approx. duration: ${sub.duration}`);
  if (sub.included?.length) {
    lines.push("", "What's included:", ...sub.included.map((t) => `• ${t}`));
  }
  if (sub.excluded?.length) {
    lines.push("", "Not included:", ...sub.excluded.map((t) => `• ${t}`));
  }
  if (sub.faqs?.length) {
    lines.push("", "FAQs:");
    sub.faqs.forEach((f) => lines.push(`Q: ${f.q}`, `A: ${f.a}`, ""));
  }
  return lines.join("\n").trim();
};

const mapHobit1Item = (item, sub, category) => {
  const hasPrice = item.price != null;
  return {
    id: item.id,
    backendId: null,
    name: item.name,
    description: buildHobit1Details(item, sub),
    durationMinutes: null,
    category: category.name,
    categoryId: category.id,
    categoryKey: category.categoryKey,
    serviceGroup: sub.name,
    monthlyPrice: null,
    oneTimePrice: hasPrice ? item.price : null,
    instantPrice: null,
    basePrice: hasPrice ? item.price : 0,
    priceType: item.priceType,
    priceLabel: hasPrice
      ? null
      : item.priceType === PRICE_TYPES.inspection
        ? "Inspection + quote"
        : "Price TBA",
    priceNote: getHobit1PriceNote(item),
    festivalPrice: null,
    memberPrice: null,
    regularPrice: null,
    isMemberPrice: false,
    isDemo: false,
    icons: [],
    iconImgSrc: sub.icon || category.icon,
    status: 1,
  };
};

function SelectService() {
  const { bookingData, updateBookingData } = useBooking();
  const navigate = useNavigate();
  const location = useLocation();

  // Whether the logged-in customer is a member (stored at login from the
  // verify-otp response's membership.is_member). Members see member_price.
  const isMember = useMemo(() => {
    try {
      return !!JSON.parse(localStorage.getItem("user") || "{}").is_member;
    } catch {
      return false;
    }
  }, []);

  const [categories, setCategories] = useState([]);
  const hasAutoSelectedFromState = useRef(false);
  const appliedNavKeyRef = useRef(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === selectedCategoryId) || null,
    [categories, selectedCategoryId],
  );

  const [selectedServices, setSelectedServices] = useState(
    bookingData.selectedServices || [],
  );

  const [instantStatus, setInstantStatus] = useState(null);
  const [instantLoading, setInstantLoading] = useState(false);
  const [instantError, setInstantError] = useState(null);
  const [readMoreService, setReadMoreService] = useState(null);
  const [guidelinesService, setGuidelinesService] = useState(null);
  const [guidelinesData, setGuidelinesData] = useState(null);
  const [guidelinesLoading, setGuidelinesLoading] = useState(false);
  const [guidelinesError, setGuidelinesError] = useState(null);
  const [isAppDownloadModalOpen, setIsAppDownloadModalOpen] = useState(false);
  // Hobit1: service whose booking request form is open (null = closed)
  const [requestService, setRequestService] = useState(null);
  // Hobit1: only these categories open the booking request form; the rest
  // (deep cleaning, pest control, painter) keep the app-download popup.
  const REQUEST_FORM_CATEGORIES = ["electrician", "plumber", "carpenter"];
  const openServiceCard = (service) => {
    if (REQUEST_FORM_CATEGORIES.includes(service.categoryKey)) {
      setRequestService(service);
    } else {
      setIsAppDownloadModalOpen(true);
    }
  };

  // Hobit1: categories and services come from src/data/hobit1Services.js.
  // The old backend catalogue (cleaning-only) is commented out.
  // const { data: categoriesData } = useQuery({
  //   queryKey: ["serviceCategories"],
  //   queryFn: adminService.getServiceCategories,
  //   staleTime: 5 * 60 * 1000,
  // });
  //
  // const { data: subscriptionTypesData } = useQuery({
  //   queryKey: ["subscriptionTypes"],
  //   queryFn: adminService.getSubscriptionTypes,
  //   staleTime: 5 * 60 * 1000,
  // });
  const subscriptionTypesData = null;

  const subscriptionTypeMap = useMemo(() => {
    const raw = Array.isArray(subscriptionTypesData)
      ? subscriptionTypesData
      : Array.isArray(subscriptionTypesData?.data)
        ? subscriptionTypesData.data
        : [];
    const map = new Map();
    raw.forEach((t) => {
      const name = String(t.name || "").toLowerCase();
      let kind = null;
      if (name.includes("instant")) kind = "instant";
      else if (name.includes("one-time")) kind = "oneTime";
      else if (name.includes("daily")) kind = "daily";
      else if (name.includes("month")) kind = "monthly";
      map.set(Number(t.id), { ...t, kind });
    });
    return map;
  }, [subscriptionTypesData]);

  // Hobit1: old backend category detail query commented out.
  // const { data: categoryData } = useQuery({
  //   queryKey: ["serviceCategory", selectedCategoryId],
  //   queryFn: () => adminService.getServiceCategory(selectedCategoryId),
  //   enabled: !!selectedCategoryId,
  //   staleTime: 5 * 60 * 1000,
  // });
  const categoryData = null;

  const groupedServicesFromApi = useMemo(() => {
    const raw =
      categoryData?.grouped_services ??
      categoryData?.services?.grouped_services;
    return Array.isArray(raw) ? raw : [];
  }, [categoryData]);

  // Hobit1: services of the selected category, in catalogue order.
  const services = useMemo(() => {
    if (!selectedCategory?.subCategories) return [];
    return selectedCategory.subCategories.flatMap((sub) =>
      sub.items.map((it) => mapHobit1Item(it, sub, selectedCategory)),
    );
  }, [selectedCategory]);

  // OLD backend service mapping (cleaning-only) — not used in Hobit1.
  // eslint-disable-next-line no-unused-vars
  const oldBackendServices = useMemo(() => {
    const categoryObj = categoryData?.services || categoryData;
    const backendServices = Array.isArray(categoryObj?.services)
      ? categoryObj.services
      : Array.isArray(categoryData?.services)
        ? categoryData.services
        : [];

    if (!selectedCategory) return [];

    const mapped = backendServices.map((svc, idx) => {
      const m = mapBackendService(
        svc,
        selectedCategory,
        subscriptionTypeMap,
        isMember,
      );
      return { ...m, originalIndex: idx };
    });

    const activeOnly = mapped.filter((s) => s.status === 1);

    if (selectedCategory.categoryKey === "instantHelp") {
      return activeOnly.sort((a, b) => a.originalIndex - b.originalIndex);
    }
    return activeOnly.sort((a, b) => {
      const priceA = a.monthlyPrice || a.oneTimePrice || a.instantPrice || 0;
      const priceB = b.monthlyPrice || b.oneTimePrice || b.instantPrice || 0;
      return priceA - priceB;
    });
  }, [categoryData, selectedCategory, subscriptionTypeMap, isMember]);

  const variantIdsInGroups = useMemo(() => {
    const set = new Set();
    groupedServicesFromApi.forEach((group) => {
      (group.variants || []).forEach((v) => set.add(v.id));
    });
    return set;
  }, [groupedServicesFromApi]);

  const displayList = useMemo(() => {
    if (!selectedCategory) return [];
    // Hobit1: show items in catalogue order (sub-category by sub-category).
    if (selectedCategory.subCategories) return services;
    if (groupedServicesFromApi.length > 0) {
      const groupCards = groupedServicesFromApi
        .filter((group) => group.name != null && group.name !== "")
        .map((group) => {
          const variants = (group.variants || []).filter(
            (v) => Number(v.status) === 1,
          );
          if (variants.length === 0) return null;
          const minPrice = Math.min(
            ...variants.map((v) => Number(v.price) || 0).filter((n) => n > 0),
            Infinity,
          );
          const fromPrice = Number.isFinite(minPrice) ? minPrice : 0;

          const subscriptionName =
            variants[0]?.subscription_name?.name ??
            (typeof variants[0]?.subscription_name === "string"
              ? variants[0].subscription_name
              : null);

          const groupDescription =
            group.description || variants[0]?.description || null;

          const kinds = (variants || [])
            .map(
              (v) => subscriptionTypeMap.get(Number(v.subscription_id))?.kind,
            )
            .filter(Boolean);

          const allMonthly =
            kinds.length > 0 &&
            kinds.every((k) => k === "monthly" || k === "daily");
          const allInstant =
            kinds.length > 0 && kinds.every((k) => k === "instant");
          const allOneTime =
            kinds.length > 0 && kinds.every((k) => k === "oneTime");

          let monthlyPrice = null;
          let oneTimePrice = null;
          let instantPrice = null;

          if (allMonthly) {
            monthlyPrice = fromPrice;
          } else if (allInstant) {
            instantPrice = fromPrice;
          } else if (allOneTime) {
            oneTimePrice = fromPrice;
          } else {
            if (selectedCategory.categoryKey === "instantHelp") {
              instantPrice = fromPrice;
            } else if (selectedCategory.categoryKey === "deepCleaning") {
              oneTimePrice = fromPrice;
            } else {
              monthlyPrice = fromPrice;
            }
          }

          const groupIcons = Array.isArray(group.icons)
            ? group.icons.map((path) => getImageUrl(path))
            : [];

          return {
            id: `group-${group.name}`,
            name: group.name,
            groupName: group.name,
            serviceGroup: group.service_group || group.name,
            isGroup: true,
            variants,
            subscriptionName,
            groupDescription,
            categoryKey: selectedCategory.categoryKey,
            category: selectedCategory.name,
            categoryId: selectedCategory.id,
            icons: groupIcons,
            iconImgSrc:
              groupIcons.length > 0
                ? groupIcons[0]
                : getServiceIconImg(group.name, selectedCategory.categoryKey),
            fromPrice,
            monthlyPrice,
            oneTimePrice,
            instantPrice,
          };
        })
        .filter(Boolean);
      const ungroupedServices = services
        .filter(
          (s) =>
            s.serviceGroup == null ||
            s.serviceGroup === "" ||
            !variantIdsInGroups.has(s.id),
        )
        .filter((s) => s.status === 1);
      const combined = [...groupCards, ...ungroupedServices];
      const getSortPrice = (item) =>
        item.fromPrice ??
        item.monthlyPrice ??
        item.oneTimePrice ??
        item.instantPrice ??
        item.basePrice ??
        0;
      return combined.sort(
        (a, b) => Number(getSortPrice(a)) - Number(getSortPrice(b)),
      );
    }
    // Ungrouped categories (e.g. Instant Help): show the hour-based services in
    // ascending duration order (1 hr, 2 hr, 3 hr, …). Falls back to parsing the
    // hours/minutes out of the name; unknown durations keep their API order.
    const getDurationMinutes = (item) => {
      const direct = Number(item.durationMinutes);
      if (Number.isFinite(direct) && direct > 0) return direct;
      const text = `${item.name || ""} ${item.description || ""}`;
      const hr = text.match(/(\d+(?:\.\d+)?)\s*hr/i);
      if (hr) return Math.round(Number(hr[1]) * 60);
      const min = text.match(/(\d+)\s*min/i);
      if (min) return Number(min[1]);
      return Number.MAX_SAFE_INTEGER; // unknown → sort last, keep relative order
    };
    return services
      .filter((s) => s.status === 1)
      .sort((a, b) => getDurationMinutes(a) - getDurationMinutes(b));
  }, [groupedServicesFromApi, selectedCategory, services, variantIdsInGroups]);

  // Auto-select a service when coming from navbar / URL (state or query params)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const serviceNameFromQuery = searchParams.get("serviceName");
    const serviceName = location.state?.serviceName || serviceNameFromQuery;
    if (!serviceName) return;
    if (!services.length) return;
    if (hasAutoSelectedFromState.current) return;
    if (selectedServices.length > 0) return;

    const lower = String(serviceName).toLowerCase();
    const match = services.find((svc) =>
      String(svc.name || "")
        .toLowerCase()
        .includes(lower),
    );
    if (!match) return;

    hasAutoSelectedFromState.current = true;
    setSelectedServices([
      {
        ...match,
        quantity: COUNTER_SERVICE_IDS.includes(Number(match.id))
          ? 1
          : undefined,
      },
    ]);
  }, [services, selectedServices.length, location.state, location.search]);

  useEffect(() => {
    const hasInstantHelp = selectedServices.some(
      (s) => s.categoryKey === "instantHelp",
    );
    const hasDemo = selectedServices.some((s) => s.isDemo);
    const onlyDemo =
      hasDemo && selectedServices.every((s) => s.isDemo);

    const isStrictlyMonthly =
      selectedServices.length > 0 &&
      selectedServices.every(
        (s) =>
          s.monthlyPrice && !s.oneTimePrice && s.categoryKey !== "instantHelp",
      );

    const serviceType = hasInstantHelp
      ? "instant"
      : onlyDemo
        ? "demo"
        : isStrictlyMonthly
          ? "monthly"
          : "scheduled";

    updateBookingData({ selectedServices, serviceType });
  }, [selectedServices]);

  useEffect(() => {
    // Hobit1: the 6 service categories, in catalogue order.
    const normalized = hobit1Categories.map((c) => ({
      ...c,
      id: c.slug,
      categoryKey: c.slug,
      isComingSoon: false,
    }));

    /* OLD backend categories (cleaning-only) — not used in Hobit1.
    const rawCategories = Array.isArray(categoriesData)
      ? categoriesData
      : Array.isArray(categoriesData?.data)
        ? categoriesData.data
        : [];

    if (rawCategories.length === 0) return;

    // Explicit slug order so the Service tabs always show in this exact
    // business-defined sequence, regardless of backend list/id order.
    const categorySlugOrder = [
      "instant_help",
      "monthly_subscription", // hobit everyday
      "_hobit_weekday", // hobit weekday
      "instant_cook",
      "monthly_cook",
    ];

    // Define custom order sequence
    const categoryOrder = [
      "instantHelp",
      "standard",
      "commercial",
      "deepCleaning",
    ];

    const normalized = rawCategories
      .filter((c) => Number(c.status) === 1)
      .map((c) => {
        const categoryKey = mapSlugToKey(c.slug || "");
        const isComingSoon = categoryKey === "deepCleaning";
        return {
          ...c,
          categoryKey,
          isComingSoon,
        };
      })
      .sort((a, b) => {
        const slugIndexA = categorySlugOrder.indexOf(a.slug);
        const slugIndexB = categorySlugOrder.indexOf(b.slug);
        if (slugIndexA !== -1 || slugIndexB !== -1) {
          const sA = slugIndexA === -1 ? 99 : slugIndexA;
          const sB = slugIndexB === -1 ? 99 : slugIndexB;
          return sA - sB;
        }
        const indexA = categoryOrder.indexOf(a.categoryKey);
        const indexB = categoryOrder.indexOf(b.categoryKey);
        // Handle cases where categoryKey might not be in our list
        const sortA = indexA === -1 ? 99 : indexA;
        const sortB = indexB === -1 ? 99 : indexB;
        return sortA - sortB;
      });
    */

    setCategories(normalized);

    const searchParams = new URLSearchParams(location.search);
    const categoryFromQuery = searchParams.get("category");
    const categoryFromNav = location.state?.category || categoryFromQuery;
    const selectedCategoryFromState =
      bookingData.selectedServices?.[0]?.categoryKey;

    const initial =
      normalized.find((c) => c.slug === categoryFromNav) ||
      normalized.find((c) => c.categoryKey === categoryFromNav) ||
      normalized.find((c) => c.categoryKey === selectedCategoryFromState) ||
      normalized.find((c) => c.categoryKey === "instantHelp") ||
      normalized.find((c) => (c.slug || "").includes("instant")) ||
      normalized[0];

    // The Footer/Navbar link to this page (with a category in location.state)
    // re-navigates without unmounting SelectService, since it's the same route
    // and the Footer is rendered on this page too. Re-apply the requested
    // category whenever a NEW navigation (tracked by location.key) asks for
    // one, instead of only on first mount — otherwise clicking a different
    // service link while already on this page silently did nothing until a
    // full page refresh reset selectedCategoryId back to null.
    const isNewNavRequest =
      categoryFromNav && location.key !== appliedNavKeyRef.current;

    if (initial && (!selectedCategoryId || isNewNavRequest)) {
      appliedNavKeyRef.current = location.key;
      setSelectedCategoryId(initial.id);
      setSelectedServices([]);
      updateBookingData({ selectedServices: [] });
      if (
        initial.categoryKey === "instantHelp" ||
        (initial.slug || "").includes("instant")
      ) {
        fetchInstantWorkers();
      } else {
        setInstantStatus(null);
        setInstantError(null);
      }
    }
  }, [
    // categoriesData, // Hobit1: old backend catalogue not used
    bookingData.selectedServices,
    selectedCategoryId,
    location.state,
    location.search,
    location.key,
  ]);

  const fetchInstantWorkers = async () => {
    try {
      setInstantError(null);
      setInstantLoading(true);
      const res = await customerService.checkInstantWorkers();
      const payload = res?.data || res;
      setInstantStatus({
        available: Boolean(payload?.available),
        message: payload?.message || "",
      });
    } catch (e) {
      setInstantError(e?.message || "Failed to check instant availability");
      setInstantStatus(null);
    } finally {
      setInstantLoading(false);
    }
  };

  const openGuidelinesForService = async (service) => {
    if (!service) return;

    // Resolve the backend service ID:
    // - Normal mapped services: use backendId (fallback to id)
    // - Group cards: use first active variant id
    let backendId = service.backendId || service.id;
    if (service.isGroup && Array.isArray(service.variants) && service.variants.length > 0) {
      const activeVariant =
        service.variants.find((v) => Number(v.status) === 1) || service.variants[0];
      backendId = activeVariant.id;
    }

    if (!backendId) {
      // If we somehow don't have an ID, just proceed without guidelines
      toggleService(service);
      return;
    }

    setGuidelinesLoading(true);
    setGuidelinesError(null);
    setGuidelinesData(null);
    setGuidelinesService(null);

    try {
      const res = await adminService.getServiceGuidelines(backendId);
      const payload = res?.data || res || {};
      const dos = Array.isArray(payload.dos) ? payload.dos : [];
      const donts = Array.isArray(payload.donts) ? payload.donts : [];

      // If there are no Do's or Don'ts, skip modal and just continue
      if (dos.length === 0 && donts.length === 0) {
        setGuidelinesLoading(false);
        setGuidelinesData(null);
        setGuidelinesError(null);
        setGuidelinesService(null);
        toggleService(service);
        return;
      }

      setGuidelinesData(res);
      setGuidelinesService(service);
    } catch (e) {
      setGuidelinesError(
        e?.message || "Failed to load service Do's & Don'ts. Please try again.",
      );
    } finally {
      setGuidelinesLoading(false);
    }
  };

  const handleAcceptGuidelines = () => {
    if (!guidelinesService) return;
    // Proceed with normal toggle/navigation behaviour after user accepts
    toggleService(guidelinesService);
    setGuidelinesService(null);
    setGuidelinesData(null);
    setGuidelinesError(null);
    setGuidelinesLoading(false);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategoryId(category.id);
    setSelectedServices([]);
    updateBookingData({ selectedServices: [] });
    if (category.categoryKey === "instantHelp") {
      fetchInstantWorkers();
    } else {
      setInstantStatus(null);
      setInstantError(null);
    }
  };

  const COUNTER_SERVICE_IDS = [9, 14, 15, 16, 17, 25, 31];

  const buildSingleServiceSelection = (service) => {
    return [
      {
        ...service,
        quantity: COUNTER_SERVICE_IDS.includes(Number(service.id))
          ? service.quantity || 1
          : undefined,
      },
    ];
  };

  const updateQuantity = (serviceId, delta) => {
    setSelectedServices((prev) => {
      return prev.map((s) => {
        if (s.id === serviceId) {
          const newQty = Math.max(1, (s.quantity || 1) + delta);
          return { ...s, quantity: newQty };
        }
        return s;
      });
    });
  };

  // ── Instant Help: single-selection cart logic ──────────────────────────────
  const addInstantHelpToCart = (service) => {
    setSelectedServices((prev) => {
      // Single selection: remove any existing instantHelp service and add the new one
      const nonInstant = prev.filter((s) => s.categoryKey !== "instantHelp");
      const next = [...nonInstant, { ...service, quantity: 1 }];

      updateBookingData({
        selectedServices: next,
        grouped_services: groupedServicesFromApi,
      });
      return next;
    });
  };

  const removeServiceCompletely = (service) => {
    setSelectedServices((prev) => {
      const next = prev.filter((s) => s.id !== service.id);
      updateBookingData({ selectedServices: next, grouped_services: groupedServicesFromApi });
      return next;
    });
  };

  const toggleService = (service) => {
    if (service.isGroup) {
      updateBookingData({ grouped_services: groupedServicesFromApi, isSelectingGroup: true });
      navigate("/book/home-type", { state: { selectedGroup: service } });
      return;
    }

    if (service.categoryKey === "instantHelp") {
      const isSelected = selectedServices.some((s) => s.id === service.id);
      if (isSelected) {
        removeServiceCompletely(service);
      } else {
        addInstantHelpToCart(service);
      }
      return;
    }

    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.id === service.id);
      if (exists) {
        const cleared = [];
        updateBookingData({ selectedServices: cleared, grouped_services: groupedServicesFromApi });
        return cleared;
      }
      const next = buildSingleServiceSelection(service);
      updateBookingData({ selectedServices: next, grouped_services: groupedServicesFromApi });
      if (service.serviceGroup) navigate("/book/home-type");
      return next;
    });
  };

  const ensureCustomerLoggedIn = (nextPath) => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (!token || !user) {
      navigate("/login", { state: { redirectTo: nextPath } });
      return false;
    }
    return true;
  };

  const hasNonServiceGroupServices = selectedServices.some(
    (service) => !service.serviceGroup,
  );

  const handleNext = () => {
    if (!ensureCustomerLoggedIn("/book/date-time")) return;
    const hasInstantHelp = selectedServices.some(
      (s) => s.categoryKey === "instantHelp",
    );
    const hasDemo = selectedServices.some((s) => s.isDemo);
    const onlyDemo =
      hasDemo && selectedServices.every((s) => s.isDemo);

    if (hasInstantHelp) {
      updateBookingData({ selectedServices, serviceType: "instant" });
      navigate("/book/date-time");
      return;
    }

    if (onlyDemo) {
      updateBookingData({ selectedServices, serviceType: "demo" });
      navigate("/book/date-time");
      return;
    }

    const isStrictlyMonthly =
      selectedServices.length > 0 &&
      selectedServices.every(
        (s) =>
          s.monthlyPrice && !s.oneTimePrice && s.categoryKey !== "instantHelp",
      );
    const serviceType = isStrictlyMonthly ? "monthly" : "scheduled";

    const hasGroupedServices = groupedServicesFromApi.length > 0;
    const hasSelectedGroup = selectedServices.some((s) => s.isGroup);

    if (hasGroupedServices && hasSelectedGroup) {
      updateBookingData({
        selectedServices,
        grouped_services: groupedServicesFromApi,
        serviceType,
      });
      navigate("/book/home-type");
      return;
    }

    updateBookingData({ selectedServices, serviceType });
    navigate("/book/date-time");
  };

  const getServicePrice = (service) => {
    if (service.isGroup) return service.fromPrice || 0;
    const basePrice =
      service.monthlyPrice || service.oneTimePrice || service.instantPrice || 0;
    const qty = service.quantity || 1;
    return basePrice * qty;
  };

  const getServiceBadge = (service) => {
    if (service.isGroup) return null;
    // Hobit1 pricing type badge
    if (service.priceType) return serviceTypeBadges[service.priceType] || null;
    if (service.isDemo) return serviceTypeBadges.demo;
    if (service.monthlyPrice) return serviceTypeBadges.monthly;
    if (service.instantPrice) return serviceTypeBadges.instant;
    if (service.oneTimePrice) return serviceTypeBadges.oneTime;
    return null;
  };

  return (
    <div className="min-h-screen pb-12 relative">
      <StepProgress />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">
            Select Services
          </h1>
          <p className="text-base sm:text-lg text-zinc-600">
            {selectedCategory?.categoryKey === "instantHelp"
            ? "Choose one Instant Help service to add to your cart."
            : "Choose one service to add to your cart."}
          </p>
        </motion.div>

        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8 justify-center">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-semibold text-xs sm:text-sm transition flex items-center gap-1 ${cat.isComingSoon
                ? "bg-zinc-100 border-2 border-dashed border-zinc-300 text-zinc-500 cursor-default"
                : selectedCategoryId === cat.id
                  ? "bg-[#3d8bff] text-white cursor-pointer"
                  : "bg-white border-2 border-zinc-200 text-zinc-700 hover:border-[#3d8bff] hover:bg-[#3d8bff]/5 cursor-pointer"
                }`}
            >
              {cat.name}
              {cat.isComingSoon && (
                <span className="ml-1 text-[9px] uppercase tracking-wide font-semibold">
                  Coming soon
                </span>
              )}
            </button>
          ))}
        </div>

        {selectedCategory?.categoryKey === "instantHelp" && (
          <div className="max-w-2xl mx-auto mb-4">
            {instantLoading ? (
              <div className="rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center text-[#3d8bff] text-sm font-semibold">
                  i
                </div>
                <p className="text-sm text-zinc-700">
                  Checking instant helper availability in your area...
                </p>
              </div>
            ) : instantError ? (
              <div className="rounded-2xl border border-red-100 bg-red-50/70 px-4 py-3 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                <p className="text-sm text-red-700">{instantError}</p>
              </div>
            ) : instantStatus && instantStatus.message ? (
              <div
                className={`rounded-2xl px-4 py-3 flex items-start gap-3 ${instantStatus.available
                  ? "border border-emerald-100 bg-emerald-50/80"
                  : "border border-amber-100 bg-amber-50/80"
                  }`}
              >
                <div className="mt-0.5">
                  {instantStatus.available ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  )}
                </div>
                <div>
                  <p
                    className={`text-sm font-semibold ${instantStatus.available
                      ? "text-emerald-800"
                      : "text-amber-800"
                      }`}
                  >
                    {/* {instantStatus.available
                      ? "Instant help is available"
                      : "Instant help might be limited"} */}
                  </p>
                  <p
                    className={`mt-0.5 text-xs sm:text-sm ${instantStatus.available
                      ? "text-emerald-900/80"
                      : "text-amber-900/80"
                      }`}
                  >
                    {instantStatus.message}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        )}

        <div
          className={
            hasNonServiceGroupServices && selectedServices.length > 0
              ? "max-w-7xl mx-auto"
              : "max-w-4xl mx-auto"
          }
        >
          {selectedCategory?.isComingSoon && (
            <div className="max-w-xl mx-auto mb-4 text-center text-xs sm:text-sm text-zinc-500 bg-zinc-50 border border-dashed border-zinc-200 rounded-xl px-4 py-3">
              Services for <span className="font-semibold">{selectedCategory.name}</span> are{" "}
              <span className="font-semibold">coming soon</span>. You can preview the list below,
              but selection is currently disabled.
            </div>
          )}
          {hasNonServiceGroupServices && selectedServices.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Services List */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
                {displayList.map((service) => {
                  const selectedServiceObj = selectedServices.find(
                    (s) => s.id === service.id,
                  );
                  const isSelected = !!selectedServiceObj;
                  const quantity = selectedServiceObj?.quantity || 1;
                  const isCounterService =
                    !service.isGroup &&
                    COUNTER_SERVICE_IDS.includes(Number(service.id));
                  const badge = getServiceBadge(service);
                  const subscriptionLabel =
                    service.isGroup && service.subscriptionName
                      ? service.subscriptionName
                      : null;
                  const price = getServicePrice({ ...service, quantity });
                  const detailsText =
                    (service.isGroup &&
                      (service.groupDescription ||
                        service.variants?.[0]?.description)) ||
                    (service.description && String(service.description)) ||
                    "";

                  const isComingSoonCategory = selectedCategory?.isComingSoon;

                  return (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (isComingSoonCategory) return;
                        openServiceCard(service);
                      }}
                      className={`relative rounded-xl sm:rounded-2xl border-2 p-4 sm:p-6 bg-white transition-all duration-200 ${isComingSoonCategory
                        ? "border-zinc-200 bg-zinc-50 opacity-60 cursor-not-allowed"
                        : isSelected
                          ? "border-[#3d8bff] bg-[#edf1ff] ring-2 ring-[#3d8bff]/40 scale-[1.01] cursor-pointer"
                          : "border-zinc-200 hover:border-[#3d8bff]/60 hover:bg-[#f5f7ff] cursor-pointer"
                        }`}
                    >
                      {(badge || subscriptionLabel) && (
                        <span className="absolute -top-2 left-3 sm:left-4 px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
                          {badge ? badge.label : subscriptionLabel}
                        </span>
                      )}

                      {isSelected && (
                        <motion.button
                          type="button"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleService(service);
                          }}
                          className="absolute -top-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 bg-[#3d8bff] rounded-full flex items-center justify-center z-10 shadow-lg hover:bg-[#ef4444] transition-colors"
                        >
                          <X className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        </motion.button>
                      )}

                      <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                        {service.icons && service.icons.length > 0 ? (
                          service.icons.map((icon, idx) => (
                            <div
                              key={`${service.id}-icon-${idx}`}
                              className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center shadow-sm"
                            >
                              <img
                                src={icon}
                                alt={`${service.name} icon ${idx}`}
                                className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                                loading="lazy"
                              />
                            </div>
                          ))
                        ) : (
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-center shadow-sm">
                            <img
                              src={
                                service.iconImgSrc || "/commercial-cleaning.png"
                              }
                              alt={`${service.name} icon`}
                              className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                              loading="lazy"
                            />
                          </div>
                        )}
                      </div>

                      {service.serviceGroup &&
                        service.serviceGroup !== service.name && (
                          <h3 className="text-base sm:text-xl font-bold text-slate-900 mb-1 line-clamp-2">
                            {service.serviceGroup}
                          </h3>
                        )}

                      {!String(service.name || "").includes("+") && (
                        <h3 className="text-base sm:text-xl font-bold text-slate-900 mb-1 line-clamp-2">
                          {service.name}
                        </h3>
                      )}

                      {String(service.name || "").includes("+") && (
                        <ul className="mt-1 space-y-1">
                          {String(service.name)
                            .split("+")
                            .map((part) => part.trim())
                            .filter(Boolean)
                            .map((part, idx) => (
                              <li
                                key={`${service.id}-part-${idx}`}
                                className="text-base sm:text-base text-zinc-900 flex items-center gap-1"
                              >
                                <span>•</span>
                                <span>{part}</span>
                              </li>
                            ))}
                        </ul>
                      )}

                      {detailsText && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setReadMoreService({
                              name: service.name,
                              text: detailsText,
                            });
                          }}
                          className="mt-1 text-[11px] font-semibold text-[#3d8bff] hover:underline"
                        >
                          Read more
                        </button>
                      )}

                      <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-zinc-100">
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <p className="text-lg sm:text-2xl font-bold text-[#3d8bff]">
                              {service.priceLabel
                                ? service.priceLabel
                                : service.isGroup
                                ? price > 0
                                  ? `From ₹${price.toLocaleString()}`
                                  : "Select option"
                                : service.isDemo && price <= 0
                                  ? "Free"
                                  : `₹${price.toLocaleString()}`}
                            </p>
                            {!service.isGroup &&
                            service.isMemberPrice &&
                            service.regularPrice != null &&
                            service.regularPrice > price ? (
                              <>
                                <span className="text-sm sm:text-base text-zinc-400 line-through font-medium">
                                  ₹{service.regularPrice.toLocaleString()}
                                </span>
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded-full">
                                  Member price
                                </span>
                              </>
                            ) : !service.isGroup &&
                              service.festivalPrice != null &&
                              service.festivalPrice > price ? (
                              <span className="text-sm sm:text-base text-zinc-400 line-through font-medium">
                                ₹{service.festivalPrice.toLocaleString()}
                              </span>
                            ) : null}
                          </div>
                          <p className="text-[10px] sm:text-xs text-zinc-500 mt-0.5">
                            {service.priceNote
                              ? service.priceNote
                              : service.isGroup
                              ? "Choose option on next step"
                              : service.isDemo
                                ? "Demo"
                                : service.monthlyPrice
                                  ? "Monthly"
                                  : service.instantPrice
                                    ? "Instant"
                                    : "One-time"}
                          </p>
                        </div>

                        {isSelected && isCounterService && (
                          <div
                            className="flex items-center gap-3 bg-white border border-zinc-200 rounded-lg p-1 shadow-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => updateQuantity(service.id, -1)}
                              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-zinc-100 text-zinc-600 transition"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-bold text-slate-900 min-w-[1.5rem] text-center">
                              {quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(service.id, 1)}
                              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-zinc-100 text-zinc-600 transition"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        {/* Instant Help selected state is now handled by card highlight and X button */}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Desktop Cart Sidebar */}
              <CartSidebar
                selectedServices={selectedServices}
                onRemove={(service) => {
                  const updatedServices = selectedServices.filter(
                    (s) => s.id !== service.id,
                  );
                  setSelectedServices(updatedServices);
                  updateBookingData({ selectedServices: updatedServices });
                }}
                onContinue={handleNext}
                totalPrice={selectedServices.reduce(
                  (sum, s) => sum + getServicePrice(s),
                  0,
                )}
              />
            </div>
          ) : (
            /* Normal layout without cart */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
              {displayList.map((service) => {
                const selectedServiceObj = selectedServices.find(
                  (s) => s.id === service.id,
                );
                const isSelected = !!selectedServiceObj;
                const quantity = selectedServiceObj?.quantity || 1;
                const isCounterService =
                  !service.isGroup &&
                  COUNTER_SERVICE_IDS.includes(Number(service.id));
                const badge = getServiceBadge(service);
                const subscriptionLabel =
                  service.isGroup && service.subscriptionName
                    ? service.subscriptionName
                    : null;
                const price = getServicePrice({ ...service, quantity });
                const detailsText =
                  (service.isGroup &&
                    (service.groupDescription ||
                      service.variants?.[0]?.description)) ||
                  (service.description && String(service.description)) ||
                  "";

                const isComingSoonCategory = selectedCategory?.isComingSoon;

                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (isComingSoonCategory) return;
                      openServiceCard(service);
                    }}
                    className={`relative rounded-xl sm:rounded-2xl border-2 p-4 sm:p-6 bg-white transition-all duration-200 ${isComingSoonCategory
                      ? "border-zinc-200 bg-zinc-50 opacity-60 cursor-not-allowed"
                      : isSelected
                        ? "border-[#3d8bff] bg-[#edf1ff] ring-2 ring-[#3d8bff]/40 scale-[1.01] cursor-pointer"
                        : "border-zinc-200 hover:border-[#3d8bff]/60 hover:bg-[#f5f7ff] cursor-pointer"
                      }`}
                  >
                    {(badge || subscriptionLabel) && (
                      <span className="absolute -top-2 left-3 sm:left-4 px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
                        {badge ? badge.label : subscriptionLabel}
                      </span>
                    )}

                    {isSelected && (
                      <motion.button
                        type="button"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleService(service);
                        }}
                        className="absolute -top-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 bg-[#3d8bff] rounded-full flex items-center justify-center z-10 shadow-lg hover:bg-[#ef4444] transition-colors"
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </motion.button>
                    )}

                    <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                      {service.icons && service.icons.length > 0 ? (
                        service.icons.map((icon, idx) => (
                          <div
                            key={`${service.id}-icon-${idx}`}
                            className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center shadow-sm"
                          >
                            <img
                              src={icon}
                              alt={`${service.name} icon ${idx}`}
                              className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                              loading="lazy"
                            />
                          </div>
                        ))
                      ) : (
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-center shadow-sm">
                          <img
                            src={
                              service.iconImgSrc || "/commercial-cleaning.png"
                            }
                            alt={`${service.name} icon`}
                            className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                            loading="lazy"
                          />
                        </div>
                      )}
                    </div>

                    {service.serviceGroup &&
                      service.serviceGroup !== service.name && (
                        <h3 className="text-base sm:text-xl font-bold text-slate-900 mb-1 line-clamp-2">
                          {service.serviceGroup}
                        </h3>
                      )}

                    {!String(service.name || "").includes("+") && (
                      <h3 className="text-base sm:text-xl font-bold text-slate-900 mb-1 line-clamp-2">
                        {service.name}
                      </h3>
                    )}

                    {String(service.name || "").includes("+") && (
                      <ul className="mt-1 space-y-1">
                        {String(service.name)
                          .split("+")
                          .map((part) => part.trim())
                          .filter(Boolean)
                          .map((part, idx) => (
                            <li
                              key={`${service.id}-part-${idx}`}
                              className="text-base sm:text-base text-zinc-900 flex items-center gap-1"
                            >
                              <span>•</span>
                              <span>{part}</span>
                            </li>
                          ))}
                      </ul>
                    )}

                    {detailsText && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setReadMoreService({
                            name: service.name,
                            text: detailsText,
                          });
                        }}
                        className="mt-1 text-[11px] font-semibold text-[#3d8bff] hover:underline"
                      >
                        Read more
                      </button>
                    )}

                    <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-zinc-100">
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <p className="text-lg sm:text-2xl font-bold text-[#3d8bff]">
                            {service.priceLabel
                              ? service.priceLabel
                              : service.isGroup
                              ? price > 0
                                ? `From ₹${price.toLocaleString()}`
                                : "Select option"
                              : service.isDemo && price <= 0
                                ? "Free"
                                : `₹${price.toLocaleString()}`}
                          </p>
                          {!service.isGroup &&
                          service.isMemberPrice &&
                          service.regularPrice != null &&
                          service.regularPrice > price ? (
                            <>
                              <span className="text-sm sm:text-base text-zinc-400 line-through font-medium">
                                ₹{service.regularPrice.toLocaleString()}
                              </span>
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded-full">
                                Member price
                              </span>
                            </>
                          ) : !service.isGroup &&
                            service.festivalPrice != null &&
                            service.festivalPrice > price ? (
                            <span className="text-sm sm:text-base text-zinc-400 line-through font-medium">
                              ₹{service.festivalPrice.toLocaleString()}
                            </span>
                          ) : null}
                        </div>
                        <p className="text-[10px] sm:text-xs text-zinc-500 mt-0.5">
                          {service.priceNote
                            ? service.priceNote
                            : service.isGroup
                            ? "Choose option on next step"
                            : service.monthlyPrice
                              ? "Monthly"
                              : service.instantPrice
                                ? "Instant"
                                : service.oneTimePrice
                                  ? "One-time"
                                  : "Scheduled"}
                        </p>
                      </div>

                      {isCounterService && isSelected && (
                        <div
                          className="flex items-center gap-1 bg-zinc-100 rounded-lg px-1 py-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => updateQuantity(service.id, -1)}
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-zinc-100 text-zinc-600 transition"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-sm font-bold text-slate-900 min-w-[1.5rem] text-center">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(service.id, 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-zinc-100 text-zinc-600 transition"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                       {/* Instant Help selected state is now handled by card highlight and X button */}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Mobile Continue Button */}
        {selectedServices.length > 0 && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-zinc-200 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-xs text-zinc-500 font-medium">
                  {selectedServices.length}{" "}
                  {selectedServices.length === 1 ? "Service" : "Services"}
                </span>
                <span className="text-lg font-bold text-[#3d8bff]">
                  ₹
                  {selectedServices
                    .reduce((sum, s) => sum + getServicePrice(s), 0)
                    .toLocaleString()}
                </span>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                className="flex-1 bg-[#3d8bff] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#3d8bff]/20"
              >
                Book
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        )}

        {/* Spacer for fixed footer */}
        <div className="h-24"></div>
      </div>

      {readMoreService && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center px-3 sm:px-4 py-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-5 sm:p-6 relative shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setReadMoreService(null)}
              className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 pr-6">
              {readMoreService.name}
            </h3>
            <p className="mt-3 text-sm text-zinc-600 leading-relaxed whitespace-pre-line">
              {readMoreService.text}
            </p>
          </motion.div>
        </div>
      )}
      {guidelinesService && (
        <ServiceGuidelinesModal
          isOpen={!!guidelinesService}
          onClose={() => {
            setGuidelinesService(null);
            setGuidelinesData(null);
            setGuidelinesError(null);
            setGuidelinesLoading(false);
          }}
          loading={guidelinesLoading}
          error={guidelinesError}
          data={guidelinesData}
          serviceName={guidelinesService?.name}
          onAccept={handleAcceptGuidelines}
        />
      )}
      <AppDownloadModal
        isOpen={isAppDownloadModalOpen}
        onClose={() => setIsAppDownloadModalOpen(false)}
      />
      <ServiceRequestModal
        isOpen={!!requestService}
        service={requestService}
        onClose={() => setRequestService(null)}
      />
    </div>
  );
}

export default SelectService;
