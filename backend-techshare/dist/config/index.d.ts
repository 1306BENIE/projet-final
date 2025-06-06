interface Config {
    port: number;
    mongoUri: string;
    jwtSecret: string;
    stripe: {
        secretKey: string;
        webhookSecret: string;
    };
    email: {
        host: string;
        port: number;
        secure: boolean;
        user: string;
        password: string;
        from: string;
    };
    cloudinary: {
        cloudName: string;
        apiKey: string;
        apiSecret: string;
    };
    redis: {
        url: string;
    };
}
export declare const config: Config;
export {};
