import { useParams, useNavigate } from "react-router-dom";
import { PaymentForm } from "@/components/features/booking/PaymentForm";
import { useEffect, useState } from "react";
import { bookingService } from "@/services/bookingService";
import { Booking, ToolLite } from "@/interfaces/booking/booking.interface";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { FiClock, FiLock } from "react-icons/fi";
import { motion } from "framer-motion";
import { toolService } from "@/services/toolService";
import { useSkeleton } from "@/context/useSkeleton";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function formatDate(dateStr: string) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const PaymentPage = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [amount, setAmount] = useState<number | null>(null);
  const [totalToPay, setTotalToPay] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [toolName, setToolName] = useState<string>("Outil");
  const [tool, setTool] = useState<ToolLite | null>(null);
  const { setShowSkeleton } = useSkeleton();

  console.log("[PaymentPage] bookingId reçu:", bookingId);

  useEffect(() => {
    setShowSkeleton(true);
    return () => setShowSkeleton(false);
  }, [setShowSkeleton]);

  useEffect(() => {
    if (!loading) {
      setShowSkeleton(false);
    }
  }, [loading, setShowSkeleton]);

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
        setToolName(data.tool?.name || data.toolName || "Outil");
        if (data.tool?.images?.length) {
          setTool(data.tool);
          setTotalToPay(data.totalPrice + (data.tool.caution || 0));
        } else if (data.toolId) {
          toolService
            .getToolById(data.toolId)
            .then((toolData) => {
              setTool(toolData);
              setToolName(toolData.name);
              setTotalToPay(data.totalPrice + (toolData.caution || 0));
            })
            .catch(() => {
              setTool(null);
              setTotalToPay(data.totalPrice);
            });
        } else {
          setTotalToPay(data.totalPrice);
        }
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

  // Récupération de l'image de l'outil (si dispo)
  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  let toolImage = tool?.images?.[0];
  if (toolImage && !toolImage.startsWith("http")) {
    toolImage = `${API_BASE_URL.replace(/\/api$/, "")}/${toolImage.replace(
      /^\//,
      ""
    )}`;
  } else if (!toolImage) {
    toolImage = "/default-tool.svg";
  }

  // Log pour diagnostic image
  console.log("TOOL OBJET POUR IMAGE:", tool);
  console.log("TOOL IMAGE URL:", toolImage);

  if (loading) return null; // Le skeleton overlay global s'affiche

  if (error || !bookingId || amount === null)
    return (
      <div className="p-8 text-center text-red-600">
        {error || "Erreur inconnue."}
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-2">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col items-center relative"
      >
        {/* Badge réservation */}
        <span className="absolute top-4 right-4 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm select-none">
          Réservation
        </span>
        {/* Résumé avec image premium */}
        {booking && (
          <div className="w-full mb-6 bg-gray-50 rounded-lg p-4 border border-gray-100 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <img
                src={toolImage}
                alt={toolName}
                className="h-14 w-14 rounded-xl object-cover shadow-md border-none bg-white transition-transform hover:scale-105 hover:shadow-lg"
                onError={(e) => (e.currentTarget.src = "/default-tool.svg")}
              />
              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-xl text-gray-900 truncate">
                  {toolName}
                </div>
                {(tool?.brand || tool?.modelName) && (
                  <div className="text-xs text-gray-500 truncate">
                    {tool?.brand && <span>{tool.brand}</span>}
                    {tool?.brand && tool?.modelName && <span> · </span>}
                    {tool?.modelName && <span>{tool.modelName}</span>}
                  </div>
                )}
                <div className="text-sm text-gray-600 truncate">
                  Du{" "}
                  <span className="font-medium">
                    {formatDate(booking.startDate)}
                  </span>{" "}
                  au{" "}
                  <span className="font-medium">
                    {formatDate(booking.endDate)}
                  </span>
                </div>
              </div>
            </div>
            {/* Récapitulatif détaillé */}
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Prix de location</span>
                <span className="font-semibold text-gray-900">
                  {booking.totalPrice.toLocaleString()} FCFA
                </span>
              </div>
              <div className="flex justify-between">
                <span>Caution</span>
                <span className="font-semibold text-blue-700">
                  {tool?.caution ? tool.caution.toLocaleString() : "0"} FCFA
                </span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2 font-bold text-base">
                <span>Total à payer</span>
                <span className="text-blue-700">
                  {totalToPay?.toLocaleString()} FCFA
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Le montant total inclut la caution de{" "}
              {tool?.caution ? tool.caution.toLocaleString() : "0"} FCFA,
              restituée après la location si aucune anomalie n'est constatée.
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs font-medium">
                <FiClock className="mr-1" /> En attente de paiement
              </span>
            </div>
          </div>
        )}
        {/* Formulaire de paiement Stripe */}
        <Elements stripe={stripePromise}>
          <PaymentForm
            amount={totalToPay || 0}
            onSuccess={() => navigate("/bookings")}
            onError={() => {}}
            onCancel={() => navigate("/bookings")}
            bookingId={bookingId}
          />
        </Elements>
        {/* Message de sécurité premium */}
        <div className="flex items-center gap-2 mt-6 text-xs text-gray-500">
          <FiLock className="text-blue-600" />
          Paiement 100% sécurisé par Stripe (SSL)
        </div>
        <div className="text-xs text-gray-400 mt-1 text-center">
          Aucune donnée bancaire n'est stockée sur nos serveurs.
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentPage;
