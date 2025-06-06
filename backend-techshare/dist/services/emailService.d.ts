import { IUser } from "../interfaces/user.interface";
declare class EmailService {
    private transporter;
    constructor();
    sendPasswordResetEmail(user: IUser, resetToken: string): Promise<void>;
    sendWelcomeEmail(user: IUser): Promise<void>;
}
export declare const emailService: EmailService;
export {};
