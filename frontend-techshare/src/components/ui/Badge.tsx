import {
  CheckCircle,
  Clock,
  XCircle,
  RefreshCcw,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import React from "react";

// Mapping des statuts vers label, couleur et icône
const statusMap: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  pending: {
    label: "En attente",
    color: "bg-yellow-100 text-yellow-800",
    icon: <Clock className="w-4 h-4 mr-1" />,
  },
  confirmed: {
    label: "Confirmée",
    color: "bg-green-100 text-green-800",
    icon: <CheckCircle className="w-4 h-4 mr-1" />,
  },
  cancelled: {
    label: "Annulée",
    color: "bg-red-100 text-red-800",
    icon: <XCircle className="w-4 h-4 mr-1" />,
  },
  refunded: {
    label: "Remboursée",
    color: "bg-blue-100 text-blue-800",
    icon: <RefreshCcw className="w-4 h-4 mr-1" />,
  },
  paid: {
    label: "Payé",
    color: "bg-green-100 text-green-800",
    icon: <CreditCard className="w-4 h-4 mr-1" />,
  },
  failed: {
    label: "Échoué",
    color: "bg-red-100 text-red-800",
    icon: <AlertCircle className="w-4 h-4 mr-1" />,
  },
};

interface BadgeProps {
  status: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className = "" }) => {
  const s = statusMap[status] || statusMap["pending"];
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${s.color} ${className}`}
    >
      {s.icon}
      {s.label}
    </span>
  );
};
