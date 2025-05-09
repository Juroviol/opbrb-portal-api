import {
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';
import {
  authenticate,
  createUser,
  getLoggedUser,
} from '../resolvers/user.resolver';

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    _id: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    scopes: { type: new GraphQLList(GraphQLString) },
    pictureUrl: { type: GraphQLString },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: 'Query',
  fields: {
    getLoggedUser: {
      type: UserType,
      resolve: getLoggedUser,
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
    authenticate: {
      type: new GraphQLObjectType({
        name: 'Token',
        fields: () => ({
          token: { type: GraphQLString },
        }),
      }),
      args: {
        username: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: authenticate,
    },
  },
});

export default new GraphQLSchema({ mutation: RootMutation, query: RootQuery });
