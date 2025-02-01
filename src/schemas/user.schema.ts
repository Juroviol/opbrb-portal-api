import {
  GraphQLID,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLNonNull,
} from 'graphql';
import { createUser, getUserById, getUsers } from '../resolvers/user.resolver';

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    _id: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    password: { type: GraphQLString },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: 'Query',
  fields: {
    getUserById: {
      type: UserType,
      args: {
        _id: { type: GraphQLID },
      },
      resolve: getUserById,
    },
    getUsers: {
      type: new GraphQLList(UserType),
      resolve: getUsers,
    },
  },
});

const RootMutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createUser: {
      type: UserType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: createUser,
    },
  },
});

export default new GraphQLSchema({ mutation: RootMutation, query: RootQuery });
