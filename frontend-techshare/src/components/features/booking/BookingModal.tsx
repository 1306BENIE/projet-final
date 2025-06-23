import { useState, useEffect } from "react";
import { AxiosError } from "axios";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { format, differenceInDays, addDays, isAfter } from "date-fns";
import { X, Calendar, Clock } from "lucide-react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "@/components/ui/Button";
import { Tool } from "@/interfaces/tools/tool";
import { CreateBookingDto } from "@/interfaces/booking/dto.interface";
import { ContractModal } from "@/components/features/booking/ContractModal";
import { PaymentModal } from "@/components/features/booking/PaymentModal";
import { usePayment } from "@/hooks/usePayment";
import { fr } from "date-fns/locale";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";

registerLocale("fr", fr);

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tool: Tool;
  bookedPeriods: { startDate: string; endDate: string }[];
}

// Fonction pour calculer le prochain créneau disponible (Ancienne version commentée)
/*
const calculateNextAvailableSlot = (
  bookedPeriods: { startDate: string; endDate: string }[]
): { startDate: Date; endDate: Date; message: string } | null => {
  if (bookedPeriods.length === 0) {
    return {
      startDate: new Date(),
      endDate: addDays(new Date(), 30),
      message: "Disponible dès aujourd'hui",
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Trier les périodes réservées par date de début
  const sortedPeriods = [...bookedPeriods].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  // Chercher le premier créneau disponible
  let currentDate = today;

  for (const period of sortedPeriods) {
    const periodStart = new Date(period.startDate);
    const periodEnd = new Date(period.endDate);

    // Si il y a un gap entre la date actuelle et le début de cette période
    if (isAfter(periodStart, addDays(currentDate, 1))) {
      const availableEnd = addDays(periodStart, -1);
      const duration = differenceInDays(availableEnd, currentDate);

      return {
        startDate: currentDate,
        endDate: availableEnd,
        message:
          duration === 0
            ? "Disponible dès aujourd'hui"
            : `Disponible du ${format(currentDate, "dd/MM")} au ${format(
                availableEnd,
                "dd/MM"
              )}`,
      };
    }

    // Mettre à jour la date courante après cette période
    currentDate = addDays(periodEnd, 1);
  }

  // Si on arrive ici, l'outil est disponible après la dernière période
  const availableEnd = addDays(currentDate, 30);
  const duration = differenceInDays(availableEnd, currentDate);

  return {
    startDate: currentDate,
    endDate: availableEnd,
    message:
      duration === 0
        ? "Disponible dès aujourd'hui"
        : `Disponible du ${format(currentDate, "dd/MM")} au ${format(
            availableEnd,
            "dd/MM"
          )}`,
  };
};
*/

