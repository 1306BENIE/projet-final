import multer from "multer";
import cloudinary from "../config/cloudinary";
export declare const uploadMiddleware: import("express").RequestHandler<import("@types/express-serve-static-core").ParamsDictionary, any, any, import("@types/qs").ParsedQs, Record<string, any>>;
export { cloudinary };
export declare const diskUploadMiddleware: multer.Multer;
