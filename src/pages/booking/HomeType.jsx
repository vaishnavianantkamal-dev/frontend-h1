import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useBooking } from "../../context/BookingContext";
import StepProgress from "../../components/booking/StepProgress";
import CartSidebar from "../../components/booking/CartSidebar";
import {
  ArrowRight,
  ArrowLeft,
  Users,
  Bath,
  Armchair,
  Layers,
} from "lucide-react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { adminService } from "../../api/services/admin";


const homeTypes = [
  { id: "1bhk", name: "1 BHK", image: "/onebhk.png", multiplier: 1.0 },
  { id: "2bhk", name: "2 BHK", image: "/twobhk.png", multiplier: 1.0 },
  { id: "3bhk", name: "3 BHK", image: "/threebhk.png", multiplier: 1.154 },
  { id: "4bhk+", name: "4 BHK+", image: "/fourbhk.png", multiplier: 1.462 },
];

const personTypes = [
  {
    id: "4person",
    name: "Upto 4 Persons",
    image: "/instant-cleaning.png",
    icon: Users,
    multiplier: 1.0,
  },
  {
    id: "8person",
    name: "upto 8 Persons",
    image: "/instant-cleaning.png",
    icon: Users,
    multiplier: 1.5,
  },
  {
    id: "12person",
    name: "upto 12 Persons",
    image: "/instant-cleaning.png",
    icon: Users,
    multiplier: 2.0,
  },
];

const bathroomTypes = [
  {
    id: "1bathroom",
    name: "1 Bathroom",
    image: "/wash.png",
    icon: Bath,
    multiplier: 1.0,
  },
  {
    id: "2bathroom",
    name: "2 Bathrooms",
    image: "/wash.png",
    icon: Bath,
    multiplier: 2.0,
  },
  {
    id: "3bathroom",
    name: "3 Bathrooms",
    image: "/wash.png",
    icon: Bath,
    multiplier: 3.0,
  },
  {
    id: "4bathroom",
    name: "4 Bathrooms",
    image: "/wash.png",
    icon: Bath,
    multiplier: 4.0,
  },
];

const sofaTypes = [
  {
    id: "1seat",
    name: "1 Seat",
    image: "/sofa-cleaning.png",
    icon: Armchair,
    multiplier: 1.0,
  },
  {
    id: "2seat",
    name: "2 Seats",
    image: "/sofa-cleaning.png",
    icon: Armchair,
    multiplier: 2.0,
  },
  {
    id: "3seat",
    name: "3 Seats",
    image: "/sofa-cleaning.png",
    icon: Armchair,
    multiplier: 3.0,
  },
  {
    id: "4seat",
    name: "4 Seats",
    image: "/sofa-cleaning.png",
    icon: Armchair,
    multiplier: 4.0,
  },
  {
    id: "5seat",
    name: "5 Seats",
    image: "/sofa-cleaning.png",
    icon: Armchair,
    multiplier: 5.0,
  },
];

const carpetTypes = [
  {
    id: "1carpet",
    name: "1 Carpet",
    image: "/carpet-cleaning.png",
    icon: Layers,
    multiplier: 1.0,
  },
  {
    id: "2carpet",
    name: "2 Carpets",
    image: "/carpet-cleaning.png",
    icon: Layers,
    multiplier: 2.0,
  },
  {
    id: "3carpet",
    name: "3 Carpets",
    image: "/carpet-cleaning.png",
    icon: Layers,
    multiplier: 3.0,
  },
  {
    id: "4carpet",
    name: "4 Carpets",
    image: "/carpet-cleaning.png",
    icon: Layers,
    multiplier: 4.0,
  },
];

const BHK_IMAGES = {
  1: "/onebhk.png",
  2: "/twobhk.png",
  3: "/threebhk.png",
  4: "/fourbhk.png",
};

const DEFAULT_STANDARD_ADDONS = [
  {
    id: "utensil-wiping",
    name: "Utensil Wiping & Trolley Arrangement",
    price: 499,
    image: "/wash.png",
  },
  {
    id: "bathroom-addon",
    name: "Bathroom Cleaning",
    price: 499,
    image: "/wash.png",
  },
  {
    id: "balcony-addon",
    name: "Balcony / Small Terrace Cleaning",
    price: 499,
    image: "/balcony.png",
  },
  {
    id: "kitchen-addon",
    name: "Kitchen Platform Surface Cleaning",
    price: 499,
    image: "/kitchen.png",

  },

];

