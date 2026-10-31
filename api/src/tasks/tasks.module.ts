import { Module } from '@nestjs/common';
import { BoardsModule } from '../boards/boards.module.js';
import { CommentsResolver, TasksResolver } from './tasks.resolver.js';
import { TasksService } from './tasks.service.js';

@Module({
  imports: [BoardsModule],
  providers: [TasksResolver, CommentsResolver, TasksService],
})
export class TasksModule {}
