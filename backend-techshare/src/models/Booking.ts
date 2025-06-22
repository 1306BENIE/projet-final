import mongoose, { Schema } from "mongoose";
import { logger } from "../utils/logger";
import { IBooking, IBookingModel } from "../interfaces/booking.interface";

const bookingSchema = new Schema<IBooking>(
  {
    tool: {
      type: Schema.Types.ObjectId,
      ref: "Tool",
      required: [true, "Tool is required"],
      index: true, // Index for faster queries
    },
    renter: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Renter is required"],
      index: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is required"],
      index: true,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
      index: true,
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "active",
        "completed",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },
    totalPrice: {
      type: Number,
      required: [true, "Total price is required"],
      min: [0, "Total price cannot be negative"],
    },
    depositAmount: {
      type: Number,
      required: [true, "Deposit amount is required"],
      min: [0, "Deposit amount cannot be negative"],
    },
    additionalFees: [
      {
        type: {
          type: String,
          required: true,
          enum: ["late_return", "damage", "cleaning", "other"],
        },
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
        description: String,
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded", "partially_refunded"],
      default: "pending",
    },
    paymentIntentId: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, "Message cannot exceed 500 characters"],
    },
    review: {
      rating: {
        type: Number,
        min: [0, "Minimum rating is 0"],
        max: [5, "Maximum rating is 5"],
      },
      comment: {
        type: String,
        trim: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
    notifications: [
      {
        type: {
          type: String,
          required: true,
          enum: ["status_change", "payment", "reminder", "system"],
        },
        message: {
          type: String,
          required: true,
        },
        read: {
          type: Boolean,
          default: false,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Cancellation fields
    cancelledAt: {
      type: Date,
    },
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    cancellationReason: {
      type: String,
      trim: true,
      maxlength: [500, "Cancellation reason cannot exceed 500 characters"],
    },
    cancellationFee: {
      type: Number,
      min: [0, "Cancellation fee cannot be negative"],
      default: 0,
    },
    refundAmount: {
      type: Number,
      min: [0, "Refund amount cannot be negative"],
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
bookingSchema.index({ tool: 1, startDate: 1, endDate: 1 });
bookingSchema.index({ status: 1, startDate: 1 });

// Static method to check availability
bookingSchema.statics.checkAvailability = async function (
  toolId: mongoose.Types.ObjectId,
  startDate: Date,
  endDate: Date
): Promise<boolean> {
  const currentDate = new Date(); // Directement en UTC

  const query = {
    tool: toolId,
    status: { $in: ["pending", "approved", "active"] },
    endDate: { $gte: currentDate },
    $or: [
      {
        startDate: { $lte: endDate },
        endDate: { $gte: startDate },
      },
    ],
  };

  logger.info({
    message: "[checkAvailability] Executing query",
    query: JSON.stringify(query),
  });

  const overlappingBooking = await this.findOne(query);

  if (overlappingBooking) {
    logger.warn({
      message: "[checkAvailability] Found overlapping booking",
      bookingId: overlappingBooking._id,
    });
  } else {
    logger.info("[checkAvailability] No overlapping booking found.");
  }

  return !overlappingBooking;
};

// Static method to calculate total price
bookingSchema.statics.calculateTotalPrice = async function (
  toolId: mongoose.Types.ObjectId,
  startDate: Date,
  endDate: Date
): Promise<number> {
  const tool = await mongoose.model("Tool").findById(toolId);
  if (!tool) throw new Error("Tool not found");

  const days = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  return tool.dailyPrice * days;
};

// Middleware to log operations
bookingSchema.pre(
  "save",
  function (
    this: IBooking,
    next: mongoose.CallbackWithoutResultAndOptionalError
  ) {
    logger.debug("Saving a booking", {
      bookingId: this._id,
      toolId: this.tool,
      renterId: this.renter,
      status: this.status,
    });
    next();
  }
);

bookingSchema.pre(
  "deleteOne",
  function (
    this: IBooking,
    next: mongoose.CallbackWithoutResultAndOptionalError
  ) {
    logger.debug("Deleting a booking", {
      bookingId: this._id,
      toolId: this.tool,
      renterId: this.renter,
    });
    next();
  }
);

// Method to add notification
bookingSchema.methods.addNotification = function (
  type: "status_change" | "payment" | "reminder" | "system",
  message: string
) {
  this.notifications.push({
    type,
    message,
    date: new Date(),
  });
};

const Booking = mongoose.model<IBooking, IBookingModel>(
  "Booking",
  bookingSchema
);
export { Booking };
