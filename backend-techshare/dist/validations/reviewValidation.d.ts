import Joi from "joi";
import { Request, Response, NextFunction } from "express";
export declare const reviewSchema: Joi.ObjectSchema<any>;
export declare const reviewParamsSchema: Joi.ObjectSchema<any>;
export declare const validateReview: (req: Request, _res: Response, next: NextFunction) => void;
export declare const validateReviewParams: (req: Request, _res: Response, next: NextFunction) => void;
