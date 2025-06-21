import {
  CreditCard,
  ShieldCheck,
  RefreshCcw,
  AlertCircle,
  Clock,
} from "lucide-react";

interface PaymentStatusBadgeProps {
  paymentStatus:
    | "pending"
    | "paid"
    | "partially_refunded"
    | "refunded"
    | "failed";
}

export const PaymentStatusBadge = ({
  paymentStatus,
}: PaymentStatusBadgeProps) => {
  const statusConfig = {
    paid: {
      text: "Payé",
      icon: <ShieldCheck className="w-3 h-3" />,
      className:
        "bg-green-100 text-green-800 border-green-200/80 backdrop-blur-sm bg-white/50",
    },
    pending: {
      text: "En attente",
      icon: <Clock className="w-3 h-3" />,
      className:
        "bg-yellow-100 text-yellow-800 border-yellow-200/80 backdrop-blur-sm bg-white/50",
    },
    failed: {
      text: "Échoué",
      icon: <AlertCircle className="w-3 h-3" />,
      className:
        "bg-red-100 text-red-800 border-red-200/80 backdrop-blur-sm bg-white/50",
    },
    refunded: {
      text: "Remboursé",
      icon: <RefreshCcw className="w-3 h-3" />,
      className:
        "bg-blue-100 text-blue-800 border-blue-200/80 backdrop-blur-sm bg-white/50",
    },
    partially_refunded: {
      text: "Remb. Partiel",
      icon: <RefreshCcw className="w-3 h-3" />,
      className:
        "bg-orange-100 text-orange-800 border-orange-200/80 backdrop-blur-sm bg-white/50",
    },
    unpaid: {
      // Keep unpaid as a fallback, though not in the type
      text: "Non Payé",
      icon: <CreditCard className="w-3 h-3" />,
      className:
        "bg-yellow-100 text-yellow-800 border-yellow-200/80 backdrop-blur-sm bg-white/50",
    },
  };

  const config = statusConfig[paymentStatus] || statusConfig.pending;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full border ${config.className}`}
    >
      {config.icon}
      <span>{config.text}</span>
    </div>
  );
};
