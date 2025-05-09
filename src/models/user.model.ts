import mongoose, { Schema } from 'mongoose';
import Base from './base.model';

export enum Scope {
  CanListPastors = 'CanListPastors',
  CanDeletePastor = 'CanDeletePastor',
  CanDetailPastor = 'CanDetailPastor',
  CanEditAccountPersonalInfo = 'CanEditAccountPersonalInfo',
  CanEditAccountCredentials = 'CanEditAccountCredentials',
  CanEditAccountAddress = 'CanEditAccountAddress',
  CanEditAccountContactInfo = 'CanEditAccountContactInfo',
  CanEditAccountMinistry = 'CanEditAccountMinistry',
  CanEditAccountOrderCard = 'CanEditAccountOrderCard',
  CanListAccountAnalysisHistory = 'CanListAccountAnalysisHistory',
  CanApprovePastorDocumentationAnalysis = 'CanApprovePastorDocumentationAnalysis',
  CanApprovePastorFinancialAnalysis = 'CanApprovePastorFinancialAnalysis',
  CanAddPendingItemAnalysis = 'CanAddPendingItemAnalysis',
  CanDownloadPastorRecommendationLetter = 'CanDownloadPastorRecommendationLetter',
  CanDownloadPastorPaymentConfirmation = 'CanDownloadPastorPaymentConfirmation',
  CanDownloadPastorOrdinationMinutes = 'CanDownloadPastorOrdinationMinutes',
  CanDownloadPastorCpfRg = 'CanDownloadPastorCpfRg',
  CanListProfileScopes = 'CanListProfileScopes',
  CanCreateProfileScopes = 'CanCreateProfileScopes',
  CanEditProfileScopes = 'CanEditProfileScopes',
  CanDeleteProfileScopes = 'CanDeleteProfileScopes',
  CanAssignProfileScopes = 'CanAssignProfileScopes',
}

export interface IUser extends Base {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  scopes: Scope[];
  pictureUrl?: string;
}
const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  scopes: {
    type: [String],
    enum: Object.values(Scope),
    required: true,
  },
  pictureUrl: { type: String },
});

export const UserModel = mongoose.model<IUser>('User', UserSchema);
