import { motion } from "framer-motion";
import { User, CalendarCheck, Wrench, Eye } from "lucide-react";
import { ReceivedBooking } from "@/interfaces/booking/received-booking.interface";
import { ReceivedBookingStatus } from "@/components/features/booking/ReceivedBookingStatus";
import { ReceivedBookingActions } from "@/components/features/booking/ReceivedBookingActions";

interface ReceivedBookingCardProps {
  booking: ReceivedBooking;
  actionLoading: string | null;
  onConfirm: (id: string) => void;
  onReject: (id: string) => void;
  onComplete: (id: string) => void;
  onViewDetails: () => void;
  index: number;
}

export const ReceivedBookingCard = ({
  booking,
  actionLoading,
  onConfirm,
  onReject,
  onComplete,
  onViewDetails,
  index,
}: ReceivedBookingCardProps) => {
  const statusBorderColor = {
    pending: "border-l-yellow-400",
    approved: "border-l-green-500",
    rejected: "border-l-red-500",
    completed: "border-l-blue-500",
    cancelled: "border-l-gray-400",
  }[booking.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.1,
        duration: 0.5,
        type: "spring",
        stiffness: 100,
      }}
      className={`group bg-white rounded-2xl shadow-[0_2px_8px_0_rgba(0,0,0,0.06),0_8px_32px_0_rgba(16,38,73,0.10)] hover:shadow-[0_8px_32px_0_rgba(16,38,73,0.18),0_2px_8px_0_rgba(0,0,0,0.10)] transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col transform-gpu hover:-translate-y-1.5 border-l-4 ${statusBorderColor}`}
    >
      {/* Header avec image et statut */}
      <div className="relative">
        <div className="h-36 bg-gradient-to-br from-gray-100 to-gray-200 w-full overflow-hidden">
          {booking.tool.image ? (
            <img
              src={booking.tool.image}
              alt={booking.tool.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Wrench className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </div>
        <div className="absolute top-3 right-3">
          <ReceivedBookingStatus
            status={booking.status}
            paymentStatus={booking.paymentStatus}
            type="booking"
          />
        </div>
        <div className="absolute top-3 left-3">
          <ReceivedBookingStatus
            status={booking.status}
            paymentStatus={booking.paymentStatus}
            type="payment"
          />
        </div>
      </div>

      {/* Contenu principal - Divulgation Progressive */}
      <div className="p-4 flex-grow flex flex-col border-t border-gray-50/80 bg-gradient-to-b from-white via-white to-gray-50/60">
        {/* En-tête de la carte : Titre et bouton Détails */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300 pr-2 truncate">
              {booking.tool.name}
            </h3>
            <p className="text-sm text-gray-500">{booking.tool.category}</p>
          </div>
          <button
            onClick={onViewDetails}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors duration-300 group/details"
          >
            <Eye className="w-4 h-4 text-gray-500 group-hover/details:text-blue-600 transition-colors duration-300" />
            <span className="font-semibold">Détails</span>
          </button>
        </div>

        {/* Locataire - Information essentielle */}
        <div className="mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center shadow-inner">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-grow">
              <p className="font-semibold text-gray-800 text-sm">
                {booking.renter.fullName}
              </p>
              {/* Email supprimé - accessible via "Détails" */}
            </div>
          </div>
        </div>

        {/* Dates - Information essentielle */}
        <div className="mb-3">
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100/60 shadow-sm">
            <CalendarCheck className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <p className="text-xs font-medium text-gray-700">
              {new Date(booking.startDate).toLocaleDateString("fr-FR")} →{" "}
              {new Date(booking.endDate).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>

        {/* Prix Total - Information essentielle (mise en avant) */}
        <div className="mb-3">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3 text-center shadow-md relative">
            <p className="text-xs text-green-600 font-medium mb-1">
              Gain potentiel
            </p>
            <p className="text-xl font-bold text-green-700 drop-shadow-lg">
              {booking.totalPrice.toLocaleString()} FCFA
            </p>
            <div className="mt-1.5 w-10 h-0.5 bg-green-400 rounded-full mx-auto opacity-60 shadow-[0_0_8px_2px_rgba(16,185,129,0.25)] animate-pulse" />
            {/* Glow effect */}
            <div
              className="absolute inset-0 pointer-events-none rounded-xl"
              style={{ boxShadow: "0 0 16px 2px rgba(16,185,129,0.10)" }}
            />
          </div>
          {/* Caution supprimée - accessible via "Détails" */}
        </div>

        {/* Statut de paiement - déplacé sur l'image */}
        <div className="text-center mb-3">
          {/* Le badge a été déplacé sur l'image */}
        </div>

        {/* Actions */}
        <div className="mt-auto pt-3 border-t border-gray-100/80">
          <ReceivedBookingActions
            bookingId={booking.id}
            status={booking.status}
            actionLoading={actionLoading}
            onConfirm={onConfirm}
            onReject={onReject}
            onComplete={onComplete}
          />
        </div>
      </div>
    </motion.div>
  );
};
