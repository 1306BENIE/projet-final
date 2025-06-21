import { motion } from "framer-motion";

const STATUS_STYLES: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  pending: {
    label: "En attente",
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    dot: "bg-yellow-500",
  },
  approved: {
    label: "Confirmée",
    bg: "bg-green-100",
    text: "text-green-800",
    dot: "bg-green-500",
  },
  rejected: {
    label: "Rejetée",
    bg: "bg-red-100",
    text: "text-red-800",
    dot: "bg-red-500",
  },
  cancelled: {
    label: "Annulée",
    bg: "bg-gray-100",
    text: "text-gray-800",
    dot: "bg-gray-500",
  },
  completed: {
    label: "Terminée",
    bg: "bg-blue-100",
    text: "text-blue-800",
    dot: "bg-blue-500",
  },
};

const PAYMENT_STATUS_STYLES: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  pending: {
    label: "Paiement en attente",
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    dot: "bg-yellow-500",
  },
  paid: {
    label: "Payé",
    bg: "bg-green-100",
    text: "text-green-800",
    dot: "bg-green-500",
  },
  partially_refunded: {
    label: "Remb. partiel",
    bg: "bg-orange-100",
    text: "text-orange-800",
    dot: "bg-orange-500",
  },
  refunded: {
    label: "Remboursé",
    bg: "bg-blue-100",
    text: "text-blue-800",
    dot: "bg-blue-500",
  },
  failed: {
    label: "Échoué",
    bg: "bg-red-100",
    text: "text-red-800",
    dot: "bg-red-500",
  },
};

interface ReceivedBookingStatusProps {
  status: string;
  paymentStatus: string;
  type: "booking" | "payment";
  className?: string;
}

export const ReceivedBookingStatus = ({
  status,
  paymentStatus,
  type,
  className = "",
}: ReceivedBookingStatusProps) => {
  const styles =
    type === "booking"
      ? STATUS_STYLES[status]
      : PAYMENT_STATUS_STYLES[paymentStatus];
  const currentStatus = type === "booking" ? status : paymentStatus;

  if (!styles) {
    return (
      <div
        className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full text-xs font-medium ${className} bg-gray-100 text-gray-800`}
      >
        <span className="w-2 h-2 rounded-full bg-gray-500" />
        <span>{currentStatus}</span>
      </div>
    );
  }

  return (
    <motion.div
      className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full text-xs font-medium ${className} ${styles.bg} ${styles.text}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <span className={`w-2 h-2 rounded-full ${styles.dot}`} />
      <span>{styles.label}</span>
    </motion.div>
  );
};
