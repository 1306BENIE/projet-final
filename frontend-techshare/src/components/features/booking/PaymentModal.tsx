import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { X, CreditCard, Shield, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { bookingService } from "@/services/bookingService";

// Charger Stripe avec la clé publique
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "");

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  amount: number;
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
}

interface PaymentFormProps {
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
  onCancel: () => void;
  bookingId: string;
  currency?: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  onSuccess,
  onError,
  onCancel,
  bookingId,
  currency = "xof",
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("Erreur lors du chargement du formulaire de paiement");
      setIsProcessing(false);
      return;
    }

    try {
      // 1. Créer le PaymentMethod Stripe
      const { error: pmError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card: cardElement,
        });
      if (pmError || !paymentMethod) {
        setError(
          pmError?.message || "Erreur lors de la création du moyen de paiement"
        );
        onError(
          pmError?.message || "Erreur lors de la création du moyen de paiement"
        );
        setIsProcessing(false);
        return;
      }

      // 2. Appeler le backend pour créer le PaymentIntent avec tous les champs requis
      const paymentIntentRes = await bookingService.createPaymentIntent({
        amount,
        currency,
        rentalId: bookingId,
        paymentMethodId: paymentMethod.id,
      });
      if (!paymentIntentRes.clientSecret) {
        setError("Impossible de récupérer le client secret Stripe");
        onError("Impossible de récupérer le client secret Stripe");
        setIsProcessing(false);
        return;
      }

      // 3. Confirmer le paiement avec Stripe
      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(paymentIntentRes.clientSecret);
      if (stripeError) {
        setError(stripeError.message || "Erreur lors du paiement");
        onError(stripeError.message || "Erreur lors du paiement");
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        onSuccess();
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#9e2146",
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CreditCard className="w-4 h-4" />
          <span>Informations de paiement</span>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <CardElement options={cardElementOptions} />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Shield className="w-3 h-3" />
          <span>Vos informations de paiement sont sécurisées par Stripe</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Traitement...
            </div>
          ) : (
            `Payer ${amount.toLocaleString()} FCFA`
          )}
        </Button>
      </div>
    </form>
  );
};

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  amount,
  onPaymentSuccess,
  onPaymentError,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Utiliser useCallback pour stabiliser la fonction
  const loadPaymentIntent = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Je supprime la ligne :
      // const response = await bookingService.getPaymentIntent(bookingId);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMessage);
      onPaymentError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [onPaymentError]);

  useEffect(() => {
    if (isOpen && bookingId) {
      loadPaymentIntent();
    }
  }, [isOpen, bookingId, loadPaymentIntent]);

  const handlePaymentSuccess = () => {
    onPaymentSuccess();
    onClose();
  };

  const handlePaymentError = (error: string) => {
    onPaymentError(error);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Paiement de la réservation
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={loadPaymentIntent} variant="outline">
                  Réessayer
                </Button>
              </div>
            ) : (
              <Elements stripe={stripePromise}>
                <PaymentForm
                  amount={amount}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  onCancel={onClose}
                  bookingId={bookingId}
                  currency="xof"
                />
              </Elements>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
