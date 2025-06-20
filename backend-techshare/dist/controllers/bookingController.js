"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBookedDates = exports.updateBooking = exports.cancelBooking = exports.getCancellationEligibility = exports.getBookingById = exports.getOwnerBookings = exports.getUserBookings = exports.getAllBookings = exports.createBooking = void 0;
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
        if (!userId || !mongoose_1.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }
        if (!toolId || !mongoose_1.Types.ObjectId.isValid(toolId)) {
            return res.status(400).json({ message: "Invalid tool ID" });
        }
        const userObjectId = new mongoose_1.Types.ObjectId(userId);
        const toolObjectId = new mongoose_1.Types.ObjectId(toolId);
        // Check if tool exists and is available
        const tool = await Tool_1.Tool.findById(toolObjectId);
        if (!tool) {
            return res.status(404).json({ message: "Tool not found" });
        }
        // Check if dates are available
        const isAvailable = await Booking_1.Booking.checkAvailability(toolObjectId, new Date(startDate), new Date(endDate));
        if (!isAvailable) {
            return res.status(400).json({
                message: "Tool is not available for the selected dates",
            });
        }
        // Calculate total price
        const totalPrice = await Booking_1.Booking.calculateTotalPrice(toolObjectId, new Date(startDate), new Date(endDate));
        // Create booking
        const booking = new Booking_1.Booking({
            tool: toolObjectId,
            renter: userObjectId,
            owner: tool.owner,
            startDate,
            endDate,
            totalPrice,
            depositAmount: tool.caution || 0,
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
// Get all bookings (with pagination)
const getAllBookings = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        if (!userId || !mongoose_1.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }
        const userObjectId = new mongoose_1.Types.ObjectId(userId);
        // Get bookings where user is either renter or owner
        const bookings = await Booking_1.Booking.find({
            $or: [{ renter: userObjectId }, { owner: userObjectId }],
        })
            .populate("tool")
            .populate("renter", "firstName lastName email")
            .populate("owner", "firstName lastName email")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        const total = await Booking_1.Booking.countDocuments({
            $or: [{ renter: userObjectId }, { owner: userObjectId }],
        });
        res.json({
            bookings,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1,
            },
        });
    }
    catch (error) {
        handleError(error, res);
    }
    return;
};
exports.getAllBookings = getAllBookings;
// Get user's bookings
const getUserBookings = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        if (!userId || !mongoose_1.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }
        const userObjectId = new mongoose_1.Types.ObjectId(userId);
        const bookings = await Booking_1.Booking.find({ renter: userObjectId })
            .populate("tool")
            .populate("owner", "firstName lastName email")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        const total = await Booking_1.Booking.countDocuments({ renter: userObjectId });
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
        if (!userId || !mongoose_1.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }
        const userObjectId = new mongoose_1.Types.ObjectId(userId);
        const bookings = await Booking_1.Booking.find({ owner: userObjectId })
            .populate("tool")
            .populate("renter", "firstName lastName email")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        const total = await Booking_1.Booking.countDocuments({ owner: userObjectId });
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
        if (!userId || !mongoose_1.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }
        if (!bookingId || !mongoose_1.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ message: "Invalid booking ID" });
        }
        const bookingObjectId = new mongoose_1.Types.ObjectId(bookingId);
        const booking = await Booking_1.Booking.findById(bookingObjectId)
            .populate("tool")
            .populate("renter", "firstName lastName email")
            .populate("owner", "firstName lastName email");
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        // Check if user is authorized to view this booking
        console.log("Checking authorization...");
        console.log("User ID:", userId);
        console.log("Booking renter ID:", booking.renter.toString());
        console.log("Booking owner ID:", booking.owner.toString());
        // Extract the actual ObjectId from populated objects
        const renterId = typeof booking.renter === "object" && booking.renter._id
            ? booking.renter._id.toString()
            : booking.renter.toString();
        const ownerId = typeof booking.owner === "object" && booking.owner._id
            ? booking.owner._id.toString()
            : booking.owner.toString();
        console.log("Extracted renter ID:", renterId);
        console.log("Extracted owner ID:", ownerId);
        console.log("Is user renter?", renterId === userId);
        console.log("Is user owner?", ownerId === userId);
        if (renterId !== userId && ownerId !== userId) {
            console.log("User not authorized");
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
// Get cancellation eligibility for a booking
const getCancellationEligibility = async (req, res) => {
    try {
        console.log("=== getCancellationEligibility called ===");
        const bookingId = req.params.id;
        const userId = req.user?.userId;
        console.log("Booking ID:", bookingId);
        console.log("User ID:", userId);
        if (!userId || !mongoose_1.Types.ObjectId.isValid(userId)) {
            console.log("Invalid user ID");
            return res.status(400).json({ message: "Invalid user ID" });
        }
        if (!bookingId || !mongoose_1.Types.ObjectId.isValid(bookingId)) {
            console.log("Invalid booking ID");
            return res.status(400).json({ message: "Invalid booking ID" });
        }
        const userObjectId = new mongoose_1.Types.ObjectId(userId);
        const bookingObjectId = new mongoose_1.Types.ObjectId(bookingId);
        console.log("Looking for booking with ID:", bookingObjectId);
        const booking = await Booking_1.Booking.findById(bookingObjectId)
            .populate("tool")
            .populate("renter", "firstName lastName email")
            .populate("owner", "firstName lastName email");
        console.log("Booking found:", !!booking);
        if (!booking) {
            console.log("Booking not found");
            return res.status(404).json({ message: "Booking not found" });
        }
        // Check if user is authorized to view this booking
        console.log("Checking authorization...");
        console.log("User ID:", userId);
        console.log("Booking renter ID:", booking.renter.toString());
        console.log("Booking owner ID:", booking.owner.toString());
        // Extract the actual ObjectId from populated objects
        const renterId = typeof booking.renter === "object" && booking.renter._id
            ? booking.renter._id.toString()
            : booking.renter.toString();
        const ownerId = typeof booking.owner === "object" && booking.owner._id
            ? booking.owner._id.toString()
            : booking.owner.toString();
        console.log("Extracted renter ID:", renterId);
        console.log("Extracted owner ID:", ownerId);
        console.log("Is user renter?", renterId === userId);
        console.log("Is user owner?", ownerId === userId);
        if (renterId !== userId && ownerId !== userId) {
            console.log("User not authorized");
            return res.status(403).json({ message: "Not authorized" });
        }
        console.log("Calculating cancellation eligibility...");
        // Calculate cancellation eligibility
        const cancellationInfo = calculateCancellationEligibility(booking);
        console.log("Cancellation info calculated:", cancellationInfo);
        const response = {
            booking: {
                id: booking._id,
                status: booking.status,
                startDate: booking.startDate,
                totalPrice: booking.totalPrice,
            },
            cancellationInfo,
        };
        console.log("Sending response:", response);
        res.json(response);
    }
    catch (error) {
        console.error("Error in getCancellationEligibility:", error);
        handleError(error, res);
    }
    return;
};
exports.getCancellationEligibility = getCancellationEligibility;
// Cancel booking
const cancelBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const userId = req.user?.userId;
        const { reason } = req.body;
        if (!userId || !mongoose_1.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }
        if (!bookingId || !mongoose_1.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ message: "Invalid booking ID" });
        }
        const userObjectId = new mongoose_1.Types.ObjectId(userId);
        const bookingObjectId = new mongoose_1.Types.ObjectId(bookingId);
        const booking = await Booking_1.Booking.findById(bookingObjectId)
            .populate("tool")
            .populate("renter", "firstName lastName email")
            .populate("owner", "firstName lastName email");
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        // Check if user is authorized to cancel this booking
        // Extract the actual ObjectId from populated objects
        const renterId = typeof booking.renter === "object" && booking.renter._id
            ? booking.renter._id.toString()
            : booking.renter.toString();
        const ownerId = typeof booking.owner === "object" && booking.owner._id
            ? booking.owner._id.toString()
            : booking.owner.toString();
        if (renterId !== userId && ownerId !== userId) {
            return res.status(403).json({ message: "Not authorized" });
        }
        // Calculate cancellation eligibility and fees
        const cancellationInfo = calculateCancellationEligibility(booking);
        if (!cancellationInfo.canCancel) {
            return res.status(400).json({
                message: cancellationInfo.reason,
                cancellationInfo,
            });
        }
        // Update booking with cancellation details
        booking.status = "cancelled";
        booking.cancelledAt = new Date();
        booking.cancelledBy = userObjectId;
        booking.cancellationReason = reason || "Cancelled by user";
        booking.cancellationFee = cancellationInfo.fee;
        booking.refundAmount = cancellationInfo.refundAmount;
        // Update payment status if applicable
        if (booking.paymentStatus === "paid" && cancellationInfo.refundAmount > 0) {
            booking.paymentStatus = "partially_refunded";
        }
        else if (booking.paymentStatus === "paid" &&
            cancellationInfo.refundAmount === 0) {
            booking.paymentStatus = "paid"; // No refund
        }
        await booking.save();
        // Add notification
        const notificationMessage = cancellationInfo.fee > 0
            ? `Booking cancelled. Cancellation fee: ${cancellationInfo.fee} FCFA. Refund: ${cancellationInfo.refundAmount} FCFA`
            : "Booking cancelled successfully";
        booking.addNotification("status_change", notificationMessage);
        // Send notification to the other party
        const otherPartyId = renterId === userId ? ownerId : renterId;
        // TODO: Implement notification service call here
        // await notificationService.notifyUser(otherPartyId, {
        //   type: "booking_cancelled",
        //   bookingId: booking._id,
        //   message: `A booking has been cancelled by ${booking.renter.toString() === userId ? 'renter' : 'owner'}`
        // });
        res.json({
            message: "Booking cancelled successfully",
            booking,
            cancellationInfo,
        });
    }
    catch (error) {
        handleError(error, res);
    }
    return;
};
exports.cancelBooking = cancelBooking;
// Helper function to calculate cancellation eligibility and fees
const calculateCancellationEligibility = (booking) => {
    const now = new Date();
    const startDate = new Date(booking.startDate);
    const createdAt = new Date(booking.createdAt);
    const timeSinceCreation = now.getTime() - createdAt.getTime();
    const hoursSinceCreation = timeSinceCreation / (1000 * 60 * 60);
    const timeUntilStart = startDate.getTime() - now.getTime();
    const hoursUntilStart = timeUntilStart / (1000 * 60 * 60);
    const daysUntilStart = hoursUntilStart / 24;
    let canCancel = true;
    let reason = "";
    let fee = 0;
    let refundAmount = booking.totalPrice;
    // New Grace Period Logic: 1 hour
    if (hoursSinceCreation <= 1) {
        canCancel = true;
        reason = "Annulation gratuite dans l'heure suivant la réservation.";
        fee = 0;
        refundAmount = booking.totalPrice;
    }
    // Existing Cancellation Rules (only apply if outside the grace period)
    else if (booking.status !== "pending" && booking.status !== "confirmed") {
        canCancel = false;
        reason = `Impossible d'annuler une réservation qui est ${booking.status}.`;
    }
    else if (hoursUntilStart < 2) {
        canCancel = false;
        reason =
            "Impossible d'annuler moins de 2 heures avant le début de la location.";
        fee = booking.totalPrice; // Full price as fee
        refundAmount = 0;
    }
    else if (hoursUntilStart < 24) {
        // Less than 24 hours: 50% cancellation fee
        fee = Math.round(booking.totalPrice * 0.5);
        refundAmount = booking.totalPrice - fee;
        reason = "Annulation à moins de 24h : 50% de frais s'appliquent.";
    }
    else if (daysUntilStart < 3) {
        // Less than 3 days: 25% cancellation fee
        fee = Math.round(booking.totalPrice * 0.25);
        refundAmount = booking.totalPrice - fee;
        reason = "Annulation à moins de 3 jours : 25% de frais s'appliquent.";
    }
    else {
        // More than 3 days: No fee
        fee = 0;
        refundAmount = booking.totalPrice;
        reason = "Annulation gratuite (plus de 3 jours avant le début).";
    }
    return {
        canCancel,
        reason,
        fee,
        refundAmount,
        hoursUntilStart: Math.round(hoursUntilStart),
        daysUntilStart: Math.round(daysUntilStart),
    };
};
// Update booking status
const updateBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const userId = req.user?.userId;
        const { status } = req.body;
        if (!userId || !mongoose_1.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }
        if (!bookingId || !mongoose_1.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ message: "Invalid booking ID" });
        }
        const bookingObjectId = new mongoose_1.Types.ObjectId(bookingId);
        const booking = await Booking_1.Booking.findById(bookingObjectId);
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
// GET /api/tools/:toolId/booked-dates
const getBookedDates = async (req, res) => {
    try {
        const { toolId } = req.params;
        if (!mongoose_1.Types.ObjectId.isValid(toolId)) {
            return res.status(400).json({ message: "Invalid tool ID" });
        }
        const toolObjectId = new mongoose_1.Types.ObjectId(toolId);
        const bookings = await Booking_1.Booking.find({
            tool: toolObjectId,
            status: { $in: ["pending", "approved", "active"] },
        }).select("startDate endDate -_id");
        res.json(bookings);
    }
    catch (error) {
        res.status(500).json({
            message: "Erreur serveur lors de la récupération des périodes réservées",
        });
    }
};
exports.getBookedDates = getBookedDates;
//# sourceMappingURL=bookingController.js.map