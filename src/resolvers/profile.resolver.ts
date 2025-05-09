import { IProfile } from '../models/profile.model';
import { GraphQLFieldResolver } from 'graphql/type/definition';
import { Page } from '../repositories/repository';
import { FieldNode } from 'graphql/language/ast';
import ProfileService from '../services/profile.service';
import { PageArg, ResolverCtx } from '../types';
import { requireAuth } from '../helpers';
import { Types } from 'mongoose';

export const list: GraphQLFieldResolver<
  unknown,
  ResolverCtx,
  PageArg,
  Promise<Page<IProfile>>
> = requireAuth((_, args, ctx, info) => {
  const [fieldNode] = info.fieldNodes;
  const [, docsSelect] = fieldNode.selectionSet?.selections as FieldNode[];
  return ProfileService.paginate({
    page: args.page,
    size: args.size,
    select: (docsSelect.selectionSet?.selections as FieldNode[]).map(
      (s) => s.name.value as keyof IProfile
    ),
  });
});

type CreateProfileArgs = Omit<IProfile, '_id'>;

export const create: GraphQLFieldResolver<
  unknown,
  ResolverCtx,
  CreateProfileArgs,
  Promise<IProfile>
> = requireAuth(async (_, args) => {
  return ProfileService.insert(args);
});

export const updateById: GraphQLFieldResolver<
  unknown,
  ResolverCtx,
  IProfile,
  Promise<IProfile>
> = requireAuth(async (_, { _id, ...args }, _ctx, info) => {
  const [fieldNode] = info.fieldNodes;
  const selections = fieldNode.selectionSet?.selections as FieldNode[];
  let result = await ProfileService.update(new Types.ObjectId(_id), args);
  if (!result) {
    throw new Error('No pastor found');
  }
  result = await ProfileService.findById(_id!, {
    select: selections?.map((s) => s.name.value as keyof IProfile),
  });
  return result!;
});

export const getById: GraphQLFieldResolver<
  IProfile,
  ResolverCtx,
  { _id: string },
  Promise<IProfile | null>
> = requireAuth(async (_parent, args, _context, info) => {
  const [fieldNode] = info.fieldNodes;
  const selections = fieldNode.selectionSet?.selections as FieldNode[];
  return ProfileService.findById(args._id, {
    select: selections?.map((s) => s.name.value as keyof IProfile),
  });
});

export const deleteById: GraphQLFieldResolver<
  IProfile,
  ResolverCtx,
  { _id: string },
  Promise<boolean>
> = requireAuth(async (_parent, args, _context) => {
  await ProfileService.remove(args._id);
  return true;
});
