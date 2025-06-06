"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseError = exports.AuthenticationError = exports.ValidationError = exports.NotificationError = void 0;
class NotificationError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = "NotificationError";
    }
}
exports.NotificationError = NotificationError;
class ValidationError extends Error {
    constructor(message, errors = []) {
        super(message);
        this.errors = errors;
        this.name = "ValidationError";
    }
}
exports.ValidationError = ValidationError;
class AuthenticationError extends Error {
    constructor(message, code = 401) {
        super(message);
        this.code = code;
        this.name = "AuthenticationError";
    }
}
exports.AuthenticationError = AuthenticationError;
class DatabaseError extends Error {
    constructor(message) {
        super(message);
        this.name = "DatabaseError";
    }
}
exports.DatabaseError = DatabaseError;
//# sourceMappingURL=errors.js.map