"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRoleMiddleware = void 0;
const logger_1 = require("../utils/logger");
const checkRoleMiddleware = (roles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: "Authentification requise" });
            }
            if (!roles.includes(req.user.role)) {
                logger_1.logger.warn(`Tentative d'accès non autorisé par l'utilisateur ${req.user.userId} avec le rôle ${req.user.role}`);
                return res.status(403).json({
                    message: "Accès refusé. Vous n'avez pas les permissions nécessaires.",
                });
            }
            next();
        }
        catch (error) {
            logger_1.logger.error("Erreur lors de la vérification des rôles:", error);
            res
                .status(500)
                .json({ message: "Erreur lors de la vérification des permissions" });
            return;
        }
        return;
    };
};
exports.checkRoleMiddleware = checkRoleMiddleware;
//# sourceMappingURL=checkRole.js.map