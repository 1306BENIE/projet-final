import { Reservation } from "@/interfaces/Reservation";
import { ReservationStatus, PaymentStatus } from "@/interfaces/Reservation";

export const mockReservationsData: Reservation[] = [
  {
    id: "1",
    toolId: "1",
    userId: "1",
    startDate: new Date("2024-03-20"),
    endDate: new Date("2024-03-25"),
    status: ReservationStatus.PENDING,
    paymentStatus: PaymentStatus.PENDING,
    totalPrice: 100,
    createdAt: new Date("2024-03-15"),
    updatedAt: new Date("2024-03-15"),
  },
  {
    id: "2",
    toolId: "2",
    userId: "2",
    startDate: new Date("2024-03-22"),
    endDate: new Date("2024-03-24"),
    status: ReservationStatus.CONFIRMED,
    paymentStatus: PaymentStatus.PAID,
    totalPrice: 75,
    createdAt: new Date("2024-03-16"),
    updatedAt: new Date("2024-03-16"),
  },
];
