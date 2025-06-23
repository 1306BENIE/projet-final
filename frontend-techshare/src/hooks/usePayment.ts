import { useState } from "react";
import { bookingService } from "@/services/bookingService";
import { CreateBookingDto } from "@/interfaces/booking/dto.interface";
import { toast } from "react-hot-toast";

interface UsePaymentReturn {
  isPaymentModalOpen: boolean;
  currentBookingId: string | null;
  currentAmount: number;
  openPaymentModal: (bookingId: string, amount: number) => void;
  closePaymentModal: () => void;
  handlePaymentSuccess: () => void;
  handlePaymentError: (error: string) => void;
  createBookingWithPayment: (bookingData: CreateBookingDto) => Promise<boolean>;
}

export const usePayment = (): UsePaymentReturn => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
  const [currentAmount, setCurrentAmount] = useState(0);

  const openPaymentModal = (bookingId: string, amount: number) => {
    console.log("openPaymentModal called with", bookingId, amount);
    setCurrentBookingId(bookingId);
    setCurrentAmount(amount);
    setIsPaymentModalOpen(true);
    console.log("isPaymentModalOpen should now be true");
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setCurrentBookingId(null);
    setCurrentAmount(0);
  };

  const handlePaymentSuccess = () => {
    toast.success("Paiement effectué avec succès !");
    closePaymentModal();
    // Optionnel : rafraîchir les données ou rediriger
    window.location.reload();
  };

  const handlePaymentError = (error: string) => {
    toast.error(`Erreur de paiement : ${error}`);
    // Le modal reste ouvert pour permettre à l'utilisateur de réessayer
  };

  const createBookingWithPayment = async (
    bookingData: CreateBookingDto
  ): Promise<boolean> => {
    try {
      toast.loading("Création de la réservation...");

      const result = await bookingService.createBookingWithPayment(bookingData);

      toast.dismiss();

      // Ouvre toujours le modal de paiement après la création du booking
      openPaymentModal(result.booking.id, result.booking.totalPrice);
      return true;
    } catch (error) {
      toast.dismiss();
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors de la création de la réservation";
      toast.error(errorMessage);
      return false;
    }
  };

  return {
    isPaymentModalOpen,
    currentBookingId,
    currentAmount,
    openPaymentModal,
    closePaymentModal,
    handlePaymentSuccess,
    handlePaymentError,
    createBookingWithPayment,
  };
};
