import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { URLResolver } from 'graphql-scalars';
import { LinkType } from '../../../generated/prisma/enums.js';

registerEnumType(LinkType, {
  name: 'LinkType',
  description: 'Kind of resource a link points to; lets clients pick an icon.',
});

@ObjectType({ description: 'A public professional resource.' })
export class ProfileLink {
  @Field(() => ID)
  id: string;

  @Field(() => LinkType)
  type: LinkType;

  @Field()
  label: string;

  @Field(() => URLResolver)
  url: string;
}

@ObjectType({ description: 'The person this business card presents.' })
export class Profile {
  @Field(() => ID)
  id: string;

  @Field()
  slug: string;

  @Field()
  name: string;

  @Field({ description: 'One-line summary, e.g. "Backend engineer".' })
  headline: string;

  @Field({ description: 'Short bio.' })
  description: string;

  @Field(() => String, { nullable: true })
  location: string | null;
}
