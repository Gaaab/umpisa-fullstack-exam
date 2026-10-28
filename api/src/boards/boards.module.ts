import { Module } from '@nestjs/common';
import { BoardsResolver } from './boards.resolver.js';
import { BoardsService } from './boards.service.js';

@Module({
  providers: [BoardsResolver, BoardsService],
})
export class BoardsModule {}
