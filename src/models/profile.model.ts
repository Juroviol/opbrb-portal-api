import mongoose, { Schema } from 'mongoose';
import { Scope } from './user.model';
import Base from './base.model';

export interface IProfile extends Base {
  name: string;
  scopes: Scope[];
}

const ProfileSchema = new Schema({
  name: String,
  scopes: {
    type: [String],
    enum: Object.values(Scope),
    required: true,
  },
});

export const ProfileModel = mongoose.model<IProfile>('Profile', ProfileSchema);
