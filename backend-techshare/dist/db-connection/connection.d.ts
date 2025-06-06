declare class Database {
    private static instance;
    private isConnected;
    private constructor();
    static getInstance(): Database;
    connect(): Promise<void>;
    private gracefulShutdown;
    disconnect(): Promise<void>;
    getConnectionStatus(): boolean;
}
declare const _default: Database;
export default _default;
