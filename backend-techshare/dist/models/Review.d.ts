import mongoose from "mongoose";
import { IReview } from "../interfaces/review.interface";
declare const Review: mongoose.Model<IReview, {}, {}, {}, mongoose.Document<unknown, {}, IReview> & IReview & {
    _id: mongoose.Types.ObjectId;
}, any>;
export { Review };
