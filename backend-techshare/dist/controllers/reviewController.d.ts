import { Request, Response, NextFunction } from "express";
export declare const reviewController: {
    createReview(req: Request, res: Response, next: NextFunction): Promise<void>;
    getReviewsByTool(req: Request, res: Response, next: NextFunction): Promise<void>;
    getReviewsByUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateReview(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteReview(req: Request, res: Response, next: NextFunction): Promise<void>;
};
