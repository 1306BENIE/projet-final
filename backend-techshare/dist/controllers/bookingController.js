"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBooking = exports.cancelBooking = exports.getBookingById = exports.getOwnerBookings = exports.getUserBookings = exports.createBooking = void 0;
const Booking_1 = require("../models/Booking");
const Tool_1 = require("../models/Tool");
const mongoose_1 = require("mongoose");
const logger_1 = require("../utils/logger");
// Centralized error handler
const handleError = (error, res) => {
    logger_1.logger.error("Booking controller error:", error);
    res.status(error.status || 500).json({
        message: error.message || "Internal server error",
    });
};
// Create a new booking
const createBooking = async (req, res) => {
    try {
        const { toolId, startDate, endDate, message } = req.body;
        const userId = req.user?.userId;
        // Check if tool exists and is available
        const tool = await Tool_1.Tool.findById(toolId);
        if (!tool) {
            return res.status(404).json({ message: "Tool not found" });
        }
        // Check if dates are available
        const isAvailable = await Booking_1.Booking.checkAvailability(new mongoose_1.Types.ObjectId(toolId), new Date(startDate), new Date(endDate));
        if (!isAvailable) {
            return res.status(400).json({
                message: "Tool is not available for the selected dates",
            });
        }
        // Calculate total price
        const totalPrice = await Booking_1.Booking.calculateTotalPrice(new mongoose_1.Types.ObjectId(toolId), new Date(startDate), new Date(endDate));
        // Create booking
        const booking = new Booking_1.Booking({
            tool: toolId,
            renter: userId,
            owner: tool.owner,
            startDate,
            endDate,
            totalPrice,
            depositAmount: tool.deposit || 0,
            message,
        });
        await booking.save();
        // Add notification
        booking.addNotification("status_change", "New booking request received");
        res.status(201).json({
            message: "Booking created successfully",
            booking,
        });
    }
    catch (error) {
        handleError(error, res);
    }
    return;
};
exports.createBooking = createBooking;
// Get user's bookings
const getUserBookings = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const bookings = await Booking_1.Booking.find({ renter: userId })
            .populate("tool")
            .populate("owner", "firstName lastName email")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        const total = await Booking_1.Booking.countDocuments({ renter: userId });
        res.json({
            bookings,
            metadata: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        handleError(error, res);
    }
    return;
};
exports.getUserBookings = getUserBookings;
// Get owner's bookings
const getOwnerBookings = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const bookings = await Booking_1.Booking.find({ owner: userId })
            .populate("tool")
            .populate("renter", "firstName lastName email")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        const total = await Booking_1.Booking.countDocuments({ owner: userId });
        res.json({
            bookings,
            metadata: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        handleError(error, res);
    }
    return;
};
exports.getOwnerBookings = getOwnerBookings;
// Get booking by ID
const getBookingById = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const userId = req.user?.userId;
        const booking = await Booking_1.Booking.findById(bookingId)
            .populate("tool")
            .populate("renter", "firstName lastName email")
            .populate("owner", "firstName lastName email");
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        // Check if user is authorized to view this booking
        if (booking.renter.toString() !== userId &&
            booking.owner.toString() !== userId) {
            return res.status(403).json({ message: "Not authorized" });
        }
        res.json(booking);
    }
    catch (error) {
        handleError(error, res);
    }
    return;
};
exports.getBookingById = getBookingById;
// Cancel booking
const cancelBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const userId = req.user?.userId;
        const booking = await Booking_1.Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        // Check if user is authorized to cancel this booking
        if (booking.renter.toString() !== userId &&
            booking.owner.toString() !== userId) {
            return res.status(403).json({ message: "Not authorized" });
        }
        // Check if booking can be cancelled
        if (!["pending", "approved"].includes(booking.status)) {
            return res.status(400).json({
                message: "Booking cannot be cancelled in its current state",
            });
        }
        booking.status = "cancelled";
        await booking.save();
        // Add notification
        booking.addNotification("status_change", "Booking has been cancelled");
        res.json({
            message: "Booking cancelled successfully",
            booking,
        });
    }
    catch (error) {
        handleError(error, res);
    }
    return;
};
exports.cancelBooking = cancelBooking;
// Update booking status
const updateBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const userId = req.user?.userId;
        const { status } = req.body;
        const booking = await Booking_1.Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        // Check if user is the owner
        if (booking.owner.toString() !== userId) {
            return res.status(403).json({ message: "Not authorized" });
        }
        // Validate status transition
        const validTransitions = {
            pending: ["approved", "rejected"],
            approved: ["active"],
            active: ["completed"],
        };
        if (!validTransitions[booking.status]?.includes(status)) {
            return res.status(400).json({
                message: `Cannot change status from ${booking.status} to ${status}`,
            });
        }
        booking.status = status;
        await booking.save();
        // Add notification
        booking.addNotification("status_change", `Booking status changed to ${status}`);
        res.json({
            message: "Booking updated successfully",
            booking,
        });
    }
    catch (error) {
        handleError(error, res);
    }
    return;
};
exports.updateBooking = updateBooking;
//# sourceMappingURL=bookingController.js.map