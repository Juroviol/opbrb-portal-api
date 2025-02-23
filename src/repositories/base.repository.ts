import {
  AggregateOptions,
  Cursor,
  Model,
  PipelineStage,
  Types,
} from 'mongoose';
import { uniq } from 'lodash';
import Repository, {
  Filter,
  Find,
  FindPaginated,
  Options,
  Page,
  PropValue,
  Result,
} from './repository';
import Base from '../models/base.model';

abstract class BaseRepository<P extends Base> implements Repository<P> {
  protected constructor(protected model: Model<P>) {}
  /**
   * Inserts a new document into the database.
   *
   * @param {P} props - The properties of the document to be inserted.
   * @returns {Promise<R>} A Promise that resolves to the newly inserted document.
   *
   * @example
   * const newDocument = {
   *   // Define the properties of the new document here
   * };
   *
   * const insertedDocument = await insert(newDocument);
   * console.log("Document inserted successfully:", insertedDocument);
   */
  async insert(props: P): Promise<Result<P>> {
    const documents = await this.model.create([props]);
    return documents[0].toObject();
  }

  /**
   * Inserts multiple documents into the database.
   *
   * @param {P[]} props - An array of properties for the documents to be inserted.
   * @returns {Promise<P[]>} A Promise that resolves to an array of the newly inserted documents.
   *
   * @example
   * const newDocuments = [...];
   *
   * const insertedDocuments = await insertMany(newDocuments);
   * console.log("Documents inserted successfully:", insertedDocuments);
   */
  async insertMany(props: P[]): Promise<Result<P>[]> {
    const documents = await this.model.insertMany(props);
    return documents.map((d) => d.toObject());
  }

  /**
   * Updates a document in the database by its ID.
   *
   * @param {string | Types.ObjectId} id - The ID of the document to update.
   * @param {P} props - The properties to update the document with.
   * @param {{ withDeleted?: boolean; populate: Populate }} [options] - Options for updating and populating.
   * @returns {Promise<Partial<L> | null>} A Promise that resolves to the updated document or null if not found.
   * @throws {Error} Throws an error if an error occurs during the update process.
   *
   * @example
   * const updatedProps = {
   *   // Define the properties to update here
   * };
   *
   * const updateOptions = {
   *   withDeleted: false, // Set to true to include deleted documents
   *   populate: { path: 'someField' } // Specify the fields to populate
   * };
   *
   * const updatedDocument = await update("5f4e62be2f857e0013cbbf83", updatedProps, updateOptions);
   * if (updatedDocument) {
   *   console.log("Document updated successfully:", updatedDocument);
   * }
   */
  update(
    id: string | Types.ObjectId,
    props: PropValue<Partial<P>>,
    options: Pick<Options<P>, 'withDeleted' | 'populate' | 'select'> = {}
  ): Promise<Result<P> | null> {
    return <Promise<Result<P> | null>>this.model
      .findOneAndUpdate(
        {
          _id: id,
          deleted: {
            $in: uniq([null, false, options?.withDeleted]),
          },
        },
        { ...props, updatedAt: new Date() },
        {
          new: true,
          populate: options?.populate,
          projection: options.select,
        }
      )
      .lean()
      .exec();
  }

  /**
   * Updates multiple documents in the database that match the specified filters with the given properties.
   *
   * @param {Filter<P>} filters - Filters to select documents for update.
   * @param {Partial<P>} props - Properties to update documents with.
   * @param {{ withDeleted?: boolean }} [options] - Options for updating and including deleted documents.
   * @returns {Promise<UpdateWriteOpResult>} A Promise that resolves to the result of the update operation.
   *
   * @example
   * const updateOptions = {
   *   filters: { someField: 'someValue' },
   *   props: { updatedField: 'newValue' },
   *   withDeleted: false, // Set to true to include deleted documents
   * };
   *
   * const updateResult = await updateMany(updateOptions);
   * console.log("Documents updated successfully. Result:", updateResult);
   */
  async updateMany(
    filters: Filter<P>,
    props: PropValue<Partial<P>>,
    options: Pick<Options<P>, 'withDeleted'> = {}
  ): Promise<void> {
    await this.model
      .updateMany(
        {
          deleted: {
            $in: uniq([
              null,
              false,
              ...(options?.withDeleted ? [options.withDeleted] : []),
            ]),
          },
          ...filters,
        },
        { ...props, updateAt: new Date() }
      )
      .exec();
  }

