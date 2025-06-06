import { Request, Response, NextFunction } from "express";
export declare const searchController: {
    searchTools(req: Request, res: Response, next: NextFunction): Promise<void>;
    getPopularTools(_req: Request, res: Response, next: NextFunction): Promise<void>;
    getNearbyTools(req: Request, res: Response, next: NextFunction): Promise<void>;
};
