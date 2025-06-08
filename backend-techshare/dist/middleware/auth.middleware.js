"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuth = exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const logger_1 = require("../utils/logger");
const auth = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId || decoded._id;
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        req.user = {
            userId: user._id.toString(),
            role: user.role,
        };
        next();
        return;
    }
    catch (error) {
        logger_1.logger.error("Authentication error:", error);
        return res.status(401).json({ message: "Invalid token" });
    }
};
exports.auth = auth;
const adminAuth = async (req, res, next) => {
    try {
        // First check if user is authenticated
        await (0, exports.auth)(req, res, () => {
            // Then check if user is admin
            if (req.user?.role !== "admin") {
                return res
                    .status(403)
                    .json({ message: "Access denied. Admin privileges required." });
            }
            next();
            return;
        });
        return;
    }
    catch (error) {
        logger_1.logger.error("Admin authentication error:", error);
        return res.status(401).json({ message: "Authentication failed" });
    }
};
exports.adminAuth = adminAuth;
//# sourceMappingURL=auth.middleware.js.map