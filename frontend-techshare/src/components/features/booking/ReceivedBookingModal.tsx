import { motion, AnimatePresence } from "framer-motion";
import { X, User, CalendarCheck, Wrench, Phone, Mail } from "lucide-react";
import { ReceivedBooking } from "@/interfaces/booking/received-booking.interface";
import { ReceivedBookingStatus } from "./ReceivedBookingStatus";

interface ReceivedBookingModalProps {
  booking: ReceivedBooking | null;
  isOpen: boolean;
  onClose: () => void;
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 40 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 25 },
  },
  exit: { opacity: 0, scale: 0.9, y: 40, transition: { duration: 0.2 } },
};

export const ReceivedBookingModal = ({
  booking,
  isOpen,
  onClose,
}: ReceivedBookingModalProps) => {
  if (!booking) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-blue-900">
                Détails de la réservation
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Informations de l'outil */}
              <div className="border-b pb-6">
                <h4 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  Outil
                </h4>
                <div className="flex items-center gap-4">
                  {booking.tool.image ? (
                    <img
                      src={booking.tool.image}
                      alt={booking.tool.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Wrench className="w-10 h-10 text-blue-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-lg">{booking.tool.name}</p>
                    <p className="text-sm text-gray-600 mb-1">
                      {booking.tool.category}
                    </p>
                    {booking.tool.description && (
                      <p className="text-sm text-gray-500">
                        {booking.tool.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Informations du locataire */}
              <div className="border-b pb-6">
                <h4 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Locataire
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-lg">
                        {booking.renter.fullName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {booking.renter.firstName} {booking.renter.lastName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{booking.renter.email}</span>
                  </div>

                  {booking.renter.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{booking.renter.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Dates et prix */}
              <div className="border-b pb-6">
                <h4 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5" />
                  Réservation
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Date de début</p>
                    <p className="font-medium">
                      {new Date(booking.startDate).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date de fin</p>
                    <p className="font-medium">
                      {new Date(booking.endDate).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Prix total</p>
                    <p className="font-bold text-green-700">
                      {booking.totalPrice.toLocaleString()} FCFA
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Caution</p>
                    <p className="font-bold text-green-700">
                      {booking.depositAmount.toLocaleString()} FCFA
                    </p>
                  </div>
                </div>
              </div>

              {/* Statuts */}
              <div className="border-b pb-6">
                <h4 className="font-semibold text-blue-800 mb-4">Statuts</h4>
                <ReceivedBookingStatus
                  status={booking.status}
                  paymentStatus={booking.paymentStatus}
                  showPaymentStatus={true}
                />
              </div>

              {/* Message */}
              {booking.message && (
                <div className="border-b pb-6">
                  <h4 className="font-semibold text-blue-800 mb-4">
                    Message du locataire
                  </h4>
                  <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                    <p className="text-gray-700">{booking.message}</p>
                  </div>
                </div>
              )}

              {/* Informations de cancellation si applicable */}
              {booking.cancelledAt && (
                <div className="border-b pb-6">
                  <h4 className="font-semibold text-red-800 mb-4">
                    Annulation
                  </h4>
                  <div className="space-y-2">
                    <p>
                      <strong>Annulée le :</strong>{" "}
                      {new Date(booking.cancelledAt).toLocaleDateString(
                        "fr-FR"
                      )}
                    </p>
                    {booking.cancellationReason && (
                      <p>
                        <strong>Raison :</strong> {booking.cancellationReason}
                      </p>
                    )}
                    {booking.cancellationFee > 0 && (
                      <p>
                        <strong>Frais d'annulation :</strong>{" "}
                        {booking.cancellationFee.toLocaleString()} FCFA
                      </p>
                    )}
                    {booking.refundAmount > 0 && (
                      <p>
                        <strong>Montant remboursé :</strong>{" "}
                        {booking.refundAmount.toLocaleString()} FCFA
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Informations système */}
              <div className="text-sm text-gray-500 space-y-1">
                <p>
                  <strong>Créée le :</strong>{" "}
                  {new Date(booking.createdAt).toLocaleDateString("fr-FR")}
                </p>
                <p>
                  <strong>Modifiée le :</strong>{" "}
                  {new Date(booking.updatedAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
