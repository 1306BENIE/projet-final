"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const rentalController_1 = require("../controllers/rentalController");
const auth_1 = require("../middleware/auth");
const validateObjectId_1 = require("../middleware/validateObjectId");
const validatePagination_1 = require("../middleware/validatePagination");
const validateRental_1 = require("../middleware/validateRental");
const router = express_1.default.Router();
router.post("/", auth_1.auth, validateRental_1.validateRental, rentalController_1.rentalController.createRental);
router.get("/user", auth_1.auth, validatePagination_1.validatePagination, rentalController_1.rentalController.getUserRentals);
router.get("/owner", auth_1.auth, validatePagination_1.validatePagination, rentalController_1.rentalController.getOwnerRentals);
router.put("/:id/status", auth_1.auth, (0, validateObjectId_1.validateObjectId)("id"), rentalController_1.rentalController.updateRentalStatus);
router.post("/:id/review", auth_1.auth, (0, validateObjectId_1.validateObjectId)("id"), rentalController_1.rentalController.addReview);
exports.default = router;
//# sourceMappingURL=rentalRoutes.js.map