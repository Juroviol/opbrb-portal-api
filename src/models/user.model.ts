import mongoose, { Schema } from 'mongoose';
import Base from '@models/base.model';

export interface IUser extends Base {
  name: string;
  email: string;
}
const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
});

export const UserModel = mongoose.model<IUser>('User', UserSchema);
