import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal/Modal";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import {
  AlertTriangle,
  X,
  DollarSign,
  Calendar,
  ShieldCheck,
  ShieldOff,
  MessageSquare,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";

interface BookingForCancellation {
  id: string;
  toolName: string;
  startDate: string;
  totalPrice: number;
}

interface CancellationInfo {
  canCancel: boolean;
  reason: string;
  fee: number;
  refundAmount: number;
  hoursUntilStart: number;
  daysUntilStart: number;
}

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  booking: BookingForCancellation;
  cancellationInfo: CancellationInfo;
  isLoading: boolean;
}

function formatDateFr(dateStr: string) {
  if (!dateStr) return "Date inconnue";
  try {
    return format(new Date(dateStr), "d MMMM yyyy", { locale: fr });
  } catch {
    return dateStr;
  }
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 50 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 50,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

export const CancelBookingModal: React.FC<CancelBookingModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  booking,
  cancellationInfo,
  isLoading,
}) => {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    // We can allow confirming even without a reason
    onConfirm(reason.trim() || "Aucune raison spécifiée");
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="xl"
      title=""
      showCloseButton={false}
    >
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full overflow-hidden"
      >
        <div className="p-4 bg-gradient-to-br from-red-500 to-orange-500 text-white flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-4">
            <AlertTriangle className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Annuler la réservation</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-gray-600 text-center">
            Vous êtes sur le point d'annuler la réservation pour :
          </p>

          {/* Booking Info */}
          <div className="bg-gray-50/70 rounded-xl p-3 border border-gray-200/80">
            <h3 className="font-bold text-gray-900 text-lg mb-2">
              {booking.toolName}
            </h3>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Début : {formatDateFr(booking.startDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span className="font-semibold">
                  Prix : {booking.totalPrice.toLocaleString()} FCFA
                </span>
              </div>
            </div>
          </div>

          {/* Financial Impact */}
          <div className="bg-white rounded-xl p-3 border-2 border-gray-100 shadow-sm">
            <h4 className="font-semibold text-gray-800 mb-3 text-center">
              Impact Financier
            </h4>
            <div className="space-y-2 text-md">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Montant initial :</span>
                <span className="font-medium text-gray-700">
                  {booking.totalPrice.toLocaleString()} FCFA
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Frais d'annulation :</span>
                <span className="font-semibold text-red-500">
                  -{cancellationInfo.fee.toLocaleString()} FCFA
                </span>
              </div>
              <div className="border-t my-2 border-dashed"></div>
              <div className="flex justify-between items-center text-lg">
                <span className="font-bold text-gray-900">
                  Remboursement estimé :
                </span>
                <span className="font-bold text-green-600">
                  {cancellationInfo.refundAmount.toLocaleString()} FCFA
                </span>
              </div>
            </div>
          </div>

          {/* Cancellation Policy Reason */}
          <div
            className={`flex items-start gap-3 p-3 rounded-xl ${
              cancellationInfo.canCancel
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            } border`}
          >
            {cancellationInfo.canCancel ? (
              <ShieldCheck className="w-8 h-8 text-green-500 mt-1 flex-shrink-0" />
            ) : (
              <ShieldOff className="w-8 h-8 text-red-500 mt-1 flex-shrink-0" />
            )}
            <div>
              <h5
                className={`font-bold ${
                  cancellationInfo.canCancel ? "text-green-800" : "text-red-800"
                }`}
              >
                {cancellationInfo.canCancel
                  ? "Annulation Possible"
                  : "Annulation Impossible"}
              </h5>
              <p
                className={`text-sm ${
                  cancellationInfo.canCancel ? "text-green-700" : "text-red-700"
                }`}
              >
                {cancellationInfo.reason ||
                  "Cette réservation ne peut plus être annulée."}
              </p>
            </div>
          </div>

          {/* Reason Input */}
          {cancellationInfo.canCancel && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <MessageSquare className="w-4 h-4" />
                Raison de l'annulation (optionnel)
              </label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Exemple : J'ai trouvé un autre outil, changement de planning..."
                rows={3}
                className="w-full focus:ring-2 focus:ring-red-300"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Ne pas annuler
            </Button>
            {cancellationInfo.canCancel && (
              <Button
                onClick={handleConfirm}
                disabled={isLoading}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Annulation...</span>
                  </div>
                ) : (
                  "Confirmer l'annulation"
                )}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </Modal>
  );
};
