import {
  X,
  Calendar,
  CreditCard,
  StickyNote,
  User,
  MapPin,
  Clock,
  Shield,
  Star,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Info,
  Phone,
  Mail,
  ExternalLink,
} from "lucide-react";
import { Booking } from "@/interfaces/booking/booking.interface";
import { Tool } from "@/interfaces/tools/tool";
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { ContractModal } from "./ContractModal";

function formatDateFr(dateStr: string) {
  if (!dateStr) return "Date inconnue";
  try {
    return format(new Date(dateStr), "d MMMM yyyy", { locale: fr });
  } catch {
    return dateStr;
  }
}

function formatTime(dateStr: string) {
  return format(new Date(dateStr), "HH:mm", { locale: fr });
}

function translateStatus(status: string): string {
  const statusTranslations: Record<string, string> = {
    pending: "En attente",
    confirmed: "Confirmée",
    cancelled: "Annulée",
    completed: "Terminée",
    paid: "Payé",
    unpaid: "Non payé",
    pending_payment: "Paiement en attente",
    failed: "Échoué",
    refunded: "Remboursé",
  };

  return statusTranslations[status.toLowerCase()] || status;
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "confirmed":
      return "bg-green-100 text-green-800 border-green-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    case "completed":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

function getStatusIcon(status: string) {
  switch (status.toLowerCase()) {
    case "pending":
      return <Clock className="w-4 h-4" />;
    case "confirmed":
      return <CheckCircle className="w-4 h-4" />;
    case "cancelled":
      return <AlertCircle className="w-4 h-4" />;
    case "completed":
      return <TrendingUp className="w-4 h-4" />;
    default:
      return <Info className="w-4 h-4" />;
  }
}

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  tool: Tool;
}

