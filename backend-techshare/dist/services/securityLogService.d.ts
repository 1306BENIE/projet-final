import { Schema, Types } from "mongoose";
export interface SecurityLogInput {
    userId?: string;
    action: string;
    ipAddress: string;
    userAgent: string;
    status: "success" | "failure";
    details: any;
}
export interface ISecurityLog {
    userId: Schema.Types.ObjectId;
    action: string;
    ipAddress: string;
    userAgent: string;
    status: "success" | "failure";
    details?: string;
    createdAt: Date;
}
declare class SecurityLogService {
    logAction(data: SecurityLogInput): Promise<void>;
    logEvent(userId: Types.ObjectId, action: string, details: string): Promise<void>;
    getLogs(query?: any): Promise<ISecurityLog[]>;
}
export declare const securityLogService: SecurityLogService;
export {};