  /**
   * Removes (permanently deletes) a document from the database by its ID.
   *
   * @param {string | Types.ObjectId} id - The ID of the document to remove (permanently delete).
   * @returns {Promise<P | null>} A Promise that resolves to the removed (permanently deleted) document or null if not found.
   *
   * @example
   * const documentId = "5f4e62be2f857e0013cbbf83";
   *
   * const removedDocument = await remove(documentId);
   * if (removedDocument) {
   *   console.log("Document removed (permanently deleted) successfully:", removedDocument);
   * } else {
   *   console.log("Document not found.");
   * }
   */
  remove(id: string | Types.ObjectId): Promise<Result<P> | null> {
    return <Promise<Result<P> | null>>(
      this.model.findByIdAndDelete(id).lean().exec()
    );
  }

  /**
   * Removes (permanently deletes) multiple documents from the database that match the specified filters.
   *
   * @param {Filter<P>} filters - Filters to select documents for removal.
   * @returns {Promise<void>} A Promise that resolves when the removal operation is completed.
   *
   * @example
   * const removeOptions = {
   *   filters: { someField: 'someValue' }, // Select documents for removal
   * };
   *
   * await removeMany(removeOptions);
   * console.log("Documents removed (permanently deleted) successfully.");
   */
  async removeMany(filters: Filter<P>): Promise<void> {
    await this.model.deleteMany(filters).lean().exec();
  }

  /**
   * Disables (soft deletes) a document in the database by setting its 'deleted' flag to true and updating 'deletedAt'.
   *
   * @param {string | Types.ObjectId} id - The ID of the document to disable (soft delete).
   * @returns {Promise<P | null>} A Promise that resolves to the disabled (soft deleted) document or null if not found.
   *
   * @example
   * const documentId = "5f4e62be2f857e0013cbbf83";
   *
   * const disabledDocument = await disable(documentId);
   * if (disabledDocument) {
   *   console.log("Document disabled (soft deleted) successfully:", disabledDocument);
   * } else {
   *   console.log("Document not found.");
   * }
   */
  disable(id: string | Types.ObjectId): Promise<Result<P> | null> {
    return <Promise<Result<P> | null>>this.model
      .findOneAndUpdate(
        {
          _id: id,
        },
        {
          deleted: true,
          deletedAt: new Date(),
        },
        {
          new: true,
        }
      )
      .lean()
      .exec();
  }

  /**
   * Disables (soft deletes) multiple documents in the database that match the specified filters by setting their 'deleted' flag to true and updating 'deletedAt'.
   *
   * @param {Filter<P>} filters - Filters to select documents for disabling.
   * @returns {Promise<UpdateWriteOpResult>} A Promise that resolves to the result of the disable operation.
   *
   * @example
   * const disableOptions = {
   *   filters: { someField: 'someValue' }, // Select documents for disabling
   * };
   *
   * const disableResult = await disableMany(disableOptions);
   * console.log("Documents disabled (soft deleted) successfully. Result:", disableResult);
   */
  async disableMany(filters: Filter<P>): Promise<void> {
    await this.model
      .updateMany(filters, {
        $set: {
          deleted: true,
          deletedAt: new Date(),
        },
      })
      .exec();
  }

  /**
   * Restores a document in the database by setting its 'deleted' flag to false and unsetting 'deletedAt'.
   *
   * @param {string | Types.ObjectId} id - The ID of the document to restore.
   * @returns {Promise<P | null>} A Promise that resolves to the restored document or null if not found.
   *
   * @example
   * const documentId = "5f4e62be2f857e0013cbbf83";
   *
   * const restoredDocument = await restore(documentId);
   * if (restoredDocument) {
   *   console.log("Document restored successfully:", restoredDocument);
   * } else {
   *   console.log("Document not found or not deleted.");
   * }
   */
  restore(id: string | Types.ObjectId): Promise<Result<P> | null> {
    return <Promise<Result<P> | null>>this.model
      .findOneAndUpdate(
        { _id: id, deleted: true },
        { deleted: false, $unset: { deletedAt: null } }
      )
      .setOptions({
        new: true,
      })
      .lean()
      .exec();
  }

