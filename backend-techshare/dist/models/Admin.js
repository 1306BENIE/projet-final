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
exports.Admin = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const logger_1 = require("../utils/logger");
const adminSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "L'utilisateur est requis"],
        unique: true,
    },
    role: {
        type: String,
        enum: ["super_admin", "moderator"],
        required: [true, "Le rôle est requis"],
    },
    permissions: [
        {
            type: String,
            required: [true, "Les permissions sont requises"],
        },
    ],
}, {
    timestamps: true,
});
// Index pour la recherche rapide
adminSchema.index({ user: 1, role: 1 });
// Middleware pour logger les opérations
adminSchema.pre("save", function (next) {
    logger_1.logger.debug("Sauvegarde d'un administrateur", {
        adminId: this._id,
        userId: this.user,
        role: this.role,
        permissions: this.permissions,
    });
    next();
});
adminSchema.pre("deleteOne", function (next) {
    logger_1.logger.debug("Suppression d'un administrateur", {
        adminId: this._id,
        userId: this.user,
        role: this.role,
    });
    next();
});
const Admin = mongoose_1.default.model("Admin", adminSchema);
exports.Admin = Admin;
//# sourceMappingURL=Admin.js.map