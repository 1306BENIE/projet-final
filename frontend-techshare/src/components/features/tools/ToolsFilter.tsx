import { Search, MapPin, DollarSign, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";
import type { ToolsFilterProps } from "@/interfaces/tools/tools";

export default function ToolsFilter({
  search,
  setSearch,
  location,
  setLocation,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  status,
  setStatus,
  resetFilters,
  resultsCount,
}: ToolsFilterProps) {
  return (
    <motion.div
      className="lg:sticky lg:top-4 z-10 max-w-7xl mx-auto mb-8 sm:mb-14 px-2 sm:px-4 lg:px-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.7,
        delay: 0.45,
        type: "spring",
        bounce: 0.18,
      }}
    >
      <div className="bg-white/60 backdrop-blur-xl shadow-2xl rounded-2xl sm:rounded-3xl max-w-sm mx-auto px-2 sm:max-w-2xl sm:mx-auto sm:px-6 lg:max-w-7xl lg:mx-auto lg:px-6 py-4 sm:py-6 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 lg:gap-6 border border-white/40">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 w-full items-center lg:flex lg:flex-row lg:gap-6 lg:w-full lg:items-center lg:justify-center">
          <div className="relative w-full lg:w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
            <input
              type="text"
              placeholder="Rechercher par nom..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400 outline-none bg-white/80 w-full min-w-0"
            />
          </div>
          <div className="relative w-full lg:w-40">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
            <input
              type="text"
              placeholder="Localisation..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10 pr-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400 outline-none bg-white/80 w-full min-w-0"
            />
          </div>
          <div className="relative w-28">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
            <input
              type="number"
              placeholder="Prix min"
              value={minPrice}
              min={0}
              max={maxPrice}
              onChange={(e) => setMinPrice(Number(e.target.value))}
              className="pl-10 pr-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400 outline-none bg-white/80 w-full min-w-0"
            />
          </div>
          <div className="relative w-28">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
            <input
              type="number"
              placeholder="Prix max"
              value={maxPrice}
              min={minPrice}
              max={100000}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="pl-10 pr-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400 outline-none bg-white/80 w-full min-w-0"
            />
          </div>
          <div className="w-36">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400 outline-none bg-white/80 w-full min-w-0"
            >
              <option value="">Tous les statuts</option>
              <option value="available">Disponible</option>
              <option value="unavailable">Indisponible</option>
            </select>
          </div>
          <div className="w-36">
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-50 text-cyan-700 font-semibold hover:bg-cyan-100 transition-colors border border-cyan-100 shadow-sm w-full"
              type="button"
            >
              <RefreshCcw className="w-4 h-4" /> Réinitialiser
            </button>
          </div>
        </div>
        <div className="text-sm text-cyan-900 font-medium mt-2 md:mt-0 text-center md:text-right w-full md:w-auto">
          {resultsCount} résultat{resultsCount > 1 ? "s" : ""}
        </div>
      </div>
    </motion.div>
  );
}
