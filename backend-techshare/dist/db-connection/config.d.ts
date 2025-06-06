declare const options: {
    useNewUrlParser: boolean;
    useUnifiedTopology: boolean;
    autoIndex: boolean;
    serverSelectionTimeoutMS: number;
    socketTimeoutMS: number;
    family: number;
    maxPoolSize: number;
    minPoolSize: number;
    retryWrites: boolean;
    retryReads: boolean;
};
declare const MONGODB_URI: string;
export { MONGODB_URI, options };
