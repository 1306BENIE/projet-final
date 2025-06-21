import { motion } from "framer-motion";
import { Loader2, CheckCircle, XCircle, Eye, Check } from "lucide-react";
import { FC, ReactNode } from "react";

interface ReceivedBookingActionsProps {
  bookingId: string;
  status: string;
  actionLoading: string | null;
  onConfirm: (id: string) => void;
  onReject: (id: string) => void;
  onComplete: (id: string) => void;
  onViewDetails: () => void;
  className?: string;
}

interface ActionButtonProps {
  onClick: () => void;
  disabled: boolean;
  icon: ReactNode;
  text: string;
  color: string;
  hoverColor: string;
  textColor?: string;
}

const ActionButton: FC<ActionButtonProps> = ({
  onClick,
  disabled,
  icon,
  text,
  color,
  hoverColor,
  textColor = "text-white",
}) => (
  <motion.button
    onClick={onClick}
    disabled={disabled}
    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all duration-300 ${color} ${textColor} ${
      disabled ? "opacity-50 cursor-not-allowed" : hoverColor
    }`}
    whileHover={{ scale: disabled ? 1 : 1.05, y: disabled ? 0 : -2 }}
    whileTap={{ scale: disabled ? 1 : 0.95 }}
  >
    {disabled ? <Loader2 className="w-5 h-5 animate-spin" /> : icon}
    <span>{text}</span>
  </motion.button>
);

export const ReceivedBookingActions: FC<ReceivedBookingActionsProps> = ({
  bookingId,
  status,
  actionLoading,
  onConfirm,
  onReject,
  onComplete,
  onViewDetails,
  className = "",
}) => {
  const isLoading = actionLoading === bookingId;

  return (
    <div className={`flex flex-col sm:flex-row gap-2 ${className}`}>
      {status === "pending" && (
        <>
          <ActionButton
            onClick={() => onConfirm(bookingId)}
            disabled={isLoading}
            icon={<CheckCircle className="w-5 h-5" />}
            text="Confirmer"
            color="bg-green-600"
            hoverColor="hover:bg-green-700"
          />
          <ActionButton
            onClick={() => onReject(bookingId)}
            disabled={isLoading}
            icon={<XCircle className="w-5 h-5" />}
            text="Rejeter"
            color="bg-red-600"
            hoverColor="hover:bg-red-700"
          />
        </>
      )}

      {status === "approved" && (
        <ActionButton
          onClick={() => onComplete(bookingId)}
          disabled={isLoading}
          icon={<Check className="w-5 h-5" />}
          text="Terminer la location"
          color="bg-blue-600"
          hoverColor="hover:bg-blue-700"
        />
      )}

      <ActionButton
        onClick={onViewDetails}
        disabled={false}
        icon={<Eye className="w-5 h-5" />}
        text="Détails"
        color="bg-gray-700"
        hoverColor="hover:bg-gray-800"
      />
    </div>
  );
};
