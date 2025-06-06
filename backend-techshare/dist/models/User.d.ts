import { Model } from "mongoose";
import { IUser, IUserMethods } from "../interfaces/user.interface";
export interface UserModel extends Model<IUser, {}, IUserMethods> {
}
export declare const User: UserModel;
