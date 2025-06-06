"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRental = void 0;
const errors_1 = require("../utils/errors");
const mongoose_1 = require("mongoose");
const MIN_RENTAL_DAYS = 1;
const MAX_RENTAL_DAYS = 30;
const validateRental = (req, _res, next) => {
    try {
        const { toolId, startDate, endDate } = req.body;
        if (!toolId || !mongoose_1.Types.ObjectId.isValid(toolId)) {
            throw new errors_1.ValidationError("ID d'outil invalide");
        }
        if (!startDate || !endDate) {
            throw new errors_1.ValidationError("Les dates de début et de fin sont requises");
        }
        const start = new Date(startDate);
        const end = new Date(endDate);
        const now = new Date();
        if (start < now) {
            throw new errors_1.ValidationError("La date de début doit être dans le futur");
        }
        if (end <= start) {
            throw new errors_1.ValidationError("La date de fin doit être après la date de début");
        }
        const durationInDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        if (durationInDays < MIN_RENTAL_DAYS) {
            throw new errors_1.ValidationError(`La durée minimale de location est de ${MIN_RENTAL_DAYS} jour(s)`);
        }
        if (durationInDays > MAX_RENTAL_DAYS) {
            throw new errors_1.ValidationError(`La durée maximale de location est de ${MAX_RENTAL_DAYS} jours`);
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.validateRental = validateRental;
//# sourceMappingURL=validateRental.js.map