import { useState } from "react";
import { Booking, BookingStatus, PaymentStatus } from "@/interfaces/Booking";
import { useBooking } from "@/hooks/useBooking";
import { format, isBefore, startOfDay, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, Banknote, X, Edit2, Loader2 } from "lucide-react";
import { Button } from "../ui/Button/Button";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { toast } from "sonner";

interface BookingDetailsProps {
  booking: Booking;
  onClose: () => void;
  onUpdate: (booking: Booking) => void;
}

export function BookingDetails({
  booking,
  onClose,
  onUpdate,
}: BookingDetailsProps) {
  const { updateBooking, cancelBooking } = useBooking();
  const [isEditingDates, setIsEditingDates] = useState(false);
  const [startDate, setStartDate] = useState(booking.startDate);
  const [endDate, setEndDate] = useState(booking.endDate);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(booking.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStatusChange = async (status: BookingStatus) => {
    if (!booking.id || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const updatedBooking = await updateBooking(booking.id, { status });
      if (updatedBooking) {
        onUpdate(updatedBooking);
        toast.success("Statut de la réservation mis à jour");
      }
    } catch {
      toast.error("Erreur lors de la mise à jour du statut");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentStatusChange = async (status: PaymentStatus) => {
    if (!booking.id || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const updatedBooking = await updateBooking(booking.id, {
        paymentStatus: status,
      });
      if (updatedBooking) {
        onUpdate(updatedBooking);
        toast.success("Statut du paiement mis à jour");
      }
    } catch {
      toast.error("Erreur lors de la mise à jour du statut de paiement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!booking.id || isSubmitting) return;
    if (
      window.confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")
    ) {
      setIsSubmitting(true);
      try {
        const updatedBooking = await cancelBooking(booking.id);
        if (updatedBooking) {
          onUpdate(updatedBooking);
          toast.success("Réservation annulée avec succès");
        }
      } catch {
        toast.error("Erreur lors de l'annulation de la réservation");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleUpdateDates = async () => {
    if (!booking.id || isSubmitting) return;

    const today = startOfDay(new Date());
    const newStartDate = startOfDay(new Date(startDate));
    const newEndDate = startOfDay(new Date(endDate));

    if (isBefore(newStartDate, today)) {
      toast.error("La date de début ne peut pas être dans le passé");
      return;
    }

    if (isBefore(newEndDate, newStartDate)) {
      toast.error("La date de fin doit être après la date de début");
      return;
    }

    const daysDifference = differenceInDays(newEndDate, newStartDate);
    if (daysDifference < 1) {
      toast.error("La durée minimale de réservation est de 1 jour");
      return;
    }

    if (daysDifference > 30) {
      toast.error("La durée maximale de réservation est de 30 jours");
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedBooking = await updateBooking(booking.id, {
        startDate: newStartDate,
        endDate: newEndDate,
      });
      if (updatedBooking) {
        onUpdate(updatedBooking);
        setIsEditingDates(false);
        toast.success("Dates de réservation mises à jour");
      }
    } catch {
      toast.error("Erreur lors de la mise à jour des dates");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateNotes = async () => {
    if (!booking.id || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const updatedBooking = await updateBooking(booking.id, { notes });
      if (updatedBooking) {
        onUpdate(updatedBooking);
        setIsEditingNotes(false);
        toast.success("Notes mises à jour");
      }
    } catch {
      toast.error("Erreur lors de la mise à jour des notes");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBookingEditable = booking.status !== BookingStatus.CANCELLED;
  const isPaymentEditable = booking.status !== BookingStatus.CANCELLED;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Détails de la réservation
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          disabled={isSubmitting}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="space-y-6">
        {/* Informations de base */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Date de début</p>
              {isEditingDates ? (
                <Input
                  type="date"
                  value={format(startDate, "yyyy-MM-dd")}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setStartDate(new Date(e.target.value))
                  }
                  disabled={isSubmitting}
                />
              ) : (
                <p className="font-medium">
                  {format(booking.startDate, "PPP", { locale: fr })}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Date de fin</p>
              {isEditingDates ? (
                <Input
                  type="date"
                  value={format(endDate, "yyyy-MM-dd")}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEndDate(new Date(e.target.value))
                  }
                  disabled={isSubmitting}
                />
              ) : (
                <p className="font-medium">
                  {format(booking.endDate, "PPP", { locale: fr })}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Prix */}
        <div className="flex items-center space-x-2">
          <Banknote className="h-5 w-5 text-gray-500" />
          <div>
            <p className="text-sm text-gray-500">Prix total</p>
            <p className="font-medium">
              {booking.totalPrice.toLocaleString()} FCFA
            </p>
          </div>
        </div>

        {/* Statuts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-2">
              Statut de la réservation
            </p>
            <div className="flex space-x-2">
              {Object.values(BookingStatus).map((status) => (
                <Button
                  key={status}
                  variant={booking.status === status ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => handleStatusChange(status)}
                  disabled={!isBookingEditable || isSubmitting}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Statut du paiement</p>
            <div className="flex space-x-2">
              {Object.values(PaymentStatus).map((status) => (
                <Button
                  key={status}
                  variant={
                    booking.paymentStatus === status ? "primary" : "ghost"
                  }
                  size="sm"
                  onClick={() => handlePaymentStatusChange(status)}
                  disabled={!isPaymentEditable || isSubmitting}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-gray-500">Notes</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingNotes(!isEditingNotes)}
              disabled={isSubmitting}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              {isEditingNotes ? "Annuler" : "Modifier"}
            </Button>
          </div>
          {isEditingNotes ? (
            <div className="space-y-2">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isSubmitting}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingNotes(false)}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleUpdateNotes}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Enregistrer"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-start">
              <p className="text-gray-700">{booking.notes || "Aucune note"}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingNotes(true)}
                disabled={!isBookingEditable || isSubmitting}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          {isEditingDates ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingDates(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleUpdateDates}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Enregistrer"
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingDates(true)}
                disabled={!isBookingEditable || isSubmitting}
              >
                Modifier les dates
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleCancel}
                disabled={!isBookingEditable || isSubmitting}
              >
                Annuler la réservation
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
