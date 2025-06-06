import { Request, Response, NextFunction } from "express";
import Joi from "joi";
export declare const validateMiddleware: (schema: Joi.ObjectSchema, type?: "body" | "query" | "params") => (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
