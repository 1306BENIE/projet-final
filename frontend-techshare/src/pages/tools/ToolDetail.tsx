import { useParams, useNavigate } from "react-router-dom";
import { MapPin, X, ShieldCheck, Star, User, Repeat2 } from "lucide-react";
import { motion } from "framer-motion";

const mockTools = [
  {
    id: 1,
    name: "MacBook Pro M1",
    description: "Puissant ordinateur portable pour les professionnels.",
    price: "15,000 FCFA",
    priceValue: 15000,
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80",
    location: "Abidjan",
    status: "available",
    category: "Ordinateur",
    rating: 4.8,
    reviewsCount: 32,
    owner: {
      name: "BENIE SYLVESTRE",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    rentalCount: 12,
    isInsured: true,
  },
  {
    id: 2,
    name: "iPad Pro",
    description: "Tablette polyvalente pour la créativité.",
    price: "10,000 FCFA",
    priceValue: 10000,
    image:
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80",
    location: "Abidjan",
    status: "available",
    category: "Tablette",
    rating: 4.6,
    reviewsCount: 18,
    owner: {
      name: "Fatou Bamba",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    rentalCount: 7,
    isInsured: true,
  },
  {
    id: 3,
    name: "DJI Mavic Air 2",
    description: "Drone compact pour la photographie aérienne.",
    price: "25,000 FCFA",
    priceValue: 25000,
    image:
      "https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?auto=format&fit=crop&w=400&q=80",
    location: "Abidjan",
    status: "available",
    category: "Drone",
    rating: 4.9,
    reviewsCount: 41,
    owner: {
      name: "Ali Koné",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    },
    rentalCount: 21,
    isInsured: false,
  },
  {
    id: 4,
    name: "Sony Alpha A6400",
    description: "Appareil photo hybride pour la photo et la vidéo 4K.",
    price: "20,000 FCFA",
    priceValue: 20000,
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80",
    location: "Abidjan",
    status: "available",
    category: "Appareil photo",
    rating: 4.7,
    reviewsCount: 25,
    owner: {
      name: "Marie Koffi",
      avatar: "https://randomuser.me/api/portraits/women/46.jpg",
    },
    rentalCount: 15,
    isInsured: true,
  },
];

export default function ToolDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const tool = mockTools.find((t) => t.id === Number(id));

  if (!tool) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-500">Outil introuvable.</div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-blue-500 via-violet-500 to-cyan-400 py-16 px-2 sm:px-4 overflow-x-hidden">
      {/* Effet de fond lumineux */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-white/80 via-white/60 to-transparent" />
      <div className="absolute inset-0 -z-20 pointer-events-none">
        <div className="absolute top-10 left-1/3 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl opacity-40 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-400/20 rounded-full blur-2xl opacity-30 animate-pulse" />
      </div>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, type: "spring", bounce: 0.18 }}
          className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 sm:p-10 flex flex-col md:flex-row gap-10 items-center md:items-stretch relative z-10"
        >
          {/* Image avec effet */}
          <motion.div
            whileHover={{ scale: 1.04, rotate: -2 }}
            className="flex-1 flex items-center justify-center min-w-[260px] max-w-xs mx-auto md:mx-0"
          >
            <img
              src={
                tool.images && tool.images.length > 0
                  ? tool.images[0]
                  : "/placeholder.png"
              }
              alt={tool.name}
              className="w-full rounded-2xl shadow-xl object-cover transition-all duration-300 hover:shadow-2xl hover:brightness-105 hover:scale-105"
              style={{ aspectRatio: "1.1/1" }}
            />
          </motion.div>
          {/* Détails */}
          <div className="flex-1 flex flex-col justify-between gap-4">
            {/* Croix de fermeture en haut à droite */}
            <button
              onClick={() => navigate(-1)}
              className="absolute top-4 right-4 z-20 bg-white/80 hover:bg-cyan-100 text-cyan-700 rounded-full p-2 shadow transition-colors border border-white/60 backdrop-blur-md"
              aria-label="Fermer la fiche"
            >
              <X className="w-6 h-6" />
            </button>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-cyan-900 mb-2 font-poppins drop-shadow-lg">
              {tool.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="text-cyan-600 font-bold text-2xl bg-cyan-50 px-4 py-1.5 rounded-xl shadow">
                {tool.dailyPrice} FCFA{" "}
                <span className="text-base font-normal">/jour</span>
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${
                  tool.status === "available"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {tool.status === "available" ? "Disponible" : "Indisponible"}
              </span>
              <span className="flex items-center gap-1 text-gray-500 bg-white/80 px-3 py-1 rounded-xl">
                <MapPin className="w-4 h-4" /> {tool.location}
              </span>
              <span className="flex items-center gap-1 text-cyan-700 bg-cyan-100 px-3 py-1 rounded-xl font-semibold">
                {tool.category}
              </span>
              {tool.isInsured && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4" /> Assuré
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 mb-2">
              <span className="flex items-center gap-1 text-yellow-500 font-bold text-lg">
                <Star className="w-5 h-5 fill-yellow-400" />
                {tool.rating}
              </span>
              <span className="text-gray-500 text-sm">
                ({tool.reviewsCount} avis)
              </span>
              <span className="flex items-center gap-1 text-cyan-700 text-sm bg-cyan-50 px-3 py-1 rounded-xl">
                <Repeat2 className="w-4 h-4" /> {tool.rentalCount} locations
              </span>
            </div>
            <p className="text-gray-700 text-base mb-4 leading-relaxed">
              {tool.description}
            </p>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-8 rounded-2xl shadow-lg transition-all text-lg w-fit mt-2"
            >
              Réserver cet outil
            </motion.button>
            {/* Propriétaire */}
            <div className="flex items-center gap-4 mt-6 bg-cyan-50/60 rounded-xl px-4 py-3 shadow-inner w-fit">
              <span className="font-semibold text-cyan-900 flex items-center gap-1">
                <User className="w-4 h-4" />{" "}
                {tool.owner
                  ? `${tool.owner.firstName} ${tool.owner.lastName}`
                  : ""}
              </span>
              <div>
                <div className="text-xs text-gray-500">Propriétaire</div>
              </div>
            </div>
          </div>
        </motion.div>
        {/* Section avis mock */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            delay: 0.2,
            type: "spring",
            bounce: 0.18,
          }}
          className="mt-10 bg-white/80 rounded-2xl shadow-lg p-6 max-w-2xl mx-auto"
        >
          <h2 className="text-xl font-bold text-cyan-900 mb-4">Avis récents</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <img
                src="https://randomuser.me/api/portraits/men/12.jpg"
                alt=""
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className="font-semibold text-cyan-800 flex items-center gap-1">
                  Moussa Traoré{" "}
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />{" "}
                  5.0
                </div>
                <div className="text-gray-600 text-sm">
                  Super expérience, matériel impeccable et propriétaire très
                  réactif !
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <img
                src="https://randomuser.me/api/portraits/women/22.jpg"
                alt=""
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className="font-semibold text-cyan-800 flex items-center gap-1">
                  Awa Kone{" "}
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />{" "}
                  4.8
                </div>
                <div className="text-gray-600 text-sm">
                  Location facile, je recommande vivement !
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
