import { Calendar, User, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

function formatDateFr(dateStr: string) {
  if (!dateStr) return "Date inconnue";
  try {
    return format(new Date(dateStr), "d MMMM yyyy", { locale: fr });
  } catch {
    return dateStr;
  }
}

interface BookingCardProps {
  booking: {
    toolName: string;
    reservedAt: string;
    startDate: string;
    endDate: string;
    price: string;
    status: string;
    paymentStatus: string;
    owner: string;
    image?: string;
    isDeleted?: boolean;
  };
  onDetails?: () => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onDetails,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
      <div className="flex items-center gap-4">
        <div className="bg-blue-100 p-4 rounded-full">
          <img
            src={booking.image || "/img/fallback-tool.png"}
            alt={booking.toolName}
            className="w-8 h-8 object-cover rounded-full"
          />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            {booking.isDeleted ? (
              <span className="text-red-600">Outil supprimé</span>
            ) : (
              booking.toolName
            )}
          </h3>
          <p className="text-gray-500">
            Réservé le {formatDateFr(booking.reservedAt)}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700 font-medium">
              {formatDateFr(booking.startDate)} -{" "}
              {formatDateFr(booking.endDate)}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <CreditCard className="w-4 h-4 text-green-500" />
            <span className="text-lg font-bold text-green-700">
              {booking.price} FCFA
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700">
              {booking.owner && booking.owner.trim() !== ""
                ? booking.owner
                : "Propriétaire inconnu"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Badge status={booking.status} />
        {booking.status !== booking.paymentStatus && (
          <Badge status={booking.paymentStatus} />
        )}
        {onDetails && (
          <button
            onClick={onDetails}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Voir les détails
          </button>
        )}
      </div>
    </div>
  );
};
