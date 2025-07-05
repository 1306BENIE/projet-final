import { useState, useEffect, useRef } from "react";
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
import { fr } from "date-fns/locale";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { useNavigate } from "react-router-dom";
import { bookingService } from "@/services/bookingService";
import { useSkeleton } from "@/context/useSkeleton";

registerLocale("fr", fr);

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tool: Tool;
  bookedPeriods: { startDate: string; endDate: string }[];
}

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
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const { setShowSkeleton } = useSkeleton();

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
    if (!isFormValid) return;
    setError(null);
    setIsLoading(true);
    const minLoadingPromise = new Promise((resolve) => {
      loadingTimeoutRef.current = setTimeout(resolve, 300); // Réduit à 300ms
    });
    try {
      if (!startDate || !endDate) {
        setIsLoading(false);
        return;
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
      const result = await bookingService.createBookingWithPayment(bookingData);
      await minLoadingPromise;
      if (result && result.booking && result.booking.id) {
        setIsLoading(false);
        setShowSkeleton(true);
        onClose();
        setTimeout(() => {
          navigate(`/payment/${result.booking.id}`);
        }, 200);
        return;
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
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    }
  };

  // Prépare les intervalles à désactiver pour le DatePicker
  const excludeIntervals = Array.isArray(safeBookedPeriods)
    ? safeBookedPeriods.map((period) => ({
        start: new Date(period.startDate),
        end: new Date(period.endDate),
      }))
    : [];

  return (
    <>
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
              <div className="relative p-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shadow-md">
                      {tool.images[0] && (
                        <img
                          src={tool.images[0]}
                          alt={tool.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        {tool.name}
                      </h2>
                      <p className="text-xs text-gray-500">
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
                <p className="text-sm text-blue-600 font-medium mt-1 text-right">
                  {tool.dailyPrice.toLocaleString()} FCFA / jour
                </p>
              </div>

              {/* Bloc d'alerte périodes réservées - design pro */}
              <AnimatePresence>
                {safeBookedPeriods.length > 0
                  ? (() => {
                      const key = "reserved-periods-alert";
                      console.log(
                        "ReservedPeriods AnimatePresence child key:",
                        key
                      );
                      return (
                        <div
                          key={key}
                          className="mb-3 flex items-start gap-2 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-xl shadow-sm"
                        >
                          <Clock className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-semibold text-blue-900 text-sm">
                              {
                                calculateNextAvailableSlot(safeBookedPeriods)
                                  ?.message
                              }
                            </div>
                            <p className="text-blue-700 text-xs">
                              {safeBookedPeriods.length} réservation
                              {safeBookedPeriods.length > 1 ? "s" : ""} active
                              {safeBookedPeriods.length > 1 ? "s" : ""} en cours
                            </p>
                          </div>
                        </div>
                      );
                    })()
                  : (() => {
                      const key = "no-reservation-alert";
                      console.log(
                        "NoReservation AnimatePresence child key:",
                        key
                      );
                      return (
                        <div
                          key={key}
                          className="mb-3 flex items-start gap-2 p-3 bg-green-50 border-l-4 border-green-400 rounded-xl shadow-sm"
                        >
                          <Clock className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-semibold text-green-900 text-sm">
                              Outil disponible
                            </div>
                            <p className="text-green-700 text-xs">
                              Aucune réservation active - vous pouvez réserver
                              dès maintenant
                            </p>
                          </div>
                        </div>
                      );
                    })()}
              </AnimatePresence>

              {/* Formulaire */}
              <form onSubmit={handleSubmit} className="p-3">
                <div className="space-y-3">
                  {/* Dates et Récapitulatif Unifiés */}
                  <div className="bg-gray-50 rounded-xl p-3">
                    {/* Dates */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
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
                        <div className="text-red-600 text-sm mt-1">
                          {dateError}
                        </div>
                      )}
                    </div>

                    {/* Récapitulatif (Apparition animée) */}
                    <AnimatePresence>
                      {startDate && endDate
                        ? (() => {
                            const key = "recap-animated";
                            console.log(
                              "Recap AnimatePresence child key:",
                              key
                            );
                            return (
                              <motion.div
                                key={key}
                                initial={{ opacity: 0, height: 0, y: -10 }}
                                animate={{ opacity: 1, height: "auto", y: 0 }}
                                exit={{ opacity: 0, height: 0, y: -10 }}
                                transition={{
                                  duration: 0.3,
                                  ease: "easeInOut",
                                }}
                                className="bg-white rounded-md p-3 border border-gray-300 mt-3 overflow-hidden"
                              >
                                <div className="space-y-1.5">
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
                                    <span className="text-gray-600">
                                      Prix de location
                                    </span>
                                    <span className="font-medium text-gray-900">
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
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">
                                      Caution
                                    </span>
                                    <span className="font-medium text-blue-700">
                                      {tool.caution?.toLocaleString() || 0} FCFA
                                    </span>
                                  </div>
                                  <div className="border-t-2 border-gray-200 pt-1.5 mt-1.5">
                                    <div className="flex justify-between font-bold text-base">
                                      <span>Total à payer</span>
                                      <span className="text-blue-700">
                                        <AnimatedNumber
                                          value={
                                            differenceInDays(
                                              new Date(endDate),
                                              new Date(startDate)
                                            ) *
                                              tool.dailyPrice +
                                            (tool.caution || 0)
                                          }
                                          formatAsCurrency={true}
                                        />
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1.5 bg-blue-50 p-2 rounded">
                                    Le montant total inclut la caution de{" "}
                                    {tool.caution?.toLocaleString() || 0} FCFA,
                                    qui vous sera restituée après la location si
                                    aucune anomalie n'est constatée.
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })()
                        : (() => {
                            console.log(
                              "Recap AnimatePresence: no child rendered"
                            );
                            return null;
                          })()}
                    </AnimatePresence>
                  </div>

                  {/* Conditions de location */}
                  <div className="space-y-1">
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
                          <p className="text-xs text-gray-500 mt-0.5 ml-6">
                            Sélectionnez les dates de réservation pour activer
                            l'acceptation des conditions
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Message d'erreur */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Boutons d'action */}
                  <div className="flex justify-end gap-3 pt-2">
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
                      disabled={!isFormValid || isLoading}
                      animate={controls}
                      style={{ minWidth: 220 }}
                    >
                      {isLoading ? "Validation..." : "Confirmer la réservation"}
                    </Button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Modal du contrat */}
        <AnimatePresence>
          {showContract
            ? (() => {
                const key = "contract-modal";
                console.log("ContractModal AnimatePresence child key:", key);
                return (
                  <ContractModal
                    key={key}
                    isOpen={showContract}
                    onClose={() => setShowContract(false)}
                    tool={tool}
                    startDate={startDate ? format(startDate, "yyyy-MM-dd") : ""}
                    endDate={endDate ? format(endDate, "yyyy-MM-dd") : ""}
                  />
                );
              })()
            : (() => {
                console.log("ContractModal AnimatePresence: no child rendered");
                return null;
              })()}
        </AnimatePresence>
      </AnimatePresence>
    </>
  );
};
