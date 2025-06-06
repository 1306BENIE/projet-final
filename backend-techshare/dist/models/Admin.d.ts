import mongoose from "mongoose";
import { IAdmin } from "../interfaces/admin.interface";
declare const Admin: mongoose.Model<IAdmin, {}, {}, {}, mongoose.Document<unknown, {}, IAdmin> & IAdmin & {
    _id: mongoose.Types.ObjectId;
}, any>;
export { Admin };
