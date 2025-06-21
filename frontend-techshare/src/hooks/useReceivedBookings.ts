import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { bookingService } from "@/services/bookingService";
import { ReceivedBooking } from "@/interfaces/booking/received-booking.interface";

export const useReceivedBookings = () => {
  const [bookings, setBookings] = useState<ReceivedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // --- Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] =
    useState<ReceivedBooking | null>(null);

  const handleOpenModal = (booking: ReceivedBooking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };
  // -------------------

  const fetchReceivedBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const receivedBookings = await bookingService.getReceivedBookings();
      setBookings(receivedBookings);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Une erreur est survenue.";
      setError(errorMessage);
      toast.error(`Erreur: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAction = async (
    bookingId: string,
    action: (id: string) => Promise<unknown>,
    successMessage: string,
    optimisticStatus?: "approved" | "rejected" | "completed"
  ) => {
    if (actionLoading) return;
    setActionLoading(bookingId);

    const previousBookings = bookings;

    if (optimisticStatus) {
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: optimisticStatus } : b
        )
      );
    }

    try {
      await action(bookingId);
      toast.success(successMessage);
      if (isModalOpen) {
        handleCloseModal();
      }
      await fetchReceivedBookings(); // Refresh data
    } catch (err) {
      setBookings(previousBookings); // Revert optimistic update
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors de l'action.";
      toast.error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirm = (bookingId: string) => {
    handleAction(
      bookingId,
      bookingService.confirmBooking,
      "Réservation confirmée avec succès",
      "approved"
    );
  };

  const handleReject = (bookingId: string) => {
    handleAction(
      bookingId,
      bookingService.rejectBooking,
      "Réservation rejetée",
      "rejected"
    );
  };

  const handleComplete = (bookingId: string) => {
    handleAction(
      bookingId,
      bookingService.completeBooking,
      "Réservation marquée comme terminée",
      "completed"
    );
  };

  useEffect(() => {
    fetchReceivedBookings();
  }, [fetchReceivedBookings]);

  return {
    bookings,
    loading,
    error,
    actionLoading,
    selectedBooking,
    isModalOpen,
    handleOpenModal,
    handleCloseModal,
    handleConfirm,
    handleReject,
    handleComplete,
    refetch: fetchReceivedBookings,
  };
};
