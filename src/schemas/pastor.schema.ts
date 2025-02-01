import {
  GraphQLID,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';
import { FieldNode } from 'graphql/language/ast';
import PastorService from '@services/pastor.service';
import { IPastor } from '@models/pastor.model';

const PastorType = new GraphQLObjectType({
  name: 'Pastor',
  fields: () => ({
    _id: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    password: { type: GraphQLString },
    address: { type: GraphQLString },
    number: { type: GraphQLString },
    city: { type: GraphQLString },
    state: { type: GraphQLString },
    country: { type: GraphQLString },
    zipCode: { type: GraphQLString },
    cellPhone: { type: GraphQLString },
  }),
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
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        address: { type: GraphQLString },
        number: { type: GraphQLString },
        city: { type: GraphQLString },
        state: { type: GraphQLString },
        country: { type: GraphQLString },
        zipCode: { type: GraphQLString },
        cellPhone: { type: GraphQLString },
      },
      resolve: (_parent, args: IPastor) => {
        return PastorService.insert(args);
      },
    },
  },
});

export default new GraphQLSchema({ mutation: RootMutation, query: RootQuery });
