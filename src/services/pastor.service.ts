import BaseService from './base.service';
import { IPastor } from '../models/pastor.model';
import PastorRepository from '../repositories/pastor.repository';
import { Result } from '../repositories/repository';
import FileApi from '../apis/file.api';
import { Types } from 'mongoose';
import { v4 as uuid } from 'uuid';

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
    return super.insert({
      _id,
      ...props,
      recommendationLetterUrl: filePath,
    });
  }
}

export default new PastorService();
