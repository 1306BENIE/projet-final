import { BookingStatus, PaymentStatus } from "./types";

/**
 * Data Transfer Object for creating a new booking
 */
export interface CreateBookingDto {
  /** ID of the tool to book */
  toolId: string;

  /** Start date of the booking period */
  startDate: Date;

  /** End date of the booking period */
  endDate: Date;

  /** Optional notes about the booking */
  notes?: string;
}

/**
 * Data Transfer Object for updating an existing booking
 */
export interface UpdateBookingDto {
  /** New start date (optional) */
  startDate?: Date;

  /** New end date (optional) */
  endDate?: Date;

  /** New status (optional) */
  status?: BookingStatus;

  /** New payment status (optional) */
  paymentStatus?: PaymentStatus;

  /** New notes (optional) */
  notes?: string;
}
