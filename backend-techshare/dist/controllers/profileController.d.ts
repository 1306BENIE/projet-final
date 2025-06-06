import { Request, Response, NextFunction } from "express";
export declare const profileController: {
    getProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteAccount(req: Request, res: Response, next: NextFunction): Promise<void>;
};
