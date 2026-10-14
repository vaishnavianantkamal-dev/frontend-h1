import React from "react";
import { motion } from "framer-motion";

// Hobit1: mission text, badges and image are local now; the old
// cleaning-only CMS mission data (cmsService.getMissionData) is not used.
const MISSION_PARAGRAPHS = [
  "At Hobit1, we connect households with verified home-service professionals for cleaning, plumbing, electrical, painting and more. Our platform makes it easy to book trusted experts with clear prices and instant confirmation.",
  "We also create meaningful opportunities for skilled workers by providing fair wages, respect and consistent work. Because a well-kept home isn't just convenient — it builds stronger families and stronger communities.",
];

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const TagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    <path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <circle cx="7" cy="7" r="1.5" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const BADGES = [
  {
    title: "100%",
    subtitle: "Verified Pros",
    Icon: UsersIcon,
    iconClass: "bg-[#3d8bff]/10 text-[#3d8bff]",
  },
  {
    title: "Fair",
    subtitle: "Pricing & Wages",
    Icon: TagIcon,
    iconClass: "bg-[#ffe75a]/40 text-amber-600",
  },
  {
    title: "Reliable",
    subtitle: "Care",
    Icon: ShieldIcon,
    iconClass: "bg-[#3d8bff]/10 text-[#3d8bff]",
  },
];

const OurStorySection = () => {
  return (
    <section id="our-mission" className="py-20 px-4 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-5">
              <div className="inline-flex items-center rounded-full border border-[#3d8bff]/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#3d8bff]">
                Our Mission
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">
                Better Homes.
                <br />
                <span className="relative inline-block text-[#3d8bff]">
                  Better Opportunities.
                  {/* Yellow brush underline */}
                  <svg
                    viewBox="0 0 120 12"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                    className="absolute -bottom-3 left-0 h-3 w-24 text-[#ffd43b]"
                  >
                    <path d="M2 9 C 35 2, 80 2, 118 6" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                  </svg>
                </span>
              </h2>
            </div>

            <div className="space-y-5 text-lg text-gray-600 leading-relaxed">
              {MISSION_PARAGRAPHS.map((para) => (
                <p key={para}>{para}</p>
              ))}
            </div>

            <div className="grid grid-cols-3 divide-x divide-gray-200 pt-2">
              {BADGES.map(({ title, subtitle, Icon, iconClass }) => (
                <div key={title} className="flex flex-col items-center px-2 text-center">
                  <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${iconClass}`}>
                    <Icon />
                  </div>
                  <h3 className="text-2xl font-bold text-[#3d8bff]">{title}</h3>
                  <p className="text-sm font-medium text-gray-500">{subtitle}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Image (frame, badge and shapes are part of the image) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <img
              src="/images/our%20mission.png"
              alt="Smiling Hobit1 professional painting a wall in a customer's home"
              loading="lazy"
              decoding="async"
              className="h-auto w-full"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default OurStorySection;
