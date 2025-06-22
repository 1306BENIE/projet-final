import { useState, useCallback } from "react";
import { bookingService, BookedDatesResponse } from "@/services/bookingService";
import { Tool } from "@/interfaces/tools/tool";

interface UseBookingModalReturn {
  isModalOpen: boolean;
  isPreLoading: boolean;
  bookedPeriods: { startDate: string; endDate: string }[];
  openModal: (tool: Tool) => Promise<void>;
  closeModal: () => void;
  error: string | null;
}

export const useBookingModal = (): UseBookingModalReturn => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreLoading, setIsPreLoading] = useState(false);
  const [bookedPeriods, setBookedPeriods] = useState<
    { startDate: string; endDate: string }[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  const openModal = useCallback(async (tool: Tool) => {
    if (!tool.id) {
      setError("ID de l'outil manquant");
      return;
    }

    setIsPreLoading(true);
    setError(null);

    try {
      // Pre-loading des données de réservation
      const data: BookedDatesResponse = await bookingService.getBookedDates(
        tool.id
      );

      console.log("Périodes réservées pré-chargées :", data);
      const periods = data.bookedDates || []; // Valeur par défaut
      setBookedPeriods(Array.isArray(periods) ? periods : []);

      console.log(`Total réservations actives: ${data.totalActiveBookings}`);
      console.log(`Date de référence: ${data.currentDate}`);

      // Ouvrir le modal une fois les données chargées
      setIsModalOpen(true);
    } catch (err) {
      console.error("Erreur lors du pré-chargement des réservations :", err);
      setError("Erreur lors du chargement des données de disponibilité");
      setBookedPeriods([]); // Toujours un tableau vide en cas d'erreur
    } finally {
      setIsPreLoading(false);
    }
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setBookedPeriods([]);
    setError(null);
  }, []);

  return {
    isModalOpen,
    isPreLoading,
    bookedPeriods,
    openModal,
    closeModal,
    error,
  };
};
