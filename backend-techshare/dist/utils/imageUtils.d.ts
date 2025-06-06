export declare const deleteImage: (publicId: string) => Promise<void>;
export declare const getImageUrl: (publicId: string, options?: {}) => string;
export declare const optimizeImage: (publicId: string) => Promise<string>;
