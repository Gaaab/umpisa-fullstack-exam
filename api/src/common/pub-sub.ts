import { Global, Module } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';

export const PUB_SUB = Symbol('PUB_SUB');
export const TASK_ASSIGNED = 'taskAssigned';
export const BOARD_ACTIVITY = 'boardActivity';

// In-memory PubSub is enough for a single API instance.
@Global()
@Module({
  providers: [{ provide: PUB_SUB, useValue: new PubSub() }],
  exports: [PUB_SUB],
})
export class PubSubModule {}
