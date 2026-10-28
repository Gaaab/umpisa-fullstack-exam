import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID, MaxLength } from 'class-validator';
import { Trim } from '../common/validation.js';

@InputType()
export class CreateBoardInput {
  @Field()
  @Trim()
  @IsNotEmpty({ message: 'Board name is required' })
  @MaxLength(60)
  name: string;
}

@InputType()
export class UpdateBoardInput extends CreateBoardInput {
  @Field(() => ID)
  @IsUUID()
  id: string;
}
