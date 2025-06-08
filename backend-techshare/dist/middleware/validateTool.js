"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTool = void 0;
const errors_1 = require("../utils/errors");
// Constantes de validation
const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 100;
const MIN_DESCRIPTION_LENGTH = 10;
const MAX_DESCRIPTION_LENGTH = 2000;
const MIN_PRICE = 0;
const MAX_PRICE = 10000;
const MAX_IMAGES = 5;
const VALID_CATEGORIES = [
    "bricolage",
    "jardinage",
    "nettoyage",
    "cuisine",
    "informatique",
    "autre",
];
const validateTool = (req, _res, next) => {
    try {
        // Harmonisation : accepter dailyPrice ou price, et convertir en nombre
        if (req.body.price && !req.body.dailyPrice) {
            req.body.dailyPrice = req.body.price;
        }
        if (req.body.dailyPrice) {
            req.body.dailyPrice = Number(req.body.dailyPrice);
        }
        // Parsing automatique du champ location si c'est une string JSON
        if (typeof req.body.location === "string") {
            try {
                req.body.location = JSON.parse(req.body.location);
            }
            catch (e) {
                throw new errors_1.ValidationError("Le champ location doit être un objet JSON valide");
            }
        }
        const { name, description, category, dailyPrice, location } = req.body;
        // Validation du nom
        if (!name || typeof name !== "string") {
            throw new errors_1.ValidationError("Le nom est requis et doit être une chaîne de caractères");
        }
        if (name.length < MIN_NAME_LENGTH) {
            throw new errors_1.ValidationError(`Le nom doit contenir au moins ${MIN_NAME_LENGTH} caractères`);
        }
        if (name.length > MAX_NAME_LENGTH) {
            throw new errors_1.ValidationError(`Le nom ne doit pas dépasser ${MAX_NAME_LENGTH} caractères`);
        }
        // Validation de la description
        if (!description || typeof description !== "string") {
            throw new errors_1.ValidationError("La description est requise et doit être une chaîne de caractères");
        }
        if (description.length < MIN_DESCRIPTION_LENGTH) {
            throw new errors_1.ValidationError(`La description doit contenir au moins ${MIN_DESCRIPTION_LENGTH} caractères`);
        }
        if (description.length > MAX_DESCRIPTION_LENGTH) {
            throw new errors_1.ValidationError(`La description ne doit pas dépasser ${MAX_DESCRIPTION_LENGTH} caractères`);
        }
        // Validation de la catégorie
        if (!category || typeof category !== "string") {
            throw new errors_1.ValidationError("La catégorie est requise et doit être une chaîne de caractères");
        }
        if (!VALID_CATEGORIES.includes(category.toLowerCase())) {
            throw new errors_1.ValidationError(`La catégorie doit être l'une des suivantes : ${VALID_CATEGORIES.join(", ")}`);
        }
        // Validation du prix
        if (dailyPrice === undefined || dailyPrice === null || isNaN(dailyPrice)) {
            throw new errors_1.ValidationError("Le prix est requis et doit être un nombre");
        }
        if (typeof dailyPrice !== "number") {
            throw new errors_1.ValidationError("Le prix doit être un nombre");
        }
        if (dailyPrice < MIN_PRICE || dailyPrice > MAX_PRICE) {
            throw new errors_1.ValidationError(`Le prix doit être compris entre ${MIN_PRICE} et ${MAX_PRICE}`);
        }
        // Validation de la localisation
        if (!location || typeof location !== "object") {
            throw new errors_1.ValidationError("La localisation est requise et doit être un objet");
        }
        if (location.type !== "Point") {
            throw new errors_1.ValidationError('Le type de localisation doit être "Point"');
        }
        if (!Array.isArray(location.coordinates) ||
            location.coordinates.length !== 2) {
            throw new errors_1.ValidationError("Les coordonnées doivent être un tableau de 2 nombres [longitude, latitude]");
        }
        const [longitude, latitude] = location.coordinates;
        if (typeof longitude !== "number" ||
            typeof latitude !== "number" ||
            longitude < -180 ||
            longitude > 180 ||
            latitude < -90 ||
            latitude > 90) {
            throw new errors_1.ValidationError("Les coordonnées doivent être des nombres valides (longitude: -180 à 180, latitude: -90 à 90)");
        }
        // Validation des images (si présentes)
        if (req.files && Array.isArray(req.files)) {
            if (req.files.length > MAX_IMAGES) {
                throw new errors_1.ValidationError(`Le nombre maximum d'images autorisé est ${MAX_IMAGES}`);
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.validateTool = validateTool;
//# sourceMappingURL=validateTool.js.map