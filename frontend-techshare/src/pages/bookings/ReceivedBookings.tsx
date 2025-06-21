import { useState } from "react";
import { motion } from "framer-motion";
import { Inbox } from "lucide-react";
import { useReceivedBookings } from "@/hooks/useReceivedBookings";
import { ReceivedBookingsList } from "@/components/features/booking/ReceivedBookingsList";
import { ReceivedBookingModal } from "@/components/features/booking/ReceivedBookingModal";
import { ReceivedBooking } from "@/interfaces/booking/received-booking.interface";
import { ReceivedBookingsSkeleton } from "@/components/features/booking/ReceivedBookingsSkeleton";

export default function ReceivedBookings() {
  const {
    bookings,
    loading,
    actionLoading,
    handleConfirm,
    handleReject,
    handleComplete,
  } = useReceivedBookings();

  const [selectedBooking, setSelectedBooking] =
    useState<ReceivedBooking | null>(null);

  // Loading state with skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 py-8">
        <div className="container mx-auto px-10 max-w-8xl">
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

          {/* Skeleton */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <ReceivedBookingsSkeleton />
          </motion.div>
        </div>
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
      <div className="container mx-auto px-10 max-w-8xl">
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

        {/* Liste des réservations */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ReceivedBookingsList
            bookings={bookings}
            actionLoading={actionLoading}
            onConfirm={handleConfirm}
            onReject={handleReject}
            onComplete={handleComplete}
            onViewDetails={setSelectedBooking}
          />
        </motion.div>
      </div>

      {/* Modal de détails */}
      <ReceivedBookingModal
        booking={selectedBooking}
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
      />
    </div>
  );
}
