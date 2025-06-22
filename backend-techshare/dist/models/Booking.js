"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Booking = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const logger_1 = require("../utils/logger");
const bookingSchema = new mongoose_1.Schema({
    tool: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Tool",
        required: [true, "Tool is required"],
        index: true, // Index for faster queries
    },
    renter: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Renter is required"],
        index: true,
    },
    owner: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
});
// Indexes for common queries
bookingSchema.index({ tool: 1, startDate: 1, endDate: 1 });
bookingSchema.index({ status: 1, startDate: 1 });
// Static method to check availability
bookingSchema.statics.checkAvailability = async function (toolId, startDate, endDate) {
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
    logger_1.logger.info({
        message: "[checkAvailability] Executing query",
        query: JSON.stringify(query),
    });
    const overlappingBooking = await this.findOne(query);
    if (overlappingBooking) {
        logger_1.logger.warn({
            message: "[checkAvailability] Found overlapping booking",
            bookingId: overlappingBooking._id,
        });
    }
    else {
        logger_1.logger.info("[checkAvailability] No overlapping booking found.");
    }
    return !overlappingBooking;
};
// Static method to calculate total price
bookingSchema.statics.calculateTotalPrice = async function (toolId, startDate, endDate) {
    const tool = await mongoose_1.default.model("Tool").findById(toolId);
    if (!tool)
        throw new Error("Tool not found");
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return tool.dailyPrice * days;
};
// Middleware to log operations
bookingSchema.pre("save", function (next) {
    logger_1.logger.debug("Saving a booking", {
        bookingId: this._id,
        toolId: this.tool,
        renterId: this.renter,
        status: this.status,
    });
    next();
});
bookingSchema.pre("deleteOne", function (next) {
    logger_1.logger.debug("Deleting a booking", {
        bookingId: this._id,
        toolId: this.tool,
        renterId: this.renter,
    });
    next();
});
// Method to add notification
bookingSchema.methods.addNotification = function (type, message) {
    this.notifications.push({
        type,
        message,
        date: new Date(),
    });
};
const Booking = mongoose_1.default.model("Booking", bookingSchema);
exports.Booking = Booking;
//# sourceMappingURL=Booking.js.map