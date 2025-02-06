import {
  GraphQLEnumType,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';
import { GraphQLDate, GraphQLDateTime } from 'graphql-scalars';
import { MaritalStatus } from '../models/pastor.model';
import { mapValues } from 'lodash';
import { GraphQLUpload } from 'graphql-upload-ts';
import {
  createPastor,
  getPastor,
  getPastors,
} from '../resolvers/pastor.resolver';

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
  church: { type: GraphQLString },
  ordinanceTime: { type: GraphQLInt },
  recommendationLetterUrl: { type: GraphQLString },
  paymentConfirmationUrl: { type: GraphQLString },
};

const PastorType = new GraphQLObjectType({
  name: 'Pastor',
  fields: () => ({
    ...PastorFields,
    maritalStatus: { type: GraphQLString },
    createdAt: { type: GraphQLDateTime },
    status: { type: GraphQLString },
  }),
});

const PastorPageType = new GraphQLObjectType({
  name: 'Page',
  fields: {
    total: { type: GraphQLInt },
    docs: { type: new GraphQLList(PastorType) },
  },
});

const RootQuery = new GraphQLObjectType({
  name: 'Query',
  fields: {
    getPastor: {
      type: PastorType,
      args: {
        id: { type: GraphQLID },
      },
      resolve: getPastor,
    },
    getPastors: {
      type: PastorPageType,
      args: {
        page: { type: GraphQLInt },
        size: { type: GraphQLInt },
      },
      resolve: getPastors,
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
        fileLetter: { type: GraphQLUpload },
        filePaymentConfirmation: { type: GraphQLUpload },
      },
      resolve: createPastor,
    },
  },
});

export default new GraphQLSchema({ mutation: RootMutation, query: RootQuery });
