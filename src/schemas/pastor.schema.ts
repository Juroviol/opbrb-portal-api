import {
  GraphQLID,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLEnumType,
} from 'graphql';
import { GraphQLDate } from 'graphql-scalars';
import { FieldNode } from 'graphql/language/ast';
import PastorService from '../services/pastor.service';
import { IPastor, MaritalStatus } from '../models/pastor.model';
import { mapValues } from 'lodash';
import { GraphQLUpload } from 'graphql-upload-ts';

const PastorFields = {
  _id: { type: GraphQLID },
  name: { type: GraphQLString },
  cpf: { type: GraphQLString },
  email: { type: GraphQLString },
  password: { type: GraphQLString },
  maritalStatus: {
    type: new GraphQLEnumType({
      name: 'MaritalStatus',
      values: mapValues(MaritalStatus, (value) => {
        return {
          value,
        };
      }),
    }),
  },
  birthday: { type: GraphQLDate },
  street: { type: GraphQLString },
  number: { type: GraphQLString },
  city: { type: GraphQLString },
  state: { type: GraphQLString },
  district: { type: GraphQLString },
  zipCode: { type: GraphQLString },
  cellPhone: { type: GraphQLString },
};

const PastorType = new GraphQLObjectType({
  name: 'Pastor',
  fields: () => PastorFields,
});

const RootQuery = new GraphQLObjectType({
  name: 'Query',
  fields: {
    getPastors: {
      type: new GraphQLList(PastorType),
      resolve: async (_parent, _args, _context, info) => {
        const [fieldNode] = info.fieldNodes;
        const selections = fieldNode.selectionSet?.selections as FieldNode[];
        return PastorService.list({
          select: selections?.map((s) => s.name.value as keyof IPastor),
        });
      },
    },
  },
});

const RootMutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createPastor: {
      type: PastorType,
      args: {
        ...PastorFields,
        file: { type: GraphQLUpload },
      },
      resolve: async (
        _parent,
        args: Omit<IPastor, '_id' | 'recommendationLetterUrl'> & {
          file: Promise<{
            filename: string;
            mimetype: string;
            createReadStream: () => NodeJS.ReadableStream;
          }>;
        }
      ) => {
        const { filename, mimetype, createReadStream } = await args.file;
        const stream = createReadStream();
        const chunks: Buffer[] = [];
        const buffer = await new Promise<Buffer<ArrayBuffer>>((resolve) => {
          stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
          stream.on('end', () => resolve(Buffer.concat(chunks)));
        });
        return PastorService.insert({
          ...args,
          file: {
            filename,
            mimetype,
            buffer,
          },
        });
      },
    },
  },
});

export default new GraphQLSchema({ mutation: RootMutation, query: RootQuery });
