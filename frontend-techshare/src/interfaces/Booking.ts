export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  REFUNDED = "REFUNDED",
  FAILED = "FAILED",
}

export interface Booking {
  id: string;
  userId: string;
  toolId: string;
  startDate: Date;
  endDate: Date;
  status: BookingStatus;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
  paymentStatus: PaymentStatus;
  notes?: string;
}

export interface CreateBookingDto {
  toolId: string;
  startDate: Date;
  endDate: Date;
  notes?: string;
}

export interface UpdateBookingDto {
  startDate?: Date;
  endDate?: Date;
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  notes?: string;
}
