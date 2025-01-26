import { Types } from 'mongoose';
import {
  Filter,
  Find,
  FindPaginated,
  Page,
  Result,
  Options,
  PropValue,
  ViewFind,
} from '@repositories/repository';

export interface ViewService<P> {
  findById(
    id: string | Types.ObjectId,
    options?: Pick<Options<P>, 'withDeleted'>
  ): Promise<Result<P> | null>;

  findOne(find?: ViewFind<P>): Promise<Result<P> | null>;

  list(find?: ViewFind<P>): Promise<Result<P>[]>;

  paginate(findPaginated: FindPaginated<P>): Promise<Page<Result<P>>>;

  count(find?: Pick<ViewFind<P>, 'filters' | 'withDeleted'>): Promise<number>;
}

interface Service<P> {
  insert(props: P): Promise<Result<P>>;

  insertMany(props: P[]): Promise<Result<P>[]>;

  update(
    id: string | Types.ObjectId,
    props: PropValue<Partial<P>>,
    options?: Pick<Options<P>, 'withDeleted' | 'populate'>
  ): Promise<Result<P> | null>;

  updateMany(
    filters: Filter<P>,
    props: PropValue<Partial<P>>,
    options?: Pick<Options<P>, 'withDeleted'>
  ): Promise<void>;

  remove(id: string | Types.ObjectId): Promise<Result<P> | null>;

  removeMany(filters: Filter<P>): Promise<void>;

  disable(id: string | Types.ObjectId): Promise<Result<P> | null>;

  disableMany(filters: Filter<P>): Promise<void>;

  restore(id: string | Types.ObjectId): Promise<Result<P> | null>;

  restoreMany(filters: Filter<P>): Promise<void>;

  findById(
    id: string | Types.ObjectId,
    options?: Pick<Options<P>, 'withDeleted' | 'populate'>
  ): Promise<Result<P> | null>;

  findOne(find?: Find<P>): Promise<Result<P> | null>;

  list(find?: Find<P>): Promise<Result<P>[]>;

  paginate(findPaginated: FindPaginated<P>): Promise<Page<Result<P>>>;

  count(find?: Find<P>): Promise<number>;
}

export default Service;
