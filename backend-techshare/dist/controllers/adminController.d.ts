import { Request, Response, NextFunction } from "express";
export declare const adminController: {
    getUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
    banUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    unbanUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    getTools(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteTool(req: Request, res: Response, next: NextFunction): Promise<void>;
    getReviews(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteReview(req: Request, res: Response, next: NextFunction): Promise<void>;
    getStats(req: Request, res: Response, next: NextFunction): Promise<void>;
};
