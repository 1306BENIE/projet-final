import { Request, Response, NextFunction } from "express";
export declare const recommendationController: {
    getPersonalizedRecommendations(req: Request, res: Response, next: NextFunction): Promise<void>;
    getSimilarTools(req: Request, res: Response, next: NextFunction): Promise<void>;
    getPopularTools(req: Request, res: Response, next: NextFunction): Promise<void>;
};
