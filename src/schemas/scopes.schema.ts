import {
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';
import { list } from '../resolvers/scope.resolver';

const RootQuery = new GraphQLObjectType({
  name: 'Query',
  fields: {
    scopes: {
      type: new GraphQLList(GraphQLString),
      resolve: list,
    },
  },
});

export default new GraphQLSchema({ query: RootQuery });
