import { Request, Response } from "express";
import { Booking } from "../models/Booking";
import { Tool } from "../models/Tool";
import { Types } from "mongoose";
import { logger } from "../utils/logger";
import { Notification } from "../models/Notification";

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

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (!toolId || !Types.ObjectId.isValid(toolId)) {
      return res.status(400).json({ message: "Invalid tool ID" });
    }

    const userObjectId = new Types.ObjectId(userId);
    const toolObjectId = new Types.ObjectId(toolId);

    // Check if tool exists and is available
    const tool = await Tool.findById(toolObjectId);
    if (!tool) {
      return res.status(404).json({ message: "Tool not found" });
    }

    // Check if dates are available
    const isAvailable = await Booking.checkAvailability(
      toolObjectId,
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
      toolObjectId,
      new Date(startDate),
      new Date(endDate)
    );

    // Create booking
    const booking = new Booking({
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
  } catch (error) {
    handleError(error, res);
  }
  return;
};

// Get all bookings (with pagination)
export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const userObjectId = new Types.ObjectId(userId);

    // Only show bookings where user is renter (not owner)
    const bookings = await Booking.find({ renter: userObjectId })
      .populate("tool")
      .populate("renter", "firstName lastName email")
      .populate("owner", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Booking.countDocuments({ renter: userObjectId });

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

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const userObjectId = new Types.ObjectId(userId);

    const bookings = await Booking.find({ renter: userObjectId })
      .populate("tool")
      .populate("owner", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Booking.countDocuments({ renter: userObjectId });

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

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const userObjectId = new Types.ObjectId(userId);

    // Récupérer les réservations avec toutes les données nécessaires
    const bookings = await Booking.find({ owner: userObjectId })
      .populate("tool", "name images description category")
      .populate("renter", "firstName lastName email phone createdAt")
      .populate("owner", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Booking.countDocuments({ owner: userObjectId });

    // Transformer les données pour le frontend
    const transformedBookings = bookings.map((booking) => {
      // Extraire les informations de l'outil
      const toolData =
        typeof booking.tool === "object" && booking.tool !== null
          ? {
              id:
                (booking.tool as any)._id?.toString() ||
                booking.tool.toString(),
              name: (booking.tool as any).name || "Outil inconnu",
              image: (booking.tool as any).images?.[0] || "",
              description: (booking.tool as any).description || "",
              category: (booking.tool as any).category || "",
            }
          : {
              id: booking.tool.toString(),
              name: "Outil inconnu",
              image: "",
              description: "",
              category: "",
            };

      // Extraire les informations du locataire
      const renterData =
        typeof booking.renter === "object" && booking.renter !== null
          ? {
              id:
                (booking.renter as any)._id?.toString() ||
                booking.renter.toString(),
              firstName: (booking.renter as any).firstName || "",
              lastName: (booking.renter as any).lastName || "",
              email: (booking.renter as any).email || "",
              phone: (booking.renter as any).phone || "",
              createdAt:
                (booking.renter as any).createdAt || new Date().toISOString(),
              fullName:
                `${(booking.renter as any).firstName || ""} ${
                  (booking.renter as any).lastName || ""
                }`.trim() || "Utilisateur inconnu",
            }
          : {
              id: booking.renter.toString(),
              firstName: "",
              lastName: "",
              email: "",
              phone: "",
              createdAt: new Date().toISOString(),
              fullName: "Utilisateur inconnu",
            };

      // Extraire les informations du propriétaire
      const ownerData =
        typeof booking.owner === "object" && booking.owner !== null
          ? {
              id:
                (booking.owner as any)._id?.toString() ||
                booking.owner.toString(),
              firstName: (booking.owner as any).firstName || "",
              lastName: (booking.owner as any).lastName || "",
              email: (booking.owner as any).email || "",
              fullName:
                `${(booking.owner as any).firstName || ""} ${
                  (booking.owner as any).lastName || ""
                }`.trim() || "Propriétaire inconnu",
            }
          : {
              id: booking.owner.toString(),
              firstName: "",
              lastName: "",
              email: "",
              fullName: "Propriétaire inconnu",
            };

      return {
        id: booking._id.toString(),
        tool: toolData,
        renter: renterData,
        owner: ownerData,
        startDate: booking.startDate.toISOString(),
        endDate: booking.endDate.toISOString(),
        status: booking.status,
        paymentStatus: booking.paymentStatus || "pending",
        totalPrice: booking.totalPrice,
        depositAmount: booking.depositAmount || 0,
        message: booking.message || "",
        createdAt: booking.createdAt.toISOString(),
        updatedAt: booking.updatedAt.toISOString(),
        cancelledAt: booking.cancelledAt?.toISOString() || null,
        cancelledBy: booking.cancelledBy?.toString() || null,
        cancellationReason: booking.cancellationReason || null,
        cancellationFee: booking.cancellationFee || 0,
        refundAmount: booking.refundAmount || 0,
      };
    });

    res.json({
      bookings: transformedBookings,
      metadata: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
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

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (!bookingId || !Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const bookingObjectId = new Types.ObjectId(bookingId);

    const booking = await Booking.findById(bookingObjectId)
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
    const renterId =
      typeof booking.renter === "object" && booking.renter._id
        ? booking.renter._id.toString()
        : booking.renter.toString();
    const ownerId =
      typeof booking.owner === "object" && booking.owner._id
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
  } catch (error) {
    handleError(error, res);
  }
  return;
};

// Get cancellation eligibility for a booking
export const getCancellationEligibility = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("=== getCancellationEligibility called ===");
    const bookingId = req.params.id;
    const userId = req.user?.userId;

    console.log("Booking ID:", bookingId);
    console.log("User ID:", userId);

    if (!userId || !Types.ObjectId.isValid(userId)) {
      console.log("Invalid user ID");
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (!bookingId || !Types.ObjectId.isValid(bookingId)) {
      console.log("Invalid booking ID");
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const userObjectId = new Types.ObjectId(userId);
    const bookingObjectId = new Types.ObjectId(bookingId);

    console.log("Looking for booking with ID:", bookingObjectId);

    const booking = await Booking.findById(bookingObjectId)
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
    const renterId =
      typeof booking.renter === "object" && booking.renter._id
        ? booking.renter._id.toString()
        : booking.renter.toString();
    const ownerId =
      typeof booking.owner === "object" && booking.owner._id
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
  } catch (error) {
    console.error("Error in getCancellationEligibility:", error);
    handleError(error, res);
  }
  return;
};

// Cancel booking
export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user?.userId;
    const { reason } = req.body;

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (!bookingId || !Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const userObjectId = new Types.ObjectId(userId);
    const bookingObjectId = new Types.ObjectId(bookingId);

    const booking = await Booking.findById(bookingObjectId)
      .populate("tool")
      .populate("renter", "firstName lastName email")
      .populate("owner", "firstName lastName email");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user is authorized to cancel this booking
    // Extract the actual ObjectId from populated objects
    const renterId =
      typeof booking.renter === "object" && booking.renter._id
        ? booking.renter._id.toString()
        : booking.renter.toString();
    const ownerId =
      typeof booking.owner === "object" && booking.owner._id
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
    } else if (
      booking.paymentStatus === "paid" &&
      cancellationInfo.refundAmount === 0
    ) {
      booking.paymentStatus = "paid"; // No refund
    }

    await booking.save();

    // Add notification
    const notificationMessage =
      cancellationInfo.fee > 0
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
  } catch (error) {
    handleError(error, res);
  }
  return;
};

// Helper function to calculate cancellation eligibility and fees
const calculateCancellationEligibility = (booking: any) => {
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
  } else if (hoursUntilStart < 2) {
    canCancel = false;
    reason =
      "Impossible d'annuler moins de 2 heures avant le début de la location.";
    fee = booking.totalPrice; // Full price as fee
    refundAmount = 0;
  } else if (hoursUntilStart < 24) {
    // Less than 24 hours: 50% cancellation fee
    fee = Math.round(booking.totalPrice * 0.5);
    refundAmount = booking.totalPrice - fee;
    reason = "Annulation à moins de 24h : 50% de frais s'appliquent.";
  } else if (daysUntilStart < 3) {
    // Less than 3 days: 25% cancellation fee
    fee = Math.round(booking.totalPrice * 0.25);
    refundAmount = booking.totalPrice - fee;
    reason = "Annulation à moins de 3 jours : 25% de frais s'appliquent.";
  } else {
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
export const updateBooking = async (req: Request, res: Response) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user?.userId;
    const { status } = req.body;

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (!bookingId || !Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const bookingObjectId = new Types.ObjectId(bookingId);

    const booking = await Booking.findById(bookingObjectId);

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
    const { startDate, endDate } = req.query;

    if (!toolId || !Types.ObjectId.isValid(toolId)) {
      return res.status(400).json({ message: "Invalid tool ID" });
    }

    const query: any = {
      tool: new Types.ObjectId(toolId),
      status: { $in: ["pending", "approved", "active"] },
    };

    if (startDate && endDate) {
      query.$or = [
        {
          startDate: { $lte: new Date(endDate as string) },
          endDate: { $gte: new Date(startDate as string) },
        },
      ];
    }

    const bookings = await Booking.find(query).select("startDate endDate");

    const bookedDates = bookings.map((booking) => ({
      startDate: booking.startDate,
      endDate: booking.endDate,
    }));

    res.json({ bookedDates });
  } catch (error) {
    console.error("Error getting booked dates:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Confirmer une réservation (propriétaire)
export const confirmBooking = async (req: Request, res: Response) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user?.userId;

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (!bookingId || !Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const booking = await Booking.findById(bookingId)
      .populate("tool", "name owner")
      .populate("renter", "firstName lastName email");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Vérifier que l'utilisateur est bien le propriétaire de l'outil
    if (booking.owner.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You can only confirm bookings for your own tools" });
    }

    // Vérifier que la réservation est en attente
    if (booking.status !== "pending") {
      return res.status(400).json({
        message: `Cannot confirm booking with status: ${booking.status}`,
      });
    }

    // Vérifier qu'il n'y a pas de conflit de dates
    const conflictingBookings = await Booking.find({
      tool: booking.tool,
      _id: { $ne: bookingId },
      status: { $in: ["pending", "approved", "active"] },
      $or: [
        {
          startDate: { $lte: booking.endDate },
          endDate: { $gte: booking.startDate },
        },
      ],
    });

    if (conflictingBookings.length > 0) {
      return res.status(409).json({
        message: "Date conflict: Another booking exists for these dates",
        conflicts: conflictingBookings.map((b) => ({
          id: b._id,
          startDate: b.startDate,
          endDate: b.endDate,
          status: b.status,
        })),
      });
    }

    // Confirmer la réservation
    booking.status = "approved";
    booking.updatedAt = new Date();
    await booking.save();

    // Envoyer une notification au locataire
    try {
      const toolName =
        typeof booking.tool === "object" && booking.tool !== null
          ? (booking.tool as any).name
          : "Tool";
      await Notification.create({
        user: booking.renter,
        type: "rental_accepted",
        title: "Réservation confirmée",
        message: `Votre réservation pour ${toolName} a été confirmée`,
        relatedBooking: booking._id,
      });
    } catch (notificationError) {
      console.error("Error creating notification:", notificationError);
      // Ne pas faire échouer la confirmation pour une erreur de notification
    }

    res.json({
      message: "Booking confirmed successfully",
      booking: {
        id: booking._id,
        status: booking.status,
        updatedAt: booking.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error confirming booking:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Rejeter une réservation (propriétaire)
export const rejectBooking = async (req: Request, res: Response) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user?.userId;
    const { reason } = req.body;

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (!bookingId || !Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const booking = await Booking.findById(bookingId)
      .populate("tool", "name owner")
      .populate("renter", "firstName lastName email");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Vérifier que l'utilisateur est bien le propriétaire de l'outil
    if (booking.owner.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You can only reject bookings for your own tools" });
    }

    // Vérifier que la réservation est en attente
    if (booking.status !== "pending") {
      return res.status(400).json({
        message: `Cannot reject booking with status: ${booking.status}`,
      });
    }

    // Rejeter la réservation
    booking.status = "rejected";
    booking.updatedAt = new Date();
    await booking.save();

    // Envoyer une notification au locataire
    try {
      const toolName =
        typeof booking.tool === "object" && booking.tool !== null
          ? (booking.tool as any).name
          : "Tool";
      await Notification.create({
        user: booking.renter,
        type: "rental_rejected",
        title: "Réservation rejetée",
        message: `Votre réservation pour ${toolName} a été rejetée${
          reason ? `: ${reason}` : ""
        }`,
        relatedBooking: booking._id,
      });
    } catch (notificationError) {
      console.error("Error creating notification:", notificationError);
      // Ne pas faire échouer le rejet pour une erreur de notification
    }

    res.json({
      message: "Booking rejected successfully",
      booking: {
        id: booking._id,
        status: booking.status,
        updatedAt: booking.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error rejecting booking:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
