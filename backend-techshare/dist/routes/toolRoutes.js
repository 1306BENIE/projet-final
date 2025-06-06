"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const toolController_1 = require("../controllers/toolController");
const auth_1 = require("../middleware/auth");
const validateObjectId_1 = require("../middleware/validateObjectId");
const validatePagination_1 = require("../middleware/validatePagination");
const upload_1 = require("../middleware/upload");
const validateTool_1 = require("../middleware/validateTool");
const errorHandler_1 = require("../middleware/errorHandler");
const router = express_1.default.Router();
router.get("/", validatePagination_1.validatePagination, (0, errorHandler_1.errorHandler)(toolController_1.toolController.getTools));
router.get("/:toolId", (0, validateObjectId_1.validateObjectId)("toolId"), (0, errorHandler_1.errorHandler)(toolController_1.toolController.getToolById));
router.post("/", auth_1.auth, upload_1.diskUploadMiddleware.array("images", 5), validateTool_1.validateTool, (0, errorHandler_1.errorHandler)(toolController_1.toolController.createTool));
router.put("/:toolId", auth_1.auth, (0, validateObjectId_1.validateObjectId)("toolId"), upload_1.diskUploadMiddleware.array("images", 5), validateTool_1.validateTool, (0, errorHandler_1.errorHandler)(toolController_1.toolController.updateTool));
router.delete("/:toolId", auth_1.auth, (0, validateObjectId_1.validateObjectId)("toolId"), (0, errorHandler_1.errorHandler)(toolController_1.toolController.deleteTool));
router.get("/user/tools", auth_1.auth, validatePagination_1.validatePagination, (0, errorHandler_1.errorHandler)(toolController_1.toolController.getUserTools));
exports.default = router;
//# sourceMappingURL=toolRoutes.js.map