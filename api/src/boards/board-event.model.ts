import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum BoardEventType {
  BOARD_CREATED = 'BOARD_CREATED',
  BOARD_UPDATED = 'BOARD_UPDATED',
  BOARD_DELETED = 'BOARD_DELETED',
  TASK_CREATED = 'TASK_CREATED',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_DELETED = 'TASK_DELETED',
  COMMENT_ADDED = 'COMMENT_ADDED',
}

registerEnumType(BoardEventType, { name: 'BoardEventType' });

// Clients refetch what they show, so the event only says what changed.
@ObjectType()
export class BoardEvent {
  @Field(() => BoardEventType)
  type: BoardEventType;

  @Field(() => ID)
  boardId: string;

  @Field(() => ID, { nullable: true })
  taskId: string | null;
}
