"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = void 0;
const errors_1 = require("../utils/errors");
const isAdmin = (req, _res, next) => {
    if (!req.user || req.user.role !== "admin") {
        throw new errors_1.ValidationError("Accès administrateur requis");
    }
    next();
};
exports.isAdmin = isAdmin;
//# sourceMappingURL=isAdmin.js.map