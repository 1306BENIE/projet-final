import { MapPin, Star, ShieldCheck, Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { Tool } from "@/interfaces/tools/tool";
import { useState } from "react";
import { useAuth } from "@/store/useAuth";
import { toast } from "react-hot-toast";
import { BookingModal } from "@/components/features/booking/BookingModal";

interface ToolCardProps {
  tool: Tool;
  index?: number;
}

const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent";

export default function ToolCard({ tool, index = 0 }: ToolCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleReserve = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Vous devez être connecté pour réserver un outil");
      navigate("/login");
      return;
    }
    setIsBookingModalOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: 0.08 * index,
        type: "spring",
        bounce: 0.2,
      }}
      className="h-full w-full max-w-none mx-0"
    >
      <Link
        to={`/tools/${tool.id}`}
        className="block group h-full relative cursor-pointer"
        tabIndex={0}
        aria-label={`Voir les détails de ${tool.name}`}
      >
        <div className="relative bg-white/20 backdrop-blur-xl border-2 border-transparent group-hover:shadow-cyan-200/60 rounded-3xl shadow-xl hover:shadow-2xl overflow-hidden flex flex-col h-full transition-all duration-300 group-hover:scale-[1.04] group-hover:-translate-y-1">
          <div className="relative h-48 w-full flex items-center justify-center overflow-hidden">
            {!imageLoaded && (
              <div
                className={`absolute inset-0 bg-gray-200 rounded-2xl ${shimmer}`}
              />
            )}
            <img
              src={
                tool.images && tool.images.length > 0
                  ? tool.images[0]
                  : "/placeholder.png"
              }
              alt={tool.name}
              className={`w-full h-full object-cover rounded-2xl shadow-md transition-all duration-300 ${
                imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
              } group-hover:scale-105 group-active:scale-105`}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setImageLoaded(true);
              }}
            />
            {imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-2xl">
                <span className="text-gray-400 text-sm">
                  Image non disponible
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-black/20 group-hover:from-black/60 group-hover:to-black/40 transition-all duration-300" />
            <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                className="bg-white/95 text-cyan-600 font-semibold px-6 py-2.5 rounded-xl shadow-lg hover:bg-white transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 will-change-transform"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/tools/${tool.id}`);
                }}
                aria-label="Voir les détails"
              >
                Voir
              </button>
              {tool.status === "available" && (
                <button
                  className="bg-cyan-500/95 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg hover:bg-cyan-500 transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 will-change-transform"
                  onClick={handleReserve}
                  aria-label="Réserver cet outil"
                >
                  Réserver
                </button>
              )}
            </div>
            <span className="absolute top-3 right-3 bg-emerald-100 text-emerald-700 font-bold text-xs px-4 py-1.5 rounded-full shadow-md">
              {tool.status === "available" ? "Disponible" : "Indisponible"}
            </span>
            <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-primary font-bold text-xs px-3 py-1 rounded-xl shadow-md">
              {tool.dailyPrice} FCFA/jour
            </span>
          </div>
          <div className="p-6 flex-1 flex flex-col min-h-[200px] overflow-hidden">
            <div className="flex items-center justify-between mb-2 gap-4">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <h3 className="font-['Poppins'] font-semibold text-xl text-primary group-hover:text-cyan-700 transition-colors truncate flex-1">
                  {tool.name}
                </h3>
                {tool.createdAt &&
                  new Date(tool.createdAt).getTime() >
                    Date.now() - 7 * 24 * 60 * 60 * 1000 && (
                    <span className="bg-cyan-500 text-white font-bold text-xs px-3 py-1 rounded-full shadow-md flex-shrink-0">
                      Nouveau
                    </span>
                  )}
              </div>
            </div>
            <div className="flex items-center gap-2 mb-3">
              {typeof tool.rating === "number" && (
                <span className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                  <Star className="w-4 h-4 fill-yellow-400" />
                  {tool.rating.toFixed(1)}
                </span>
              )}
              {tool.category && (
                <span className="ml-auto flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold shadow-md bg-cyan-100 text-cyan-700">
                  {tool.category}
                </span>
              )}
            </div>
            <p className="text-gray-700 text-sm mb-4 flex-1 line-clamp-2 min-h-[40px]">
              {tool.description}
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 gap-2 min-w-0">
              <div className="flex items-center gap-2 text-sm text-gray-600 min-w-0 flex-1">
                <MapPin className="w-4 h-4 flex-shrink-0 text-cyan-600" />
                <span className="truncate">{tool.address}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {tool.isInsured && (
                  <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold whitespace-nowrap">
                    <ShieldCheck className="w-4 h-4" /> Assuré
                  </span>
                )}
                <button
                  tabIndex={-1}
                  className="p-2 rounded-full bg-white hover:bg-cyan-100 text-cyan-500 shadow transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 will-change-transform flex-shrink-0"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toast.success("Fonctionnalité des favoris à venir");
                  }}
                  aria-label="Ajouter aux favoris"
                >
                  <Heart className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500 truncate">
              {tool.owner && (
                <span>
                  Propriétaire : {tool.owner.firstName} {tool.owner.lastName}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>

      <AnimatePresence>
        {isBookingModalOpen && (
          <BookingModal
            isOpen={isBookingModalOpen}
            onClose={() => setIsBookingModalOpen(false)}
            tool={tool}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
