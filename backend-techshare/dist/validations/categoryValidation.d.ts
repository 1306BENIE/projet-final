import Joi from "joi";
import { Request, Response, NextFunction } from "express";
export declare const createCategorySchema: Joi.ObjectSchema<any>;
export declare const updateCategorySchema: Joi.ObjectSchema<any>;
export declare const validateCategory: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
