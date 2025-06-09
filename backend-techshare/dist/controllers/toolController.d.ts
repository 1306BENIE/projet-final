import { Request, Response, NextFunction } from "express";
export declare const toolController: {
    createTool(req: Request, res: Response, next: NextFunction): Promise<void>;
    getTools(req: Request, res: Response, next: NextFunction): Promise<void>;
    getToolById(req: Request, res: Response): Promise<void>;
    updateTool(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteTool(req: Request, res: Response, next: NextFunction): Promise<void>;
    getUserTools(req: Request, res: Response, next: NextFunction): Promise<void>;
};
