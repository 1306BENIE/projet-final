import { Request, Response, NextFunction } from "express";
export declare const rentalController: {
    createRental(req: Request, res: Response, next: NextFunction): Promise<void>;
    getUserRentals(req: Request, res: Response, next: NextFunction): Promise<void>;
    getOwnerRentals(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateRentalStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    addReview(req: Request, res: Response, next: NextFunction): Promise<void>;
};
