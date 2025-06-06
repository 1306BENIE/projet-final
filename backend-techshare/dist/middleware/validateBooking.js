"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBooking = void 0;
const mongoose_1 = require("mongoose");
// Validation constants
const MIN_BOOKING_DAYS = 1;
const MAX_BOOKING_DAYS = 30;
const MAX_MESSAGE_LENGTH = 500;
const validateBooking = (req, res, next) => {
    try {
        const { toolId, startDate, endDate, message } = req.body;
        // Validate tool ID
        if (toolId && !mongoose_1.Types.ObjectId.isValid(toolId)) {
            return res.status(400).json({
                message: "Invalid tool ID",
            });
        }
        // Validate dates
        if (startDate) {
            const start = new Date(startDate);
            if (isNaN(start.getTime())) {
                return res.status(400).json({
                    message: "Invalid start date",
                });
            }
        }
        if (endDate) {
            const end = new Date(endDate);
            if (isNaN(end.getTime())) {
                return res.status(400).json({
                    message: "Invalid end date",
                });
            }
        }
        // Validate booking duration
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays < MIN_BOOKING_DAYS) {
                return res.status(400).json({
                    message: `Minimum booking duration is ${MIN_BOOKING_DAYS} day(s)`,
                });
            }
            if (diffDays > MAX_BOOKING_DAYS) {
                return res.status(400).json({
                    message: `Maximum booking duration is ${MAX_BOOKING_DAYS} days`,
                });
            }
            if (start > end) {
                return res.status(400).json({
                    message: "Start date must be before end date",
                });
            }
            if (start < new Date()) {
                return res.status(400).json({
                    message: "Start date must be in the future",
                });
            }
        }
        // Validate message
        if (message && message.length > MAX_MESSAGE_LENGTH) {
            return res.status(400).json({
                message: `Message must not exceed ${MAX_MESSAGE_LENGTH} characters`,
            });
        }
        next();
    }
    catch (error) {
        next(error);
    }
    return;
};
exports.validateBooking = validateBooking;
//# sourceMappingURL=validateBooking.js.map