export declare class NotificationError extends Error {
    code: number;
    constructor(message: string, code: number);
}
export declare class ValidationError extends Error {
    errors: Array<{
        field: string;
        message: string;
    }>;
    constructor(message: string, errors?: Array<{
        field: string;
        message: string;
    }>);
}
export declare class AuthenticationError extends Error {
    code: number;
    constructor(message: string, code?: number);
}
export declare class DatabaseError extends Error {
    constructor(message: string);
}
