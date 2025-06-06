import { Booking } from "@/types/booking";
import { BookingStatus, PaymentStatus } from "@/interfaces/Booking";

export const mockReservations: Booking[] = [
  {
    id: "1",
    toolId: "1",
    userId: "1",
    startDate: new Date("2024-03-20"),
    endDate: new Date("2024-03-25"),
    status: BookingStatus.CONFIRMED,
    paymentStatus: PaymentStatus.PAID,
    totalPrice: 100,
    createdAt: new Date("2024-03-15"),
    updatedAt: new Date("2024-03-15"),
    notes: "Première réservation",
  },
  {
    id: "2",
    toolId: "2",
    userId: "2",
    startDate: new Date("2024-03-22"),
    endDate: new Date("2024-03-24"),
    status: BookingStatus.PENDING,
    paymentStatus: PaymentStatus.PENDING,
    totalPrice: 75,
    createdAt: new Date("2024-03-16"),
    updatedAt: new Date("2024-03-16"),
    notes: "Réservation en attente",
  },
];
