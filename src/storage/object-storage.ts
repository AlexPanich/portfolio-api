export interface SignedUrl {
  url: string;
  expiresAt: Date;
}

/**
 * Port for binary object storage. Business code depends on this
 * abstraction (also the DI token), not on the AWS SDK, so the backend can
 * be swapped (S3, R2, MinIO, a fake in tests) without touching callers.
 */
export abstract class ObjectStorage {
  /** False when no storage is configured; reads then degrade to `null`. */
  abstract readonly enabled: boolean;

  /** Creates the bucket if it does not exist yet. Idempotent. */
  abstract ensureBucket(): Promise<void>;

  abstract exists(key: string): Promise<boolean>;

  abstract put(key: string, body: Buffer, contentType: string): Promise<void>;

  /** Time-limited download URL; `null` when storage is disabled. */
  abstract signedUrl(key: string): Promise<SignedUrl | null>;
}

/** Used when S3 is not configured: the app runs, files are just absent. */
export class DisabledObjectStorage extends ObjectStorage {
  readonly enabled = false;

  ensureBucket(): Promise<void> {
    return Promise.reject(this.error());
  }

  exists(): Promise<boolean> {
    return Promise.reject(this.error());
  }

  put(): Promise<void> {
    return Promise.reject(this.error());
  }

  signedUrl(): Promise<null> {
    return Promise.resolve(null);
  }

  private error(): Error {
    return new Error('Object storage is not configured (set S3_BUCKET)');
  }
}
