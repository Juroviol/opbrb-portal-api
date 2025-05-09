import {
  GraphQLEnumType,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLBoolean,
} from 'graphql';
import {
  create,
  list,
  getById,
  updateById,
  deleteById,
} from '../resolvers/profile.resolver';
import { Scope } from '../models/user.model';
import { GraphQLNonNull } from 'graphql';

const ScopeEnumType = new GraphQLEnumType({
  name: 'Scope',
  values: Object.keys(Scope).reduce((obj, key) => {
    obj[key] = { value: key };
    return obj;
  }, {} as { [k: string]: { value: string } }),
});

const ProfileType = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    _id: { type: GraphQLID },
    name: { type: GraphQLString },
    scopes: { type: new GraphQLList(ScopeEnumType) },
  }),
});

const PastorPageType = new GraphQLObjectType({
  name: 'ProfilePage',
  fields: {
    total: { type: GraphQLInt },
    docs: { type: new GraphQLList(ProfileType) },
  },
});

const RootQuery = new GraphQLObjectType({
  name: 'Query',
  fields: {
    profiles: {
      type: PastorPageType,
      args: {
        page: { type: new GraphQLNonNull(GraphQLInt) },
        size: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve: list,
    },
    profile: {
      type: ProfileType,
      args: {
        _id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: getById,
    },
  },
});

const RootMutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createProfile: {
      type: ProfileType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        scopes: {
          type: new GraphQLNonNull(
            new GraphQLList(new GraphQLNonNull(ScopeEnumType))
          ),
        },
      },
      resolve: create,
    },
    updateProfile: {
      type: ProfileType,
      args: {
        _id: { type: new GraphQLNonNull(GraphQLID) },
        scopes: { type: new GraphQLList(ScopeEnumType) },
      },
      resolve: updateById,
    },
    deleteProfile: {
      type: GraphQLBoolean,
      args: {
        _id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: deleteById,
    },
  },
});

export default new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});
