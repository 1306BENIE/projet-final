import winston from 'winston';
import 'winston-daily-rotate-file';
import { Request, Response, NextFunction } from 'express';
export declare const logger: winston.Logger;
export declare const stream: {
    write: (message: string) => void;
};
export declare const logError: (error: Error, context?: string) => void;
export declare const logHttpRequest: (req: Request, _res: Response, next: NextFunction) => void;
export declare const logSecurityEvent: (action: string, details: any, userId?: string) => void;
export declare const logPerformance: (operation: string, duration: number, metadata?: any) => void;
