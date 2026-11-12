import {
  CreateBucketCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ServiceException,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Logger, type OnModuleDestroy } from '@nestjs/common';
import type { StorageConfig } from '../config/env.schema.js';
import { ObjectStorage, type SignedUrl } from './object-storage.js';

const isNotFound = (error: unknown): boolean =>
  error instanceof S3ServiceException &&
  (error.$metadata.httpStatusCode === 404 || error.name === 'NotFound');

/**
 * ObjectStorage over the AWS SDK; works with AWS S3, MinIO, Cloudflare R2
 * and other S3-compatible stores.
 *
 * Two clients on purpose: `client` talks to S3_ENDPOINT (inside Docker that
 * is `http://minio:9000`), while `signer` signs URLs for S3_PUBLIC_ENDPOINT,
 * the host a browser can actually reach. A presigned URL embeds the host in
 * its signature, so it cannot be rewritten after signing.
 * Signing is local crypto: it makes no network call.
 */
export class S3ObjectStorage extends ObjectStorage implements OnModuleDestroy {
  readonly enabled = true;

  private readonly logger = new Logger(S3ObjectStorage.name);
  private readonly client: S3Client;
  private readonly signer: S3Client;

  constructor(private readonly config: StorageConfig) {
    super();
    const base = {
      region: config.region,
      forcePathStyle: config.forcePathStyle,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      // AWS SDK v3 adds CRC checksums to every request by default; not all
      // S3-compatible stores (Cloudflare R2, older MinIO) support them, so
      // checksums are sent only when an operation requires them.
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    } as const;
    this.client = new S3Client({ ...base, endpoint: config.endpoint });
    this.signer = new S3Client({
      ...base,
      endpoint: config.publicEndpoint ?? config.endpoint,
    });
  }

  async ensureBucket(): Promise<void> {
    const Bucket = this.config.bucket;
    try {
      await this.client.send(new HeadBucketCommand({ Bucket }));
    } catch (error) {
      if (!isNotFound(error)) throw error;
      await this.client.send(new CreateBucketCommand({ Bucket }));
      this.logger.log(`Created bucket "${Bucket}"`);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({ Bucket: this.config.bucket, Key: key }),
      );
      return true;
    } catch (error) {
      if (isNotFound(error)) return false;
      throw error;
    }
  }

  async put(key: string, body: Buffer, contentType: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        // Keys are content-addressed, so an object never changes.
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );
  }

  async signedUrl(key: string): Promise<SignedUrl> {
    const expiresIn = this.config.urlTtlSeconds;
    const url = await getSignedUrl(
      this.signer,
      new GetObjectCommand({ Bucket: this.config.bucket, Key: key }),
      { expiresIn },
    );
    return { url, expiresAt: new Date(Date.now() + expiresIn * 1000) };
  }

  onModuleDestroy(): void {
    this.client.destroy();
    this.signer.destroy();
  }
}