function getVariantImage(groupName, variantLabel) {
  const name = (groupName || "").toLowerCase();
  const label = (variantLabel || "").toLowerCase();
  if (name.includes("sweep") || name.includes("mop") || label.includes("bhk")) {
    const bhk = label.match(/(\d)\s*bhk/)?.[1] || label.match(/^(\d)/)?.[1];
    return BHK_IMAGES[Number(bhk)] || "/twobhk.png";
  }
  if (name.includes("bathroom") || label.includes("bathroom"))
    return "/wash.png";
  if (
    name.includes("utensils") ||
    name.includes("clothes") ||
    label.includes("person")
  )
    return "/instant-cleaning.png";
  if (name.includes("sofa") || label.includes("seat"))
    return "/sofa-cleaning.png";
  if (name.includes("carpet")) return "/carpet-cleaning.png";
  if (name.includes("kitchen")) return "/kitchen.png";
  return "/onebhk.png";
}

function HomeType({ isModal = false, onClose, onCompleted, activeService }) {
  const { bookingData, updateBookingData } = useBooking();
  const navigate = useNavigate();
  const location = useLocation();

  const ensureCustomerLoggedIn = (nextPath) => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (!token || !user) {
      navigate("/login", { state: { redirectTo: nextPath } });
      return false;
    }
    return true;
  };

  const groupedServices = Array.isArray(bookingData.grouped_services)
    ? bookingData.grouped_services
    : [];

  const getInitialAddonQty = (addonId) => {
    const svc = (bookingData.selectedServices || []).find(
      (s) =>
        s.isStandardAddon &&
        (String(s.id) === String(addonId) ||
          String(s.backendId) === String(addonId)),
    );
    return svc?.quantity || 0;
  };

  const getInitialAddonQuantities = () => {
    const qty = {};
    DEFAULT_STANDARD_ADDONS.forEach((a) => {
      qty[a.id] = getInitialAddonQty(a.id);
    });
    return qty;
  };

  const [standardAddons, setStandardAddons] = useState(
    DEFAULT_STANDARD_ADDONS,
  );
  const [addonQuantities, setAddonQuantities] = useState(getInitialAddonQuantities);

  useEffect(() => {
    const fetchAddons = async () => {
      try {
        const addons = await adminService.getAddons();
        if (!Array.isArray(addons) || addons.length === 0) return;

        const filtered = addons.filter((a) => a.status === true);
        const mapped = filtered.map((a) => ({
          id: a.id,
          backendId: a.id,
          name: a.name || "Add-on",
          price: Number(a.price) || 499,
          image: a.images?.[0] || null,
        }));

        setStandardAddons(mapped);
        setAddonQuantities((prev) => {
          const next = { ...prev };
          mapped.forEach((a) => {
            if (next[a.id] === undefined) {
              next[a.id] = getInitialAddonQty(a.id);
            }
          });
          return next;
        });
      } catch (e) {
        // If addons API fails, keep defaults
      }
    };

    fetchAddons();
  }, []);

  const usesGroupedServices = groupedServices.length > 0;
  const isServiceMatchingGroupVariant = (service, group) => {
    if (!service || service.isStandardAddon) return false;
    return Boolean(
      group?.variants?.some(
        (variant) =>
          variant.id === service.id || variant.id === service.backendId,
      ),
    );
  };

  const selectedGroupsWithVariants = useMemo(() => {
    const selected = bookingData.selectedServices || [];
    const stateGroup = location.state?.selectedGroup;

    // If we have a group from navigation state, use that
    if (stateGroup) {
      return [
        {
          name: stateGroup.groupName || stateGroup.name,
          variants: stateGroup.variants || [],
        },
      ];
    }

    const hasGroupPlaceholders = selected.some((s) => s.isGroup);
    if (hasGroupPlaceholders) {
      return selected
        .filter((s) => s.isGroup)
        .map((s) => ({
          name: s.groupName || s.name,
          variants: s.variants || [],
        }));
    }
    if (!usesGroupedServices) return [];
    return groupedServices.filter((group) =>
      selected.some((s) =>
        isServiceMatchingGroupVariant(s, group),
      ),
    );
  }, [
    usesGroupedServices,
    groupedServices,
    bookingData.selectedServices,
    location.state,
  ]);

  const getSelectedVariantIdForGroup = (group) => {
    const placeholder = bookingData.selectedServices?.find(
      (s) => s.isGroup && (s.groupName === group.name || s.name === group.name),
    );
    if (placeholder) return null;
    const svc = bookingData.selectedServices?.find((s) =>
      isServiceMatchingGroupVariant(s, group),
    );
    return svc ? (svc.id ?? svc.backendId) : null;
  };

  const selectVariant = (group, variant) => {
    const stateGroup = location.state?.selectedGroup;
    const current = bookingData.selectedServices?.find(
      (s) =>
        (s.isGroup && (s.groupName === group.name || s.name === group.name)) ||
        isServiceMatchingGroupVariant(s, group),
    );
    const wasDifferentSelection =
      !current ||
      (current.backendId ?? current.id) !== variant.id;
    const price = Number(variant.price) || 0;
    const subId = Number(variant.subscription_id);
    const subscriptionName =
      variant.subscription_name?.name ??
      (typeof variant.subscription_name === "string"
        ? variant.subscription_name
        : null);
    const newService = {
      id: variant.id,
      backendId: variant.id,
      name: variant.label,
      category:
        current?.category || stateGroup?.category || "Standard Cleaning",
      categoryKey:
        current?.categoryKey || stateGroup?.categoryKey || "standard",
      serviceGroup: group.name,
      basePrice: price,
      monthlyPrice: subId === 4 || subId === 8 ? price : null,
      oneTimePrice: subId === 6 ? price : null,
      instantPrice: subId === 5 ? price : null,
      isVariantPrice: true,
      quantity: 1,
      subscriptionId: variant.subscription_id,
      subscriptionName,
    };

    const categoryKeyForFlow =
      stateGroup?.categoryKey ??
      current?.categoryKey ??
      newService.categoryKey ??
      "standard";

    const enforceSingleStandardMain =
      categoryKeyForFlow === "standard" && !aggregatedFlags.isDeepCleaning;

    let otherServices;
    if (enforceSingleStandardMain) {
      otherServices = (bookingData.selectedServices || []).filter(
        (s) => s.isStandardAddon,
      );
    } else {
      otherServices = (bookingData.selectedServices || []).filter(
        (s) =>
          !(
            s.isGroup &&
            (s.groupName === group.name || s.name === group.name)
          ) && !isServiceMatchingGroupVariant(s, group),
      );
    }
    const nextSelected = [...otherServices, newService];
    const isStrictlyMonthly =
      nextSelected.length > 0 &&
      nextSelected.every(
        (s) =>
          s.monthlyPrice && !s.oneTimePrice && s.categoryKey !== "instantHelp",
      );
    updateBookingData({
      selectedServices: nextSelected,
      serviceType: isStrictlyMonthly ? "monthly" : "scheduled",
      isSelectingGroup: false, // selection finished
    });

    if (wasDifferentSelection) {
      const fullTitle = group?.name
        ? `${group.name} — ${newService.name}`
        : newService.name;
      toast.success(`${fullTitle} added to cart`);
    }

    // After choosing a standard cleaning variant, open Add-on services modal
    const selectedIsStandard =
      (current?.categoryKey || stateGroup?.categoryKey || "standard") ===
      "standard" && !flags.isDeepCleaning;
    if (selectedIsStandard) {
      setShowAddonsModal(true);
    }
  };

  const estimatedPriceFromGrouped = useMemo(() => {
    const selected = bookingData.selectedServices || [];
    if (!selected.length) return 0;
    let total = 0;
    selected.forEach((s) => {
      if (s.isGroup) {
        total += Number(s.fromPrice) || 0;
      } else if (s.isVariantPrice && s.basePrice != null) {
        total += Number(s.basePrice) * (s.quantity || 1);
      } else {
        const p =
          s.monthlyPrice ??
          s.oneTimePrice ??
          s.instantPrice ??
          s.basePrice ??
          0;
        total += Number(p) * (s.quantity || 1);
      }
    });
    return total;
  }, [bookingData.selectedServices]);

  const [homeSize, setHomeSize] = useState(bookingData.homeType || "2bhk");
  const [familySize, setFamilySize] = useState(
    bookingData.familySize || "4person",
  );
  const [bathroomCount, setBathroomCount] = useState(
    bookingData.bathroomCount || "1bathroom",
  );
  const [sofaCount, setSofaCount] = useState(
    bookingData.sofaSeatCount || "1seat",
  );
  const [carpetCount, setCarpetCount] = useState(
    bookingData.carpetCount || "1carpet",
  );

  const normalizeName = (s) =>
    String(s?.name || s?.groupName || "").toLowerCase();
  const hasKeywords = (s, arr) => {
    const n = normalizeName(s);
    return arr.some((k) => n.includes(k));
  };

  const isUtensilsOrClothesService = bookingData.selectedServices?.some(
    (s) =>
      (typeof s.id === "string" &&
        (s.id === "utensils-washing" || s.id === "clothes-washing")) ||
      hasKeywords(s, ["utensils", "clothes", "laundry"]),
  );

  const isBathroomService = bookingData.selectedServices?.some(
    (s) =>
      (typeof s.id === "string" &&
        (s.id === "bathroom-cleaning" || s.id === "bathroom-deep-cleaning")) ||
      hasKeywords(s, ["bathroom", "washroom"]),
  );

  const isSofaService = bookingData.selectedServices?.some(
    (s) =>
      (typeof s.id === "string" && s.id === "sofa-cleaning") ||
      hasKeywords(s, ["sofa", "couch", "seat"]),
  );

  const isCarpetService = bookingData.selectedServices?.some(
    (s) =>
      (typeof s.id === "string" && s.id === "carpet-cleaning") ||
      hasKeywords(s, ["carpet", "rug"]),
  );

  const isDeepCleaning = bookingData.selectedServices?.some(
    (s) =>
      (typeof s.id === "string" && s.id === "full-house-deep-cleaning") ||
      hasKeywords(s, ["full house", "deep cleaning"]),
  );

  const isStandardServiceAggregated = bookingData.selectedServices?.some(
    (s) => {
      if (s.isGroup) return false;
      if (s.categoryKey === "commercial" || s.categoryKey === "instantHelp")
        return false;
      if (typeof s.id !== "string") {
        const n = normalizeName(s);
        const isSpecialByName = [
          "utensils",
          "clothes",
          "bathroom",
          "sofa",
          "carpet",
          "kitchen",
        ].some((k) => n.includes(k));
        return !isSpecialByName;
      }
      const specialIds = [
        "utensils-washing",
        "clothes-washing",
        "bathroom-cleaning",
        "bathroom-deep-cleaning",
        "sofa-cleaning",
        "carpet-cleaning",
        "kitchen-cleaning",
        "kitchen-deep-cleaning",
      ];
      const isFullHouseDeepCleaning = s.id === "full-house-deep-cleaning";
      const isSpecial = specialIds.includes(s.id);
      return (
        (isFullHouseDeepCleaning || !isSpecial) &&
        s.categoryKey !== "commercial" &&
        s.categoryKey !== "instantHelp"
      );
    },
  );

  const aggregatedFlags = {
    isStandardService: isStandardServiceAggregated,
    isUtensilsOrClothesService,
    isBathroomService,
    isSofaService,
    isCarpetService,
    isDeepCleaning,
  };

  const deriveFlagsFromService = (s) => {
    const idStr = typeof s?.id === "string" ? s.id : "";
    const n = normalizeName(s);
    const bathroom =
      idStr.includes("bathroom") ||
      n.includes("bathroom") ||
      n.includes("washroom");
    const utensilsOrClothes =
      idStr.includes("utensils") ||
      idStr.includes("clothes") ||
      n.includes("utensils") ||
      n.includes("clothes") ||
      n.includes("laundry");
    const sofa =
      idStr.includes("sofa") ||
      n.includes("sofa") ||
      n.includes("couch") ||
      n.includes("seat");
    const carpet =
      idStr.includes("carpet") || n.includes("carpet") || n.includes("rug");
    const deep =
      idStr.includes("full-house-deep-cleaning") ||
      n.includes("full house") ||
      n.includes("deep cleaning");
    const kitchen = idStr.includes("kitchen") || n.includes("kitchen");
    const standard =
      !bathroom &&
      !utensilsOrClothes &&
      !sofa &&
      !carpet &&
      !kitchen &&
      s?.categoryKey !== "commercial" &&
      s?.categoryKey !== "instantHelp";
    return {
      isStandardService: standard,
      isUtensilsOrClothesService: utensilsOrClothes,
      isBathroomService: bathroom,
      isSofaService: sofa,
      isCarpetService: carpet,
      isDeepCleaning: deep,
    };
  };

  const flags =
    isModal && activeService
      ? deriveFlagsFromService(activeService)
      : aggregatedFlags;

  const handleRemoveService = (serviceToRemove) => {
    const removingStandardMainService =
      !serviceToRemove?.isStandardAddon &&
      (serviceToRemove?.categoryKey === "standard" ||
        serviceToRemove?.isGroup ||
        Boolean(serviceToRemove?.serviceGroup));

    let updatedServices = (bookingData.selectedServices || []).filter(
      (service) => service.id !== serviceToRemove.id,
    );

    // If the main standard/group service is removed, clear linked standard add-ons too.
    if (removingStandardMainService) {
      updatedServices = updatedServices.filter((service) => !service.isStandardAddon);
      setAddonQuantities((prev) => {
        const next = { ...prev };
        standardAddons.forEach((addon) => {
          const id = addon.backendId ?? addon.id;
          next[id] = 0;
          next[addon.id] = 0;
        });
        return next;
      });
      updateBookingData({ selectedServices: updatedServices, standardAddons: [] });
      return;
    }

    updateBookingData({ selectedServices: updatedServices });

    // When removing only an add-on from cart, reset its quantity in modal state.
    if (serviceToRemove?.isStandardAddon) {
      const id = serviceToRemove.backendId ?? serviceToRemove.id;
      setAddonQuantities((prev) => ({ ...prev, [id]: 0 }));
    }
  };

  const calculateTotalPrice = () => {
    return (bookingData.selectedServices || []).reduce((total, service) => {
      let price = 0;
      if (service.monthlyPrice) {
        price = Number(service.monthlyPrice) || 0;
      } else if (service.oneTimePrice) {
        price = Number(service.oneTimePrice) || 0;
      } else if (service.instantPrice) {
        price = Number(service.instantPrice) || 0;
      } else if (service.basePrice) {
        price = Number(service.basePrice) || 0;
      } else if (service.price) {
        price = Number(service.price) || 0;
      }

      // Apply multipliers for home type, family size, etc.
      if (flags.isStandardService && homeSize && !service.isStandardAddon) {
        const homeType = homeTypes.find((h) => h.id === homeSize);
        price *= homeType?.multiplier || 1;
      }
      if (flags.isUtensilsOrClothesService && familySize) {
        const personType = personTypes.find((p) => p.id === familySize);
        price *= personType?.multiplier || 1;
      }
      if (flags.isBathroomService && bathroomCount) {
        const bathroomType = bathroomTypes.find((b) => b.id === bathroomCount);
        price *= bathroomType?.multiplier || 1;
      }

      const quantity = Math.max(1, Number(service.quantity) || 1);
      return total + price * quantity;
    }, 0);
  };

  const handleNext = () => {
    if (!ensureCustomerLoggedIn("/book/date-time")) return;

    if (showGroupedSections && !hasUnselectedGroups) {
      updateBookingData({
        selectedServices: bookingData.selectedServices || [],
        serviceType: bookingData.serviceType || "scheduled",
      });
      if (isModal && onCompleted) {
        onCompleted();
      } else {
        navigate("/book/date-time");
      }
      return;
    }

    const isStrictlyMonthly =
      nextSelectedServices.length > 0 &&
      nextSelectedServices.every(
        (s) =>
          s.monthlyPrice && !s.oneTimePrice && s.categoryKey !== "instantHelp",
      );

    // Build updated services including standard add-ons from addonQuantities
    const baseServices = (bookingData.selectedServices || []).filter(
      (s) => !s.isStandardAddon,
    );
    const addonServices = [];
    standardAddons.forEach((addon) => {
      const qty = addonQuantities[addon.id] ?? 0;
      if (qty <= 0) return;
      const price = addon.price || 0;
      const backendId = addon.backendId ?? addon.id;
      addonServices.push({
        id: backendId,
        backendId,
        name: addon.name || "Add-on",
        category: "Standard Cleaning Add-on",
        categoryKey: "standard",
        serviceGroup: null,
        basePrice: price,
        monthlyPrice: price,
        oneTimePrice: null,
        instantPrice: null,
        isStandardAddon: true,
        quantity: qty,
      });
    });
    const nextSelectedServices = [...baseServices, ...addonServices];
    const selectedAddonIds = addonServices.map((s) => String(s.id));

    const updates = {
      homeType: flags.isStandardService ? homeSize : null,
      familySize: flags.isUtensilsOrClothesService ? familySize : null,
      bathroomCount: flags.isBathroomService ? bathroomCount : null,
      sofaSeatCount: flags.isSofaService ? sofaCount : null,
      carpetCount: flags.isCarpetService ? carpetCount : null,
      selectedServices: nextSelectedServices,
      standardAddons: selectedAddonIds,
    };

    if (isStrictlyMonthly) {
      updateBookingData({
        ...updates,
        serviceType: "monthly",
      });
      if (isModal && onCompleted) {
        onCompleted();
      } else {
        navigate("/book/date-time");
      }
    } else if (
      nextSelectedServices.length > 0 &&
      nextSelectedServices.every(
        (s) => s.oneTimePrice && !s.monthlyPrice && !s.instantPrice,
      )
    ) {
      updateBookingData({
        ...updates,
        serviceType: "scheduled",
      });
      if (isModal && onCompleted) {
        onCompleted();
      } else {
        navigate("/book/date-time");
      }
    } else {
      updateBookingData(updates);
      if (isModal && onCompleted) {
        onCompleted();
      } else {
        navigate("/book/date-time");
      }
    }
  };

  const calculateEstimatedPrice = () => {
    let totalPrice = 0;
    bookingData.selectedServices?.forEach((service) => {
      // Base price
      let servicePrice =
        (bookingData.serviceType === "monthly" && service.monthlyPrice) ||
        (bookingData.serviceType === "instant" && service.instantPrice) ||
        (bookingData.serviceType === "scheduled" && service.oneTimePrice) ||
        service.monthlyPrice ||
        service.oneTimePrice ||
        service.instantPrice ||
        0;

      let multiplier = 1.0;

      if (service.categoryKey === "commercial") {
        multiplier = 1.0;
      } else if (
        typeof service.id === "string" &&
        service.id === "sofa-cleaning"
      ) {
        if (sofaCount === "2seat") multiplier = 2.0;
        else if (sofaCount === "3seat") multiplier = 3.0;
        else if (sofaCount === "4seat") multiplier = 4.0;
        else if (sofaCount === "5seat") multiplier = 5.0;
      } else if (
        typeof service.id === "string" &&
        service.id === "carpet-cleaning"
      ) {
        if (carpetCount === "2carpet") multiplier = 2.0;
        else if (carpetCount === "3carpet") multiplier = 3.0;
        else if (carpetCount === "4carpet") multiplier = 4.0;
      } else if (
        typeof service.id === "string" &&
        service.id.includes("bathroom")
      ) {
        if (bathroomCount === "2bathroom") multiplier = 2.0;
        else if (bathroomCount === "3bathroom") multiplier = 3.0;
        else if (bathroomCount === "4bathroom") multiplier = 4.0;
      } else if (
        typeof service.id === "string" &&
        (service.id === "utensils-washing" || service.id === "clothes-washing")
      ) {
        if (familySize === "8person") multiplier = 1.5;
        else if (familySize === "12person") multiplier = 2.0;
      } else if (
        typeof service.id === "string" &&
        service.id === "full-house-deep-cleaning"
      ) {
        if (homeSize === "1bhk") multiplier = 1.0;
        else if (homeSize === "2bhk") multiplier = 1.2;
        else if (homeSize === "3bhk") multiplier = 1.6;
        else if (homeSize === "4bhk+") multiplier = 2.0;
      } else {
        // Standard services
        if (homeSize === "3bhk") multiplier = 1.154;
        else if (homeSize === "4bhk+") multiplier = 1.462;
      }

      totalPrice += servicePrice * multiplier;
    });

    return Math.round(totalPrice);
  };

  const modalGroups =
    isModal && activeService?.isGroup
      ? [
        {
          name: activeService.groupName || activeService.name,
          variants: activeService.variants || [],
        },
      ]
      : selectedGroupsWithVariants;

  const showGroupedSections = isModal
    ? Boolean(activeService?.isGroup)
    : modalGroups.length > 0;
  const hasUnselectedGroups =
    showGroupedSections &&
    (bookingData.selectedServices || []).some((s) => s.isGroup);
  const estimatedPrice = showGroupedSections
    ? estimatedPriceFromGrouped
    : calculateEstimatedPrice();

  const renderGroupedSection = (group) => {
    const selectedVariantId = getSelectedVariantIdForGroup(group);
    return (
      <div key={group.name} className="mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {group.name}
          </h2>
          <p className="text-sm text-zinc-500">Choose your option</p>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {(group.variants || []).map((variant) => {
            const isSelected = selectedVariantId === variant.id;
            const priceNum = Number(variant.price) || 0;
            const variantImage = getVariantImage(group.name, variant.label);
            return (
              <motion.button
                key={variant.id}
                type="button"
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => selectVariant(group, variant)}
                className={`relative rounded-2xl border-2 p-6 bg-white transition text-left ${isSelected
                  ? "border-[#3d8bff] shadow-xl shadow-[#3d8bff]/20 bg-[#3d8bff]/5"
                  : "border-zinc-200 hover:border-[#3d8bff]/50"
                  }`}
              >
                {isSelected && (
                  <motion.button
                    type="button"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      const remaining = (bookingData.selectedServices || []).filter(
                        (s) =>
                          !isServiceMatchingGroupVariant(s, group),
                      );
                      const cleared = remaining.filter((s) => !s.isStandardAddon);
                      const resetAddonQuantities = { ...addonQuantities };
                      standardAddons.forEach((addon) => {
                        const id = addon.backendId ?? addon.id;
                        resetAddonQuantities[id] = 0;
                        resetAddonQuantities[addon.id] = 0;
                      });
                      setAddonQuantities(resetAddonQuantities);
                      updateBookingData({
                        ...bookingData,
                        selectedServices: cleared,
                        standardAddons: [],
                        isSelectingGroup: true,
                      });
                    }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-[#3d8bff] rounded-full flex items-center justify-center shadow-lg hover:bg-[#ef4444] transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </motion.button>
                )}
                <div className="mb-4 flex justify-center">
                  <img
                    src={variantImage}
                    alt={variant.label}
                    className="w-20 h-20 object-contain mx-auto"
                  />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  {variant.label}
                </h3>
                <p className="text-xl font-bold text-[#3d8bff]">
                  {priceNum <= 0 ||
                    (priceNum === 1 &&
                      variant.label?.toLowerCase().includes("free"))
                    ? "Free"
                    : `₹${priceNum.toLocaleString()}`}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  };

  const updateAddonsInBooking = (quantities) => {
    const baseServices = (bookingData.selectedServices || []).filter(
      (s) => !s.isStandardAddon,
    );
    const addonServices = [];

    standardAddons.forEach((addon) => {
      const qty = quantities[addon.id] ?? 0;
      if (qty <= 0) return;
      const price = addon.price || 0;
      const backendId = addon.backendId ?? addon.id;
      addonServices.push({
        id: backendId,
        backendId,
        name: addon.name || "Add-on",
        category: "Standard Cleaning Add-on",
        categoryKey: "standard",
        serviceGroup: null,
        basePrice: price,
        monthlyPrice: price,
        oneTimePrice: null,
        instantPrice: null,
        isStandardAddon: true,
        quantity: qty,
      });
    });

    const nextStandardAddons = addonServices.map((s) => String(s.id));
    updateBookingData({
      ...bookingData,
      selectedServices: [...baseServices, ...addonServices],
      standardAddons: nextStandardAddons,
    });
  };

  const changeAddonQty = (addonId, delta, addonName) => {
    setAddonQuantities((prev) => {
      const prevQty = prev[addonId] ?? 0;
      const nextQty = Math.max(0, prevQty + delta);
      if (prevQty === 0 && nextQty > 0) {
        toast.success(`${addonName || "Add-on"} added to cart`);
      } else if (prevQty > 0 && nextQty === 0) {
        toast.success(`${addonName || "Add-on"} removed from cart`);
      }
      const next = { ...prev, [addonId]: nextQty };
      updateAddonsInBooking(next);
      return next;
    });
  };

  const [showAddonsModal, setShowAddonsModal] = useState(false);

  const renderStandardAddons = () => {
    // Show add-ons only for pure standard cleaning, not deep cleaning
    const hasDeepCleaningSelected = (bookingData.selectedServices || []).some(
      (s) =>
        s.categoryKey === "deepCleaning" ||
        String(s.name || "")
          .toLowerCase()
          .includes("deep cleaning"),
    );
    if (!flags.isStandardService || flags.isDeepCleaning || hasDeepCleaningSelected)
      return null;
    return (
      <div className="mt-6 mb-6 flex justify-center">
        <button
          type="button"
          onClick={() => setShowAddonsModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#3b82f6]/40 bg-white text-sm font-semibold text-[#1d4ed8] hover:border-[#3b82f6] hover:bg-[#eff6ff] transition"
        >
          Add-on services
          <span className="text-[11px] text-zinc-500">
            Choose extra areas you want to include
          </span>
        </button>
      </div>
    );
  };

  const renderSection = (title, types, selected, setSelected) => (
    <div className="mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {types.map((type) => (
          <motion.button
            key={type.id}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelected(type.id)}
            className={`relative rounded-2xl border-2 p-6 bg-white transition ${selected === type.id
              ? "border-[#3d8bff] shadow-xl shadow-[#3d8bff]/20 bg-[#3d8bff]/5"
              : "border-zinc-200 hover:border-[#3d8bff]/50"
              }`}
          >
            {selected === type.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-[#3d8bff] rounded-full flex items-center justify-center"
              >
                <span className="text-white text-sm">✓</span>
              </motion.div>
            )}

            <div className="mb-4 flex justify-center">
              {type.image ? (
                <img
                  src={type.image}
                  alt={type.name}
                  className="w-20 h-20 object-contain mx-auto"
                />
              ) : (
                <div className="w-20 h-20 flex items-center justify-center bg-blue-50 rounded-full">
                  <type.icon className="w-10 h-10 text-[#3d8bff]" />
                </div>
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-900">{type.name}</h3>
          </motion.button>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`${isModal ? "pb-6" : "min-h-screen pb-12"}`}>
      {!isModal && <StepProgress />}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {showGroupedSections &&
              modalGroups.map((group) => renderGroupedSection(group))}

            {showGroupedSections && renderStandardAddons()}

            {!showGroupedSections && (
              <>
                {/* {flags.isStandardService &&
              renderSection(
                "What's your home type?",
                homeTypes,
                homeSize,
                setHomeSize,
              )} */}
                {flags.isUtensilsOrClothesService &&
                  renderSection(
                    "How many people?",
                    personTypes,
                    familySize,
                    setFamilySize,
                  )}
                {flags.isBathroomService &&
                  renderSection(
                    "How many bathrooms?",
                    bathroomTypes,
                    bathroomCount,
                    setBathroomCount,
                  )}
                {flags.isSofaService &&
                  renderSection(
                    "How many seats?",
                    sofaTypes,
                    sofaCount,
                    setSofaCount,
                  )}
                {flags.isCarpetService &&
                  renderSection(
                    "How many carpets?",
                    carpetTypes,
                    carpetCount,
                    setCarpetCount,
                  )}
              </>
            )}

            {/* Price Display (Desktop) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={estimatedPrice}
              className="hidden lg:flex bg-white rounded-xl border border-zinc-200 p-6 mb-8 justify-between items-center shadow-sm sticky bottom-4 z-10"
            >
              <div>
                <p className="text-zinc-600 font-medium">Estimated Total</p>
                <p className="text-sm text-zinc-500">
                  Includes all selected services
                </p>
              </div>
              <p className="text-3xl font-bold text-[#3d8bff]">
                ₹{estimatedPrice.toLocaleString()}
              </p>
            </motion.div>

            <div className="flex justify-between items-center mb-8">
              <motion.button
                whileHover={{ x: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (isModal && onClose) {
                    onClose();
                  } else {
                    navigate("/book/service");
                  }
                }}
                className="flex items-center text-zinc-500 hover:text-slate-900 transition font-medium"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </motion.button>
            </div>
          </div>

          {/* Desktop Cart Sidebar */}
          <CartSidebar
            selectedServices={bookingData.selectedServices || []}
            onRemove={handleRemoveService}
            onContinue={handleNext}
            totalPrice={calculateTotalPrice()}
          />
        </div>
      </div>

      {/* Mobile Continue Button */}
      {bookingData.selectedServices?.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-zinc-200 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-xs text-zinc-500 font-medium">
                {bookingData.selectedServices.length}{" "}
                {bookingData.selectedServices.length === 1
                  ? "Service"
                  : "Services"}
              </span>
              <span className="text-lg font-bold text-[#3d8bff]">
                ₹{calculateTotalPrice().toLocaleString()}
              </span>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              disabled={hasUnselectedGroups}
              className="flex-1 bg-[#3d8bff] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#3d8bff]/20 disabled:opacity-50"
            >
              Book
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      )}
      {showAddonsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6 relative shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setShowAddonsModal(false)}
              className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-700"
            >
              <X />
            </button>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                Add-on services
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Choose extra areas you want to include
              </p>
            </div>
            {/* Main selected services preview */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-zinc-500 mb-2 text-left">
                Your services
              </p>
              <div className="flex flex-wrap gap-2">
                {(bookingData.selectedServices || [])
                  .filter((s) => !s.isStandardAddon)
                  .map((s) => {
                    const basePrice =
                      s.monthlyPrice ||
                      s.oneTimePrice ||
                      s.instantPrice ||
                      s.basePrice ||
                      0;
                    const qty = s.quantity || 1;
                    const title =
                      s.serviceGroup && s.name
                        ? `${s.serviceGroup} — ${s.name}`
                        : s.name || s.serviceGroup || "Service";
                    return (
                      <span
                        key={s.id}
                        className="px-3 py-1 rounded-full bg-zinc-100 text-[11px] font-medium text-zinc-700 flex items-center gap-1"
                      >
                        <span>{title}</span>
                        {basePrice > 0 && (
                          <span className="text-[10px] text-zinc-500">
                            · ₹{(basePrice * qty).toLocaleString()}
                          </span>
                        )}
                      </span>
                    );
                  })}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 justify-center">
              {standardAddons.map((addon) => {
                const qty = addonQuantities[addon.id] ?? 0;
                const active = qty > 0;
                const changeQty = (delta) =>
                  changeAddonQty(addon.id, delta, addon.name);

                return (
                  <div
                    key={addon.id}
                    className={`relative w-full min-h-[190px] px-5 py-4 rounded-2xl text-xs font-semibold border transition flex flex-col items-center gap-1 ${active
                      ? "bg-white text-[#1d4ed8] border-[#3b82f6] shadow-md"
                      : "bg-white text-zinc-700 border-zinc-200 hover:border-[#3b82f6]"
                      }`}
                  >
                    {active && (
                      <motion.button
                        type="button"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Remove this add-on by reducing its quantity to 0
                          if (qty > 0) {
                            changeQty(-qty);
                          }
                        }}
                        className="absolute -top-2 -right-2 w-7 h-7 bg-[#3d8bff] rounded-full flex items-center justify-center shadow-lg hover:bg-[#ef4444] transition-colors"
                      >
                        <X className="w-3 h-3 text-white" />
                      </motion.button>
                    )}
                    <img
                      src={addon.image || "/wash.png"}
                      alt={addon.name}
                      className="w-14 h-14 object-contain"
                    />
                    <span className="mt-1 text-base font-semibold text-slate-900 text-center">
                      {addon.name}
                    </span>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-zinc-50 px-3 py-1 border border-zinc-200">

                      <button
                        type="button"
                        onClick={() => changeQty(-1)}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-zinc-600 border border-zinc-300 text-[13px] font-bold hover:bg-zinc-100"
                      >
                        -
                      </button>
                      <span className="text-[13px] font-bold min-w-[2rem] text-center text-slate-900">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => changeQty(1)}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-[#3d8bff] text-white border border-[#3d8bff] text-[13px] font-bold hover:bg-[#3f5ce6]"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-[18px] font-semibold mt-1 text-zinc-600 ">
                      ₹{(Number(addon.price) || 0).toLocaleString()}{" "}
                      <span className="text-[10px] font-normal ">per</span>
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAddonsModal(false)}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#3d8bff] text-white text-sm font-semibold shadow-md shadow-[#3d8bff]/30 hover:bg-[#3f5ce6] transition"
              >
                Continue
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default HomeType;
