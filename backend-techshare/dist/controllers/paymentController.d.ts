import { Request, Response, NextFunction } from "express";
export declare const paymentController: {
    createPaymentIntent(req: Request, res: Response, next: NextFunction): Promise<void>;
    handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void>;
    getPaymentHistory(req: Request, res: Response, next: NextFunction): Promise<void>;
    refundPayment(req: Request, res: Response, next: NextFunction): Promise<void>;
    getPaymentIntent(req: Request, res: Response, next: NextFunction): Promise<void>;
};
