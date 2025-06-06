import mongoose from "mongoose";
import { ITool } from "../interfaces/tool.interface";
declare const Tool: mongoose.Model<ITool, {}, {}, {}, mongoose.Document<unknown, {}, ITool> & ITool & {
    _id: mongoose.Types.ObjectId;
}, any>;
export { Tool };
