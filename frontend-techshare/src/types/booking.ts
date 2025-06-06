import { BookingStatus, PaymentStatus } from "@/interfaces/Booking";

export interface Booking {
  id: string;
  toolId: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export interface BookingInput {
  toolId: string;
  startDate: Date;
  endDate: Date;
  notes?: string;
}
