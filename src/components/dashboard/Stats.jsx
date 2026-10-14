import { motion } from "framer-motion";

export default function Stats({ stats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
      {stats.map((stat, idx) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition"
        >
          <div
            className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-4`}
          >
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </div>
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">
            {stat.label}
          </p>
          <p className="text-2xl font-black text-slate-900">{stat.value}</p>
        </motion.div>
      ))}
    </div>
  );
}
