import BaseService from './base.service';
import { IUser } from '../models/user.model';
import UserRepository from '../repositories/user.repository';
import { Result } from '../repositories/repository';
import bcrypt from 'bcrypt';
import Jwt from 'jsonwebtoken';

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

  async validateUsernameAndPassword(
    username: string,
    password: string
  ): Promise<IUser> {
    const user = await this.findOne({
      filters: { email: username },
    });
    if (!user) {
      throw new Error('User not found.');
    }
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw new Error('Invalid credentials');
    }
    return user;
  }

  async generateToken(user: IUser): Promise<string> {
    return Jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: '1d',
        issuer: 'opbrb',
        subject: user._id?.toString(),
      }
    );
  }
}

export default new UserService();
