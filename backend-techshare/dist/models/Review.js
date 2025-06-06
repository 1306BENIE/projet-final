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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Review = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const logger_1 = require("../utils/logger");
const reviewSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "L'utilisateur est requis"],
    },
    tool: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Tool",
        required: [true, "L'outil est requis"],
    },
    rental: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Rental",
        required: [true, "La location est requise"],
    },
    rating: {
        type: Number,
        required: [true, "La note est requise"],
        min: [1, "La note minimale est de 1"],
        max: [5, "La note maximale est de 5"],
    },
    comment: {
        type: String,
        required: [true, "Le commentaire est requis"],
        trim: true,
        minlength: [10, "Le commentaire doit contenir au moins 10 caractères"],
        maxlength: [500, "Le commentaire ne doit pas dépasser 500 caractères"],
    },
}, {
    timestamps: true,
});
reviewSchema.index({ user: 1, rental: 1 }, { unique: true });
reviewSchema.pre("save", function (next) {
    logger_1.logger.debug("Sauvegarde d'un avis", {
        reviewId: this._id,
        userId: this.user,
        toolId: this.tool,
        rentalId: this.rental,
    });
    next();
});
reviewSchema.pre("deleteOne", function (next) {
    logger_1.logger.debug("Suppression d'un avis", {
        reviewId: this._id,
        userId: this.user,
        toolId: this.tool,
        rentalId: this.rental,
    });
    next();
});
const Review = mongoose_1.default.model("Review", reviewSchema);
exports.Review = Review;
//# sourceMappingURL=Review.js.map