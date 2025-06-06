import { Server } from "socket.io";
import { INotification } from "../models/Notification";
interface NotificationData {
    recipient: string;
    sender?: string;
    type: INotification["type"];
    title: string;
    message: string;
    relatedTool?: string;
    relatedRental?: string;
}
interface EmailData {
    title: string;
    message: string;
    details?: string;
    [key: string]: any;
}
interface PaginationResult {
    notifications: INotification[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}
declare class NotificationService {
    private transporter;
    private io;
    private userSockets;
    constructor(io: Server);
    private setupSocketHandlers;
    createNotification(data: NotificationData): Promise<INotification>;
    getUserNotifications(userId: string, page?: number, limit?: number): Promise<PaginationResult>;
    markAllAsRead(userId: string): Promise<{
        modifiedCount: number;
    }>;
    getUnreadCount(userId: string): Promise<number>;
    sendEmail(to: string, subject: string, template: string, data: EmailData): Promise<void>;
    private renderTemplate;
    markAsRead(notificationId: string, userId: string): Promise<INotification>;
    deleteNotification(notificationId: string, userId: string): Promise<void>;
}
export declare const initializeNotificationService: (io: Server) => NotificationService;
export declare const getNotificationService: () => NotificationService;
export {};
