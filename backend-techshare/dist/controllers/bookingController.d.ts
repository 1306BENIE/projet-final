import { Request, Response } from "express";
export declare const createBooking: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getUserBookings: (req: Request, res: Response) => Promise<void>;
export declare const getOwnerBookings: (req: Request, res: Response) => Promise<void>;
export declare const getBookingById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const cancelBooking: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateBooking: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
