import { motion } from "framer-motion";
import { ReceivedBooking } from "@/interfaces/booking/received-booking.interface";
import { ReceivedBookingCard } from "@/components/features/booking/ReceivedBookingCard";

interface ReceivedBookingsListProps {
  bookings: ReceivedBooking[];
  actionLoading: string | null;
  onConfirm: (id: string) => void;
  onReject: (id: string) => void;
  onComplete: (id: string) => void;
  onViewDetails: (booking: ReceivedBooking) => void;
}

export const ReceivedBookingsList = ({
  bookings,
  actionLoading,
  onConfirm,
  onReject,
  onComplete,
  onViewDetails,
}: ReceivedBookingsListProps) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {bookings.map((booking, index) => (
        <ReceivedBookingCard
          key={booking.id}
          booking={booking}
          actionLoading={actionLoading}
          onConfirm={onConfirm}
          onReject={onReject}
          onComplete={onComplete}
          onViewDetails={() => onViewDetails(booking)}
          index={index}
        />
      ))}
    </motion.div>
  );
};
