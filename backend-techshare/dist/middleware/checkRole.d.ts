import { Request, Response, NextFunction } from "express";
export declare const checkRoleMiddleware: (roles: string[]) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
