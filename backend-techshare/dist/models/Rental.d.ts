import mongoose from "mongoose";
import { IRental } from "../interfaces/rental.interface";
declare const Rental: mongoose.Model<IRental, {}, {}, {}, mongoose.Document<unknown, {}, IRental> & IRental & {
    _id: mongoose.Types.ObjectId;
}, any>;
export { Rental };
