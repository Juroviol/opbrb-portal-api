import { GraphQLFieldResolver } from 'graphql/type/definition';
import { IPastor } from '../models/pastor.model';
import PastorService from '../services/pastor.service';
import { FieldNode } from 'graphql/language/ast';
import { Page } from '../repositories/repository';

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
  { id: string },
  Promise<IPastor | null>
> = async (_parent, args, _context, info) => {
  const [fieldNode] = info.fieldNodes;
  const selections = fieldNode.selectionSet?.selections as FieldNode[];
  return PastorService.findById(args.id, {
    select: selections?.map((s) => s.name.value as keyof IPastor),
  });
};

type CreatePastorArgs = Omit<
  IPastor,
  '_id' | 'recommendationLetterUrl' | 'paymentConfirmationUrl'
> & {
  fileLetter?: FileType;
  filePaymentConfirmation?: FileType;
};

export const create: GraphQLFieldResolver<
  unknown,
  { user: { id: string } },
  CreatePastorArgs,
  Promise<IPastor>
> = async (
  _parent,
  {
    fileLetter: promiseFileLetter,
    filePaymentConfirmation: promiseFilePaymentConfirmation,
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
  return PastorService.insert({
    ...args,
    ...(fileLetter && {
      ...fileLetter,
      buffer: fileLetterBuffer,
    }),
    ...(filePaymentConfirmation &&
      filePaymentConfirmationBuffer && {
        filePaymentConfirmation: {
          ...filePaymentConfirmation,
          buffer: filePaymentConfirmationBuffer,
        },
      }),
  });
};

type UpdatePersonalInfoArgs = Partial<
  Pick<IPastor, 'name' | 'cpf' | 'maritalStatus' | 'birthday'>
> &
  Required<Pick<IPastor, '_id'>>;

export const updatePersonalInfo: GraphQLFieldResolver<
  unknown,
  { user: { id: string } },
  UpdatePersonalInfoArgs,
  Promise<IPastor>
> = async (_, args, ctx, info) => {
  if (!ctx.user) {
    throw new Error('No user logged in.');
  }
  const { _id } = args;
  const [fieldNode] = info.fieldNodes;
  const result = await PastorService.update(_id, args, {
    select: (fieldNode.selectionSet?.selections as FieldNode[]).map(
      (s) => s.name.value as keyof IPastor
    ),
  });
  return result!;
};

export const list: GraphQLFieldResolver<
  unknown,
  { user: { id: string } },
  { page: number; size: number },
  Promise<Page<IPastor>>
> = (_, args, ctx, info) => {
  if (!ctx.user) {
    throw new Error('No user logged in.');
  }
  const [fieldNode] = info.fieldNodes;
  const [, docsSelect] = fieldNode.selectionSet?.selections as FieldNode[];
  return PastorService.paginate({
    page: args.page,
    size: args.size,
    select: (docsSelect.selectionSet?.selections as FieldNode[]).map(
      (s) => s.name.value as keyof IPastor
    ),
  });
};
