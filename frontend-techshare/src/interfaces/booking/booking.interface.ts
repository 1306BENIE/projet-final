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

export interface ToolLite {
  name: string;
  images?: string[];
  brand?: string;
  modelName?: string;
  caution?: number;
}

/**
 * Interface representing a booking in the system
 */
export interface Booking {
  /** Unique identifier of the booking */
  id: string;

  /** ID of the user who made the booking */
  userId: string;

  /** ID of the tool being booked */
  toolId: string;

  /** Start date of the booking period */
  startDate: string;

  /** End date of the booking period */
  endDate: string;

  /** Current status of the booking */
  status: BookingStatus;

  /** Total price of the booking */
  totalPrice: number;

  /** Date when the booking was created */
  createdAt: string;

  /** Date when the booking was last updated */
  updatedAt: string;

  /** Current status of the payment */
  paymentStatus: PaymentStatus;

  /** Optional notes about the booking */
  notes?: string;

  tool?: ToolLite;
  toolName?: string;
}
