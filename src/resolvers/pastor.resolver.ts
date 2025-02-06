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

export const getPastor: GraphQLFieldResolver<
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

export const createPastor: GraphQLFieldResolver<
  IPastor,
  { user: { id: string } },
  Omit<IPastor, '_id' | 'recommendationLetterUrl'> & {
    fileLetter: Promise<{
      filename: string;
      mimetype: string;
      createReadStream: () => NodeJS.ReadableStream;
    }>;
    filePaymentConfirmation: Promise<{
      filename: string;
      mimetype: string;
      createReadStream: () => NodeJS.ReadableStream;
    }>;
  },
  Promise<IPastor>
> = async (
  _parent,
  {
    fileLetter: promiseFileLetter,
    filePaymentConfirmation: promiseFilePaymentConfirmation,
    ...args
  }
) => {
  const fileLetter = await promiseFileLetter;
  const filePaymentConfirmation = await promiseFilePaymentConfirmation;
  const fileLetterBuffer = await streamToBuffer(fileLetter.createReadStream());
  const filePaymentConfirmationBuffer = await streamToBuffer(
    filePaymentConfirmation.createReadStream()
  );
  return PastorService.insert({
    ...args,
    fileLetter: {
      ...fileLetter,
      buffer: fileLetterBuffer,
    },
    filePaymentConfirmation: {
      ...filePaymentConfirmation,
      buffer: filePaymentConfirmationBuffer,
    },
  });
};

export const getPastors: GraphQLFieldResolver<
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
