import {
  GraphQLEnumType,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';
import { GraphQLDate, GraphQLDateTime } from 'graphql-scalars';
import { MaritalStatus } from '../models/pastor.model';
import { mapValues } from 'lodash';
import { GraphQLUpload } from 'graphql-upload-ts';
import {
  create,
  getById,
  list,
  updatePastor,
} from '../resolvers/pastor.resolver';

const MaritalStatusType = new GraphQLEnumType({
  name: 'MaritalStatus',
  values: mapValues(MaritalStatus, (value) => {
    return {
      value,
    };
  }),
});

const PastorType = new GraphQLObjectType({
  name: 'Pastor',
  fields: () => ({
    _id: { type: GraphQLID },
    name: { type: GraphQLString },
    cpf: { type: GraphQLString },
    email: { type: GraphQLString },
    password: { type: GraphQLString },
    maritalStatus: {
      type: MaritalStatusType,
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
    ordinationMinutesUrl: { type: GraphQLString },
    pictureUrl: { type: GraphQLString },
    cpfRgUrl: { type: GraphQLString },
    createdAt: { type: GraphQLDateTime },
    status: { type: GraphQLString },
  }),
});

const PastorPageType = new GraphQLObjectType({
  name: 'PastorPage',
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
      resolve: getById,
    },
    getPastors: {
      type: PastorPageType,
      args: {
        page: { type: GraphQLInt },
        size: { type: GraphQLInt },
      },
      resolve: list,
    },
  },
});

const RootMutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createPastor: {
      type: PastorType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        cpf: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
        maritalStatus: {
          type: new GraphQLNonNull(MaritalStatusType),
        },
        birthday: { type: new GraphQLNonNull(GraphQLDate) },
        street: { type: new GraphQLNonNull(GraphQLString) },
        number: { type: new GraphQLNonNull(GraphQLString) },
        city: { type: new GraphQLNonNull(GraphQLString) },
        state: { type: new GraphQLNonNull(GraphQLString) },
        district: { type: new GraphQLNonNull(GraphQLString) },
        zipCode: { type: new GraphQLNonNull(GraphQLString) },
        cellPhone: { type: new GraphQLNonNull(GraphQLString) },
        church: { type: new GraphQLNonNull(GraphQLString) },
        ordinanceTime: { type: new GraphQLNonNull(GraphQLInt) },
        recommendationLetterUrl: { type: GraphQLString },
        paymentConfirmationUrl: { type: GraphQLString },
        fileLetter: { type: GraphQLUpload },
        filePaymentConfirmation: { type: GraphQLUpload },
        fileOrdinationMinutes: { type: GraphQLUpload },
        filePicture: { type: GraphQLUpload },
        fileCpfRg: { type: GraphQLUpload },
      },
      resolve: create,
    },
    updatePastor: {
      type: PastorType,
      args: {
        _id: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString },
        cpf: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        newPassword: { type: GraphQLString },
        maritalStatus: {
          type: MaritalStatusType,
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
        createdAt: { type: GraphQLDateTime },
        status: { type: GraphQLString },
        fileLetter: { type: GraphQLUpload },
        filePaymentConfirmation: { type: GraphQLUpload },
        fileOrdinationMinutes: { type: GraphQLUpload },
        filePicture: { type: GraphQLUpload },
        fileCpfRg: { type: GraphQLUpload },
      },
      resolve: updatePastor,
    },
  },
});

export default new GraphQLSchema({ mutation: RootMutation, query: RootQuery });
