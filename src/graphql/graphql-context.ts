import type { Request } from 'express';
import type { Loaders } from './loaders.factory.js';

export interface GraphQLContext {
  req: Request;
  loaders: Loaders;
}
