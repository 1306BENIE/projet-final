import { useState, useEffect } from "react";
import { AxiosError } from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInDays } from "date-fns";
import { X, Clock, Calendar, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "@/components/ui/Button";
import { Tool } from "@/interfaces/tools/tool";
import { CreateBookingDto } from "@/interfaces/booking/dto.interface";
import { bookingService } from "@/services/bookingService";
import { ContractModal } from "@/components/features/booking/ContractModal";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tool: Tool;
}

export const BookingModal = ({ isOpen, onClose, tool }: BookingModalProps) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [showContract, setShowContract] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookedPeriods, setBookedPeriods] = useState<
    { startDate: string; endDate: string }[]
  >([]);
  const navigate = useNavigate();
  const [dateError, setDateError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && tool.id) {
      bookingService
        .getBookedDates(tool.id)
        .then(setBookedPeriods)
        .catch(() => setBookedPeriods([]));
    } else {
      setBookedPeriods([]);
    }
  }, [isOpen, tool.id]);

  useEffect(() => {
    if (startDate && endDate) {
      if (endDate <= startDate) {
        setDateError("La date de fin doit être après la date de début.");
      } else {
        setDateError(null);
      }
    } else {
      setDateError(null);
    }
  }, [startDate, endDate]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!startDate || !endDate) {
        throw new Error("Veuillez sélectionner les dates de réservation");
      }

      if (!hasAcceptedTerms) {
        throw new Error("Veuillez accepter les conditions de location");
      }

      // Réinitialiser les heures à minuit pour la comparaison des dates
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(0, 0, 0, 0);

      const now = new Date();
      now.setHours(0, 0, 0, 0);

      // Validation des dates
      if (start < now) {
        throw new Error("La date de début doit être dans le futur");
      }

      if (end <= start) {
        throw new Error("La date de fin doit être après la date de début");
      }

      // Calcul de la durée en jours
      const duration = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (duration < 1) {
        throw new Error("La durée minimale de réservation est de 1 jour");
      }
      if (duration > 30) {
        throw new Error("La durée maximale de réservation est de 30 jours");
      }

      // Vérifier le chevauchement avec les périodes réservées
      const isOverlapping = bookedPeriods.some(
        (period) =>
          startDate &&
          endDate &&
          new Date(startDate) <= new Date(period.endDate) &&
          new Date(endDate) >= new Date(period.startDate)
      );
      if (isOverlapping) {
        setError(
          "L'outil est déjà réservé sur cette période. Veuillez choisir d'autres dates."
        );
        setIsLoading(false);
        return;
      }

      const bookingData: CreateBookingDto = {
        toolId: tool.id,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      };

      console.log("Sending booking data:", bookingData);
      await bookingService.createBooking(bookingData);

      toast.success("Réservation créée avec succès !");
      onClose();
      navigate("/my-bookings");
    } catch (error) {
      console.error("Booking error:", error);
      if (error instanceof AxiosError) {
        let msg =
          error.response?.data?.message ||
          "Une erreur est survenue lors de la création de la réservation";
        if (msg === "Tool is not available for the selected dates") {
          msg =
            "L'outil est déjà réservé sur cette période. Veuillez choisir d'autres dates.";
        }
        setError(msg);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Une erreur inattendue est survenue");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Prépare les intervalles à désactiver pour le DatePicker
  const excludeIntervals = bookedPeriods.map((period) => ({
    start: new Date(period.startDate),
    end: new Date(period.endDate),
  }));

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
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto overflow-hidden"
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

          {/* Bloc d'alerte périodes réservées - design pro */}
          {bookedPeriods.length > 0 && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-xl shadow-sm">
              <AlertCircle className="w-6 h-6 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-yellow-900 mb-1">
                  Périodes déjà réservées :
                </div>
                <ul className="list-disc ml-5 text-yellow-900 text-sm space-y-1">
                  {bookedPeriods.map((period, idx) => (
                    <li key={idx}>
                      {format(new Date(period.startDate), "dd/MM/yyyy")} au{" "}
                      {format(new Date(period.endDate), "dd/MM/yyyy")}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

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
                    <div className="bg-gray-50 rounded-md p-2">
                      <DatePicker
                        selected={startDate}
                        onChange={(date: Date | null) => setStartDate(date)}
                        minDate={new Date()}
                        excludeDateIntervals={excludeIntervals}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Date de début"
                        className="w-full border-gray-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 bg-gray-50"
                        locale="fr"
                      />
                    </div>
                    <div className="bg-gray-50 rounded-md p-2">
                      <DatePicker
                        selected={endDate}
                        onChange={(date: Date | null) => setEndDate(date)}
                        minDate={startDate || new Date()}
                        excludeDateIntervals={excludeIntervals}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Date de fin"
                        className="w-full border-gray-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 bg-gray-50"
                        locale="fr"
                      />
                    </div>
                    {dateError && (
                      <div className="text-red-600 text-sm mt-1">
                        {dateError}
                      </div>
                    )}
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

              {/* Conditions de location */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={hasAcceptedTerms}
                        onChange={(e) => setHasAcceptedTerms(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        disabled={!startDate || !endDate}
                      />
                      <label htmlFor="terms" className="text-sm text-gray-700">
                        J'accepte les{" "}
                        <button
                          type="button"
                          onClick={() => setShowContract(true)}
                          className="text-blue-600 hover:text-blue-700 font-medium underline"
                        >
                          conditions de location
                        </button>
                      </label>
                    </div>
                    {(!startDate || !endDate) && (
                      <p className="text-xs text-gray-500 mt-1 ml-6">
                        Sélectionnez les dates de réservation pour activer
                        l'acceptation des conditions
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Message d'erreur */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {error}
                </div>
              )}

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
                  disabled={isLoading || !hasAcceptedTerms || !!dateError}
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
          {showContract && (
            <ContractModal
              isOpen={showContract}
              onClose={() => setShowContract(false)}
              tool={tool}
              startDate={startDate ? format(startDate, "yyyy-MM-dd") : ""}
              endDate={endDate ? format(endDate, "yyyy-MM-dd") : ""}
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
