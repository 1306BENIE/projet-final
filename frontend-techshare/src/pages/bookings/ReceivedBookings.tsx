import { useState, useEffect } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  User2,
  Info,
  Inbox,
  Loader2,
  User,
} from "lucide-react";
import { Booking } from "@/interfaces/booking/booking.interface";
import { Tool } from "@/interfaces/tools/tool";
import { User as UserType } from "@/interfaces/User";
import { ReceivedBooking } from "@/interfaces/booking/received-booking.interface";
import { bookingService } from "@/services/bookingService";
import { getUserById } from "@/services/userService";
import { toolService } from "@/services/toolService";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  CANCELLED: "Annulée",
  COMPLETED: "Terminée",
};
const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 animate-pulse",
  CONFIRMED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  COMPLETED: "bg-blue-100 text-blue-800",
};

const rowVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07 },
  }),
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 40 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 25 },
  },
  exit: { opacity: 0, scale: 0.9, y: 40, transition: { duration: 0.2 } },
};

export default function ReceivedBookings() {
  const [bookings, setBookings] = useState<ReceivedBooking[]>([]);
  const [selected, setSelected] = useState<ReceivedBooking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReceivedBookings() {
      setLoading(true);
      try {
        const rawBookings: Booking[] =
          await bookingService.getReceivedBookings();
        const enriched: ReceivedBooking[] = await Promise.all(
          rawBookings.map(async (booking) => {
            const tool: Tool = await toolService.getToolById(booking.toolId);
            const renter: UserType = await getUserById(booking.userId);
            return {
              id: booking.id,
              tool: { name: tool.name, image: tool.images[0] || "" },
              renter: {
                name: renter.firstName + " " + renter.lastName,
                email: renter.email,
              },
              startDate: booking.startDate,
              endDate: booking.endDate,
              status: booking.status,
            };
          })
        );
        setBookings(enriched);
      } catch {
        toast.error("Erreur lors du chargement des réservations reçues");
      } finally {
        setLoading(false);
      }
    }
    fetchReceivedBookings();
  }, []);

  // Loader
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <span className="text-lg text-blue-700 font-semibold">
          Chargement des réservations reçues...
        </span>
      </div>
    );
  }

  // Empty state
  if (!bookings.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
        <Inbox className="w-16 h-16 text-blue-300 mb-4" />
        <h2 className="text-2xl font-bold text-blue-800 mb-2">
          Aucune réservation reçue
        </h2>
        <p className="text-gray-600 mb-4">
          Vous n'avez pas encore reçu de demande de réservation sur vos outils.
        </p>
        <a
          href="/my-tools"
          className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
        >
          Voir mes outils
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <Inbox className="w-10 h-10 text-blue-600 bg-white rounded-full shadow p-2 animate-fade-in" />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-blue-900">
                Réservations reçues
              </h1>
              <p className="text-blue-700 mt-1 text-lg">
                Gérez les demandes de réservation sur vos outils en toute
                simplicité
              </p>
            </div>
          </div>
        </motion.div>
        {/* Liste/tableau */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/90 rounded-2xl shadow-xl p-6 border border-blue-100 overflow-x-auto"
        >
          <table className="min-w-full divide-y divide-blue-100">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-blue-500 uppercase">
                  Outil
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-blue-500 uppercase">
                  Locataire
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-blue-500 uppercase">
                  Dates
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-blue-500 uppercase">
                  Statut
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-blue-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              <AnimatePresence>
                {bookings.map((booking, i) => (
                  <motion.tr
                    key={booking.id}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={rowVariants}
                    className="hover:bg-blue-50/70 transition group cursor-pointer"
                    whileHover={{
                      scale: 1.01,
                      boxShadow: "0 4px 24px 0 rgba(37,99,235,0.08)",
                    }}
                  >
                    {/* Outil */}
                    <td className="px-4 py-4 flex items-center gap-3">
                      <motion.img
                        src={booking.tool.image}
                        alt={booking.tool.name}
                        className="w-12 h-12 rounded-xl object-cover border-2 border-blue-100 shadow-sm"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 + 0.2 }}
                      />
                      <span className="font-semibold text-blue-900">
                        {booking.tool.name}
                      </span>
                    </td>
                    {/* Locataire */}
                    <td className="px-4 py-4 flex items-center gap-3">
                      <motion.div
                        className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-lg shadow"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.1 + 0.3 }}
                        title={booking.renter.name}
                      >
                        <User className="w-5 h-5" />
                      </motion.div>
                      <div>
                        <span className="block font-medium text-blue-900">
                          {booking.renter.name}
                        </span>
                        <span className="block text-xs text-blue-400">
                          {booking.renter.email}
                        </span>
                      </div>
                    </td>
                    {/* Dates */}
                    <td className="px-4 py-4 flex items-center gap-2">
                      <CalendarCheck className="w-5 h-5 text-blue-400" />
                      <span className="text-blue-800 font-medium">
                        {booking.startDate} → {booking.endDate}
                      </span>
                    </td>
                    {/* Statut */}
                    <td className="px-4 py-4">
                      <motion.span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow ${
                          STATUS_COLORS[booking.status]
                        }`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.1 + 0.4 }}
                        title={STATUS_LABELS[booking.status]}
                      >
                        {STATUS_LABELS[booking.status]}
                      </motion.span>
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-4 flex gap-2">
                      {booking.status === "PENDING" && (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          whileHover={{
                            scale: 1.07,
                            boxShadow: "0 2px 8px 0 rgba(34,197,94,0.12)",
                          }}
                          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-green-100 text-green-800 hover:bg-green-200 text-xs font-semibold transition shadow relative overflow-hidden"
                          onClick={() =>
                            toast.success("Réservation confirmée (démo)")
                          }
                          title="Confirmer la réservation"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Confirmer
                        </motion.button>
                      )}
                      {booking.status === "PENDING" && (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          whileHover={{
                            scale: 1.07,
                            boxShadow: "0 2px 8px 0 rgba(239,68,68,0.12)",
                          }}
                          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-100 text-red-800 hover:bg-red-200 text-xs font-semibold transition shadow relative overflow-hidden"
                          onClick={() =>
                            toast.success("Réservation refusée (démo)")
                          }
                          title="Refuser la réservation"
                        >
                          <XCircle className="w-4 h-4" /> Refuser
                        </motion.button>
                      )}
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        whileHover={{
                          scale: 1.07,
                          boxShadow: "0 2px 8px 0 rgba(37,99,235,0.12)",
                        }}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs font-semibold transition shadow relative overflow-hidden"
                        onClick={() => setSelected(booking)}
                        title="Voir les détails"
                      >
                        <Info className="w-4 h-4" /> Détails
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </motion.div>
        {/* Modal de détails animé */}
        <AnimatePresence>
          {selected && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={modalVariants}
            >
              <motion.div
                className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative animate-fade-in-up"
                initial={{ scale: 0.9, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 40 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <button
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
                  onClick={() => setSelected(null)}
                >
                  <XCircle className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Inbox className="w-6 h-6 text-blue-500 animate-bounce" />
                  Détails de la réservation
                </h2>
                <div className="mb-2 flex items-center gap-2">
                  <User2 className="w-5 h-5 text-blue-400" />
                  <span className="font-medium">{selected.renter.name}</span>
                  <span className="text-blue-500 text-sm">
                    ({selected.renter.email})
                  </span>
                </div>
                <div className="mb-2 flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-blue-400" />
                  <span>
                    {selected.startDate} → {selected.endDate}
                  </span>
                </div>
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow ${
                      STATUS_COLORS[selected.status]
                    }`}
                  >
                    {STATUS_LABELS[selected.status]}
                  </span>
                </div>
                <div className="mb-2 flex items-center gap-2">
                  <img
                    src={selected.tool.image}
                    alt={selected.tool.name}
                    className="w-10 h-10 rounded-lg object-cover border border-blue-100"
                  />
                  <span className="font-medium text-blue-900">
                    {selected.tool.name}
                  </span>
                </div>
                {/* Actions contextuelles dans le modal */}
                {selected.status === "PENDING" && (
                  <div className="flex gap-2 mt-4">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      whileHover={{
                        scale: 1.07,
                        boxShadow: "0 2px 8px 0 rgba(34,197,94,0.12)",
                      }}
                      className="flex items-center gap-1 px-4 py-2 rounded-lg bg-green-100 text-green-800 hover:bg-green-200 text-sm font-semibold transition shadow"
                      onClick={() =>
                        toast.success("Réservation confirmée (démo)")
                      }
                    >
                      <CheckCircle2 className="w-4 h-4" /> Confirmer
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      whileHover={{
                        scale: 1.07,
                        boxShadow: "0 2px 8px 0 rgba(239,68,68,0.12)",
                      }}
                      className="flex items-center gap-1 px-4 py-2 rounded-lg bg-red-100 text-red-800 hover:bg-red-200 text-sm font-semibold transition shadow"
                      onClick={() =>
                        toast.success("Réservation refusée (démo)")
                      }
                    >
                      <XCircle className="w-4 h-4" /> Refuser
                    </motion.button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
