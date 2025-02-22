import BaseService from './base.service';
import { IPastor } from '../models/pastor.model';
import PastorRepository from '../repositories/pastor.repository';
import { Result } from '../repositories/repository';
import FileApi from '../apis/file.api';
import { Types } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { Role, Scope } from '../models/user.model';
import bcrypt from 'bcrypt';
import { formatToCapitalized } from 'brazilian-values';

class PastorService extends BaseService<IPastor> {
  constructor() {
    super(PastorRepository);
  }

  private async upload(
    _id: Types.ObjectId,
    file: {
      filename: string;
      mimetype: string;
      buffer: Buffer;
    }
  ) {
    const fileUrl = `pastors/${_id}/${uuid()}.${file.filename
      .split('.')
      .pop()}`;
    await FileApi.create(fileUrl, file.buffer, 'public-read', file.mimetype);
    return fileUrl;
  }

  async insert({
    fileLetter,
    filePaymentConfirmation,
    ...props
  }: Omit<
    IPastor,
    '_id' | 'recommendationLetterUrl' | 'paymentConfirmationUrl'
  > & {
    fileLetter?: {
      filename: string;
      mimetype: string;
      buffer: Buffer;
    };
    filePaymentConfirmation?: {
      filename: string;
      mimetype: string;
      buffer: Buffer;
    };
  }): Promise<Result<IPastor>> {
    const _id = new Types.ObjectId();
    let recommendationLetterUrl;
    if (fileLetter) {
      recommendationLetterUrl = await this.upload(_id, fileLetter);
    }
    let paymentConfirmationUrl;
    if (filePaymentConfirmation) {
      paymentConfirmationUrl = await this.upload(_id, filePaymentConfirmation);
    }
    const hashedPassword = await bcrypt.hash(props.password, 10);
    return super.insert({
      _id,
      ...props,
      name: formatToCapitalized(props.name),
      password: hashedPassword,
      role: Role.PASTOR,
      scopes: [Scope.CanListPastors, Scope.CanDetailPastor],
      ...(recommendationLetterUrl && { recommendationLetterUrl }),
      recommendationLetterUrl,
      ...(paymentConfirmationUrl && { paymentConfirmationUrl }),
    });
  }
}

export default new PastorService();
