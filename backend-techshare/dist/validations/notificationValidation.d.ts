import Joi from "joi";
export declare const notificationValidation: {
    getUserNotifications: Joi.ObjectSchema<any>;
    markAsRead: Joi.ObjectSchema<any>;
    deleteNotification: Joi.ObjectSchema<any>;
};
