import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { bookingService } from "@/services/bookingService";
import { ReceivedBooking } from "@/interfaces/booking/received-booking.interface";

export const useReceivedBookings = () => {
  const [bookings, setBookings] = useState<ReceivedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Charger les réservations
  const fetchReceivedBookings = useCallback(async () => {
    try {
      console.log("Starting to fetch received bookings...");
      const receivedBookings = await bookingService.getReceivedBookings();
      console.log("Received bookings:", receivedBookings);
      setBookings(receivedBookings);
    } catch (error) {
      console.error("Error in fetchReceivedBookings:", error);
      toast.error("Erreur lors du chargement des réservations reçues");
    } finally {
      setLoading(false);
    }
  }, []);

  // Confirmer une réservation
  const handleConfirmBooking = useCallback(
    async (bookingId: string) => {
      if (actionLoading) return;

      setActionLoading(bookingId);
      try {
        // Optimistic update
        setBookings((prev) =>
          prev.map((booking) =>
            booking.id === bookingId
              ? { ...booking, status: "approved" }
              : booking
          )
        );

        await bookingService.confirmBooking(bookingId);
        toast.success("Réservation confirmée avec succès");

        // Rafraîchir les données
        const updatedBookings = await bookingService.getReceivedBookings();
        setBookings(updatedBookings);
      } catch (error) {
        console.error("Error confirming booking:", error);
        toast.error("Erreur lors de la confirmation");

        // Revert optimistic update
        const originalBookings = await bookingService.getReceivedBookings();
        setBookings(originalBookings);
      } finally {
        setActionLoading(null);
      }
    },
    [actionLoading]
  );

  // Rejeter une réservation
  const handleRejectBooking = useCallback(
    async (bookingId: string) => {
      if (actionLoading) return;

      setActionLoading(bookingId);
      try {
        // Optimistic update
        setBookings((prev) =>
          prev.map((booking) =>
            booking.id === bookingId
              ? { ...booking, status: "rejected" }
              : booking
          )
        );

        await bookingService.rejectBooking(bookingId);
        toast.success("Réservation rejetée avec succès");

        // Rafraîchir les données
        const updatedBookings = await bookingService.getReceivedBookings();
        setBookings(updatedBookings);
      } catch (error) {
        console.error("Error rejecting booking:", error);
        toast.error("Erreur lors du rejet");

        // Revert optimistic update
        const originalBookings = await bookingService.getReceivedBookings();
        setBookings(originalBookings);
      } finally {
        setActionLoading(null);
      }
    },
    [actionLoading]
  );

  // Marquer comme terminé
  const handleCompleteBooking = useCallback(
    async (bookingId: string) => {
      if (actionLoading) return;

      setActionLoading(bookingId);
      try {
        // Optimistic update
        setBookings((prev) =>
          prev.map((booking) =>
            booking.id === bookingId
              ? { ...booking, status: "completed" }
              : booking
          )
        );

        await bookingService.completeBooking(bookingId);
        toast.success("Réservation marquée comme terminée");

        // Rafraîchir les données
        const updatedBookings = await bookingService.getReceivedBookings();
        setBookings(updatedBookings);
      } catch (error) {
        console.error("Error completing booking:", error);
        toast.error("Erreur lors de la mise à jour");

        // Revert optimistic update
        const originalBookings = await bookingService.getReceivedBookings();
        setBookings(originalBookings);
      } finally {
        setActionLoading(null);
      }
    },
    [actionLoading]
  );

  // Charger les données au montage
  useEffect(() => {
    fetchReceivedBookings();
  }, [fetchReceivedBookings]);

  return {
    bookings,
    loading,
    actionLoading,
    handleConfirmBooking,
    handleRejectBooking,
    handleCompleteBooking,
    refetch: fetchReceivedBookings,
  };
};
