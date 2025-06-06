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
exports.Rental = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const logger_1 = require("../utils/logger");
const rentalSchema = new mongoose_1.Schema({
    tool: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Tool",
        required: [true, "L'outil est requis"],
    },
    renter: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Le locataire est requis"],
    },
    owner: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Le propriétaire est requis"],
    },
    startDate: {
        type: Date,
        required: [true, "La date de début est requise"],
    },
    endDate: {
        type: Date,
        required: [true, "La date de fin est requise"],
    },
    status: {
        type: String,
        enum: [
            "pending",
            "approved",
            "rejected",
            "active",
            "completed",
            "cancelled",
        ],
        default: "pending",
    },
    totalPrice: {
        type: Number,
        required: [true, "Le prix total est requis"],
        min: [0, "Le prix total ne peut pas être négatif"],
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "refunded"],
        default: "pending",
    },
    paymentIntentId: {
        type: String,
        trim: true,
    },
    message: {
        type: String,
        trim: true,
        maxlength: [500, "Le message ne doit pas dépasser 500 caractères"],
    },
    review: {
        rating: {
            type: Number,
            min: [0, "La note minimale est de 0"],
            max: [5, "La note maximale est de 5"],
        },
        comment: {
            type: String,
            trim: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
    },
}, {
    timestamps: true,
});
// Middleware pour logger les opérations
rentalSchema.pre("save", function (next) {
    logger_1.logger.debug("Sauvegarde d'une location", {
        rentalId: this._id,
        toolId: this.tool,
        renterId: this.renter,
        status: this.status,
    });
    next();
});
rentalSchema.pre("deleteOne", function (next) {
    logger_1.logger.debug("Suppression d'une location", {
        rentalId: this._id,
        toolId: this.tool,
        renterId: this.renter,
    });
    next();
});
const Rental = mongoose_1.default.model("Rental", rentalSchema);
exports.Rental = Rental;
//# sourceMappingURL=Rental.js.map