import { useState, useEffect } from "react";
import { Booking, BookingStatus, PaymentStatus } from "@/interfaces/Booking";
import { bookingService } from "@/services/bookingService";
import { Button } from "@/components/ui/Button/Button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

interface ReceivedBookingsProps {
  userId: string;
}

export const ReceivedBookings = ({ userId }: ReceivedBookingsProps) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    try {
      const receivedBookings = await bookingService.getReceivedBookings(userId);
      setBookings(receivedBookings);
    } catch (error) {
      console.error("Erreur lors du chargement des réservations:", error);
      toast.error("Erreur lors du chargement des réservations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [userId]);

  const handleConfirm = async (id: string) => {
    try {
      await bookingService.confirmBooking(id);
      toast.success("Réservation confirmée");
      loadBookings();
    } catch (error) {
      console.error("Erreur lors de la confirmation:", error);
      toast.error("Erreur lors de la confirmation");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await bookingService.rejectBooking(id);
      toast.success("Réservation rejetée");
      loadBookings();
    } catch (error) {
      console.error("Erreur lors du rejet:", error);
      toast.error("Erreur lors du rejet");
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await bookingService.completeBooking(id);
      toast.success("Réservation marquée comme terminée");
      loadBookings();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING:
        return "bg-yellow-100 text-yellow-800";
      case BookingStatus.CONFIRMED:
        return "bg-green-100 text-green-800";
      case BookingStatus.CANCELLED:
        return "bg-red-100 text-red-800";
      case BookingStatus.COMPLETED:
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return "bg-green-100 text-green-800";
      case PaymentStatus.PENDING:
        return "bg-yellow-100 text-yellow-800";
      case PaymentStatus.REFUNDED:
        return "bg-blue-100 text-blue-800";
      case PaymentStatus.FAILED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Réservations reçues</h2>
      {bookings.length === 0 ? (
        <p>Aucune réservation reçue</p>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="p-4 border rounded-lg shadow-sm space-y-2"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">
                    Réservation #{booking.id.slice(-6)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Du{" "}
                    {format(new Date(booking.startDate), "dd MMMM yyyy", {
                      locale: fr,
                    })}{" "}
                    au{" "}
                    {format(new Date(booking.endDate), "dd MMMM yyyy", {
                      locale: fr,
                    })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${getPaymentStatusColor(
                      booking.paymentStatus
                    )}`}
                  >
                    {booking.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {booking.status === BookingStatus.PENDING && (
                  <>
                    <Button
                      variant="primary"
                      onClick={() => handleConfirm(booking.id)}
                    >
                      Confirmer
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleReject(booking.id)}
                    >
                      Rejeter
                    </Button>
                  </>
                )}
                {booking.status === BookingStatus.CONFIRMED && (
                  <Button
                    variant="primary"
                    onClick={() => handleComplete(booking.id)}
                  >
                    Marquer comme terminé
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
