/**
 * Enum representing the possible statuses of a booking
 */
export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

/**
 * Enum representing the possible statuses of a payment
 */
export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  REFUNDED = "REFUNDED",
  FAILED = "FAILED",
}
