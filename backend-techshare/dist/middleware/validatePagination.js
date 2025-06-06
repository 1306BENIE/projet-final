"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePagination = void 0;
const errors_1 = require("../utils/errors");
const MIN_PAGE = 1;
const MAX_PAGE = 100;
const MIN_LIMIT = 1;
const MAX_LIMIT = 50;
const validatePagination = (req, _res, next) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    if (page < MIN_PAGE ||
        page > MAX_PAGE ||
        limit < MIN_LIMIT ||
        limit > MAX_LIMIT) {
        throw new errors_1.ValidationError(`La page doit être entre ${MIN_PAGE} et ${MAX_PAGE}, et la limite entre ${MIN_LIMIT} et ${MAX_LIMIT}`);
    }
    next();
};
exports.validatePagination = validatePagination;
//# sourceMappingURL=validatePagination.js.map