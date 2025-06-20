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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const validateObjectId_1 = require("../middleware/validateObjectId");
const validatePagination_1 = require("../middleware/validatePagination");
const validateBooking_1 = require("../middleware/validateBooking");
const bookingController = __importStar(require("../controllers/bookingController"));
const router = express_1.default.Router();
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
 * /api/bookings/test-no-auth:
 *   get:
 *     tags: [Bookings]
 *     summary: Test endpoint for bookings without auth
 *     responses:
 *       200:
 *         description: Test successful
 */
router.get("/test-no-auth", (req, res) => {
    res.json({
        message: "Bookings routes are working without auth",
        timestamp: new Date().toISOString(),
    });
});
/**
 * @swagger
 * /api/bookings/test:
 *   get:
 *     tags: [Bookings]
 *     summary: Test endpoint for bookings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Test successful
 */
router.get("/test", auth_middleware_1.auth, (req, res) => {
    res.json({
        message: "Bookings routes are working",
        timestamp: new Date().toISOString(),
    });
});
/**
 * @swagger
 * /api/bookings/test-validate/{id}:
 *   get:
 *     tags: [Bookings]
 *     summary: Test validateObjectId middleware
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Test successful
 */
router.get("/test-validate/:id", auth_middleware_1.auth, (0, validateObjectId_1.validateObjectId)("id"), (req, res) => {
    res.json({
        message: "validateObjectId middleware works",
        id: req.params.id,
        timestamp: new Date().toISOString(),
    });
});
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
router.post("/", auth_middleware_1.auth, validateBooking_1.validateBooking, bookingController.createBooking);
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
router.get("/user", auth_middleware_1.auth, validatePagination_1.validatePagination, bookingController.getUserBookings);
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
router.get("/owner", auth_middleware_1.auth, validatePagination_1.validatePagination, bookingController.getOwnerBookings);
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
router.get("/:id", auth_middleware_1.auth, (0, validateObjectId_1.validateObjectId)("id"), bookingController.getBookingById);
/**
 * @swagger
 * /api/bookings/{id}/cancel-eligibility:
 *   get:
 *     tags: [Bookings]
 *     summary: Check cancellation eligibility for a booking
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
 *         description: Cancellation eligibility information
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking not found
 */
router.get("/:id/cancel-eligibility", auth_middleware_1.auth, (0, validateObjectId_1.validateObjectId)("id"), bookingController.getCancellationEligibility);
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
router.post("/:id/cancel", auth_middleware_1.auth, (0, validateObjectId_1.validateObjectId)("id"), bookingController.cancelBooking);
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
router.put("/:id", auth_middleware_1.auth, (0, validateObjectId_1.validateObjectId)("id"), bookingController.updateBooking);
/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get all bookings (with pagination)
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
 *         description: List of bookings with pagination
 *       401:
 *         description: Unauthorized
 */
router.get("/", auth_middleware_1.auth, validatePagination_1.validatePagination, bookingController.getAllBookings);
exports.default = router;
//# sourceMappingURL=bookingRoutes.js.map