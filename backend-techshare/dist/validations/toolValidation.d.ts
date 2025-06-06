import Joi from "joi";
import { Request, Response, NextFunction } from "express";
export declare const createToolSchema: Joi.ObjectSchema<any>;
export declare const updateToolSchema: Joi.ObjectSchema<any>;
export declare const validateTool: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
