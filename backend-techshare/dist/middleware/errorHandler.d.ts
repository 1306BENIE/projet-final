import { Request, Response, NextFunction } from "express";
type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;
export declare const errorHandler: (fn: AsyncFunction) => (req: Request, res: Response, next: NextFunction) => Promise<any>;
export {};
