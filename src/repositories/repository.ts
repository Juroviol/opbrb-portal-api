import { AggregateOptions, Cursor, PipelineStage, PopulateOptions, Types } from "mongoose";

type FilterValue<T, K extends keyof T> =
  | (string extends T[K]
      ? T[K] | { $regex: string; $options?: "i" | "m" | "x" | "s" }
      : Types.ObjectId extends T[K]
      ? Types.ObjectId | string
      : T[K])
  | { $eq: T[K] | null }
  | { $ne: T[K] | null }
  | { $in: Required<T>[K] extends (infer U)[] ? U[] : (T[K] | null)[] }
  | { $nin: T[K][] }
  | { $gte: T[K] }
  | { $gt: T[K] }
  | { $lte: T[K] }
  | { $lt: T[K] }
  | { $exists: boolean }
  | { $elemMatch: { [key: string]: FilterValue<T, K> } }
  | null;

export type Filter<T> = {
  [K in keyof T]?: FilterValue<T, K>;
} & {
  $or?: Filter<T>[];
  $and?: Filter<T>[];
} & {
  [key: string]: any;
};

export type Options<P> = {
  withDeleted?: boolean;
  populate?: Populate;
  sort?: { [k in keyof P]?: 1 | -1 };
  select?: (keyof P)[];
};

export type Find<P> = {
  filters?: Filter<P>;
} & Options<P>;

export type ViewFind<P> = Pick<Find<P>, "filters" | "withDeleted" | "sort">;

export type Populate = string | string[] | PopulateOptions | PopulateOptions[];

export type PropValue<T> =
  | { [k in keyof T]?: T[k] }
  | { $set?: { [k in keyof T]: Required<T>[k] extends (infer U)[] ? U : T[k] } | { [key in string]: unknown } }
  | { $unset?: { [k in keyof T]: Required<T>[k] extends (infer U)[] ? U : T[k] } | { [key in string]: unknown } }
  | { $push?: { [k in keyof T]: Required<T>[k] extends (infer U)[] ? U : T[k] } };

export type PageRequest = {
  page: number;
  size: number;
};

export type Page<P> = {
  docs: P[];
  total: number;
};

export type FindPaginated<P> = Find<P> & PageRequest;

export type Result<P> = P & { _id: Types.ObjectId };

export interface ViewRepository<P> {
  findById(id: string | Types.ObjectId, options?: Pick<Options<P>, "withDeleted">): Promise<Result<P> | null>;

  findOne(find?: ViewFind<P>): Promise<Result<P> | null>;

  list(find?: ViewFind<P>): Promise<Result<P>[]>;

  paginate(findPaginated: FindPaginated<P>): Promise<Page<Result<P>>>;

  count(find?: Pick<ViewFind<P>, "withDeleted" | "filters">): Promise<number>;

  aggregate<T = Result<P>>(pipeline: PipelineStage[], options?: AggregateOptions): Promise<T[]>;
}

interface Repository<P> {
  insert(props: P): Promise<Result<P>>;

  insertMany(props: P[]): Promise<Result<P>[]>;

  update(
    id: string | Types.ObjectId,
    props: PropValue<Partial<P>>,
    options?: Pick<Options<P>, "withDeleted" | "populate">
  ): Promise<Result<P> | null>;

  updateMany(
    filters: Filter<P>,
    props: PropValue<Partial<P>>,
    options?: Pick<Options<P>, "withDeleted">
  ): Promise<void>;

  remove(id: string | Types.ObjectId): Promise<Result<P> | null>;

  removeMany(filters: Filter<P>): Promise<void>;

  disable(id: string | Types.ObjectId): Promise<Result<P> | null>;

  disableMany(filters: Filter<P>): Promise<void>;

  restore(id: string | Types.ObjectId): Promise<Result<P> | null>;

  restoreMany(filters: Filter<P>): Promise<void>;

  findById(
    id: string | Types.ObjectId,
    options?: Pick<Options<P>, "withDeleted" | "populate">
  ): Promise<Result<P> | null>;

  findOne(find?: Find<P>): Promise<Result<P> | null>;

  list(find?: Find<P>): Promise<Result<P>[]>;

  paginate(findPaginated: FindPaginated<P>): Promise<Page<Result<P>>>;

  count(find?: Find<P>): Promise<number>;

  aggregate<T = Result<P>>(pipeline: PipelineStage[], options?: AggregateOptions): Promise<T[]>;

  cursor(pipeline: PipelineStage[], options?: AggregateOptions): Cursor<Result<P>>;
}

export default Repository;
