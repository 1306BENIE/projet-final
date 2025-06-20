"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateObjectId = void 0;
const mongoose_1 = require("mongoose");
const validateObjectId = (paramName) => {
    return (req, res, next) => {
        console.log(`=== validateObjectId called for ${paramName} ===`);
        console.log(`URL: ${req.method} ${req.originalUrl}`);
        const id = req.params[paramName];
        console.log(`Validation de l'ID ${paramName}:`, id);
        console.log("Type de l'ID:", typeof id);
        console.log("Longueur de l'ID:", id?.length);
        console.log("Est-ce un ObjectId valide:", mongoose_1.Types.ObjectId.isValid(id));
        if (!id) {
            console.error(`ID ${paramName} manquant dans les paramètres`);
            return res.status(400).json({
                error: "ValidationError",
                message: `ID ${paramName} manquant`,
            });
        }
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            console.error(`Format d'ID ${paramName} invalide:`, id);
            return res.status(400).json({
                error: "ValidationError",
                message: `Format d'ID ${paramName} invalide`,
            });
        }
        console.log(`ID ${paramName} valide:`, id);
        console.log(`=== validateObjectId passed for ${paramName} ===`);
        next();
    };
};
exports.validateObjectId = validateObjectId;
//# sourceMappingURL=validateObjectId.js.map