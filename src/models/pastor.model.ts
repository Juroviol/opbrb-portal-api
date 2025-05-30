import { IUser, Scope, UserModel } from './user.model';
import { Schema } from 'mongoose';

export enum MaritalStatus {
  Married = 'Casado',
  Single = 'Solteiro',
  Widower = 'Viúvo',
}

export enum Status {
  APPROVED = 'Aprovado',
  ANALYSING = 'Em análise',
}

export enum AnalysisType {
  Documentation = 'Documentação',
  Financial = 'Financeiro',
}

export type Analysis = {
  author: string;
  date: Date;
  type: AnalysisType;
  approved: boolean;
  reason?: string;
};

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
  paymentConfirmationUrl?: string;
  ordinationMinutesUrl?: string;
  cpfRgUrl?: string;
  status: Status;
  analysis?: Analysis[];
  church: string;
  ordinanceTime: number;
  scopes: Scope[];
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
    paymentConfirmationUrl: { type: String },
    ordinationMinutesUrl: { type: String },
    cpfRgUrl: { type: String },
    church: { type: String, required: true },
    ordinanceTime: { type: Number, required: true },
    analysis: [
      {
        reason: { type: String },
        approved: { type: Boolean, required: true },
        date: { type: Date, required: true },
        type: {
          type: String,
          enum: AnalysisType,
          required: true,
        },
        author: { type: String, required: true },
      },
    ],
    status: {
      type: String,
      enum: Status,
      required: true,
      default: Status.ANALYSING,
    },
    scopes: {
      type: [String],
      enum: Object.values(Scope),
      required: true,
    },
  })
);
