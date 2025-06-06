import { Request, Response, NextFunction } from "express";
export declare const validateObjectId: (paramName: string) => (req: Request, _res: Response, next: NextFunction) => void;
