import BaseService from './base.service';
import { IPastor } from '../models/pastor.model';
import PastorRepository from '../repositories/pastor.repository';
import { Options, Result } from '../repositories/repository';
import FileApi from '../apis/file.api';
import { Types } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { Role, Scope } from '../models/user.model';
import bcrypt from 'bcrypt';
import { formatToCapitalized } from 'brazilian-values';
import UserService from './user.service';
import { omit } from 'lodash';

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

  async update(
    id: string | Types.ObjectId,
    props: Partial<
      IPastor & { newPassword: string } & {
        fileLetter: {
          filename: string;
          mimetype: string;
          buffer: Buffer;
        };
        filePaymentConfirmation: {
          filename: string;
          mimetype: string;
          buffer: Buffer;
        };
      }
    >,
    options?: Pick<Options<IPastor>, 'withDeleted' | 'populate' | 'select'>
  ): Promise<Result<IPastor> | null> {
    const pastor = await this.findById(id);
    if (!pastor) {
      throw new Error('Pastor not found.');
    }
    if (props.password && props.newPassword) {
      await UserService.validateUsernameAndPassword(
        pastor.email,
        props.password
      );
      props.password = await bcrypt.hash(props.newPassword, 10);
    } else {
      props.password = pastor.password;
    }

    let recommendationLetterUrl;
    if (props.fileLetter) {
      if (pastor.recommendationLetterUrl) {
        await FileApi.delete([{ Key: pastor.recommendationLetterUrl }]);
      }
      recommendationLetterUrl = await this.upload(
        new Types.ObjectId(id),
        props.fileLetter
      );
    }
    let paymentConfirmationUrl;
    if (props.filePaymentConfirmation) {
      if (pastor.paymentConfirmationUrl) {
        await FileApi.delete([{ Key: pastor.paymentConfirmationUrl }]);
      }
      paymentConfirmationUrl = await this.upload(
        new Types.ObjectId(id),
        props.filePaymentConfirmation
      );
    }

    return super.update(
      id,
      {
        ...omit(props, '_id'),
        ...(recommendationLetterUrl && {
          recommendationLetterUrl,
        }),
        ...(paymentConfirmationUrl && {
          paymentConfirmationUrl,
        }),
      },
      options
    );
  }
}

export default new PastorService();