  /**
   * Restores multiple documents in the database that match the specified filters by setting their 'deleted' flag to false and unsetting 'deletedAt'.
   *
   * @param {Filter<P>} filters - Filters to select documents for restoration.
   * @returns {Promise<UpdateWriteOpResult>} A Promise that resolves to the result of the restoration operation.
   *
   * @example
   * const restoreOptions = {
   *   filters: { someField: 'someValue', deleted: true }, // Select deleted documents for restoration
   * };
   *
   * const restoreResult = await restoreMany(restoreOptions);
   * console.log("Documents restored successfully. Result:", restoreResult);
   */
  async restoreMany(filters: Filter<P>): Promise<void> {
    await this.model
      .updateMany(
        { ...filters, deleted: true },
        { deleted: false, $unset: { deletedAt: null } }
      )
      .lean()
      .exec();
  }

  /**
   * Finds a document by its ID.
   *
   * @param {string | Types.ObjectId} id - The ID of the document to find.
   * @param {Object} [options]
   * @param {Populate} [options.populate] - Options for populating references.
   * @param {boolean} [options.withDeleted] - Indicates whether deleted documents should be included in the search.
   * @returns {Promise<R | null>} A Promise that resolves to the found document or null if not found.
   *
   * @example
   * const document = await findById("5f4e62be2f857e0013cbbf83");
   * if (document) {
   *   console.log("Found document:", document);
   * } else {
   *   console.log("Document not found.");
   * }
   */
  findById(
    id: string | Types.ObjectId,
    options?: Pick<Options<P>, 'withDeleted' | 'populate' | 'select'>
  ): Promise<Result<P> | null> {
    return <Promise<Result<P> | null>>this.model
      .findOne(
        {
          _id: id,
          deleted: {
            $in: uniq([null, false, options?.withDeleted]),
          },
        },
        options?.select,
        {
          populate: options?.populate,
        }
      )
      .lean()
      .exec();
  }

  /**
   * Finds a single document in the database based on specified filters.
   *
   * @param {Find<P>} [options] - Options for filtering, populating, sorting, and selecting fields.
   * @returns {Promise<P | null>} A Promise that resolves to the found document or null if not found.
   *
   * @example
   * const searchOptions = {
   *   filters: { someField: 'someValue' },
   *   withDeleted: false, // Set to true to include deleted documents
   *   populate: { path: 'relatedField' }, // Specify fields to populate
   *   sort: { createdAt: -1 }, // Specify sorting criteria
   *   select: ['field1', 'field2'], // Specify fields to include in the result
   * };
   *
   * const foundDocument = await findOne(searchOptions);
   * if (foundDocument) {
   *   console.log("Document found:", foundDocument);
   * }
   */
  findOne({
    filters,
    withDeleted,
    populate,
    sort,
    select,
  }: Find<P> = {}): Promise<Result<P> | null> {
    return <Promise<Result<P> | null>>this.model
      .findOne(
        {
          deleted: {
            $in: uniq([null, false, withDeleted]),
          },
          ...filters,
        },
        select,
        {
          populate,
          sort: sort || { _id: -1 },
        }
      )
      .lean()
      .exec();
  }

  /**
   * Retrieves a list of documents from the database based on specified filters.
   *
   * @param {Find<P>} [options] - Options for filtering, populating, sorting, selecting fields, and including deleted documents.
   * @returns {Promise<P[]>} A Promise that resolves to an array of matching documents.
   * @throws {Error} Throws an error if an error occurs during the retrieval process.
   *
   * @example
   * const listOptions = {
   *   filters: { someField: 'someValue' },
   *   withDeleted: false, // Set to true to include deleted documents
   *   populate: { path: 'relatedField' }, // Specify fields to populate
   *   sort: { createdAt: -1 }, // Specify sorting criteria
   *   select: ['field1', 'field2'], // Specify fields to include in the results
   * };
   *
   *  const documents = await list(listOptions);
   *  console.log("Found documents:", documents);
   */
  list({ filters, withDeleted, populate, sort, select }: Find<P> = {}): Promise<
    Result<P>[]
  > {
    return <Promise<Result<P>[]>>this.model
      .find(
        {
          deleted: {
            $in: uniq([null, false, withDeleted]),
          },
          ...filters,
        },
        select,
        {
          populate,
          sort: sort || { _id: -1 },
        }
      )
      .lean()
      .exec();
  }

