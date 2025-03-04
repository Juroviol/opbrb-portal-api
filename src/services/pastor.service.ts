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

type FileType = {
  filename: string;
  mimetype: string;
  buffer: Buffer;
};

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
    fileOrdinationMinutes,
    filePicture,
    fileCpfRg,
    ...props
  }: Omit<
    IPastor,
    | '_id'
    | 'recommendationLetterUrl'
    | 'paymentConfirmationUrl'
    | 'ordinationMinutesUrl'
    | 'pictureUrl'
    | 'cpfRgUrl'
  > & {
    fileLetter?: FileType;
    filePaymentConfirmation?: FileType;
    fileOrdinationMinutes?: FileType;
    filePicture?: FileType;
    fileCpfRg?: FileType;
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
    let ordinationMinutesUrl;
    if (fileOrdinationMinutes) {
      ordinationMinutesUrl = await this.upload(_id, fileOrdinationMinutes);
    }
    let pictureUrl;
    if (filePicture) {
      pictureUrl = await this.upload(_id, filePicture);
    }
    let cpfRgUrl;
    if (fileCpfRg) {
      cpfRgUrl = await this.upload(_id, fileCpfRg);
    }
    const hashedPassword = await bcrypt.hash(props.password, 10);
    return super.insert({
      _id,
      ...props,
      name: formatToCapitalized(props.name),
      password: hashedPassword,
      role: Role.PASTOR,
      scopes: [
        Scope.CanListPastors,
        Scope.CanDetailPastor,
        Scope.CanEditProfilePersonalInfo,
        Scope.CanEditProfileAddress,
        Scope.CanEditProfileContactInfo,
        Scope.CanEditProfileMinistry,
        Scope.CanEditProfileOrderCard,
        Scope.CanEditProfileCredentials,
      ],
      recommendationLetterUrl,
      paymentConfirmationUrl,
      ordinationMinutesUrl,
      pictureUrl,
      cpfRgUrl,
    });
  }

  async update(
    id: string | Types.ObjectId,
    props: Partial<
      IPastor & { newPassword: string } & {
        fileLetter?: FileType;
        filePaymentConfirmation?: FileType;
        fileOrdinationMinutes?: FileType;
        filePicture?: FileType;
        fileCpfRg?: FileType;
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

    let ordinationMinutesUrl;
    if (props.fileOrdinationMinutes) {
      if (pastor.ordinationMinutesUrl) {
        await FileApi.delete([{ Key: pastor.ordinationMinutesUrl }]);
      }
      ordinationMinutesUrl = await this.upload(
        new Types.ObjectId(id),
        props.fileOrdinationMinutes
      );
    }

    let pictureUrl;
    if (props.filePicture) {
      if (pastor.pictureUrl) {
        await FileApi.delete([{ Key: pastor.pictureUrl }]);
      }
      pictureUrl = await this.upload(new Types.ObjectId(id), props.filePicture);
    }

    let cpfRgUrl;
    if (props.fileCpfRg) {
      if (pastor.cpfRgUrl) {
        await FileApi.delete([{ Key: pastor.cpfRgUrl }]);
      }
      cpfRgUrl = await this.upload(new Types.ObjectId(id), props.fileCpfRg);
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
        ...(ordinationMinutesUrl && {
          ordinationMinutesUrl,
        }),
        ...(pictureUrl && {
          pictureUrl,
        }),
        ...(cpfRgUrl && {
          cpfRgUrl,
        }),
      },
      options
    );
  }
}

export default new PastorService();
