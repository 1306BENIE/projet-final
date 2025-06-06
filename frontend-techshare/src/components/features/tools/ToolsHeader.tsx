import { PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function ToolsHeader() {
  return (
    <>
      {/* Header immersif */}
      <div className="relative max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 pt-24 pb-20 flex flex-col items-center text-center">
        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl font-['Poppins'] font-extrabold text-white drop-shadow-lg mb-3 sm:mb-4 tracking-tight"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            delay: 0.1,
            type: "spring",
            bounce: 0.2,
          }}
        >
          Tous les outils disponibles
        </motion.h1>
        <motion.p
          className="text-white/90 text-base sm:text-lg max-w-2xl mx-auto drop-shadow-md px-2 sm:px-0"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            delay: 0.22,
            type: "spring",
            bounce: 0.2,
          }}
        >
          Parcourez notre catalogue d'équipements tech à louer partout en Côte
          d'Ivoire. Trouvez l'outil idéal pour vos besoins professionnels ou
          personnels.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            delay: 0.34,
            type: "spring",
            bounce: 0.2,
          }}
        >
          <motion.div
            whileHover={{ scale: 1.07, rotate: -2 }}
            whileTap={{ scale: 0.97, rotate: 1 }}
          >
            <Link
              to="/tools/add"
              className="mt-6 sm:mt-8 inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-base sm:text-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2"
              style={{ boxShadow: "0 4px 24px 0 rgba(0,180,216,0.10)" }}
            >
              <PlusCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              Ajouter un outil
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
