import BaseRepository from '../repositories/base.repository';
import { IProfile, ProfileModel } from '../models/profile.model';

class ProfileRepository extends BaseRepository<IProfile> {
  constructor() {
    super(ProfileModel);
  }
}

export default new ProfileRepository();
