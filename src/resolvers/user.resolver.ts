import { GraphQLFieldResolver } from 'graphql/type/definition';
import { IUser } from '../models/user.model';
import UserService from '../services/user.service';
import { FieldNode } from 'graphql/language/ast';

export const getLoggedUser: GraphQLFieldResolver<
  IUser,
  { user: { id: string } },
  { id: string },
  Promise<IUser | null>
> = (_parent, _args, ctx, info) => {
  if (!ctx.user) {
    throw new Error('No user logged in.');
  }
  const [fieldNode] = info.fieldNodes;
  const selections = fieldNode.selectionSet?.selections as FieldNode[];
  return UserService.findById(ctx.user.id, {
    select: selections?.map((s) => s.name.value as keyof IUser),
  });
};

export const createUser: GraphQLFieldResolver<
  IUser,
  unknown,
  IUser,
  Promise<IUser>
> = (_parent, args: IUser) => {
  return UserService.insert(args);
};

export const authenticate: GraphQLFieldResolver<
  unknown,
  { user: IUser | null },
  { username: string; password: string },
  Promise<{ token: string }>
> = async (_parent, { username, password }, ctx) => {
  const user = await UserService.validateUsernameAndPassword(
    username,
    password
  );
  ctx.user = user;
  const token = await UserService.generateToken(user);
  return { token };
};
