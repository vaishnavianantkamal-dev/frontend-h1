import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
// import { cmsService } from "../../api/services/cms"; // Hobit1: old cleaning CMS text not used
import { hobit1Categories } from "../../data/hobit1Services";


// OLD cleaning-only cards (pre-Hobit1) — not used.
// const STATIC_SERVICES = [
//   { id: "window-cleaning", name: "Window Cleaning", image: "/services/windose.png" },
//   { id: "kitchen-cleaning-static", name: "Kitchen Cleaning", image: "/services/Kitchen_Cleaning.png" },
//   { id: "surface-cleaning", name: "Surface Cleaning", image: "/services/Surface_Cleaning.png" },
//   { id: "mopping-static", name: "Mopping", image: "/services/mopping.png" },
//   { id: "scrubbing", name: "Scrubbing", image: "/services/Scrubbing.png" },
//   { id: "disinfecting", name: "Disinfecting", image: "/services/Disinfecting.png" },
// ];

// Hobit1: one card per service category (src/data/hobit1Services.js).
const STATIC_SERVICES = hobit1Categories.map((c) => ({
  id: c.slug,
  name: c.name,
  image: c.image,
}));

const getHomeServiceLabel = (name) => {
  if (!name) return "";
  let base = String(name);
  base = base.replace(/^\s*\d+\s*bhk\s*/i, "").trim();
  if (!base) return String(name);
  return base
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
};


function ServiceTitle({ name }) {
  const fullLabel = getHomeServiceLabel(name);
  const needsTruncate = fullLabel.length > 28;
  const displayLabel = needsTruncate
    ? `${fullLabel.slice(0, 28)}...`
    : fullLabel;

  return (
    <div className="flex flex-col items-center gap-1">
      <p className="text-center text-lg font-semibold text-slate-900">
        {displayLabel}
      </p>
      {needsTruncate && (
        <span className="text-xs font-semibold text-[#3d8bff] underline underline-offset-2">
          Read more
        </span>
      )}
    </div>
  );
}

function ServicesSection() {
  const [serviceData] = useState(null);

  // Hobit1: old cleaning CMS text ("Book Trusted Cleaning Help") not used.
  // useEffect(() => {
  //   const fetchServiceData = async () => {
  //     try {
  //       const response = await cmsService.getServiceData();
  //       if (response.success && response.data) {
  //         setServiceData(response.data);
  //       }
  //     } catch (error) {
  //       console.error("Failed to fetch service data:", error);
  //     }
  //   };
  //   fetchServiceData();
  // }, []);

  const getDescriptionParts = () => {
    if (!serviceData?.description) return { part1: null, part2: null };
    // Split by <br> tags (ignoring case and variations)
    // The API example has \n</br>\n, so we target the tag.
    const parts = serviceData.description.split(/<\/br>|<br\s*\/?>/i);
    return {
      part1: parts[0]?.trim(),
      part2: parts.slice(1).join(" ").trim(),
    };
  };


  const { part1, part2 } = getDescriptionParts();
  const baseServices = STATIC_SERVICES;
  const marqueeServices = [...baseServices, ...baseServices];

  return (
    <section id="services" className="w-full space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center gap-3 text-center px-4"
      >
        <div className="inline-flex items-center gap-2  px-3 py-1 text-base font-medium text-[#3d8bff]">
          <span>{serviceData?.short_heading || "Our Services"}</span>
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-4xl">
          {serviceData?.heading || "Trusted Home Services in Nashik"}
        </h2>
        <p className="max-w-xl text-lg text-zinc-600">
          {serviceData
            ? part1
            : "Deep cleaning, pest control, painting, electrical, plumbing and carpentry—all booked in one place."}
        </p>
        <p className="text-base text-zinc-500">
          {serviceData
            ? part2
            : "All services are delivered by verified professionals and managed by Hobit1."}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative overflow-hidden pb-6"
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-linear-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-linear-to-l from-white to-transparent" />
        <div className="marquee-track flex gap-6">
          {marqueeServices.map((service, index) => (
            <Link
              key={`${service.name}-${index}`}
              to={`/book/service?category=${service.id}`}
              className="flex flex-col gap-4 shrink-0 cursor-pointer"
            >
              <div className="group relative h-[300px] w-[360px] overflow-hidden rounded-[32px] border border-zinc-100 bg-white shadow-sm transition hover:shadow-xl">
                <img
                  src={service.image}
                  alt={service.name}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
              </div>
              <ServiceTitle name={service.name} />
            </Link>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

export default ServicesSection;
