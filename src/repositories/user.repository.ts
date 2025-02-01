import BaseRepository from './base.repository';
import { IUser, UserModel } from '../models/user.model';

class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(UserModel);
  }
}

export default new UserRepository();
