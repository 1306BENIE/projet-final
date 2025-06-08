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
exports.Tool = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const logger_1 = require("../utils/logger");
const toolSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Le nom est requis"],
        trim: true,
    },
    brand: {
        type: String,
        required: [true, "La marque est requise"],
        trim: true,
    },
    modelName: {
        type: String,
        required: [true, "Le modèle est requis"],
        trim: true,
    },
    description: {
        type: String,
        required: [true, "La description est requise"],
        trim: true,
    },
    category: {
        type: String,
        required: [true, "La catégorie est requise"],
        enum: ["informatique", "bureautique", "multimedia", "autre"],
    },
    etat: {
        type: String,
        required: [true, "L'état est requis"],
        enum: ["neuf", "bon_etat", "usage"],
    },
    dailyPrice: {
        type: Number,
        required: [true, "Le prix journalier est requis"],
        min: [0, "Le prix journalier ne peut pas être négatif"],
    },
    caution: {
        type: Number,
        required: [true, "La caution est requise"],
        min: [0, "La caution ne peut pas être négative"],
    },
    isInsured: {
        type: Boolean,
        default: false,
    },
    owner: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Le propriétaire est requis"],
    },
    images: [
        {
            type: String,
            trim: true,
        },
    ],
    status: {
        type: String,
        enum: ["available", "rented", "maintenance"],
        default: "available",
    },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            required: true,
            default: "Point",
        },
        coordinates: {
            type: [Number],
            required: true,
        },
    },
    address: {
        type: String,
        required: [true, "L'adresse est requise"],
        trim: true,
    },
    rating: {
        type: Number,
        min: [0, "La note minimale est de 0"],
        max: [5, "La note maximale est de 5"],
        default: 0,
    },
    rentalCount: {
        type: Number,
        default: 0,
    },
    reviews: [
        {
            user: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "User",
                required: [true, "L'utilisateur est requis"],
            },
            rating: {
                type: Number,
                required: [true, "La note est requise"],
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
    ],
}, {
    timestamps: true,
});
// Index pour la recherche géospatiale
toolSchema.index({ location: "2dsphere" });
// Middleware pour logger les opérations
toolSchema.pre("save", function (next) {
    logger_1.logger.debug("Sauvegarde d'un outil", {
        toolId: this._id,
        name: this.name,
        owner: this.owner,
        status: this.status,
    });
    next();
});
toolSchema.pre("deleteOne", function (next) {
    logger_1.logger.debug("Suppression d'un outil", {
        toolId: this._id,
        name: this.name,
        owner: this.owner,
    });
    next();
});
const Tool = mongoose_1.default.model("Tool", toolSchema);
exports.Tool = Tool;
//# sourceMappingURL=Tool.js.map