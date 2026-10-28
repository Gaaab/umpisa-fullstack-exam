import { PubSub } from 'graphql-subscriptions';

export const PUB_SUB = Symbol('PUB_SUB');
export const TASK_ASSIGNED = 'taskAssigned';

// In-memory PubSub is enough for a single API instance.
export const pubSubProvider = { provide: PUB_SUB, useValue: new PubSub() };
