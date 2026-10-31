import { Module } from '@nestjs/common';
import { BoardActivity } from './board-activity.js';
import { BoardsResolver } from './boards.resolver.js';
import { BoardsService } from './boards.service.js';

@Module({
  providers: [BoardsResolver, BoardsService, BoardActivity],
  exports: [BoardActivity],
})
export class BoardsModule {}
