import { Booking, BookingStatus, PaymentStatus } from "@/interfaces/Booking";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, Clock, Banknote, Wrench } from "lucide-react";

interface BookingListProps {
  bookings: Booking[];
  onBookingSelect: (booking: Booking) => void;
  selectedBookingId?: string;
}

const statusColors: Record<BookingStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  COMPLETED: "bg-blue-100 text-blue-800",
};

const paymentStatusColors: Record<PaymentStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  REFUNDED: "bg-blue-100 text-blue-800",
  FAILED: "bg-red-100 text-red-800",
};

export default function BookingList({
  bookings,
  onBookingSelect,
  selectedBookingId,
}: BookingListProps) {
  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Aucune réservation
        </h3>
        <p className="text-gray-500">Vous n'avez pas encore de réservations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          onClick={() => onBookingSelect(booking)}
          className={`bg-white rounded-xl shadow-lg p-6 cursor-pointer transition-all duration-200 hover:shadow-xl ${
            selectedBookingId === booking.id
              ? "ring-2 ring-primary"
              : "hover:ring-1 hover:ring-primary/50"
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Wrench className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Outil #{booking.toolId}
                </h3>
                <p className="text-sm text-gray-500">
                  Réservé le{" "}
                  {booking.createdAt
                    ? format(new Date(booking.createdAt), "PPP", { locale: fr })
                    : "Date inconnue"}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  statusColors[booking.status]
                }`}
              >
                {booking.status}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  paymentStatusColors[booking.paymentStatus]
                }`}
              >
                {booking.paymentStatus}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>
                {booking.startDate
                  ? format(new Date(booking.startDate), "PPP", { locale: fr })
                  : "Date inconnue"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>
                {booking.endDate
                  ? format(new Date(booking.endDate), "PPP", { locale: fr })
                  : "Date inconnue"}
              </span>
            </div>
          </div>

          {booking.notes && (
            <p className="mt-4 text-sm text-gray-600 line-clamp-2">
              {booking.notes}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <Banknote className="w-4 h-4" />
              <span>{booking.totalPrice.toLocaleString("fr-FR")} FCFA</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
