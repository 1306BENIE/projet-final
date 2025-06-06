"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateObjectId = void 0;
const mongoose_1 = require("mongoose");
const errors_1 = require("../utils/errors");
const validateObjectId = (paramName) => {
    return (req, _res, next) => {
        const id = req.params[paramName];
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            throw new errors_1.ValidationError(`ID ${paramName} invalide`);
        }
        next();
    };
};
exports.validateObjectId = validateObjectId;
//# sourceMappingURL=validateObjectId.js.map