"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordController = void 0;
const User_1 = require("../models/User");
const emailService_1 = require("../services/emailService");
const securityLogService_1 = require("../services/securityLogService");
const errors_1 = require("../utils/errors");
const password_encoder_1 = require("../utils/password-encoder");
const crypto_1 = __importDefault(require("crypto"));
exports.passwordController = {
    async requestPasswordReset(req, res, next) {
        try {
            const { email } = req.body;
            if (!email) {
                throw new errors_1.ValidationError("L'email est requis");
            }
            const user = await User_1.User.findOne({ email });
            if (!user) {
                const response = {
                    message: "Si un compte existe avec cet email, vous recevrez un lien de réinitialisation",
                };
                res.status(200).json(response);
                return;
            }
            const resetToken = crypto_1.default.randomBytes(32).toString("hex");
            const resetExpires = new Date(Date.now() + 3600000);
            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = resetExpires;
            await user.save();
            await emailService_1.emailService.sendPasswordResetEmail(user, resetToken);
            await securityLogService_1.securityLogService.logEvent(user._id, "REQUEST_PASSWORD_RESET", "Demande de réinitialisation de mot de passe");
            const response = {
                message: "Si un compte existe avec cet email, vous recevrez un lien de réinitialisation",
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    },
    async resetPassword(req, res, next) {
        try {
            const { token, password } = req.body;
            if (!token || !password) {
                throw new errors_1.ValidationError("Le token et le mot de passe sont requis");
            }
            const user = await User_1.User.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() },
            });
            if (!user) {
                throw new errors_1.ValidationError("Token de réinitialisation invalide ou expiré");
            }
            const validation = password_encoder_1.PasswordEncoder.validatePassword(password);
            if (!validation.isValid) {
                throw new errors_1.ValidationError("Mot de passe invalide", validation.errors.map((error) => ({
                    field: "password",
                    message: error,
                })));
            }
            user.password = password;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            await securityLogService_1.securityLogService.logEvent(user._id, "RESET_PASSWORD", "Réinitialisation de mot de passe réussie");
            const response = {
                message: "Le mot de passe a été réinitialisé avec succès",
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=passwordController.js.map