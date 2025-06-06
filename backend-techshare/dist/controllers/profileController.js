"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileController = void 0;
const User_1 = require("../models/User");
const Rental_1 = require("../models/Rental");
const errors_1 = require("../utils/errors");
exports.profileController = {
    async getProfile(req, res, next) {
        var _a;
        try {
            if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
                throw new errors_1.ValidationError("Utilisateur non authentifié");
            }
            const user = await User_1.User.findById(req.user.userId).select("-password");
            if (!user) {
                throw new errors_1.DatabaseError("Utilisateur non trouvé");
            }
            const response = {
                message: "Profil récupéré avec succès",
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phone: user.phone,
                    address: user.address,
                    role: user.role,
                },
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    },
    async updateProfile(req, res, next) {
        var _a;
        try {
            if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
                throw new errors_1.ValidationError("Utilisateur non authentifié");
            }
            const user = await User_1.User.findById(req.user.userId);
            if (!user) {
                throw new errors_1.DatabaseError("Utilisateur non trouvé");
            }
            const { firstName, lastName, phone, address } = req.body;
            if (address) {
                if (!address.street ||
                    !address.city ||
                    !address.postalCode ||
                    !address.country) {
                    throw new errors_1.ValidationError("Tous les champs de l'adresse sont requis");
                }
            }
            if (firstName)
                user.firstName = firstName;
            if (lastName)
                user.lastName = lastName;
            if (phone)
                user.phone = phone;
            if (address)
                user.address = address;
            await user.save();
            const response = {
                message: "Profil mis à jour avec succès",
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phone: user.phone,
                    address: user.address,
                    role: user.role,
                },
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    },
    async deleteAccount(req, res, next) {
        var _a;
        try {
            if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
                throw new errors_1.ValidationError("Utilisateur non authentifié");
            }
            const user = await User_1.User.findById(req.user.userId);
            if (!user) {
                throw new errors_1.DatabaseError("Utilisateur non trouvé");
            }
            const activeRentals = await Rental_1.Rental.find({
                $or: [
                    { renter: user._id, status: { $in: ["pending", "active"] } },
                    { owner: user._id, status: { $in: ["pending", "active"] } },
                ],
            });
            if (activeRentals.length > 0) {
                throw new errors_1.ValidationError("Impossible de supprimer le compte avec des locations actives", [
                    {
                        field: "rentals",
                        message: `${activeRentals.length} location(s) active(s)`,
                    },
                ]);
            }
            await user.deleteOne();
            res.status(200).json({ message: "Compte supprimé avec succès" });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=profileController.js.map