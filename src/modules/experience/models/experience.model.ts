import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { DateResolver } from 'graphql-scalars';

@ObjectType({ description: 'Length of time in whole months.' })
export class Duration {
  @Field(() => Int)
  years: number;

  @Field(() => Int, { description: 'Months on top of full years (0-11).' })
  months: number;

  @Field(() => Int)
  totalMonths: number;
}

@ObjectType({ description: 'When a position was held.' })
export class Period {
  @Field(() => DateResolver)
  startDate: Date;

  @Field(() => DateResolver, {
    nullable: true,
    description: 'Empty while the position is current.',
  })
  endDate: Date | null;

  @Field()
  isCurrent: boolean;

  @Field(() => Duration, { description: 'Inclusive, counted in months.' })
  duration: Duration;
}

@ObjectType({ description: 'A position held at a company.' })
export class Experience {
  @Field(() => ID)
  id: string;

  @Field()
  company: string;

  @Field(() => String, { nullable: true })
  companyUrl: string | null;

  @Field({ description: 'Job title.' })
  position: string;

  @Field(() => String, { nullable: true })
  location: string | null;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field(() => [String])
  achievements: string[];
}
