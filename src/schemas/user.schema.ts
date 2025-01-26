import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLID,
  GraphQLList,
} from 'graphql';
import UserService from '@services/user.service';
import { IUser } from '@models/user.model';
import { FieldNode } from 'graphql/language/ast';

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    _id: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: 'Query',
  fields: {
    getUsers: {
      type: new GraphQLList(UserType),
      resolve: async (_parent, _args, _context, info) => {
        const [fieldNode] = info.fieldNodes;
        const selections = fieldNode.selectionSet?.selections as FieldNode[];
        return UserService.list({
          select: selections?.map((s) => s.name.value as keyof IUser),
        });
      },
    },
  },
});

const RootMutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createUser: {
      type: UserType,
      args: {
        name: { type: GraphQLString },
        email: { type: GraphQLString },
      },
      resolve: (_parent, args: IUser) => {
        return UserService.insert(args);
      },
    },
  },
});

export default new GraphQLSchema({ mutation: RootMutation, query: RootQuery });
