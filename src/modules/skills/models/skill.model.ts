import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { SkillCategory } from '../../../generated/prisma/enums.js';

registerEnumType(SkillCategory, {
  name: 'SkillCategory',
  description: 'Area a skill belongs to; used to group skills in a CV.',
});

@ObjectType({ description: 'A technology, language or practice.' })
export class Skill {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => SkillCategory)
  category: SkillCategory;
}