export const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  isOpen,
  onClose,
  booking,
  tool,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "details" | "contact"
  >("overview");
  const [isContractOpen, setIsContractOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      rotateX: -15,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      rotateX: -15,
      transition: {
        duration: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const handleViewContract = () => {
    setIsContractOpen(true);
  };

  const handleCallOwner = () => {
    // Pour l'instant, on affiche une notification
    // TODO: Implémenter la fonctionnalité de contact téléphonique
    alert(
      "Fonctionnalité de contact téléphonique à implémenter. Veuillez contacter le propriétaire via l'application."
    );
  };

  const handleMessageOwner = () => {
    alert(
      "Fonctionnalité de messagerie à implémenter. Veuillez contacter le propriétaire via l'application."
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[75vh] overflow-hidden relative"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header avec gradient */}
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 p-4 text-white">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  Détails de la réservation
                </h2>
                <p className="text-blue-100 text-sm">
                  #{booking.id.slice(-8).toUpperCase()}
                </p>
              </div>
              <motion.button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 group"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5 group-hover:text-white" />
              </motion.button>
            </div>
          </div>

          {/* Navigation tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            {[
              {
                id: "overview",
                label: "Aperçu",
                icon: <Info className="w-4 h-4" />,
              },
              {
                id: "details",
                label: "Détails",
                icon: <Calendar className="w-4 h-4" />,
              },
              {
                id: "contact",
                label: "Contact",
                icon: <User className="w-4 h-4" />,
              },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() =>
                  setActiveTab(tab.id as "overview" | "details" | "contact")
                }
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
                }`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                {tab.icon}
                {tab.label}
              </motion.button>
            ))}
          </div>

          {/* Content */}
          <div className="p-3 max-h-[45vh] overflow-y-auto">
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="space-y-3"
                >
                  {/* Tool Card */}
                  <motion.div
                    variants={cardVariants}
                    className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-3 border border-gray-200 shadow-lg"
                  >
                    <div className="flex items-start gap-3">
                      <motion.div
                        className="relative"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <img
                          src={tool.images[0] || "/img/fallback-tool.png"}
                          alt={tool.name}
                          className="w-20 h-20 object-cover rounded-lg shadow-lg border-2 border-white"
                        />
                        <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-1 shadow-lg">
                          <Shield className="w-3 h-3" />
                        </div>
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                          {tool.name}
                        </h3>
                        <p className="text-gray-600 mb-1 text-sm truncate">
                          {(() => {
                            const brand =
                              tool.brand && tool.brand.trim() !== ""
                                ? tool.brand
                                : null;
                            const model =
                              tool.model && tool.model.trim() !== ""
                                ? tool.model
                                : null;

                            if (brand && model) {
                              return `${brand} ${model}`;
                            } else if (brand) {
                              return brand;
                            } else if (model) {
                              return model;
                            } else {
                              return "Détails non disponibles";
                            }
                          })()}
                        </p>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span className="font-semibold text-sm">
                              {tool.rating || 0}
                            </span>
                          </div>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-600 text-sm">
                            {tool.rentalCount || 0} locations
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 text-sm">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">
                            {tool.address || "Adresse non disponible"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Status Cards */}
                  <motion.div
                    variants={cardVariants}
                    className="grid grid-cols-1 md:grid-cols-2 gap-2"
                  >
                    <div
                      className={`p-2 rounded-lg border-2 ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      <div className="flex items-center gap-2">
                        {getStatusIcon(booking.status)}
                        <div>
                          <p className="font-semibold text-xs">
                            Statut réservation
                          </p>
                          <p className="text-xs capitalize">
                            {translateStatus(booking.status)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`p-2 rounded-lg border-2 ${getStatusColor(
                        booking.paymentStatus
                      )}`}
                    >
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-3 h-3" />
                        <div>
                          <p className="font-semibold text-xs">
                            Statut paiement
                          </p>
                          <p className="text-xs capitalize">
                            {translateStatus(booking.paymentStatus)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Price Card */}
                  <motion.div
                    variants={cardVariants}
                    className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 font-medium text-xs">
                          Prix total
                        </p>
                        <p className="text-lg font-bold text-green-700">
                          {booking.totalPrice.toLocaleString()} FCFA
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-600 font-medium text-xs">
                          Caution
                        </p>
                        <p className="text-base font-bold text-blue-700">
                          {tool.caution ? tool.caution.toLocaleString() : "0"}{" "}
                          FCFA
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {activeTab === "details" && (
                <motion.div
                  key="details"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="space-y-3"
                >
                  {/* Date Range */}
                  <motion.div
                    variants={cardVariants}
                    className="bg-blue-50 rounded-lg p-3 border border-blue-200"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Calendar className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Période de location
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                        <p className="text-xs text-gray-600 mb-1">Début</p>
                        <p className="text-base font-bold text-blue-700">
                          {formatDateFr(booking.startDate)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatTime(booking.startDate)}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                        <p className="text-xs text-gray-600 mb-1">Fin</p>
                        <p className="text-base font-bold text-blue-700">
                          {formatDateFr(booking.endDate)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatTime(booking.endDate)}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Tool Details */}
                  <motion.div
                    variants={cardVariants}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                      Détails de l'outil
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <p className="text-xs text-gray-600">Marque</p>
                        <p className="font-semibold text-sm">
                          {tool.brand && tool.brand.trim() !== ""
                            ? tool.brand
                            : "Non spécifiée"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Modèle</p>
                        <p className="font-semibold text-sm">
                          {tool.model && tool.model.trim() !== ""
                            ? tool.model
                            : "Non spécifié"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">État</p>
                        <p className="font-semibold text-sm capitalize">
                          {tool.etat && tool.etat.trim() !== ""
                            ? tool.etat
                            : "Non spécifié"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Catégorie</p>
                        <p className="font-semibold text-sm">
                          {tool.category && tool.category.trim() !== ""
                            ? tool.category
                            : "Non spécifiée"}
                        </p>
                      </div>
                    </div>
                    {tool.description && (
                      <div className="mt-3 p-3 bg-white rounded-lg border">
                        <p className="text-xs text-gray-600 mb-1">
                          Description
                        </p>
                        <p className="text-gray-800 text-sm">
                          {tool.description}
                        </p>
                      </div>
                    )}
                  </motion.div>

                  {/* Notes */}
                  {booking.notes && (
                    <motion.div
                      variants={cardVariants}
                      className="bg-yellow-50 rounded-lg p-3 border border-yellow-200"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <StickyNote className="w-4 h-4 text-yellow-600" />
                        <h3 className="text-base font-bold text-gray-900">
                          Notes
                        </h3>
                      </div>
                      <p className="text-gray-800 text-sm">{booking.notes}</p>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {activeTab === "contact" && (
                <motion.div
                  key="contact"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="space-y-3"
                >
                  {/* Owner Contact */}
                  <motion.div
                    variants={cardVariants}
                    className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 bg-purple-100 rounded-full">
                        <User className="w-4 h-4 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Propriétaire
                      </h3>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-purple-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {tool.owner?.firstName?.charAt(0) || "P"}
                        </div>
                        <div>
                          <p className="font-bold text-base">
                            {tool.owner
                              ? `${tool.owner.firstName} ${tool.owner.lastName}`
                              : "Propriétaire inconnu"}
                          </p>
                          <p className="text-gray-600 text-sm">
                            Propriétaire de l'outil
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <motion.button
                          onClick={handleCallOwner}
                          className="flex items-center gap-2 w-full p-2 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors duration-200"
                          whileHover={{ x: 5 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Phone className="w-3 h-3 text-purple-600" />
                          <span className="text-purple-800 font-medium text-sm">
                            Contacter par téléphone
                          </span>
                        </motion.button>
                        <motion.button
                          onClick={handleMessageOwner}
                          className="flex items-center gap-2 w-full p-2 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors duration-200"
                          whileHover={{ x: 5 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Mail className="w-3 h-3 text-purple-600" />
                          <span className="text-purple-800 font-medium text-sm">
                            Envoyer un message
                          </span>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>

                  {/* Booking Info */}
                  <motion.div
                    variants={cardVariants}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                  >
                    <h3 className="text-base font-bold text-gray-900 mb-3">
                      Informations de réservation
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-white rounded-lg border">
                        <span className="text-gray-600 text-sm">Référence</span>
                        <span className="font-mono font-bold text-blue-600 text-sm">
                          #{booking.id.slice(-8).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white rounded-lg border">
                        <span className="text-gray-600 text-sm">Créée le</span>
                        <span className="font-semibold text-sm">
                          {formatDateFr(booking.createdAt)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white rounded-lg border">
                        <span className="text-gray-600 text-sm">
                          Dernière mise à jour
                        </span>
                        <span className="font-semibold text-sm">
                          {formatDateFr(booking.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <motion.button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Fermer
              </motion.button>
              <motion.button
                onClick={handleViewContract}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <ExternalLink className="w-4 h-4 inline mr-2" />
                Voir le contrat
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Contract Modal */}
      <ContractModal
        isOpen={isContractOpen}
        onClose={() => setIsContractOpen(false)}
        tool={tool}
        startDate={formatDateFr(booking.startDate)}
        endDate={formatDateFr(booking.endDate)}
      />
    </AnimatePresence>
  );
};