// NOUVELLE FONCTION : Calcule le prochain créneau disponible avec une logique à 3 états
const calculateNextAvailableSlot = (
  bookedPeriods: { startDate: string; endDate: string }[]
): { message: string } | null => {
  // CAS 1: Totalement Disponible
  if (!bookedPeriods || bookedPeriods.length === 0) {
    return {
      message: "Disponible dès aujourd'hui",
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sortedPeriods = [...bookedPeriods]
    .map((p) => ({
      start: new Date(p.startDate),
      end: new Date(p.endDate),
    }))
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  // Gérer les réservations qui commencent aujourd'hui ou dans le passé mais finissent dans le futur
  const firstRelevantPeriod = sortedPeriods.find((p) => p.end >= today);
  if (!firstRelevantPeriod) {
    // Toutes les réservations sont passées
    return { message: "Disponible dès aujourd'hui" };
  }

  // Si la première réservation pertinente est dans le futur, il y a un créneau avant.
  if (isAfter(firstRelevantPeriod.start, today)) {
    const endOfGap = addDays(firstRelevantPeriod.start, -1);
    const duration = differenceInDays(endOfGap, today) + 1;
    return {
      message: `Prochain créneau : du ${format(
        today,
        "dd/MM/yyyy"
      )} au ${format(endOfGap, "dd/MM/yyyy")} (${duration} jours)`,
    };
  }

  // Parcourir les réservations pour trouver un créneau entre elles
  for (let i = 0; i < sortedPeriods.length - 1; i++) {
    const currentPeriodEnd = sortedPeriods[i].end;
    const nextPeriodStart = sortedPeriods[i + 1].start;

    // On ne considère que les créneaux futurs
    if (currentPeriodEnd < today) continue;

    const availableStart = addDays(currentPeriodEnd, 1);

    if (isAfter(nextPeriodStart, availableStart)) {
      const availableEnd = addDays(nextPeriodStart, -1);
      const duration = differenceInDays(availableEnd, availableStart) + 1;
      if (duration > 0) {
        return {
          message: `Prochain créneau : du ${format(
            availableStart,
            "dd/MM/yyyy"
          )} au ${format(availableEnd, "dd/MM/yyyy")} (${duration} jours)`,
        };
      }
    }
  }

  // CAS 2: Disponible à partir de (après la dernière réservation)
  const lastPeriodEnd = sortedPeriods[sortedPeriods.length - 1].end;
  const nextAvailableDate = addDays(lastPeriodEnd, 1);

  return {
    message: `Disponible à partir du ${format(
      nextAvailableDate,
      "dd/MM/yyyy"
    )}`,
  };
};

export const BookingModal = ({
  isOpen,
  onClose,
  tool,
  bookedPeriods,
}: BookingModalProps) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [showContract, setShowContract] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  // Hook pour gérer le paiement
  const {
    isPaymentModalOpen,
    currentBookingId,
    currentAmount,
    closePaymentModal,
    handlePaymentSuccess,
    handlePaymentError,
    createBookingWithPayment,
  } = usePayment();

  // Valeur par défaut pour éviter undefined
  const safeBookedPeriods = bookedPeriods || [];

  const isFormValid = startDate && endDate && hasAcceptedTerms;
  const controls = useAnimation();

  useEffect(() => {
    // Bloquer le scroll de l'arrière-plan quand la modale est ouverte
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Nettoyage au démontage du composant
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

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

  useEffect(() => {
    if (isFormValid) {
      // Animation "Pulse & Shine" quand le formulaire devient valide
      controls.start({
        scale: [1, 1.05, 1],
        transition: { duration: 0.3 },
      });
    }
  }, [isFormValid, controls]);

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
      const isOverlapping = safeBookedPeriods.some(
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

      // Utiliser la nouvelle méthode avec paiement
      const success = await createBookingWithPayment(bookingData);

      if (success) {
        // Le modal de paiement s'ouvrira automatiquement si nécessaire
        // ou on affichera un message de succès
        onClose();
        // Ne pas naviguer automatiquement, laisser l'utilisateur gérer le paiement
      }
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
  const excludeIntervals = Array.isArray(safeBookedPeriods)
    ? safeBookedPeriods.map((period) => ({
        start: new Date(period.startDate),
        end: new Date(period.endDate),
      }))
    : [];

  // Affichage du PaymentModal après la création de la réservation
  console.log(
    "BookingModal: isPaymentModalOpen",
    isPaymentModalOpen,
    "currentBookingId",
    currentBookingId,
    "currentAmount",
    currentAmount
  );
  return (
    <AnimatePresence>
      {isOpen && (
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
            <div className="relative p-4 border-b border-gray-100">
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
            {safeBookedPeriods.length > 0 && (
              <div className="mb-4 flex items-start gap-3 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-xl shadow-sm">
                <Clock className="w-6 h-6 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-blue-900 mb-1">
                    {calculateNextAvailableSlot(safeBookedPeriods)?.message}
                  </div>
                  <p className="text-blue-700 text-sm">
                    {safeBookedPeriods.length} réservation
                    {safeBookedPeriods.length > 1 ? "s" : ""} active
                    {safeBookedPeriods.length > 1 ? "s" : ""} en cours
                  </p>
                </div>
              </div>
            )}

            {/* Message quand aucune réservation active */}
            {safeBookedPeriods.length === 0 && (
              <div className="mb-4 flex items-start gap-3 p-4 bg-green-50 border-l-4 border-green-400 rounded-xl shadow-sm">
                <Clock className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-green-900 mb-1">
                    Outil disponible
                  </div>
                  <p className="text-green-700 text-sm">
                    Aucune réservation active - vous pouvez réserver dès
                    maintenant
                  </p>
                </div>
              </div>
            )}

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="p-4">
              <div className="space-y-4">
                {/* Dates et Récapitulatif Unifiés */}
                <div className="bg-gray-50 rounded-xl p-4">
                  {/* Dates */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <h3 className="text-sm font-semibold text-gray-900">
                        Choisissez vos dates de location
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <DatePicker
                        selected={startDate}
                        onChange={(date: Date | null) => setStartDate(date)}
                        minDate={new Date()}
                        excludeDateIntervals={excludeIntervals}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Date de début"
                        className="w-full border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 py-2 px-3 bg-white"
                        locale="fr"
                      />
                      <DatePicker
                        selected={endDate}
                        onChange={(date: Date | null) => setEndDate(date)}
                        minDate={startDate || new Date()}
                        excludeDateIntervals={excludeIntervals}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Date de fin"
                        className="w-full border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 py-2 px-3 bg-white"
                        locale="fr"
                      />
                    </div>
                    {dateError && (
                      <div className="text-red-600 text-sm mt-2">
                        {dateError}
                      </div>
                    )}
                  </div>

                  {/* Récapitulatif (Apparition animée) */}
                  <AnimatePresence>
                    {startDate && endDate && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="bg-white rounded-md p-4 border border-gray-300 mt-4 overflow-hidden"
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Durée</span>
                            <span className="font-medium text-blue-700">
                              <AnimatedNumber
                                value={differenceInDays(
                                  new Date(endDate),
                                  new Date(startDate)
                                )}
                              />{" "}
                              jours
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Caution</span>
                            <span className="font-medium text-blue-700">
                              {tool.caution?.toLocaleString() || 0} FCFA
                            </span>
                          </div>
                          <div className="border-t-2 border-gray-200 pt-2 mt-2">
                            <div className="flex justify-between font-bold text-base">
                              <span>Total</span>
                              <span className="text-blue-700">
                                <AnimatedNumber
                                  value={
                                    differenceInDays(
                                      new Date(endDate),
                                      new Date(startDate)
                                    ) * tool.dailyPrice
                                  }
                                  formatAsCurrency={true}
                                />
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Conditions de location */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="terms"
                          checked={hasAcceptedTerms}
                          onChange={(e) =>
                            setHasAcceptedTerms(e.target.checked)
                          }
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          disabled={!startDate || !endDate}
                        />
                        <label
                          htmlFor="terms"
                          className="text-sm text-gray-700"
                        >
                          J'accepte les{" "}
                          <button
                            type="button"
                            onClick={() => setShowContract(true)}
                            className="text-blue-600 hover:text-blue-700 font-medium underline cursor-pointer"
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
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                {/* Boutons d'action */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isLoading}
                    disabled={!isFormValid || isLoading}
                    animate={controls}
                  >
                    {isLoading ? "Création..." : "Confirmer la réservation"}
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Modal du contrat */}
      <ContractModal
        isOpen={showContract}
        onClose={() => setShowContract(false)}
        tool={tool}
        startDate={startDate ? format(startDate, "yyyy-MM-dd") : ""}
        endDate={endDate ? format(endDate, "yyyy-MM-dd") : ""}
      />

      {/* Modal de paiement */}
      <AnimatePresence>
        {isPaymentModalOpen && currentBookingId && (
          <PaymentModal
            isOpen={isPaymentModalOpen}
            onClose={closePaymentModal}
            bookingId={currentBookingId}
            amount={currentAmount}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
          />
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};
