import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  useInView,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { adminService } from "../../api/services/admin";

const Counter = ({ value }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20px" });
  const count = useMotionValue(0);

  const numericValue = parseInt(value.replace(/[^0-9]/g, ""), 10);
  const suffix = value.includes("+") ? "+" : "";

  useEffect(() => {
    if (isInView) {
      animate(count, numericValue, { duration: 2.5, ease: "easeOut" });
    }
  }, [isInView, numericValue, count]);

  const displayValue = useTransform(count, (latest) => {
    return Math.round(latest).toLocaleString() + suffix;
  });

  return <motion.span ref={ref}>{displayValue}</motion.span>;
};

function OnDemandSection() {
  const [stats, setStats] = useState([
    { label: "Nashik homes using Hobit1", value: "20+" },
    { label: "Hours of follow-ups eliminated", value: "100+" },
    { label: "Verified professionals onboarded", value: "50+" },
  ]);

  useEffect(() => {
    const fetchDashboardCounts = async () => {
      try {
        const data = await adminService.getDashboardCounts();
        setStats([
          {
            label: "Nashik homes using Hobit1",
            value: data.total_bookings.toString(),
          },
          {
            label: "Hours of follow-ups eliminated",
            value: Math.round(data.total_hours).toString(),
          },
          {
            label: "Verified professionals onboarded",
            value: data.total_workers.toString(),
          },
        ]);
      } catch (error) {
        console.error("Error fetching dashboard counts:", error);
      }
    };

    fetchDashboardCounts();
  }, []);

  return (
    <section className="w-full px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center text-center mb-10 space-y-4">
          <div className="inline-flex items-center gap-2  px-3 py-1 text-base font-medium text-[#3d8bff]">
            <span>Trusted in Nashik</span>
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-4xl"
          >
            A System That's Already Working
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-2xl text-lg text-zinc-600"
          >
            <p>Growing slowly to ensure quality never breaks.</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              whileHover={{ y: -5 }}
              className="flex flex-col items-center justify-center rounded-4xl border border-zinc-100 bg-white p-10 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-lg"
            >
              <h3 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-2">
                <Counter value={stat.value} />
              </h3>
              <p className="text-base font-medium text-zinc-500">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default OnDemandSection;
