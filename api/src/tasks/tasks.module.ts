import { Module } from '@nestjs/common';
import { pubSubProvider } from './pub-sub.js';
import { CommentsResolver, TasksResolver } from './tasks.resolver.js';
import { TasksService } from './tasks.service.js';

@Module({
  providers: [TasksResolver, CommentsResolver, TasksService, pubSubProvider],
})
export class TasksModule {}
