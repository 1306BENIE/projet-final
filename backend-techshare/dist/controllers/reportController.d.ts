import { Request, Response } from "express";
export declare const reportController: {
    getSecurityLogs(req: Request, res: Response): Promise<void>;
    generateActivityReport(req: Request, res: Response): Promise<void>;
    generateUserReport(req: Request, res: Response): Promise<void>;
    generateToolReport(req: Request, res: Response): Promise<void>;
    getActivityLogs(req: Request, res: Response): Promise<void>;
    getErrorLogs(req: Request, res: Response): Promise<void>;
    getUserActivity(req: Request, res: Response): Promise<void>;
    getToolActivity(req: Request, res: Response): Promise<void>;
};
