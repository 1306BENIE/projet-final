"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryController = void 0;
const mongoose_1 = require("mongoose");
const Category_1 = require("../models/Category");
const errors_1 = require("../utils/errors");
const securityLogService_1 = require("../services/securityLogService");
// Constantes de validation
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 50;
const MIN_DESCRIPTION_LENGTH = 10;
const MAX_DESCRIPTION_LENGTH = 500;
const VALID_ICON_TYPES = ["material", "font-awesome", "custom"];
// Validation des données de catégorie
const validateCategoryInput = (data) => {
    if (!data.name ||
        data.name.length < MIN_NAME_LENGTH ||
        data.name.length > MAX_NAME_LENGTH) {
        throw new errors_1.ValidationError(`Le nom doit contenir entre ${MIN_NAME_LENGTH} et ${MAX_NAME_LENGTH} caractères`);
    }
    if (data.description &&
        (data.description.length < MIN_DESCRIPTION_LENGTH ||
            data.description.length > MAX_DESCRIPTION_LENGTH)) {
        throw new errors_1.ValidationError(`La description doit contenir entre ${MIN_DESCRIPTION_LENGTH} et ${MAX_DESCRIPTION_LENGTH} caractères`);
    }
    if (data.icon) {
        if (!VALID_ICON_TYPES.includes(data.icon.type)) {
            throw new errors_1.ValidationError("Type d'icône invalide");
        }
        if (!data.icon.name) {
            throw new errors_1.ValidationError("Nom d'icône requis");
        }
    }
};
exports.categoryController = {
    // Get all categories
    async getCategories(req, res, next) {
        try {
            const { page = 1, limit = 20, includeInactive = false } = req.query;
            const pageNum = Number(page);
            const limitNum = Number(limit);
            const filter = includeInactive === "true" ? {} : { isActive: true };
            const skip = (pageNum - 1) * limitNum;
            const [categories, total] = await Promise.all([
                Category_1.Category.find(filter).sort({ name: 1 }).skip(skip).limit(limitNum),
                Category_1.Category.countDocuments(filter),
            ]);
            const response = {
                message: "Catégories récupérées avec succès",
                categories,
                metadata: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    pages: Math.ceil(total / limitNum),
                },
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    },
    // Get category by ID
    async getCategoryById(req, res, next) {
        try {
            const { id } = req.params;
            if (!mongoose_1.Types.ObjectId.isValid(id)) {
                throw new errors_1.ValidationError("ID de catégorie invalide");
            }
            const category = await Category_1.Category.findById(id);
            if (!category) {
                throw new errors_1.ValidationError("Catégorie non trouvée");
            }
            const response = {
                message: "Catégorie récupérée avec succès",
                category,
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    },
    // Create new category (admin only)
    async createCategory(req, res, next) {
        try {
            if (!req.user?.userId || req.user.role !== "admin") {
                throw new errors_1.ValidationError("Accès administrateur requis");
            }
            const categoryData = req.body;
            validateCategoryInput(categoryData);
            // Check if category already exists
            const existingCategory = await Category_1.Category.findOne({
                name: { $regex: new RegExp(`^${categoryData.name}$`, "i") },
            });
            if (existingCategory) {
                throw new errors_1.ValidationError("Cette catégorie existe déjà");
            }
            const category = new Category_1.Category({
                ...categoryData,
                slug: categoryData.name.toLowerCase().replace(/\s+/g, "-"),
                isActive: true,
            });
            await category.save();
            // Journalisation de l'événement
            await securityLogService_1.securityLogService.logEvent(new mongoose_1.Types.ObjectId(req.user.userId), "category_created", "Nouvelle catégorie créée");
            const response = {
                message: "Catégorie créée avec succès",
                category,
            };
            res.status(201).json(response);
        }
        catch (error) {
            next(error);
        }
    },
    // Update category (admin only)
    async updateCategory(req, res, next) {
        try {
            if (!req.user?.userId || req.user.role !== "admin") {
                throw new errors_1.ValidationError("Accès administrateur requis");
            }
            const { id } = req.params;
            if (!mongoose_1.Types.ObjectId.isValid(id)) {
                throw new errors_1.ValidationError("ID de catégorie invalide");
            }
            const categoryData = req.body;
            validateCategoryInput(categoryData);
            const category = await Category_1.Category.findById(id);
            if (!category) {
                throw new errors_1.ValidationError("Catégorie non trouvée");
            }
            // If name is being updated, check for duplicates
            if (categoryData.name && categoryData.name !== category.name) {
                const existingCategory = await Category_1.Category.findOne({
                    name: { $regex: new RegExp(`^${categoryData.name}$`, "i") },
                    _id: { $ne: category._id },
                });
                if (existingCategory) {
                    throw new errors_1.ValidationError("Ce nom de catégorie existe déjà");
                }
                category.slug = categoryData.name.toLowerCase().replace(/\s+/g, "-");
            }
            Object.assign(category, categoryData);
            await category.save();
            // Log de l'événement
            await securityLogService_1.securityLogService.logEvent(new mongoose_1.Types.ObjectId(req.user.userId), "category_updated", "Catégorie mise à jour");
            const response = {
                message: "Catégorie mise à jour avec succès",
                category,
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    },
    // Delete category (admin only)
    async deleteCategory(req, res, next) {
        try {
            if (!req.user?.userId || req.user.role !== "admin") {
                throw new errors_1.ValidationError("Accès administrateur requis");
            }
            const { id } = req.params;
            if (!mongoose_1.Types.ObjectId.isValid(id)) {
                throw new errors_1.ValidationError("ID de catégorie invalide");
            }
            const category = await Category_1.Category.findById(id);
            if (!category) {
                throw new errors_1.ValidationError("Catégorie non trouvée");
            }
            // Instead of deleting, mark as inactive
            category.isActive = false;
            await category.save();
            // Log de l'événement
            await securityLogService_1.securityLogService.logEvent(new mongoose_1.Types.ObjectId(req.user.userId), "category_deleted", "Catégorie supprimée");
            const response = {
                message: "Catégorie supprimée avec succès",
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=categoryController.js.map