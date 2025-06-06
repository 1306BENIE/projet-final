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
router.post("/", auth_middleware_1.auth, validateBooking_1.validateBooking, bookingController.createBooking);
router.get("/user", auth_middleware_1.auth, validatePagination_1.validatePagination, bookingController.getUserBookings);
router.get("/owner", auth_middleware_1.auth, validatePagination_1.validatePagination, bookingController.getOwnerBookings);
router.get("/:id", auth_middleware_1.auth, validateObjectId_1.validateObjectId, bookingController.getBookingById);
router.post("/:id/cancel", auth_middleware_1.auth, validateObjectId_1.validateObjectId, bookingController.cancelBooking);
router.put("/:id", auth_middleware_1.auth, validateObjectId_1.validateObjectId, bookingController.updateBooking);
exports.default = router;
//# sourceMappingURL=bookingRoutes.js.map