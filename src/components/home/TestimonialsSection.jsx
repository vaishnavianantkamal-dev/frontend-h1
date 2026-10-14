import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cmsService } from "../../api/services/cms";

const TestimonialsSection = () => {
  const containerRef = useRef(null);

  const [shortHeading, setShortHeading] = useState("Customer Stories");
  const [heading] = useState("Life with Hobit1");
  const [description, setDescription] = useState(
    "What changes when your home runs on a system instead of follow-ups.",
  );

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const res = await cmsService.getTestimonialsData();
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];

        if (!isMounted || list.length === 0) return;

        const first = list[0];

        setShortHeading(first?.short_heading || "Customer Stories");
        // Hobit1: old CMS heading ("Life with hobit") not used.
        // setHeading(first?.heading || "Loved by Nashik Homes");
        setDescription(
          first?.description ||
            "What changes when your home runs on a system instead of follow-ups.",
        );
      } catch {
        // keep defaults on error
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const x1 = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const x2 = useTransform(scrollYProgress, [0, 1], ["10%", "-10%"]);

  const testimonials = [
    // Hobit1: old daily-maid review (id 1) — not used.
    // {
    //   id: 1,
    //   name: "Yogesh Nagpure",
    //   locality: "College Road",
    //   rating: 5,
    //   text: "Living in College Road, it's hard to find reliable help. Hobit saved me 5 hours a week. No more stress about unexpected leaves.",
    //   avatar: "/images/testimonials/yogesh-nagpure.jpg",
    // },
    // Hobit1: old daily-maid review (id 2) — not used.
    // {
    //   id: 2,
    //   name: "Nikita Badgujar",
    //   locality: "Gangapur Road",
    //   rating: 5,
    //   text: "The best part? No daily follow-ups. My home is always clean when I return from work. It's a system that just works.",
    //   avatar: "/images/testimonials/nikita-badgujar.jpg",
    // },
    {
      id: 3,
      name: "Yogesh Lodha",
      locality: "Indira Nagar",
      rating: 5,
      text: "I used to spend weekends cleaning. Now Hobit handles it. The peace of mind knowing a professional is on the job is priceless.",
      avatar: "/images/testimonials/yogesh-lodha.jpg",
    },
    // Hobit1: old daily-maid review (id 4) — not used.
    // {
    //   id: 4,
    //   name: "Roshan Bachhav",
    //   locality: "Pathardi Phata",
    //   rating: 5,
    //   text: "Service in Pathardi Phata is usually hit or miss, but Hobit is consistent. Saved me the headache of bargaining and constant supervision.",
    //   avatar: "/images/testimonials/roshan-bachhav.jpg",
    // },
    {
      id: 5,
      name: "Priya Sharma",
      locality: "Mahatmanagar",
      rating: 5,
      text: "Deep cleaning my bungalow was a nightmare before. Hobit's team finished it in half the time. Zero stress involved.",
      avatar: "/images/testimonials/priya-sharma.jpg",
    },
    {
      id: 6,
      name: "Amit Deshmukh",
      locality: "Govind Nagar",
      rating: 5,
      text: "Finally, a service that values time. I've reclaimed my Sunday mornings. The professionalism reduces so much daily anxiety.",
      avatar: "/images/testimonials/amit-deshmukh.jpg",
    },
    {
      id: 7,
      name: "Sneha Kulkarni",
      locality: "Serene Meadows",
      rating: 5,
      text: "Needed trustworthy help in Serene Meadows. Hobit professionals are verified and punctual. It's not just cleaning, it's a stress-free lifestyle.",
      avatar: "/images/testimonials/sneha-kulkarni.jpg",
    },
    {
      id: 8,
      name: "Rahul Patil",
      locality: "Ashok Stambh",
      rating: 5,
      text: "Quick response for my home. The time I saved on finding a professional was worth every penny. No more chasing people around.",
      avatar: "/images/testimonials/rahul-patil.jpg",
    },
  ];

  const firstRow = testimonials.slice(0, 3);
  const secondRow = testimonials.slice(3);

  const StarRating = ({ rating }) => (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < rating ? "text-amber-400" : "text-zinc-300"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );

  const TestimonialCard = ({ testimonial }) => (
    <div className="group relative shrink-0 w-[320px] sm:w-[380px] mx-3 sm:mx-4 p-4">
      <div className="relative h-full rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm transition-all duration-300 group-hover:border-[#3d8bff]/30 group-hover:shadow-lg group-hover:shadow-[#3d8bff]/10">
        {/* Quote icon */}
        <div className="absolute -top-3 left-6 bg-linear-to-br from-[#3d8bff] to-[#7b5cff] p-2 rounded-xl shadow-lg shadow-[#3d8bff]/25">
          <svg
            className="w-4 h-4 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
        </div>

        {/* Content */}
        <div className="mt-4">
          <StarRating rating={testimonial.rating} />
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-zinc-600 line-clamp-4">
            {testimonial.text}
          </p>
        </div>

        {/* Author */}
        <div className="flex items-center gap-3 mt-5 pt-4 border-t border-zinc-100">
          <div className="relative">
            <img
              src={testimonial.avatar}
              alt={testimonial.name}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-zinc-100"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=3d8bff&color=fff&size=128`;
              }}
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900">
              {testimonial.name}
            </p>
            <p className="text-xs text-zinc-500">{testimonial.locality}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section
      ref={containerRef}
      id="testimonials"
      className="py-16 lg:py-24 bg-linear-to-b from-white via-zinc-50/50 to-white overflow-hidden"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="container mx-auto max-w-7xl px-4 mb-12 sm:mb-16 text-center"
      >
        <div className="inline-flex items-center gap-2  px-4 py-1.5 text-base font-medium text-[#3d8bff] mb-6">
          <span>{shortHeading}</span>
        </div>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
          {heading}
        </h2>
        <p className="text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto">
          {description}
        </p>
      </motion.div>

      {/* Scroll-Linked Rows */}
      <div className="space-y-6 sm:space-y-8">
        {/* Row 1 - Moves Left to Right */}
        <motion.div
          drag="x"
          className="cursor-grab active:cursor-grabbing"
          whileTap={{ cursor: "grabbing" }}
        >
          <motion.div style={{ x: x1 }} className="flex w-max">
            {/* Repeat array to ensure enough width for scrolling effect */}
            {[...firstRow, ...firstRow, ...firstRow].map(
              (testimonial, index) => (
                <TestimonialCard
                  key={`row1-${testimonial.id}-${index}`}
                  testimonial={testimonial}
                />
              ),
            )}
          </motion.div>
        </motion.div>

        {/* Row 2 - Moves Right to Left */}
        <motion.div
          drag="x"
          className="cursor-grab active:cursor-grabbing"
          whileTap={{ cursor: "grabbing" }}
        >
          <motion.div style={{ x: x2 }} className="flex w-max">
            {/* Repeat array to ensure enough width for scrolling effect */}
            {[...secondRow, ...secondRow, ...secondRow].map(
              (testimonial, index) => (
                <TestimonialCard
                  key={`row2-${testimonial.id}-${index}`}
                  testimonial={testimonial}
                />
              ),
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
