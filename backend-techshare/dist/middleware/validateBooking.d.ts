import { Request, Response, NextFunction } from "express";
export declare const validateBooking: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
