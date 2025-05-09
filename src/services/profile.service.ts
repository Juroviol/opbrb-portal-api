import BaseService from './base.service';
import { IProfile } from '../models/profile.model';
import ProfileRepository from '../repositories/profile.repository';

class ProfileService extends BaseService<IProfile> {
  constructor() {
    super(ProfileRepository);
  }
}

export default new ProfileService();
