import express from "express";
import { auth } from "../middleware/auth.middleware";
import { validateObjectId } from "../middleware/validateObjectId";
import { validatePagination } from "../middleware/validatePagination";
import { validateBooking } from "../middleware/validateBooking";
import * as bookingController from "../controllers/bookingController";
import { Booking } from "../models/Booking";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Tool booking management
 *
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         tool:
 *           $ref: '#/components/schemas/Tool'
 *         renter:
 *           $ref: '#/components/schemas/User'
 *         owner:
 *           $ref: '#/components/schemas/User'
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *         totalPrice:
 *           type: number
 *         deposit:
 *           type: number
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected, cancelled, completed]
 *         paymentStatus:
 *           type: string
 *           enum: [pending, paid, refunded]
 *         message:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - toolId
 *               - startDate
 *               - endDate
 *             properties:
 *               toolId:
 *                 type: string
 *                 description: ID of the tool to book
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Start date of the booking
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: End date of the booking
 *               message:
 *                 type: string
 *                 description: Optional message for the owner
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tool not found
 */
router.post("/", auth, validateBooking, bookingController.createBooking);

/**
 * @swagger
 * /api/bookings/user:
 *   get:
 *     summary: Get user's bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of user's bookings
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/user",
  auth,
  validatePagination,
  bookingController.getUserBookings
);

/**
 * @swagger
 * /api/bookings/owner:
 *   get:
 *     summary: Get bookings for owner's tools
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of bookings for owner's tools
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/owner",
  auth,
  validatePagination,
  bookingController.getOwnerBookings
);

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     tags: [Bookings]
 *     summary: Get booking details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking not found
 */
router.get("/:id", auth, validateObjectId, bookingController.getBookingById);

/**
 * @swagger
 * /api/bookings/{id}/cancel:
 *   post:
 *     tags: [Bookings]
 *     summary: Cancel a booking
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking not found
 */
router.post(
  "/:id/cancel",
  auth,
  validateObjectId,
  bookingController.cancelBooking
);

/**
 * @swagger
 * /api/bookings/{id}:
 *   put:
 *     tags: [Bookings]
 *     summary: Update booking status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected, active, completed]
 *                 description: New booking status
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking not found
 */
router.put("/:id", auth, validateObjectId, bookingController.updateBooking);

router.get("/", auth, async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des réservations",
      error,
    });
  }
});

export default router;
