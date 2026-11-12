import { Module } from '@nestjs/common';
import { FilesRepository } from './files.repository.js';
import { FilesService } from './files.service.js';

@Module({
  providers: [FilesRepository, FilesService],
  exports: [FilesRepository, FilesService],
})
export class FilesModule {}
