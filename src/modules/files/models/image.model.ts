import { Field, GraphQLISODateTime, Int, ObjectType } from '@nestjs/graphql';
import { URLResolver } from 'graphql-scalars';

@ObjectType({ description: 'An image stored in S3-compatible object storage.' })
export class Image {
  @Field(() => URLResolver, {
    description: 'Presigned download URL; valid until `expiresAt`.',
  })
  url: string;

  @Field(() => GraphQLISODateTime)
  expiresAt: Date;

  @Field()
  contentType: string;

  @Field(() => Int, { description: 'Size in bytes.' })
  size: number;
}
