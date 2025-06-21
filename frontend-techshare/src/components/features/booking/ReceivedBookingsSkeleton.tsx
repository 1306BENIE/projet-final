import { ReceivedBookingCardSkeleton } from "@/components/features/booking/ReceivedBookingCardSkeleton";

export const ReceivedBookingsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <ReceivedBookingCardSkeleton key={index} />
      ))}
    </div>
  );
};
