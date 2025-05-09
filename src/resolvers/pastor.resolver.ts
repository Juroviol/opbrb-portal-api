import { GraphQLFieldResolver } from 'graphql/type/definition';
import { AnalysisType, IPastor, Status } from '../models/pastor.model';
import PastorService from '../services/pastor.service';
import { FieldNode } from 'graphql/language/ast';
import { Page } from '../repositories/repository';
import { PageArg, ResolverCtx } from '../types';
import { requireAuth } from '../helpers';
import UserService from '../services/user.service';
import { findLast } from 'lodash';
import { Types } from 'mongoose';

function streamToBuffer(stream: NodeJS.ReadableStream) {
  const chunks: Buffer[] = [];
  return new Promise<Buffer<ArrayBuffer>>((resolve) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

type FileType = Promise<{
  filename: string;
  mimetype: string;
  createReadStream: () => NodeJS.ReadableStream;
}>;

export const getById: GraphQLFieldResolver<
  IPastor,
  { user: { id: string } },
  { _id: string },
  Promise<IPastor | null>
> = async (_parent, args, _context, info) => {
  const [fieldNode] = info.fieldNodes;
  const selections = fieldNode.selectionSet?.selections as FieldNode[];
  return PastorService.findById(args._id, {
    select: selections?.map((s) => s.name.value as keyof IPastor),
  });
};

type CreatePastorArgs = Omit<
  IPastor,
  '_id' | 'recommendationLetterUrl' | 'paymentConfirmationUrl'
> & {
  fileLetter?: FileType;
  filePaymentConfirmation?: FileType;
  fileOrdinationMinutes?: FileType;
  filePicture?: FileType;
  fileCpfRg?: FileType;
};

export const create: GraphQLFieldResolver<
  unknown,
  ResolverCtx,
  CreatePastorArgs,
  Promise<IPastor>
> = async (
  _parent,
  {
    fileLetter: promiseFileLetter,
    filePaymentConfirmation: promiseFilePaymentConfirmation,
    fileOrdinationMinutes: promiseFileOrdinationMinutes,
    filePicture: promiseFilePicture,
    fileCpfRg: promiseFileCpfRg,
    ...args
  }
) => {
  let fileLetter;
  let fileLetterBuffer: Buffer<ArrayBuffer> | null = null;
  if (promiseFileLetter) {
    fileLetter = await promiseFileLetter;
    fileLetterBuffer = await streamToBuffer(fileLetter.createReadStream());
  }
  let filePaymentConfirmation: typeof fileLetter | null = null;
  let filePaymentConfirmationBuffer: Buffer<ArrayBuffer> | null = null;
  if (promiseFilePaymentConfirmation) {
    filePaymentConfirmation = await promiseFilePaymentConfirmation;
    filePaymentConfirmationBuffer = await streamToBuffer(
      filePaymentConfirmation.createReadStream()
    );
  }
  let fileOrdinationMinutes: typeof fileLetter | null = null;
  let fileOrdinationMinutesBuffer: Buffer<ArrayBuffer> | null = null;
  if (promiseFileOrdinationMinutes) {
    fileOrdinationMinutes = await promiseFileOrdinationMinutes;
    fileOrdinationMinutesBuffer = await streamToBuffer(
      fileOrdinationMinutes.createReadStream()
    );
  }
  let filePicture: typeof fileLetter | null = null;
  let filePictureBuffer: Buffer<ArrayBuffer> | null = null;
  if (promiseFilePicture) {
    filePicture = await promiseFilePicture;
    filePictureBuffer = await streamToBuffer(filePicture.createReadStream());
  }
  let fileCpfRg: typeof fileLetter | null = null;
  let fileCpfRgBuffer: Buffer<ArrayBuffer> | null = null;
  if (promiseFileCpfRg) {
    fileCpfRg = await promiseFileCpfRg;
    fileCpfRgBuffer = await streamToBuffer(fileCpfRg.createReadStream());
  }
  return PastorService.insert({
    ...args,
    ...(fileLetter &&
      fileLetterBuffer && {
        fileLetter: {
          ...fileLetter,
          buffer: fileLetterBuffer,
        },
      }),
    ...(filePaymentConfirmation &&
      filePaymentConfirmationBuffer && {
        filePaymentConfirmation: {
          ...filePaymentConfirmation,
          buffer: filePaymentConfirmationBuffer,
        },
      }),
    ...(fileOrdinationMinutes &&
      fileOrdinationMinutesBuffer && {
        fileOrdinationMinutes: {
          ...fileOrdinationMinutes,
          buffer: fileOrdinationMinutesBuffer,
        },
      }),
    ...(filePicture &&
      filePictureBuffer && {
        filePicture: {
          ...filePicture,
          buffer: filePictureBuffer,
        },
      }),
    ...(fileCpfRg &&
      fileCpfRgBuffer && {
        fileCpfRg: {
          ...fileCpfRg,
          buffer: fileCpfRgBuffer,
        },
      }),
  });
};

type UpdatePastorArgs = Partial<IPastor> &
  Required<Pick<IPastor, '_id'>> & {
    newPassword?: string;
    fileLetter?: FileType;
    filePaymentConfirmation?: FileType;
    fileOrdinationMinutes?: FileType;
    filePicture?: FileType;
    fileCpfRg?: FileType;
  };

export const update: GraphQLFieldResolver<
  unknown,
  ResolverCtx,
  UpdatePastorArgs,
  Promise<IPastor>
> = async (
  _,
  {
    fileLetter: promiseFileLetter,
    filePaymentConfirmation: promiseFilePaymentConfirmation,
    fileOrdinationMinutes: promiseFileOrdinationMinutes,
    filePicture: promiseFilePicture,
    fileCpfRg: promiseFileCpfRg,
    ...args
  },
  ctx,
  info
) => {
  if (!ctx.user) {
    throw new Error('No user logged in.');
  }

  const { _id } = args;

  const [fieldNode] = info.fieldNodes;
  const select = (fieldNode.selectionSet?.selections as FieldNode[]).map(
    (s) => s.name.value as keyof IPastor
  );

  let fileLetter;
  let fileLetterBuffer: Buffer<ArrayBuffer> | null = null;
  if (promiseFileLetter) {
    fileLetter = await promiseFileLetter;
    fileLetterBuffer = await streamToBuffer(fileLetter.createReadStream());
  }
  let filePaymentConfirmation: typeof fileLetter | null = null;
  let filePaymentConfirmationBuffer: Buffer<ArrayBuffer> | null = null;
  if (promiseFilePaymentConfirmation) {
    filePaymentConfirmation = await promiseFilePaymentConfirmation;
    filePaymentConfirmationBuffer = await streamToBuffer(
      filePaymentConfirmation.createReadStream()
    );
  }
  let fileOrdinationMinutes: typeof fileLetter | null = null;
  let fileOrdinationMinutesBuffer: Buffer<ArrayBuffer> | null = null;
  if (promiseFileOrdinationMinutes) {
    fileOrdinationMinutes = await promiseFileOrdinationMinutes;
    fileOrdinationMinutesBuffer = await streamToBuffer(
      fileOrdinationMinutes.createReadStream()
    );
  }
  let filePicture: typeof fileLetter | null = null;
  let filePictureBuffer: Buffer<ArrayBuffer> | null = null;
  if (promiseFilePicture) {
    filePicture = await promiseFilePicture;
    filePictureBuffer = await streamToBuffer(filePicture.createReadStream());
  }
  let fileCpfRg: typeof fileLetter | null = null;
  let fileCpfRgBuffer: Buffer<ArrayBuffer> | null = null;
  if (promiseFileCpfRg) {
    fileCpfRg = await promiseFileCpfRg;
    fileCpfRgBuffer = await streamToBuffer(fileCpfRg.createReadStream());
  }
  const result = await PastorService.update(
    _id,
    {
      ...args,
      ...(fileLetter &&
        fileLetterBuffer && {
          fileLetter: {
            ...fileLetter,
            buffer: fileLetterBuffer,
          },
        }),
      ...(filePaymentConfirmation &&
        filePaymentConfirmationBuffer && {
          filePaymentConfirmation: {
            ...filePaymentConfirmation,
            buffer: filePaymentConfirmationBuffer,
          },
        }),
      ...(fileOrdinationMinutes &&
        fileOrdinationMinutesBuffer && {
          fileOrdinationMinutes: {
            ...fileOrdinationMinutes,
            buffer: fileOrdinationMinutesBuffer,
          },
        }),
      ...(filePicture &&
        filePictureBuffer && {
          filePicture: {
            ...filePicture,
            buffer: filePictureBuffer,
          },
        }),
      ...(fileCpfRg &&
        fileCpfRgBuffer && {
          fileCpfRg: {
            ...fileCpfRg,
            buffer: fileCpfRgBuffer,
          },
        }),
    },
    {
      select,
    }
  );
  if (!result) {
    throw new Error('No pastor found');
  }
  return result;
};

export const list: GraphQLFieldResolver<
  unknown,
  ResolverCtx,
  PageArg,
  Promise<Page<IPastor>>
> = requireAuth((_, args, ctx, info) => {
  const [fieldNode] = info.fieldNodes;
  const [, docsSelect] = fieldNode.selectionSet?.selections as FieldNode[];
  return PastorService.paginate({
    page: args.page,
    size: args.size,
    filters: {
      _id: {
        $ne: new Types.ObjectId(ctx.user.id),
      },
    },
    select: (docsSelect.selectionSet?.selections as FieldNode[]).map(
      (s) => s.name.value as keyof IPastor
    ),
  });
});

export const approveAnalysis: GraphQLFieldResolver<
  unknown,
  ResolverCtx,
  Required<Pick<IPastor, '_id'>> & { type: AnalysisType },
  Promise<Boolean>
> = requireAuth(async (_, args, ctx) => {
  const pastor = await PastorService.findById(args._id);
  if (!pastor) {
    throw new Error('No pastor found');
  }
  const author = (await UserService.findById(ctx.user.id))!;
  const newAnalysis = [
    ...(pastor.analysis || []),
    {
      approved: true,
      author: author.name,
      type: args.type,
      date: new Date(),
    },
  ];
  const lastDocumentationAnalysis = findLast(
    newAnalysis,
    (a) => a.type === AnalysisType.Documentation
  );
  const lastFinancialAnalysis = findLast(
    newAnalysis,
    (a) => a.type === AnalysisType.Financial
  );
  await PastorService.update(args._id, {
    analysis: newAnalysis,
    status:
      lastDocumentationAnalysis?.approved && lastFinancialAnalysis?.approved
        ? Status.APPROVED
        : Status.ANALYSING,
  });
  return true;
});

export const createPastorPendingItemAnalysis: GraphQLFieldResolver<
  unknown,
  ResolverCtx,
  Required<Pick<IPastor, '_id'>> & { type: AnalysisType; reason: string },
  Promise<Boolean>
> = requireAuth(async (_, args, ctx) => {
  const pastor = await PastorService.findById(args._id);
  if (!pastor) {
    throw new Error('No pastor found');
  }
  const author = (await UserService.findById(ctx.user.id))!;
  await PastorService.update(args._id, {
    status: Status.ANALYSING,
    analysis: [
      ...(pastor.analysis || []),
      {
        approved: false,
        author: author.name,
        type: args.type,
        date: new Date(),
        reason: args.reason,
      },
    ],
  });
  return true;
});

export const deleteById: GraphQLFieldResolver<
  IPastor,
  ResolverCtx,
  { _id: string },
  Promise<boolean>
> = requireAuth(async (_parent, args, _context) => {
  await PastorService.remove(args._id);
  return true;
});