  /**
   * Paginates through documents in the database based on specified filters and pagination options.
   *
   * @param {FindPaginated<P>} options - Options for filtering, pagination, sorting, populating, selecting fields, and including deleted documents.
   * @returns {Promise<Page<P>>} A Promise that resolves to a page of matching documents and the total count.
   *
   * @example
   * const paginationOptions = {
   *   filters: { someField: 'someValue' },
   *   size: 10, // Number of documents per page
   *   page: 1, // Current page
   *   sort: { createdAt: -1 }, // Specify sorting criteria
   *   populate: { path: 'relatedField' }, // Specify fields to populate
   *   withDeleted: false, // Set to true to include deleted documents
   *   select: ['field1', 'field2'], // Specify fields to include in the results
   * };
   *
   * const pageResult = await paginate(paginationOptions);
   * console.log("Page of documents:", pageResult.docs);
   * console.log("Total document count:", pageResult.total);
   */
  async paginate({
    filters,
    size,
    page,
    sort,
    populate,
    withDeleted = false,
    select,
  }: FindPaginated<P>): Promise<Page<Result<P>>> {
    const [docs, total] = await Promise.all([
      this.model
        .find(
          {
            deleted: {
              $in: uniq([null, false, withDeleted]),
            },
            ...filters,
          },
          select
        )
        .setOptions({
          populate,
          sort: sort || { _id: -1 },
          limit: size,
          skip: (page - 1) * size,
        })
        .lean()
        .exec(),
      this.model
        .countDocuments({
          deleted: {
            $in: uniq([null, false, withDeleted]),
          },
          ...filters,
        })
        .exec(),
    ]);

    return { docs: <Result<P>[]>docs, total };
  }

  /**
   * Counts the number of documents in the database that match the specified filters.
   *
   * @param {Find<P>} [options] - Options for filtering and including deleted documents.
   * @returns {Promise<number>} A Promise that resolves to the count of matching documents.
   *
   * @example
   * const countOptions = {
   *   filters: { someField: 'someValue' },
   *   withDeleted: false, // Set to true to include deleted documents
   * };
   *
   * const documentCount = await count(countOptions);
   * console.log("Number of matching documents:", documentCount);
   */
  count({ filters, withDeleted = false }: Find<P> = {}): Promise<number> {
    return this.model
      .countDocuments({
        deleted: {
          $in: uniq([null, false, withDeleted]),
        },
        ...filters,
      })
      .exec();
  }

  /**
   * Executes an aggregation pipeline on the database using the specified stages and options.
   *
   * @param {PipelineStage[]} pipeline - An array of pipeline stages for aggregation.
   * @param {AggregateOptions} [options] - Additional options for customizing the aggregation.
   * @returns {Promise<unknown[]>} A Promise that resolves to the result of the aggregation pipeline.
   * @throws {Error} Throws an error if an error occurs during the aggregation process.
   *
   * @example
   * const aggregationPipeline = [
   *   {
   *     $match: {
   *       someField: 'someValue',
   *     },
   *   },
   *   {
   *     $group: {
   *       _id: '$groupField',
   *       total: { $sum: '$countField' },
   *     },
   *   },
   * ];
   *
   * const aggregationOptions = {
   *   allowDiskUse: true, // Specify additional options as needed
   * };
   *
   * const aggregationResult = await aggregate(aggregationPipeline, aggregationOptions);
   * console.log("Aggregation result:", aggregationResult);
   */
  aggregate<T = Result<P>>(
    pipeline: PipelineStage[],
    options?: AggregateOptions
  ): Promise<T[]> {
    return <Promise<T[]>>this.model
      .aggregate(pipeline, {
        ...options,
      })
      .exec();
  }
  /**
   * Creates a cursor for an aggregation pipeline with the specified stages and options.
   *
   * @param {PipelineStage[]} pipeline - An array of pipeline stages for aggregation.
   * @param {AggregateOptions} [options] - Additional options for customizing the aggregation.
   * @returns {Cursor<P>} A cursor for the aggregation pipeline.
   * @throws {Error} Throws an error if an error occurs during cursor creation.
   *
   * @example
   * const aggregationPipeline = [
   *   {
   *     $match: {
   *       someField: 'someValue',
   *     },
   *   },
   *   {
   *     $group: {
   *       _id: '$groupField',
   *       total: { $sum: '$countField' },
   *     },
   *   },
   * ];
   *
   * const aggregationOptions = {
   *   allowDiskUse: true, // Specify additional options as needed
   * };
   *
   * const aggregationCursor = cursor(aggregationPipeline, aggregationOptions);
   * console.log("Aggregation cursor created successfully.");
   * while (await aggregationCursor.hasNext()) {
   *   const result = await aggregationCursor.next();
   *   console.log("Aggregation result:", result);
   *  }
   */
  cursor(
    pipeline: PipelineStage[],
    options?: AggregateOptions
  ): Cursor<Result<P>> {
    return this.model.aggregate(pipeline, options).cursor();
  }
}

export default BaseRepository;
