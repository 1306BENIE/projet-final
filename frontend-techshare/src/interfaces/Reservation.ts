export enum ReservationStatus {
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

export interface Reservation {
  id: string;
  userId: string;
  toolId: string;
  startDate: Date;
  endDate: Date;
  status: ReservationStatus;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
  paymentStatus: PaymentStatus;
}

export interface CreateReservationDto {
  toolId: string;
  startDate: Date;
  endDate: Date;
}

export interface UpdateReservationDto {
  startDate?: Date;
  endDate?: Date;
  status?: ReservationStatus;
  paymentStatus?: PaymentStatus;
}
