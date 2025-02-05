import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { StreamingBlobPayloadInputTypes } from '@smithy/types';
import { ObjectIdentifierList } from 'aws-sdk/clients/s3';

const client = new S3Client({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY || '',
    secretAccessKey: process.env.AWS_SECRET_KEY || '',
  },
});

class FileApi {
  /**
   * Creates a new file in the storage.
   * @param to - The destination path for the file.
   * @param file - The file to be uploaded.
   * @param filePermission - Access permission for the file.
   * @param mimeType - MIME type of the file.
   * @returns A promise that resolves when the file is successfully created.
   */
  create(
    to: string,
    file: StreamingBlobPayloadInputTypes,
    filePermission: ObjectCannedACL,
    mimeType: string
  ) {
    return client.send(
      new PutObjectCommand({
        ACL: filePermission,
        Key: to,
        Body: file,
        Bucket: process.env.ASSETS_BUCKET as string,
        CacheControl: 'max-age=0',
        ContentType: mimeType,
      })
    );
  }

  /**
   * Copies a file from one location to another.
   * @param from - The source path of the file to be copied.
   * @param to - The destination path for the copied file.
   * @param filePermission - Access permission for the copied file.
   * @returns A promise that resolves when the copy is successfully completed.
   */
  copy(from: string, to: string, filePermission: ObjectCannedACL) {
    return client.send(
      new CopyObjectCommand({
        Bucket: process.env.ASSETS_BUCKET as string,
        Key: to,
        CopySource: from,
        ACL: filePermission,
      })
    );
  }

  /**
   * Deletes one or more objects from the storage.
   * @param objects - List of object identifiers to be deleted.
   * @returns A promise that resolves when the deletion is successfully completed.
   */
  async delete(objects: ObjectIdentifierList) {
    for (const object of objects) {
      await client.send(
        new DeleteObjectCommand({
          Bucket: process.env.ASSETS_BUCKET as string,
          Key: object.Key,
        })
      );
    }
  }

  /**
   * Gets a file from the storage based on the provided key.
   *
   * @param key - The key of the file to be retrieved.
   * @returns A promise that resolves with the retrieved file.
   */
  get(key: string) {
    return client.send(
      new GetObjectCommand({
        Bucket: process.env.ASSETS_BUCKET as string,
        Key: key,
      })
    );
  }

  list(folder: string) {
    return client.send(
      new ListObjectsV2Command({
        Bucket: process.env.ASSETS_BUCKET as string,
        Prefix: folder,
      })
    );
  }
}

export default new FileApi();
