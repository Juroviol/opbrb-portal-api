import mongoose, { Schema } from 'mongoose';
import Base from './base.model';

export enum Role {
  ADMIN = 'ADMIN',
  PASTOR = 'PASTOR',
}

export interface IUser extends Base {
  name: string;
  email: string;
  password: string;
  role: Role;
  createdAt: Date;
}
const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: Object.values(Role), required: true },
  createdAt: { type: Date, default: Date.now },
});

export const UserModel = mongoose.model<IUser>('User', UserSchema);
