"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBooking = exports.cancelBooking = exports.getBookingById = exports.getOwnerBookings = exports.getUserBookings = exports.createBooking = void 0;
const Booking_1 = require("../models/Booking");
const Tool_1 = require("../models/Tool");
const mongoose_1 = require("mongoose");
const logger_1 = require("../utils/logger");
const handleError = (error, res) => {
    logger_1.logger.error("Booking controller error:", error);
    res.status(error.status || 500).json({
        message: error.message || "Internal server error",
    });
};
const createBooking = async (req, res) => {
    var _a;
    try {
        const { toolId, startDate, endDate, message } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const tool = await Tool_1.Tool.findById(toolId);
        if (!tool) {
            return res.status(404).json({ message: "Tool not found" });
        }
        const isAvailable = await Booking_1.Booking.checkAvailability(new mongoose_1.Types.ObjectId(toolId), new Date(startDate), new Date(endDate));
        if (!isAvailable) {
            return res.status(400).json({
                message: "Tool is not available for the selected dates",
            });
        }
        const totalPrice = await Booking_1.Booking.calculateTotalPrice(new mongoose_1.Types.ObjectId(toolId), new Date(startDate), new Date(endDate));
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
const getUserBookings = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
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
const getOwnerBookings = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
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
const getBookingById = async (req, res) => {
    var _a;
    try {
        const bookingId = req.params.id;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const booking = await Booking_1.Booking.findById(bookingId)
            .populate("tool")
            .populate("renter", "firstName lastName email")
            .populate("owner", "firstName lastName email");
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
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
const cancelBooking = async (req, res) => {
    var _a;
    try {
        const bookingId = req.params.id;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const booking = await Booking_1.Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        if (booking.renter.toString() !== userId &&
            booking.owner.toString() !== userId) {
            return res.status(403).json({ message: "Not authorized" });
        }
        if (!["pending", "approved"].includes(booking.status)) {
            return res.status(400).json({
                message: "Booking cannot be cancelled in its current state",
            });
        }
        booking.status = "cancelled";
        await booking.save();
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
const updateBooking = async (req, res) => {
    var _a, _b;
    try {
        const bookingId = req.params.id;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { status } = req.body;
        const booking = await Booking_1.Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        if (booking.owner.toString() !== userId) {
            return res.status(403).json({ message: "Not authorized" });
        }
        const validTransitions = {
            pending: ["approved", "rejected"],
            approved: ["active"],
            active: ["completed"],
        };
        if (!((_b = validTransitions[booking.status]) === null || _b === void 0 ? void 0 : _b.includes(status))) {
            return res.status(400).json({
                message: `Cannot change status from ${booking.status} to ${status}`,
            });
        }
        booking.status = status;
        await booking.save();
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