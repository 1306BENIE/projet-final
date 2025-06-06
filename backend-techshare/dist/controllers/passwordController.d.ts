import { Request, Response, NextFunction } from "express";
export declare const passwordController: {
    requestPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void>;
    resetPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
};
