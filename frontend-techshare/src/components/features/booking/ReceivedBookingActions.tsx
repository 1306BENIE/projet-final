import { motion } from "framer-motion";
import { Loader2, CheckCircle, XCircle, Check } from "lucide-react";
import { FC, ReactNode } from "react";

interface ReceivedBookingActionsProps {
  bookingId: string;
  status: string;
  actionLoading: string | null;
  onConfirm: (id: string) => void;
  onReject: (id: string) => void;
  onComplete: (id: string) => void;
  className?: string;
}

interface ActionButtonProps {
  onClick: () => void;
  disabled: boolean;
  icon: ReactNode;
  text: string;
  variant: "primary" | "secondary" | "outline";
  color?: string;
}

const ActionButton: FC<ActionButtonProps> = ({
  onClick,
  disabled,
  icon,
  text,
  variant,
  color,
}) => {
  const baseClasses =
    "flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all duration-300";

  const variantClasses = {
    primary: `${color} text-white hover:brightness-110 shadow-md`,
    secondary: `${color} text-white hover:brightness-110 shadow-md`,
    outline:
      "border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400",
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
      whileHover={{
        scale: disabled ? 1 : 1.02,
        y: disabled ? 0 : -1,
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      {disabled ? <Loader2 className="w-5 h-5 animate-spin" /> : icon}
      <span>{text}</span>
    </motion.button>
  );
};

export const ReceivedBookingActions: FC<ReceivedBookingActionsProps> = ({
  bookingId,
  status,
  actionLoading,
  onConfirm,
  onReject,
  onComplete,
  className = "",
}) => {
  const isLoading = actionLoading === bookingId;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Actions primaires - Actions critiques qui modifient l'état */}
      <div className="flex gap-2 justify-center">
        {status === "pending" && (
          <>
            <ActionButton
              onClick={() => onConfirm(bookingId)}
              disabled={isLoading}
              icon={<CheckCircle className="w-5 h-5" />}
              text="Confirmer"
              variant="primary"
              color="bg-green-600"
            />
            <ActionButton
              onClick={() => onReject(bookingId)}
              disabled={isLoading}
              icon={<XCircle className="w-5 h-5" />}
              text="Rejeter"
              variant="secondary"
              color="bg-red-600"
            />
          </>
        )}

        {status === "approved" && (
          <ActionButton
            onClick={() => onComplete(bookingId)}
            disabled={isLoading}
            icon={<Check className="w-5 h-5" />}
            text="Terminer la location"
            variant="primary"
            color="bg-blue-600"
          />
        )}
      </div>

      {/* Action secondaire (Détails) a été déplacée dans la carte parente */}
    </div>
  );
};
