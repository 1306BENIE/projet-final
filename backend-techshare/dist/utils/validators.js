"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRating = exports.validatePrice = exports.validateDate = exports.validatePostalCode = exports.validatePhoneNumber = exports.validatePassword = exports.validateEmail = void 0;
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.validateEmail = validateEmail;
const validatePassword = (password) => {
    // Au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};
exports.validatePassword = validatePassword;
const validatePhoneNumber = (phone) => {
    // Format français : +33 ou 0 suivi de 9 chiffres
    const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
    return phoneRegex.test(phone);
};
exports.validatePhoneNumber = validatePhoneNumber;
const validatePostalCode = (postalCode) => {
    // Code postal français : 5 chiffres
    const postalCodeRegex = /^[0-9]{5}$/;
    return postalCodeRegex.test(postalCode);
};
exports.validatePostalCode = validatePostalCode;
const validateDate = (date) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date))
        return false;
    const d = new Date(date);
    return d instanceof Date && !isNaN(d.getTime());
};
exports.validateDate = validateDate;
const validatePrice = (price) => {
    return price >= 0 && price <= 1000000; // Prix maximum de 1 million
};
exports.validatePrice = validatePrice;
const validateRating = (rating) => {
    return rating >= 0 && rating <= 5;
};
exports.validateRating = validateRating;
//# sourceMappingURL=validators.js.map