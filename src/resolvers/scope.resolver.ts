import { Scope } from '../models/user.model';
import { GraphQLFieldResolver } from 'graphql/type/definition';

export const list: GraphQLFieldResolver<
  unknown,
  { user: { id: string } },
  object,
  Scope[]
> = (_parent, _args, ctx) => {
  if (!ctx.user) {
    throw new Error('No user logged in.');
  }
  return Object.values(Scope);
};
