import { motion } from "framer-motion";
import { Mail, ArrowRight } from "lucide-react";

export default function Careers() {
  return (
    <div className="min-h-[80vh] bg-white px-4 py-20 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto text-center space-y-12"
      >
        <div className="space-y-6">
          <h1 className="text-3xl md:text-3xl font-black text-slate-900 tracking-tight">
            Careers at Hobit1
          </h1>
          <p className="text-lg md:text-lg text-zinc-600 leading-relaxed max-w-2xl mx-auto">
            We are always looking for passionate individuals to join our
            mission. If you want to be part of our journey, we'd love to hear
            from you.
          </p>
        </div>

        <div className="pt-12">
          <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6">
            Interested in joining our team? Reach out at:
          </p>

          <motion.a
            href="mailto:careers@hobit.com"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-4 px-8 py-5 rounded-3xl bg-zinc-50 border-2 border-zinc-100 hover:border-[#3d8bff]/30 hover:bg-blue-50/30 transition-all group"
          >
            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:bg-[#3d8bff] transition-colors">
              <Mail className="w-6 h-6 text-[#3d8bff] group-hover:text-white transition-colors" />
            </div>
            <div className="text-left">
              <span className="block text-xl md:text-2xl font-bold text-slate-900 group-hover:text-[#3d8bff] transition-colors">
                careers@hobit.club
              </span>
              <span className="text-sm text-zinc-500 font-medium flex items-center gap-1">
                Click to open your mail app <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </motion.a>
        </div>

        <div className="pt-20 text-zinc-400 text-sm font-medium">
          <p>© {new Date().getFullYear()} Hobit1 Careers • Nashik, India</p>
        </div>
      </motion.div>
    </div>
  );
}
