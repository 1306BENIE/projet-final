import { motion } from "framer-motion";
import { User, CalendarCheck, Wrench } from "lucide-react";
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
      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col"
    >
      {/* Header avec image et statut */}
      <div className="relative">
        <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 w-full overflow-hidden">
          {booking.tool.image ? (
            <img
              src={booking.tool.image}
              alt={booking.tool.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-lg font-bold text-white truncate shadow-sm">
            {booking.tool.name}
          </h3>
          <p className="text-sm text-gray-200 truncate">
            {booking.tool.category}
          </p>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="p-5 flex-grow flex flex-col">
        {/* Renter et Dates */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">
                {booking.renter.fullName}
              </p>
              <p className="text-sm text-gray-500">{booking.renter.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <CalendarCheck className="w-5 h-5 text-gray-500 flex-shrink-0" />
            <p className="text-sm font-medium text-gray-700">
              {new Date(booking.startDate).toLocaleDateString("fr-FR")} →{" "}
              {new Date(booking.endDate).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>

        {/* Prix et caution */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-center">
          <div>
            <p className="text-sm text-gray-500">Prix Total</p>
            <p className="text-xl font-bold text-green-600">
              {booking.totalPrice.toLocaleString()} FCFA
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Caution</p>
            <p className="text-lg font-semibold text-gray-700">
              {booking.depositAmount.toLocaleString()} FCFA
            </p>
          </div>
        </div>

        {/* Statut de paiement */}
        <div className="text-center mb-4">
          <ReceivedBookingStatus
            status={booking.status}
            paymentStatus={booking.paymentStatus}
            type="payment"
          />
        </div>

        {/* Actions */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <ReceivedBookingActions
            bookingId={booking.id}
            status={booking.status}
            actionLoading={actionLoading}
            onConfirm={onConfirm}
            onReject={onReject}
            onComplete={onComplete}
            onViewDetails={onViewDetails}
          />
        </div>
      </div>
    </motion.div>
  );
};
