import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInDays } from "date-fns";
import { X, Clock, Calendar } from "lucide-react";
import { toast } from "sonner";
import { bookingService } from "@/services/bookingService";
import { CreateBookingDto } from "@/interfaces/booking/dto.interface";
import { Tool } from "@/interfaces/tools/tool";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import { ContractModal } from "@/components/booking/ContractModal";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tool: Tool;
}

export function BookingModal({ isOpen, onClose, tool }: BookingModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      toast.error("Veuillez sélectionner les dates de réservation");
      return;
    }

    if (!hasAcceptedTerms) {
      toast.error("Veuillez accepter les conditions de location");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      toast.error("La date de fin doit être après la date de début");
      return;
    }

    const days = differenceInDays(end, start);
    if (days < 1) {
      toast.error("La durée minimale de réservation est de 1 jour");
      return;
    }

    if (days > 30) {
      toast.error("La durée maximale de réservation est de 30 jours");
      return;
    }

    setIsLoading(true);

    try {
      const bookingData: CreateBookingDto = {
        toolId: tool.id,
        startDate: start,
        endDate: end,
      };

      await bookingService.createBooking(bookingData);
      toast.success("Réservation effectuée avec succès");
      onClose();
    } catch (err) {
      console.error("Erreur lors de la réservation:", err);
      toast.error("Une erreur est survenue lors de la réservation");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
        >
          {/* En-tête */}
          <div className="relative p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shadow-md">
                  {tool.images[0] && (
                    <img
                      src={tool.images[0]}
                      alt={tool.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {tool.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {tool.owner.firstName} {tool.owner.lastName}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-blue-600 font-medium mt-2 text-right">
              {tool.dailyPrice.toLocaleString()} FCFA / jour
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              {/* Dates et Récapitulatif */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dates */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-semibold text-gray-900">
                      Dates de location
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        min={format(new Date(), "yyyy-MM-dd")}
                        required
                        className="w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate || format(new Date(), "yyyy-MM-dd")}
                        required
                        className="w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Récapitulatif */}
                {startDate && endDate && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-blue-50 rounded-xl p-4 border border-blue-100"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Durée</span>
                        <span className="font-medium text-blue-700">
                          {differenceInDays(
                            new Date(endDate),
                            new Date(startDate)
                          )}{" "}
                          jours
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Caution</span>
                        <span className="font-medium text-blue-700">
                          {tool.caution?.toLocaleString() || 0} FCFA
                        </span>
                      </div>
                      <div className="border-t border-blue-200 pt-2 mt-2">
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span className="text-blue-700">
                            {(
                              differenceInDays(
                                new Date(endDate),
                                new Date(startDate)
                              ) * tool.dailyPrice
                            ).toLocaleString()}{" "}
                            FCFA
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Contrat */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="accept-terms"
                    checked={hasAcceptedTerms}
                    onChange={(e) => setHasAcceptedTerms(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="accept-terms"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    J'accepte les{" "}
                    <button
                      type="button"
                      onClick={() => setIsContractModalOpen(true)}
                      className="text-blue-600 hover:text-blue-700 hover:underline focus:outline-none font-medium"
                    >
                      conditions de location
                    </button>
                  </label>
                </div>
              </div>

              {/* Boutons */}
              <div className="flex justify-end space-x-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !hasAcceptedTerms}
                  className="px-4 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Traitement...
                    </div>
                  ) : (
                    "Confirmer la réservation"
                  )}
                </Button>
              </div>
            </div>
          </form>

          {/* Modal du contrat */}
          <ContractModal
            isOpen={isContractModalOpen}
            onClose={() => setIsContractModalOpen(false)}
            tool={tool}
            startDate={startDate}
            endDate={endDate}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
