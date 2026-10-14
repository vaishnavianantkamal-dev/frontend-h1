import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  PauseCircle,
  CalendarDays,
  RefreshCcw,
  PhoneCall,
  Users,
  Loader2,
} from "lucide-react";

import { customerService } from "../../api/services/customer";

// The API returns icon: null for every item, so we assign a nice icon + colour
// per index from this palette to keep the visuals consistent.
const ICON_PALETTE = [
  { icon: Users, iconColor: "text-blue-500", bgIcon: "bg-blue-50" },
  { icon: PauseCircle, iconColor: "text-rose-500", bgIcon: "bg-rose-50" },
  { icon: CalendarDays, iconColor: "text-emerald-500", bgIcon: "bg-emerald-50" },
  { icon: PhoneCall, iconColor: "text-indigo-500", bgIcon: "bg-indigo-50" },
  { icon: ShieldCheck, iconColor: "text-amber-500", bgIcon: "bg-amber-50" },
  { icon: RefreshCcw, iconColor: "text-sky-500", bgIcon: "bg-sky-50" },
];
const pick = (i) => ICON_PALETTE[i % ICON_PALETTE.length];

// Reusable InfoCard component for key details
const InfoCard = ({
  icon: Icon,
  title,
  description,
  badge,
  iconColor = "text-blue-500",
  bgIcon = "bg-blue-50",
}) => {
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4 text-left relative overflow-hidden group h-full w-full"
    >
      <div
        className={`p-3 rounded-xl ${bgIcon} ${iconColor} shrink-0 group-hover:scale-110 transition-transform duration-300`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <div className="space-y-1 z-10 min-w-0 flex-1">
        {badge && (
          <span className="inline-block text-[10px] font-bold tracking-wider uppercase bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full mb-1">
            {badge}
          </span>
        )}
        <h3 className="font-semibold text-slate-800 text-base break-words">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-slate-500 leading-relaxed break-words">
            {description}
          </p>
        )}
      </div>
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50/10 to-blue-50/30 rounded-full blur-xl -mr-6 -mt-6 pointer-events-none group-hover:scale-150 transition-all duration-500" />
    </motion.div>
  );
};

