import { Inject, Injectable } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { BOARD_ACTIVITY, PUB_SUB } from '../common/pub-sub.js';
import { BoardEventType } from './board-event.model.js';

@Injectable()
export class BoardActivity {
  constructor(@Inject(PUB_SUB) private readonly pubSub: PubSub) {}

  publish(type: BoardEventType, boardId: string, taskId: string | null = null) {
    return this.pubSub.publish(BOARD_ACTIVITY, {
      boardActivity: { type, boardId, taskId },
    });
  }

  listen() {
    return this.pubSub.asyncIterableIterator(BOARD_ACTIVITY);
  }
}
