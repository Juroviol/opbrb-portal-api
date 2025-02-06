import BaseService from './base.service';
import { IPastor } from '../models/pastor.model';
import PastorRepository from '../repositories/pastor.repository';
import { Result } from '../repositories/repository';
import FileApi from '../apis/file.api';
import { Types } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { Role } from '../models/user.model';
import bcrypt from 'bcrypt';

class PastorService extends BaseService<IPastor> {
  constructor() {
    super(PastorRepository);
  }

  async insert({
    file,
    ...props
  }: Omit<IPastor, '_id' | 'recommendationLetterUrl'> & {
    file: {
      filename: string;
      mimetype: string;
      buffer: Buffer;
    };
  }): Promise<Result<IPastor>> {
    const _id = new Types.ObjectId();
    const filePath = `pastors/${_id}/${uuid()}.${file.filename
      .split('.')
      .pop()}`;
    await FileApi.create(filePath, file.buffer, 'public-read', file.mimetype);
    const hashedPassword = await bcrypt.hash(props.password, 10);
    return super.insert({
      _id,
      ...props,
      password: hashedPassword,
      role: Role.PASTOR,
      recommendationLetterUrl: filePath,
    });
  }
}

export default new PastorService();
