import { GraphQLFieldResolver } from 'graphql/type/definition';
import { ResolverCtx } from '../types';

export function requireAuth<TSource, TArgs, TReturn>(
  resolver: GraphQLFieldResolver<TSource, ResolverCtx, TArgs, Promise<TReturn>>
): GraphQLFieldResolver<TSource, ResolverCtx, TArgs, Promise<TReturn>> {
  return async (parent, args, ctx, info) => {
    if (!ctx.user) {
      throw new Error('No user logged in.');
    }
    return resolver(parent, args, ctx, info);
  };
}
