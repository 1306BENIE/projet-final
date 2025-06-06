"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const auth_1 = require("../middleware/auth");
const isAdmin_1 = require("../middleware/isAdmin");
const validateObjectId_1 = require("../middleware/validateObjectId");
const validate_1 = require("../middleware/validate");
const categoryValidation_1 = require("../validations/categoryValidation");
const router = (0, express_1.Router)();
router.get("/", controllers_1.categoryController.getCategories);
router.get("/:id", (0, validateObjectId_1.validateObjectId)("id"), controllers_1.categoryController.getCategoryById);
router.post("/", auth_1.auth, isAdmin_1.isAdmin, (0, validate_1.validateMiddleware)(categoryValidation_1.createCategorySchema), controllers_1.categoryController.createCategory);
router.put("/:id", auth_1.auth, isAdmin_1.isAdmin, (0, validateObjectId_1.validateObjectId)("id"), (0, validate_1.validateMiddleware)(categoryValidation_1.updateCategorySchema), controllers_1.categoryController.updateCategory);
router.delete("/:id", auth_1.auth, isAdmin_1.isAdmin, (0, validateObjectId_1.validateObjectId)("id"), controllers_1.categoryController.deleteCategory);
exports.default = router;
//# sourceMappingURL=categoryRoutes.js.map