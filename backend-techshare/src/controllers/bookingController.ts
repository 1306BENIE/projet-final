import { Request, Response } from "express";
import { Booking } from "../models/Booking";
import { Tool } from "../models/Tool";
import { Types } from "mongoose";
import { logger } from "../utils/logger";

// Centralized error handler
const handleError = (error: any, res: Response) => {
  logger.error("Booking controller error:", error);
  res.status(error.status || 500).json({
    message: error.message || "Internal server error",
  });
};

// Create a new booking
export const createBooking = async (req: Request, res: Response) => {
  try {
    const { toolId, startDate, endDate, message } = req.body;
    const userId = req.user?.userId;

    // Check if tool exists and is available
    const tool = await Tool.findById(toolId);
    if (!tool) {
      return res.status(404).json({ message: "Tool not found" });
    }

    // Check if dates are available
    const isAvailable = await Booking.checkAvailability(
      new Types.ObjectId(toolId),
      new Date(startDate),
      new Date(endDate)
    );

    if (!isAvailable) {
      return res.status(400).json({
        message: "Tool is not available for the selected dates",
      });
    }

    // Calculate total price
    const totalPrice = await Booking.calculateTotalPrice(
      new Types.ObjectId(toolId),
      new Date(startDate),
      new Date(endDate)
    );

    // Create booking
    const booking = new Booking({
      tool: toolId,
      renter: userId,
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
  } catch (error) {
    handleError(error, res);
  }
  return;
};

// Get user's bookings
export const getUserBookings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const bookings = await Booking.find({ renter: userId })
      .populate("tool")
      .populate("owner", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Booking.countDocuments({ renter: userId });

    res.json({
      bookings,
      metadata: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    handleError(error, res);
  }
  return;
};

// Get owner's bookings
export const getOwnerBookings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const bookings = await Booking.find({ owner: userId })
      .populate("tool")
      .populate("renter", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Booking.countDocuments({ owner: userId });

    res.json({
      bookings,
      metadata: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    handleError(error, res);
  }
  return;
};

// Get booking by ID
export const getBookingById = async (req: Request, res: Response) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user?.userId;

    const booking = await Booking.findById(bookingId)
      .populate("tool")
      .populate("renter", "firstName lastName email")
      .populate("owner", "firstName lastName email");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user is authorized to view this booking
    if (
      booking.renter.toString() !== userId &&
      booking.owner.toString() !== userId
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(booking);
  } catch (error) {
    handleError(error, res);
  }
  return;
};

// Cancel booking
export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user?.userId;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user is authorized to cancel this booking
    if (
      booking.renter.toString() !== userId &&
      booking.owner.toString() !== userId
    ) {
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
  } catch (error) {
    handleError(error, res);
  }
  return;
};

// Update booking status
export const updateBooking = async (req: Request, res: Response) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user?.userId;
    const { status } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user is the owner
    if (booking.owner.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Validate status transition
    const validTransitions: { [key: string]: string[] } = {
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
    booking.addNotification(
      "status_change",
      `Booking status changed to ${status}`
    );

    res.json({
      message: "Booking updated successfully",
      booking,
    });
  } catch (error) {
    handleError(error, res);
  }
  return;
};

// GET /api/tools/:toolId/booked-dates
export const getBookedDates = async (req: Request, res: Response) => {
  try {
    const { toolId } = req.params;
    if (!Types.ObjectId.isValid(toolId)) {
      return res.status(400).json({ message: "Invalid tool ID" });
    }
    const bookings = await Booking.find({
      tool: toolId,
      status: { $in: ["pending", "approved", "active"] },
    }).select("startDate endDate -_id");

    res.json(bookings);
  } catch (error) {
    res.status(500).json({
      message: "Erreur serveur lors de la récupération des périodes réservées",
    });
  }
};
