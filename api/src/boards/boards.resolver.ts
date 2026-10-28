import { UseGuards } from '@nestjs/common';
import {
  Args,
  ID,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import type { JwtPayload } from '../auth/auth.types.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { GqlAuthGuard } from '../auth/gql-auth.guard.js';
import { Task } from '../tasks/task.model.js';
import { User } from '../users/user.model.js';
import { CreateBoardInput, UpdateBoardInput } from './board.inputs.js';
import { Board } from './board.model.js';
import { BoardsService } from './boards.service.js';

@Resolver(() => Board)
@UseGuards(GqlAuthGuard)
export class BoardsResolver {
  constructor(private readonly service: BoardsService) {}

  @Query(() => [Board])
  boards() {
    return this.service.findAll();
  }

  @Query(() => Board)
  board(@Args('id', { type: () => ID }) id: string) {
    return this.service.findOne(id);
  }

  @Mutation(() => Board)
  createBoard(
    @CurrentUser() user: JwtPayload,
    @Args('input') input: CreateBoardInput,
  ) {
    return this.service.create(user.sub, input.name);
  }

  @Mutation(() => Board)
  updateBoard(
    @CurrentUser() user: JwtPayload,
    @Args('input') input: UpdateBoardInput,
  ) {
    return this.service.update(user.sub, input.id, input.name);
  }

  @Mutation(() => ID)
  deleteBoard(
    @CurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.service.remove(user.sub, id);
  }

  @ResolveField(() => User)
  owner(@Parent() board: Board) {
    return this.service.owner(board);
  }

  @ResolveField(() => [Task])
  tasks(@Parent() board: Board) {
    return this.service.tasks(board.id);
  }

  @ResolveField(() => Int)
  openTaskCount(@Parent() board: Board) {
    return this.service.openTaskCount(board.id);
  }
}
