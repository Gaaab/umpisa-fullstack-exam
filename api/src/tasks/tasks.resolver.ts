import { Inject, UseGuards } from '@nestjs/common';
import {
  Args,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import type { GqlContext, JwtPayload } from '../auth/auth.types.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { GqlAuthGuard } from '../auth/gql-auth.guard.js';
import { Board } from '../boards/board.model.js';
import { User } from '../users/user.model.js';
import { PUB_SUB, TASK_ASSIGNED } from './pub-sub.js';
import {
  AddCommentInput,
  CreateTaskInput,
  UpdateTaskInput,
} from './task.inputs.js';
import { Comment, Task, TaskAssignment } from './task.model.js';
import { TasksService } from './tasks.service.js';

@Resolver(() => Task)
@UseGuards(GqlAuthGuard)
export class TasksResolver {
  constructor(
    private readonly service: TasksService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  @Query(() => Task)
  task(@Args('id', { type: () => ID }) id: string) {
    return this.service.findOne(id);
  }

  @Query(() => [Task])
  myTasks(@CurrentUser() user: JwtPayload) {
    return this.service.findAssignedTo(user.sub);
  }

  @Mutation(() => Task)
  createTask(
    @CurrentUser() user: JwtPayload,
    @Args('input') input: CreateTaskInput,
  ) {
    return this.service.create(user.sub, input);
  }

  @Mutation(() => Task)
  updateTask(
    @CurrentUser() user: JwtPayload,
    @Args('input') input: UpdateTaskInput,
  ) {
    return this.service.update(user.sub, input);
  }

  @Mutation(() => ID)
  deleteTask(@Args('id', { type: () => ID }) id: string) {
    return this.service.remove(id);
  }

  @Mutation(() => Comment)
  addComment(
    @CurrentUser() user: JwtPayload,
    @Args('input') input: AddCommentInput,
  ) {
    return this.service.addComment(user.sub, input);
  }

  @Subscription(() => TaskAssignment, {
    filter: (
      payload: { taskAssigned: { task: Task } },
      _: unknown,
      context: GqlContext,
    ) => payload.taskAssigned.task.assigneeId === context.user?.sub,
  })
  taskAssigned() {
    return this.pubSub.asyncIterableIterator(TASK_ASSIGNED);
  }

  @ResolveField(() => Board)
  board(@Parent() task: Task) {
    return this.service.board(task);
  }

  @ResolveField(() => User, { nullable: true })
  assignee(@Parent() task: Task) {
    return this.service.assignee(task);
  }

  @ResolveField(() => [Comment])
  comments(@Parent() task: Task) {
    return this.service.comments(task.id);
  }
}

@Resolver(() => Comment)
export class CommentsResolver {
  constructor(private readonly service: TasksService) {}

  @ResolveField(() => User)
  author(@Parent() comment: Comment) {
    return this.service.author(comment);
  }
}
