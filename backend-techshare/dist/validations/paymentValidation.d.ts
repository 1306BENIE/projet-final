import Joi from "joi";
import { Request, Response, NextFunction } from "express";
export declare const createPaymentIntentSchema: Joi.ObjectSchema<any>;
export declare const refundPaymentSchema: Joi.ObjectSchema<any>;
export declare const webhookSchema: Joi.ObjectSchema<any>;
export declare const getPaymentIntentSchema: Joi.ObjectSchema<any>;
export declare const getPaymentHistorySchema: Joi.ObjectSchema<any>;
export declare const validatePayment: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
