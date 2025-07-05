import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { bookingService } from "@/services/bookingService";
import { Spinner } from "@/components/common/Spinner";
import { Booking } from "@/interfaces/booking/booking.interface";
import { CheckCircle, Calendar, MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";

const PaymentSuccessPage = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setBooking(data);
      })
      .catch((err) => {
        console.error("Erreur lors de la récupération du booking:", err);
        setError("Impossible de récupérer la réservation.");
      })
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (loading) return <Spinner />;

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">
            {error || "Erreur inconnue"}
          </div>
          <Button onClick={() => navigate("/bookings")}>
            Retour aux réservations
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header de succès */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Paiement confirmé !
            </h1>
            <p className="text-gray-600">
              Votre réservation a été confirmée et le paiement a été traité avec
              succès.
            </p>
          </div>

          {/* Carte de réservation */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Détails de votre réservation
            </h2>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Période de location</p>
                  <p className="font-medium">
                    {formatDate(booking.startDate)} -{" "}
                    {formatDate(booking.endDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Outil réservé</p>
                  <p className="font-medium">ID: {booking.toolId}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Montant total</span>
                  <span className="text-2xl font-bold text-green-600">
                    {booking.totalPrice.toLocaleString()} FCFA
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              Prochaines étapes
            </h3>
            <div className="space-y-3 text-blue-800">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Le propriétaire de l'outil va confirmer votre réservation</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>
                  Vous recevrez une notification dès que la réservation sera
                  approuvée
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>
                  Préparez-vous à récupérer l'outil à la date de début de
                  location
                </p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Besoin d'aide ?
            </h3>
            <div className="space-y-2 text-gray-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>support@techshare.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+225 0123456789</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => navigate("/bookings")} className="flex-1">
              Voir mes réservations
            </Button>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="flex-1"
            >
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
