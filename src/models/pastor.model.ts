import { IUser, UserModel } from './user.model';
import { Schema } from 'mongoose';

export interface IPastor extends IUser {
  birthday: Date;
  address: string;
  number: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  cellPhone: string;
}

export const PastorModel = UserModel.discriminator<IPastor>(
  'Pastor',
  new Schema({
    birthday: { type: Date, required: true },
    address: { type: String, required: true },
    number: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    zipCode: { type: String, required: true },
    cellPhone: { type: String, required: true },
  })
);
