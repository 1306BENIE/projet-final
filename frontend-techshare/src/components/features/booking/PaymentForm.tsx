import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { CreditCard, Shield, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { bookingService } from "@/services/bookingService";

interface PaymentFormProps {
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
  onCancel: () => void;
  bookingId: string;
  currency?: string;
}

const StripePaymentForm: React.FC<PaymentFormProps> = ({
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

      <div className="flex gap-3 mt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 py-1 rounded-lg border border-black text-black font-semibold hover:bg-gray-100 transition text-center whitespace-nowrap"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 py-1 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition text-center whitespace-nowrap"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2 justify-center">
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

export const PaymentForm = StripePaymentForm;
