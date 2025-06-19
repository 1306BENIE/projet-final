import { X, Calendar, CreditCard, StickyNote } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Booking } from "@/interfaces/booking/booking.interface";
import { Tool } from "@/interfaces/tools/tool";
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
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          Détails de la réservation
        </h2>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Image outil */}
          <div className="flex-shrink-0 flex flex-col items-center gap-2">
            <img
              src={tool.images[0] || "/img/fallback-tool.png"}
              alt={tool.name}
              className="w-32 h-32 object-cover rounded-xl border"
            />
            <span className="text-lg font-semibold text-gray-800 mt-2">
              {tool.name}
            </span>
            <span className="text-sm text-gray-500">
              {tool.brand} {tool.model}
            </span>
          </div>
          {/* Infos */}
          <div className="flex-1 space-y-4">
            <div>
              <span className="font-semibold">Propriétaire :</span>{" "}
              {tool.owner
                ? `${tool.owner.firstName} ${tool.owner.lastName}`
                : "Inconnu"}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="font-semibold">Dates :</span>
              <span>
                {formatDateFr(booking.startDate)} →{" "}
                {formatDateFr(booking.endDate)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-green-500" />
              <span className="font-semibold">Prix total :</span>
              <span className="text-green-700 font-bold">
                {booking.totalPrice.toLocaleString()} FCFA
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Caution :</span>
              <span className="text-blue-700 font-bold">
                {tool.caution ? tool.caution.toLocaleString() : "0"} FCFA
              </span>
            </div>
            <div className="flex gap-4 mt-4">
              <div>
                <span className="font-semibold">Statut réservation :</span>
                <Badge status={booking.status.toLowerCase()} />
              </div>
              <div>
                <span className="font-semibold">Statut paiement :</span>
                <Badge status={booking.paymentStatus.toLowerCase()} />
              </div>
            </div>
            {booking.notes && (
              <div className="flex items-center gap-2 mt-2">
                <StickyNote className="w-4 h-4 text-gray-400" />
                <span className="font-semibold">Notes :</span>
                <span>{booking.notes}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
