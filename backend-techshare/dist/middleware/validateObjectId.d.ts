import { Request, Response, NextFunction } from "express";
export declare const validateObjectId: (paramName: string) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
