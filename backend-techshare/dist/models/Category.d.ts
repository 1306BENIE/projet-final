import mongoose from "mongoose";
import { ICategory } from "../interfaces/category.interface";
declare const Category: mongoose.Model<ICategory, {}, {}, {}, mongoose.Document<unknown, {}, ICategory> & ICategory & {
    _id: mongoose.Types.ObjectId;
}, any>;
export { Category };
