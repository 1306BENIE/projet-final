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
exports.Category = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const logger_1 = require("../utils/logger");
const categorySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Le nom est requis"],
        trim: true,
    },
    description: {
        type: String,
        required: [true, "La description est requise"],
        trim: true,
    },
    slug: {
        type: String,
        required: [true, "Le slug est requis"],
        unique: true,
        trim: true,
    },
    icon: {
        type: String,
        trim: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});
// Index pour la recherche rapide
categorySchema.index({ slug: 1 });
categorySchema.index({ name: "text" });
// Middleware pour logger les opérations
categorySchema.pre("save", function (next) {
    logger_1.logger.debug("Sauvegarde d'une catégorie", {
        categoryId: this._id,
        name: this.name,
        slug: this.slug,
    });
    next();
});
categorySchema.pre("deleteOne", function (next) {
    logger_1.logger.debug("Suppression d'une catégorie", {
        categoryId: this._id,
        name: this.name,
        slug: this.slug,
    });
    next();
});
const Category = mongoose_1.default.model("Category", categorySchema);
exports.Category = Category;
//# sourceMappingURL=Category.js.map