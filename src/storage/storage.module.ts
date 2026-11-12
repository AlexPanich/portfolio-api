import { Global, Logger, Module } from '@nestjs/common';
import { AppConfig } from '../config/app-config.service.js';
import { DisabledObjectStorage, ObjectStorage } from './object-storage.js';
import { S3ObjectStorage } from './s3-object-storage.js';

@Global()
@Module({
  providers: [
    {
      provide: ObjectStorage,
      inject: [AppConfig],
      useFactory: (config: AppConfig): ObjectStorage => {
        const storage = config.storage;
        if (storage) return new S3ObjectStorage(storage);
        new Logger('StorageModule').warn(
          'S3 is not configured: files (avatar) are disabled',
        );
        return new DisabledObjectStorage();
      },
    },
  ],
  exports: [ObjectStorage],
})
export class StorageModule {}
