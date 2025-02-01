import { GraphQLFieldResolver } from 'graphql/type/definition';
import { IUser } from '../models/user.model';
import UserService from '../services/user.service';
import { FieldNode } from 'graphql/language/ast';

export const getUserById: GraphQLFieldResolver<
  IUser,
  unknown,
  { _id: string },
  Promise<IUser | null>
> = (_parent, { _id }) => {
  return UserService.findById(_id);
};

export const getUsers: GraphQLFieldResolver<
  IUser,
  unknown,
  unknown,
  Promise<IUser[]>
> = (_parent, _args, _context, info) => {
  const [fieldNode] = info.fieldNodes;
  const selections = fieldNode.selectionSet?.selections as FieldNode[];
  return UserService.list({
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
