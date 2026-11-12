import { Field, ID, ObjectType } from '@nestjs/graphql';
import { URLResolver } from 'graphql-scalars';

@ObjectType({
  description: 'A project worth showing: product, library or demo.',
})
export class Project {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => URLResolver, {
    nullable: true,
    description: 'Live product or demo.',
  })
  url: string | null;

  @Field(() => URLResolver, { nullable: true, description: 'Source code.' })
  repositoryUrl: string | null;
}
