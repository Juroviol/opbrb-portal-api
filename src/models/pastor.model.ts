import { IUser, UserModel } from './user.model';
import { Schema } from 'mongoose';
export enum MaritalStatus {
  Married = 'Casado',
  Single = 'Solteiro',
  Widower = 'Viúvo',
}
export interface IPastor extends IUser {
  cpf: string;
  maritalStatus: MaritalStatus;
  birthday: Date;
  street: string;
  number: string;
  city: string;
  state: string;
  district: string;
  zipCode: string;
  cellPhone: string;
  recommendationLetterUrl?: string;
}

export const PastorModel = UserModel.discriminator<IPastor>(
  'Pastor',
  new Schema({
    cpf: { type: String, required: true },
    maritalStatus: {
      type: String,
      enum: Object.values(MaritalStatus),
      required: true,
    },
    birthday: { type: Date, required: true },
    street: { type: String, required: true },
    number: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    district: { type: String, required: true },
    zipCode: { type: String, required: true },
    cellPhone: { type: String, required: true },
    recommendationLetterUrl: { type: String },
  })
);
