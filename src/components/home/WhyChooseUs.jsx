import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cmsService } from "../../api/services/cms";
import { getImageUrl } from "../../config/mediaUrls";

const REASONS = [
  {
    title: "Verified professionals",
    text: "Book trusted, verified professionals for every service.",
  },
  {
    title: "Fixed, upfront pricing",
    text: "See the price before you book. No surprise charges at your door.",
  },
  {
    title: "OTP-based job start",
    text: "Work begins only after you share the OTP, so you know who is in your home.",
  },
  {
    title: "Free rework",
    text: "Not happy with the result? We'll come back and fix it at no extra cost.",
  },
];

const WhyChooseUs = () => {
  const [heading] = useState("Why Choose Hobit1");
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const res = await cmsService.getChooseUsData();
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];

        if (!isMounted || list.length === 0) return;

        // Use the heading once for the section title
        // Hobit1: old CMS heading ("Why Choose Hobit") not used.
        // setHeading(list[0]?.heading || "Why Choose Hobit1");

        // Map cards using card_heading + image
        const mapped = list.map((item) => ({
          id: item.id,
          title: item.card_heading,
          image: getImageUrl(item.image),
        }));

        setFeatures(mapped);
      } catch {
        // silently keep defaults if API fails
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const marqueeFeatures = features.length > 0 ? [...features, ...features] : [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="py-16 px-4 bg-linear-to-b from-gray-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Hobit1: content left, image right (was a centered heading only) */}
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 py-1 text-base font-medium text-[#3d8bff] mb-3">
              Trusted Home Service Platform
            </div>
            <h2 className="text-4xl md:text-4xl font-black mb-4 tracking-tight">
              <span className="text-gray-800">{heading}</span>
            </h2>

            <p className="text-lg md:text-lg text-gray-600 mb-6">
              Book verified home service professionals with fixed pricing,
              OTP-based job start, and free rework if something is not right.
            </p>

            <ul className="space-y-4">
              {REASONS.map((reason) => (
                <li key={reason.title} className="flex gap-3">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#3d8bff]/10 text-sm font-bold text-[#3d8bff]">
                    ✓
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {reason.title}
                    </h3>
                    <p className="text-sm text-gray-600">{reason.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <img
              src="/images/why-choose-hobit1.png"
              alt="Hobit1 professionals cleaning, doing electrical and plumbing work, with a happy family"
              loading="lazy"
              decoding="async"
              className="h-auto w-full object-contain"
            />
          </motion.div>
        </div>

        {marqueeFeatures.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative overflow-hidden pb-3"
          >
            <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-linear-to-r from-white to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-linear-to-l from-white to-transparent" />
            <div className="marquee-track flex gap-6">
              {marqueeFeatures.map((feature, index) => (
                <motion.div
                  key={`${feature.id}-${index}`}
                  variants={cardVariants}
                  className="shrink-0 w-72 md:w-80 lg:w-96 flex flex-col items-center group"
                >
                  <motion.div
                    className="relative w-full aspect-16/10 rounded-2xl shadow-md overflow-hidden mb-5 cursor-pointer"
                    whileHover={{
                      y: -8,
                      boxShadow:
                        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <motion.img
                      src={feature.image}
                      alt={feature.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.08 }}
                      transition={{ duration: 0.5 }}
                    />
                    <div className="absolute inset-0 bg-linear-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  </motion.div>
                  <div className="px-4 text-center">
                    <h3 className="text-lg font-bold text-gray-800 leading-snug group-hover:text-[#3d8bff] transition-colors duration-300">
                      {feature.title}
                    </h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default WhyChooseUs;
