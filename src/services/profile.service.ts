import BaseService from './base.service';
import { IProfile } from '../models/profile.model';
import ProfileRepository from '../repositories/profile.repository';
import { Types } from 'mongoose';
import PastorService from './pastor.service';

class ProfileService extends BaseService<IProfile> {
  constructor() {
    super(ProfileRepository);
  }

  async assignProfileToPastors(
    profileId: string | Types.ObjectId,
    pastorsIds: (string | Types.ObjectId)[]
  ): Promise<Boolean> {
    const profile = await this.findById(profileId);
    if (!profile) {
      throw new Error('Profile not found.');
    }
    await PastorService.updateMany(
      {
        _id: {
          $in: pastorsIds.map((id) => new Types.ObjectId(id)),
        },
      },
      {
        scopes: profile.scopes,
      }
    );
    return true;
  }
}

export default new ProfileService();
