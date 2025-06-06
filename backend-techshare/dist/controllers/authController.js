"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const User_1 = require("../models/User");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const password_encoder_1 = require("../utils/password-encoder");
const emailService_1 = require("../services/emailService");
const securityLogService_1 = require("../services/securityLogService");
const errors_1 = require("../utils/errors");
const mongoose_1 = require("mongoose");
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}
const JWT_CONFIG = {
    expiresIn: 24 * 60 * 60,
    algorithm: "HS256",
    audience: "techshare-api",
    issuer: "techshare",
};
exports.authController = {
    async register(req, res, next) {
        try {
            const { email, password, firstName, lastName, phone, address } = req.body;
            if (!email ||
                !password ||
                !firstName ||
                !lastName ||
                !phone ||
                !address) {
                throw new errors_1.ValidationError("Tous les champs sont requis", [
                    { field: "email", message: "L'email est requis" },
                    { field: "password", message: "Le mot de passe est requis" },
                    { field: "firstName", message: "Le prénom est requis" },
                    { field: "lastName", message: "Le nom est requis" },
                    { field: "phone", message: "Le téléphone est requis" },
                    { field: "address", message: "L'adresse est requise" },
                ]);
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new errors_1.ValidationError("Format d'email invalide");
            }
            const phoneRegex = /^\+?[\d\s-]{10,}$/;
            if (!phoneRegex.test(phone)) {
                throw new errors_1.ValidationError("Format de numéro de téléphone invalide");
            }
            if (!address.street ||
                !address.city ||
                !address.postalCode ||
                !address.country) {
                throw new errors_1.ValidationError("Tous les champs de l'adresse sont requis", [
                    { field: "address.street", message: "La rue est requise" },
                    { field: "address.city", message: "La ville est requise" },
                    { field: "address.postalCode", message: "Le code postal est requis" },
                    { field: "address.country", message: "Le pays est requis" },
                ]);
            }
            const existingUser = await User_1.User.findOne({ email });
            if (existingUser) {
                throw new errors_1.ValidationError("Cet email est déjà utilisé");
            }
            const validation = password_encoder_1.PasswordEncoder.validatePassword(password);
            if (!validation.isValid) {
                throw new errors_1.ValidationError("Mot de passe invalide", validation.errors.map((error) => ({
                    field: "password",
                    message: error,
                })));
            }
            const user = new User_1.User({
                email: email.toLowerCase().trim(),
                password,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                phone: phone.trim(),
                address: {
                    street: address.street.trim(),
                    city: address.city.trim(),
                    postalCode: address.postalCode.trim(),
                    country: address.country.trim(),
                },
                role: "user",
            });
            await user.save();
            const token = jsonwebtoken_1.default.sign({ userId: user._id, role: user.role }, JWT_SECRET, JWT_CONFIG);
            await securityLogService_1.securityLogService.logEvent(user._id, "register", "Inscription réussie");
            await emailService_1.emailService.sendWelcomeEmail(user);
            const response = {
                message: "Inscription réussie",
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                },
            };
            res.status(201).json(response);
        }
        catch (error) {
            next(error);
        }
    },
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                throw new errors_1.ValidationError("Email et mot de passe requis");
            }
            const user = await User_1.User.findOne({ email: email.toLowerCase().trim() });
            if (!user) {
                throw new errors_1.AuthenticationError("Identifiants invalides");
            }
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                await securityLogService_1.securityLogService.logEvent(user._id, "login_failed", "Tentative de connexion échouée");
                throw new errors_1.AuthenticationError("Identifiants invalides");
            }
            const token = jsonwebtoken_1.default.sign({ userId: user._id, role: user.role }, JWT_SECRET, JWT_CONFIG);
            await securityLogService_1.securityLogService.logEvent(user._id, "login", "Connexion réussie");
            const response = {
                message: "Connexion réussie",
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                },
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    },
    async logout(req, res, next) {
        var _a;
        try {
            if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
                throw new errors_1.AuthenticationError("Non autorisé");
            }
            await securityLogService_1.securityLogService.logEvent(new mongoose_1.Types.ObjectId(req.user.userId), "logout", "Déconnexion réussie");
            const response = {
                message: "Déconnexion réussie",
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=authController.js.map