import BaseService from './base.service';
import { IUser } from '@models/user.model';
import UserRepository from '@repositories/user.repository';

class UserService extends BaseService<IUser> {
  constructor() {
    super(UserRepository);
  }
}

export default new UserService();
