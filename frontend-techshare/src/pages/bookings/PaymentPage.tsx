import { useParams, useNavigate } from "react-router-dom";
import { PaymentForm } from "@/components/features/booking/PaymentForm";
import { useEffect, useState } from "react";
import { bookingService } from "@/services/bookingService";
import { Spinner } from "@/components/common/Spinner";
import { Booking } from "@/interfaces/booking/booking.interface";

const PaymentPage = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [amount, setAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);

  console.log("[PaymentPage] bookingId reçu:", bookingId);

  useEffect(() => {
    if (!bookingId) {
      setError("Aucun identifiant de réservation fourni.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    bookingService
      .getBooking(bookingId)
      .then((data) => {
        console.log("[PaymentPage] booking récupéré:", data);
        setBooking(data);
        setAmount(data.totalPrice);
      })
      .catch((err) => {
        console.error(
          "[PaymentPage] Erreur lors de la récupération du booking:",
          err
        );
        setError("Impossible de récupérer la réservation.");
      })
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (loading) return <Spinner />;
  if (error || !bookingId || amount === null)
    return (
      <div className="p-8 text-center text-red-600">
        {error || "Erreur inconnue."}
      </div>
    );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      {booking && (
        <div style={{ marginBottom: 16 }}>
          <h2>Résumé de la réservation</h2>
          <div>Outil : {booking.toolId}</div>
          <div>Date début : {booking.startDate}</div>
          <div>Date fin : {booking.endDate}</div>
          <div>Prix total : {booking.totalPrice} XOF</div>
          <div>Statut : {booking.status}</div>
        </div>
      )}
      <PaymentForm
        amount={amount}
        onSuccess={() => navigate("/bookings")}
        onError={() => {}}
        onCancel={() => navigate("/bookings")}
        bookingId={bookingId}
      />
    </div>
  );
};

export default PaymentPage;
