import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// Hobit1: steps and images are local now; the old cleaning-only CMS
// how-it-works data (cmsService.getHowItWorksData) is no longer used.
const STEPS = [
  {
    title: "Choose Your Service",
    subtitle: "Pick the service your home needs and see transparent pricing.",
    image: "/images/Woman%20Exploring%20Home%20Services%20App.png",
    alt: "Woman choosing a home service in the Hobit1 app",
  },
  {
    title: "Pick a Time Slot",
    subtitle: "Choose a convenient date and time that works for you.",
    image: "/images/Hobit1%20Time%20Slot%20Booking%20Workspace.png",
    alt: "Calendar and clock for picking a Hobit1 time slot",
  },
  {
    title: "Relax, We're On Our Way",
    subtitle: "Get instant confirmation and a verified professional at your door.",
    image: "/images/Friendly%20Electrician%20Doorstep%20Visit.png",
    alt: "Verified Hobit1 professional arriving at a customer's door",
  },
];

function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="container mx-auto max-w-7xl px-4 py-12"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-2xl text-center mb-14"
      >
        <div className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#3d8bff]">
          How It Works
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">
          Simple Steps to a Well-Kept Home
        </h2>
        <p className="text-lg text-zinc-600">
          Book in less time than it takes to call around. No negotiations, no
          uncertainty—just fixed prices, clear slots and instant confirmations.
        </p>
      </motion.div>

      <div className="grid gap-12 md:grid-cols-3 md:gap-8">
        {STEPS.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            className="group relative rounded-3xl border border-[#3d8bff]/10 bg-linear-to-b from-[#3d8bff]/10 to-[#3d8bff]/5 p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            {/* Step number badge */}
            <div className="absolute -top-5 left-4 z-10 flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-[#3d8bff] text-lg font-bold text-white shadow-md">
              {String(index + 1).padStart(2, "0")}
            </div>

            {/* Dashed connector to the next card (desktop only) */}
            {index < STEPS.length - 1 && (
              <div className="absolute top-3 -right-8 hidden w-8 border-t-2 border-dashed border-[#3d8bff]/40 md:block" />
            )}

            <div className="aspect-[1478/1064] overflow-hidden rounded-2xl bg-white">
              <img
                src={step.image}
                alt={step.alt}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            <div className="px-3 pt-5 pb-4">
              <h3 className="mb-2 text-xl font-bold text-slate-900">
                {step.title}
              </h3>
              <p className="leading-relaxed text-zinc-600">{step.subtitle}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Link
          to="/book"
          className="inline-flex items-center gap-2 rounded-full bg-[#3d8bff] px-8 py-3 text-base font-semibold text-white shadow-md shadow-[#3d8bff]/40 transition hover:-translate-y-0.5 hover:bg-[#3f5ce6] hover:shadow-lg"
        >
          Book a Service
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}

export default HowItWorksSection;
