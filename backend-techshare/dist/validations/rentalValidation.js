"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addReviewSchema = exports.updateRentalStatusSchema = exports.createRentalSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createRentalSchema = joi_1.default.object({
    toolId: joi_1.default.string().required(),
    startDate: joi_1.default.date().min("now").required(),
    endDate: joi_1.default.date().min(joi_1.default.ref("startDate")).required(),
    totalPrice: joi_1.default.number().min(0).required(),
});
exports.updateRentalStatusSchema = joi_1.default.object({
    status: joi_1.default.string()
        .valid("pending", "accepted", "rejected", "completed")
        .required(),
});
exports.addReviewSchema = joi_1.default.object({
    rating: joi_1.default.number().min(1).max(5).required(),
    comment: joi_1.default.string().required(),
});
//# sourceMappingURL=rentalValidation.js.map