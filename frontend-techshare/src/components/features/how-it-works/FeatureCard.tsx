import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
}

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  index,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
      }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
      className="relative bg-gradient-to-br from-white to-cyan-50/30 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group h-[320px] flex flex-col"
    >
      {/* Effet de brillance au survol */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-violet-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
        className="flex justify-center mb-8 mt-4"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-cyan-50 to-violet-50 rounded-xl flex items-center justify-center group-hover:from-cyan-100 group-hover:to-violet-100 transition-all duration-300 shadow-sm">
          <Icon className="w-10 h-10 text-cyan-600 group-hover:text-violet-600 transition-colors duration-300" />
        </div>
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 + 0.4 }}
        className="text-xl font-semibold text-gray-900 mb-4 text-center group-hover:text-cyan-600 transition-colors duration-300 font-sans"
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 + 0.5 }}
        className="text-gray-600 leading-relaxed text-center font-sans text-base flex-grow"
      >
        {description}
      </motion.p>
    </motion.div>
  );
}
