import { Request, Response } from "express";
export declare const statsController: {
    getDashboardStats(_req: Request, res: Response): Promise<void>;
    getToolStats(_req: Request, res: Response): Promise<void>;
    getUserStats(_req: Request, res: Response): Promise<void>;
    getRentalStats(_req: Request, res: Response): Promise<void>;
    getRevenueStats(_req: Request, res: Response): Promise<void>;
    getCategoryStats(_req: Request, res: Response): Promise<void>;
};
