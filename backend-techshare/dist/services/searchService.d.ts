import { Types } from "mongoose";
interface SearchFilters {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: {
        type: "Point";
        coordinates: [number, number];
    };
    maxDistance?: number;
    availability?: {
        startDate: Date;
        endDate: Date;
    };
    searchTerm?: string;
}
declare class SearchService {
    searchTools(filters: SearchFilters, page?: number, limit?: number): Promise<{
        tools: Omit<Omit<import("mongoose").Document<unknown, {}, import("../models").ITool> & import("../models").ITool & {
            _id: Types.ObjectId;
        }, never>, never>[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
}
export declare const searchService: SearchService;
export {};
