import { Request, Response } from "express";
export declare const notificationController: {
    getUserNotifications(req: Request, res: Response): Promise<void>;
    getUnreadNotifications(req: Request, res: Response): Promise<void>;
    markAsRead(req: Request, res: Response): Promise<void>;
    markAllAsRead(req: Request, res: Response): Promise<void>;
    deleteNotification(req: Request, res: Response): Promise<void>;
    getUnreadCount(req: Request, res: Response): Promise<void>;
};
