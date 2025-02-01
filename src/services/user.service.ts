import BaseService from './base.service';
import { IUser } from '@models/user.model';
import UserRepository from '@repositories/user.repository';
import { Result } from '@repositories/repository';
import bcrypt from 'bcrypt';

class UserService extends BaseService<IUser> {
  constructor() {
    super(UserRepository);
  }

  async insert(props: IUser): Promise<Result<IUser>> {
    const hashedPassword = await bcrypt.hash(props.password, 10);
    return super.insert({
      ...props,
      password: hashedPassword,
    });
  }
}

export default new UserService();
