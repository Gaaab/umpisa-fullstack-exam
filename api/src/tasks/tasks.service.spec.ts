import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { PubSub } from 'graphql-subscriptions';
import type { PrismaService } from '../prisma/prisma.service.js';
import { TASK_ASSIGNED } from './pub-sub.js';
import { TasksService } from './tasks.service.js';

describe('TasksService', () => {
  const task = {
    id: 't1',
    title: 'Ship',
    description: null,
    status: 'TODO',
    boardId: 'b1',
    assigneeId: null as string | null,
  };
  const prisma = {
    board: { count: vi.fn() },
    user: { count: vi.fn(), findUniqueOrThrow: vi.fn() },
    task: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    comment: { create: vi.fn() },
  };
  const pubSub = { publish: vi.fn() };
  const service = new TasksService(
    prisma as unknown as PrismaService,
    pubSub as unknown as PubSub,
  );

  beforeEach(() => {
    vi.resetAllMocks();
    prisma.board.count.mockResolvedValue(1);
    prisma.user.count.mockResolvedValue(1);
    prisma.user.findUniqueOrThrow.mockResolvedValue({
      id: 'alice',
      name: 'Alice',
    });
    prisma.task.findUnique.mockResolvedValue(task);
  });

  it('rejects a task on a missing board', async () => {
    prisma.board.count.mockResolvedValue(0);
    await expect(
      service.create('alice', { boardId: 'nope', title: 'x' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects an unknown assignee', async () => {
    prisma.user.count.mockResolvedValue(0);
    await expect(
      service.update('alice', { id: 't1', assigneeId: 'ghost' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('notifies a new assignee who is not the actor', async () => {
    const assigned = { ...task, assigneeId: 'bob' };
    prisma.task.update.mockResolvedValue(assigned);
    await service.update('alice', { id: 't1', assigneeId: 'bob' });
    expect(pubSub.publish).toHaveBeenCalledWith(TASK_ASSIGNED, {
      taskAssigned: {
        task: assigned,
        assignedBy: { id: 'alice', name: 'Alice' },
      },
    });
  });

  it('does not notify on self-assignment or unchanged assignee', async () => {
    prisma.task.update.mockResolvedValue({ ...task, assigneeId: 'alice' });
    await service.update('alice', { id: 't1', assigneeId: 'alice' });

    prisma.task.findUnique.mockResolvedValue({ ...task, assigneeId: 'bob' });
    prisma.task.update.mockResolvedValue({
      ...task,
      assigneeId: 'bob',
      status: 'DONE',
    });
    await service.update('alice', { id: 't1', status: 'DONE' });

    expect(pubSub.publish).not.toHaveBeenCalled();
  });

  it('keeps omitted fields and clears an empty description', async () => {
    prisma.task.update.mockResolvedValue(task);
    await service.update('alice', { id: 't1', description: '' });
    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id: 't1' },
      data: {
        title: undefined,
        description: null,
        status: undefined,
        assigneeId: undefined,
      },
    });
  });

  it('rejects a comment on a missing task', async () => {
    prisma.task.findUnique.mockResolvedValue(null);
    await expect(
      service.addComment('alice', { taskId: 'nope', body: 'hi' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
