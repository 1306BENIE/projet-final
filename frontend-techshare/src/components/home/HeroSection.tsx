import { motion } from "framer-motion";
import { Star, Search } from "lucide-react";
import { Link } from "react-router-dom";

const svgTech = (
  <svg
    viewBox="0 0 300 300"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-64 h-64 hidden md:block absolute right-0 top-1/2 -translate-y-1/2 z-0 opacity-80 pointer-events-none"
  >
    <circle cx="150" cy="150" r="120" fill="url(#paint0_radial)" />
    <rect
      x="80"
      y="80"
      width="140"
      height="140"
      rx="32"
      fill="#fff"
      fillOpacity="0.15"
    />
    <rect
      x="110"
      y="110"
      width="80"
      height="80"
      rx="20"
      fill="#fff"
      fillOpacity="0.25"
    />
    <defs>
      <radialGradient
        id="paint0_radial"
        cx="0"
        cy="0"
        r="1"
        gradientTransform="translate(150 150) scale(120)"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#38bdf8" />
        <stop offset="1" stopColor="#7c3aed" />
      </radialGradient>
    </defs>
  </svg>
);

export default function HeroSection() {
  return (
    <section className="relative flex flex-col md:flex-row items-center justify-center px-2 sm:px-4 pt-16 pb-20 w-full bg-gradient-to-br from-blue-600 via-violet-500 to-cyan-400 overflow-hidden min-h-[480px]">
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-cyan-400/30 rounded-full blur-2xl opacity-40 animate-pulse z-0" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: "spring" }}
        className="max-w-6xl w-full text-center md:text-left relative z-10"
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl md:text-4xl font-['Poppins'] font-extrabold text-white mb-4 leading-tight drop-shadow-lg"
        >
          Louez, partagez & économisez{" "}
          <span className="text-cyan-200">Tech </span>
          <span className="text-white/80">Equipment</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg md:text-2xl text-white/90 mb-8 max-w-xl"
        >
          La plateforme de location d'outils informatiques la plus moderne et
          sécurisée en Côte d'Ivoire.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
        >
          <Link
            to="/auth/register"
            className="bg-white text-primary text-[#4D5BFF] font-bold px-8 py-3 rounded-xl shadow-waouh hover:bg-cyan-100/90 hover:text-[#4D5BFF] text-lg flex items-center justify-center gap-2 ring-2 ring-cyan-200/30 focus:ring-cyan-400 hover:scale-105 transition-transform duration-200 max-w-xs mx-auto sm:mx-0"
          >
            <Star className="w-5 h-5" />
            Commencer
          </Link>
          <Link
            to="/tools"
            className="bg-transparent border-2 border-white text-white font-bold px-8 py-3 rounded-xl hover:bg-transparent hover:text-white text-lg flex items-center justify-center gap-2 hover:scale-105 transition-transform duration-200 max-w-xs mx-auto sm:mx-0"
          >
            <Search className="w-5 h-5" />
            Voir les outils
          </Link>
        </motion.div>
      </motion.div>
      {svgTech}
    </section>
  );
}
