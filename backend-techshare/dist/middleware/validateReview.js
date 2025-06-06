"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateReview = void 0;
const errors_1 = require("../utils/errors");
const mongoose_1 = require("mongoose");
const MIN_RATING = 1;
const MAX_RATING = 5;
const MIN_COMMENT_LENGTH = 10;
const MAX_COMMENT_LENGTH = 1000;
const validateReview = (req, next) => {
    try {
        const { toolId, rating, comment } = req.body;
        if (req.method === "POST" && (!toolId || !mongoose_1.Types.ObjectId.isValid(toolId))) {
            throw new errors_1.ValidationError("ID d'outil invalide");
        }
        if (!rating || typeof rating !== "number") {
            throw new errors_1.ValidationError("La note est requise et doit être un nombre");
        }
        if (rating < MIN_RATING || rating > MAX_RATING) {
            throw new errors_1.ValidationError(`La note doit être comprise entre ${MIN_RATING} et ${MAX_RATING}`);
        }
        if (comment) {
            if (typeof comment !== "string") {
                throw new errors_1.ValidationError("Le commentaire doit être une chaîne de caractères");
            }
            if (comment.length < MIN_COMMENT_LENGTH) {
                throw new errors_1.ValidationError(`Le commentaire doit contenir au moins ${MIN_COMMENT_LENGTH} caractères`);
            }
            if (comment.length > MAX_COMMENT_LENGTH) {
                throw new errors_1.ValidationError(`Le commentaire ne doit pas dépasser ${MAX_COMMENT_LENGTH} caractères`);
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.validateReview = validateReview;
//# sourceMappingURL=validateReview.js.map