import { Field, ID, InputType } from '@nestjs/graphql';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { Trim } from '../common/validation.js';
import { TaskStatus } from '../generated/prisma/enums.js';

@InputType()
export class CreateTaskInput {
  @Field(() => ID)
  @IsUUID()
  boardId: string;

  @Field()
  @Trim()
  @IsNotEmpty({ message: 'Task title is required' })
  @MaxLength(120)
  title: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @Trim()
  @MaxLength(2000)
  description?: string | null;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  assigneeId?: string | null;
}

// Omitted fields stay unchanged; `assigneeId: null` unassigns.
@InputType()
export class UpdateTaskInput {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @Trim()
  @IsNotEmpty({ message: 'Task title is required' })
  @MaxLength(120)
  title?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @Trim()
  @MaxLength(2000)
  description?: string | null;

  @Field(() => TaskStatus, { nullable: true })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus | null;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  assigneeId?: string | null;
}

@InputType()
export class AddCommentInput {
  @Field(() => ID)
  @IsUUID()
  taskId: string;

  @Field()
  @Trim()
  @IsNotEmpty({ message: 'Comment cannot be empty' })
  @MaxLength(1000)
  body: string;
}
