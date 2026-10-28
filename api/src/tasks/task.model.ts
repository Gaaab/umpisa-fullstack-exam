import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { TaskStatus } from '../generated/prisma/enums.js';
import { User } from '../users/user.model.js';

registerEnumType(TaskStatus, { name: 'TaskStatus' });

@ObjectType()
export class Task {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field(() => TaskStatus)
  status: TaskStatus;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  boardId: string;
  assigneeId: string | null;
}

@ObjectType()
export class Comment {
  @Field(() => ID)
  id: string;

  @Field()
  body: string;

  @Field()
  createdAt: Date;

  taskId: string;
  authorId: string;
}

@ObjectType()
export class TaskAssignment {
  @Field(() => Task)
  task: Task;

  @Field(() => User)
  assignedBy: User;
}
