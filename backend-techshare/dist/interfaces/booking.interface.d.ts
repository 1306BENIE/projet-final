import { Document, Types, Model } from "mongoose";
/**
 * Interface representing a booking in the application
 */
export interface IBooking extends Document {
    /** Tool identifier */
    tool: Types.ObjectId;
    /** Renter identifier */
    renter: Types.ObjectId;
    /** Owner identifier */
    owner: Types.ObjectId;
    /** Start date of the booking */
    startDate: Date;
    /** End date of the booking */
    endDate: Date;
    /** Total price of the booking */
    totalPrice: number;
    /** Deposit amount required for the booking */
    depositAmount: number;
    /** Additional fees applied to the booking */
    additionalFees: Array<{
        /** Type of fee */
        type: "late_return" | "damage" | "cleaning" | "other";
        /** Amount of the fee */
        amount: number;
        /** Description of the fee */
        description?: string;
        /** Date when the fee was applied */
        date: Date;
    }>;
    /** Booking status */
    status: "pending" | "approved" | "rejected" | "active" | "completed" | "cancelled";
    /** Payment status */
    paymentStatus: "pending" | "paid" | "refunded" | "partially_refunded";
    /** Stripe payment identifier */
    stripePaymentId?: string;
    /** Payment intent identifier */
    paymentIntentId?: string;
    /** Optional message for the booking */
    message?: string;
    /** Review for the booking (optional) */
    review?: {
        /** Rating given */
        rating: number;
        /** Optional comment */
        comment?: string;
        /** Review date */
        date: Date;
    };
    /** Notifications related to the booking */
    notifications: Array<{
        /** Type of notification */
        type: "status_change" | "payment" | "reminder" | "system";
        /** Notification message */
        message: string;
        /** Whether the notification has been read */
        read: boolean;
        /** Date of the notification */
        date: Date;
    }>;
    /** Cancellation date */
    cancelledAt?: Date;
    /** User who cancelled the booking */
    cancelledBy?: Types.ObjectId;
    /** Reason for cancellation */
    cancellationReason?: string;
    /** Cancellation fee amount */
    cancellationFee: number;
    /** Refund amount after cancellation */
    refundAmount: number;
    /** Creation date */
    createdAt: Date;
    /** Last update date */
    updatedAt: Date;
    /** Add a notification to the booking */
    addNotification(type: "status_change" | "payment" | "reminder" | "system", message: string): void;
}
/**
 * Interface for the Booking model
 */
export interface IBookingModel extends Model<IBooking> {
    /** Check if a tool is available for the given dates */
    checkAvailability(toolId: Types.ObjectId, startDate: Date, endDate: Date): Promise<boolean>;
    /** Calculate the total price for a booking */
    calculateTotalPrice(toolId: Types.ObjectId, startDate: Date, endDate: Date): Promise<number>;
}