// Reusable PolicySection component
const PolicySection = ({ title, items, icon: Icon }) => {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all text-left">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-4">
        <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-slate-800 text-base sm:text-lg">
          {title}
        </h3>
      </div>
      <ul className="space-y-3">
        {items.map((item, idx) => (
          <li
            key={idx}
            className="flex items-start gap-2.5 text-sm text-slate-600"
          >
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// serviceType: "cleaner" (Hobit Every Day / Hobit Week Day) | "cook" (Monthly Cook)
const MonthlySubscriptionInfo = ({ serviceType = "cleaner" }) => {
  // Top banner image — fully dynamic from /app/savings-banner. Hidden until
  // (and unless) the API returns an active banner image.
  const [bannerImage, setBannerImage] = useState(null);

  // Fully API-driven — no static content. Empty until the endpoints respond.
  const [benefits, setBenefits] = useState({ heading: "", items: [] });
  const [why, setWhy] = useState({ heading: "", subtitle: null, items: [] });
  const [policies, setPolicies] = useState({ heading: "", groups: [] });
  const [loading, setLoading] = useState(true);

  // Load the top savings banner once (not service-type specific).
  useEffect(() => {
    let cancelled = false;
    const loadBanner = async () => {
      try {
        const res = await customerService.getSavingsBanner();
        const data = res?.data;
        const url = Array.isArray(data?.images) ? data.images[0] : null;
        if (!cancelled && data?.is_active !== false && url) {
          setBannerImage(url);
        }
      } catch (e) {
        // Keep the bundled fallback image on failure.
        console.error("Failed to load savings banner:", e);
      }
    };
    loadBanner();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load the three content endpoints for the current service type.
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const [benRes, whyRes, polRes] = await Promise.allSettled([
        customerService.getSubscriptionBenefits(serviceType),
        customerService.getWhyChoose(serviceType),
        customerService.getSubscriptionPolicies(serviceType),
      ]);
      if (cancelled) return;

      const benData = benRes.status === "fulfilled" ? benRes.value?.data : null;
      const benList = Array.isArray(benData?.benefits) ? benData.benefits : [];
      setBenefits({
        heading: benData?.heading || "",
        items: benList.map((b, i) => ({
          title: b.title ?? b.name ?? "",
          ...pick(i),
        })),
      });

      const whyData = whyRes.status === "fulfilled" ? whyRes.value?.data : null;
      const whyCards = Array.isArray(whyData?.cards) ? whyData.cards : [];
      setWhy({
        heading: whyData?.heading || "",
        subtitle: whyData?.subtitle || null,
        items: whyCards.map((c) => c.card_title ?? c.title ?? ""),
      });

      const polData = polRes.status === "fulfilled" ? polRes.value?.data : null;
      const polGroups = Array.isArray(polData?.groups) ? polData.groups : [];
      setPolicies({
        heading: polData?.heading || "",
        groups: [...polGroups]
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((g) => ({
            title: g.title,
            items: Array.isArray(g.points)
              ? g.points.map((p) => p.text ?? p)
              : [],
          })),
      });

      setLoading(false);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [serviceType]);

  return (
    <div className="bg-slate-50/50 border border-slate-200/60 rounded-3xl p-4 sm:p-6 shadow-sm mt-8 relative">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#3d8bff] animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Subscription Details
          </span>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          Scroll to see details
        </span>
      </div>

      <div className="max-h-[60vh] sm:max-h-[520px] overflow-y-auto pr-1 sm:pr-3 scroll-smooth">
        <div className="space-y-12 max-w-5xl mx-auto px-1 sm:px-0">
          {/* 1. TOP BANNER — /app/savings-banner (fully dynamic) */}
          {bannerImage && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full overflow-hidden rounded-3xl shadow-sm border border-slate-100 bg-white relative flex items-center justify-center min-h-[120px] sm:min-h-[180px] md:min-h-[240px] max-h-[320px]"
            >
              <img
                src={bannerImage}
                alt="Subscription savings banner"
                onError={() => setBannerImage(null)}
                className="w-full h-auto max-h-[320px] object-contain sm:object-cover block"
              />
            </motion.div>
          )}

          {loading ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center gap-2 py-12 text-zinc-500"
            >
              <Loader2 className="w-6 h-6 text-[#3d8bff] animate-spin" />
              <p className="text-sm">Loading subscription details…</p>
            </motion.div>
          ) : (
            <>
              {/* 2. BENEFITS OF SUBSCRIPTION — /app/subscription-benefits */}
              {benefits.items.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
                  className="space-y-6 text-center"
                >
                  {benefits.heading && (
                    <div className="space-y-2">
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                        {benefits.heading}
                      </h2>
                    </div>
                  )}

                  <div className="flex flex-wrap justify-center gap-4">
                    {benefits.items.map((benefit, idx) => (
                      <div
                        key={idx}
                        className="w-full sm:w-[calc(50%-0.5rem)] flex"
                      >
                        <InfoCard
                          icon={benefit.icon}
                          title={benefit.title}
                          description={benefit.description}
                          iconColor={benefit.iconColor}
                          bgIcon={benefit.bgIcon}
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 3. WHY CHOOSE / FLEXIBILITY — /app/why-choose */}
              {why.items.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
                  className="space-y-6 text-left max-w-3xl mx-auto"
                >
                  {(why.heading || why.subtitle) && (
                    <div className="space-y-2 text-center">
                      {why.heading && (
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 leading-tight tracking-tight">
                          {why.heading}
                        </h2>
                      )}
                      {why.subtitle && (
                        <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
                          {why.subtitle}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="space-y-4">
                    {why.items.map((title, idx) => {
                      const p = pick(idx);
                      return (
                        <div
                          key={idx}
                          className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm flex items-start gap-4 hover:shadow-md transition-all"
                        >
                          <div
                            className={`p-2.5 rounded-xl ${p.bgIcon} ${p.iconColor} shrink-0`}
                          >
                            <p.icon className="w-5 h-5" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-bold text-slate-800 text-sm sm:text-base">
                              {title}
                            </h4>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* 4. SUBSCRIPTION POLICY — /app/subscription-policies */}
              {policies.groups.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }} className="space-y-6">
                  {policies.heading && (
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                        {policies.heading}
                      </h2>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {policies.groups.map((group, idx) => (
                      <PolicySection
                        key={idx}
                        title={group.title}
                        items={group.items}
                        icon={pick(idx).icon}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </>
          )}

          {/* Spacing before footer */}
          <div className="h-4 sm:h-8" />
        </div>
      </div>
    </div>
  );
};

export default MonthlySubscriptionInfo;
