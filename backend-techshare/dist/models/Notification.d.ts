import mongoose from "mongoose";
import { INotification } from "../interfaces/notification.interface";
declare const Notification: mongoose.Model<INotification, {}, {}, {}, mongoose.Document<unknown, {}, INotification> & INotification & {
    _id: mongoose.Types.ObjectId;
}, any>;
export { Notification, INotification };
