import {
  GraphQLBoolean,
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
import { AnalysisType, MaritalStatus } from '../models/pastor.model';
import { mapValues } from 'lodash';
import { GraphQLUpload } from 'graphql-upload-ts';
import {
  approveAnalysis,
  create,
  createPastorPendingItemAnalysis,
  deleteById,
  getById,
  list,
  update,
} from '../resolvers/pastor.resolver';
import { Scope } from '../models/user.model';

const MaritalStatusType = new GraphQLEnumType({
  name: 'MaritalStatus',
  values: mapValues(MaritalStatus, (value) => {
    return {
      value,
    };
  }),
});

const ScopeEnumType = new GraphQLEnumType({
  name: 'Scope',
  values: mapValues(Scope, (value) => {
    return {
      value,
    };
  }),
});

const AnalysisEnumType = new GraphQLEnumType({
  name: 'AnalysisType',
  values: mapValues(AnalysisType, (value) => {
    return {
      value,
    };
  }),
});

const AnalysisObjectType = new GraphQLObjectType({
  name: 'Analysis',
  fields: () => ({
    author: { type: GraphQLString },
    type: {
      type: AnalysisEnumType,
    },
    date: { type: GraphQLDate },
    reason: { type: GraphQLString },
    approved: { type: GraphQLBoolean },
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
    scopes: { type: new GraphQLList(ScopeEnumType) },
    analysis: { type: new GraphQLList(AnalysisObjectType) },
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
    pastor: {
      type: PastorType,
      args: {
        _id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: getById,
    },
    pastors: {
      type: PastorPageType,
      args: {
        page: { type: new GraphQLNonNull(GraphQLInt) },
        size: { type: new GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLString },
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
        scopes: { type: new GraphQLList(new GraphQLNonNull(ScopeEnumType)) },
      },
      resolve: update,
    },
    deletePastor: {
      type: GraphQLBoolean,
      args: {
        _id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: deleteById,
    },
    approvePastorAnalysis: {
      type: GraphQLBoolean,
      args: {
        _id: { type: new GraphQLNonNull(GraphQLID) },
        type: { type: new GraphQLNonNull(AnalysisEnumType) },
      },
      resolve: approveAnalysis,
    },
    createPastorPendingItemAnalysis: {
      type: GraphQLBoolean,
      args: {
        _id: { type: new GraphQLNonNull(GraphQLID) },
        type: { type: new GraphQLNonNull(AnalysisEnumType) },
        reason: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: createPastorPendingItemAnalysis,
    },
  },
});

export default new GraphQLSchema({ mutation: RootMutation, query: RootQuery });
