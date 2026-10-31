import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { BoardActivity } from '../boards/board-activity.js';
import { BoardEventType } from '../boards/board-event.model.js';
import { PUB_SUB, TASK_ASSIGNED } from '../common/pub-sub.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  AddCommentInput,
  CreateTaskInput,
  UpdateTaskInput,
} from './task.inputs.js';
import type { Comment, Task } from './task.model.js';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
    private readonly activity: BoardActivity,
  ) {}

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  findAssignedTo(userId: string) {
    return this.prisma.task.findMany({
      where: { assigneeId: userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async create(actorId: string, input: CreateTaskInput) {
    if (!(await this.prisma.board.count({ where: { id: input.boardId } }))) {
      throw new NotFoundException('Board not found');
    }
    await this.assertAssignee(input.assigneeId);
    const task = await this.prisma.task.create({
      data: {
        boardId: input.boardId,
        title: input.title,
        description: input.description || null,
        assigneeId: input.assigneeId ?? null,
      },
    });
    await this.activity.publish(
      BoardEventType.TASK_CREATED,
      task.boardId,
      task.id,
    );
    await this.notifyAssignee(task, actorId, null);
    return task;
  }

  async update(actorId: string, input: UpdateTaskInput) {
    const before = await this.findOne(input.id);
    await this.assertAssignee(input.assigneeId);
    const task = await this.prisma.task.update({
      where: { id: input.id },
      data: {
        title: input.title ?? undefined,
        description:
          input.description === undefined
            ? undefined
            : input.description || null,
        status: input.status ?? undefined,
        assigneeId: input.assigneeId,
      },
    });
    await this.activity.publish(
      BoardEventType.TASK_UPDATED,
      task.boardId,
      task.id,
    );
    await this.notifyAssignee(task, actorId, before.assigneeId);
    return task;
  }

  async remove(id: string) {
    const task = await this.findOne(id);
    await this.prisma.task.delete({ where: { id } });
    await this.activity.publish(BoardEventType.TASK_DELETED, task.boardId, id);
    return id;
  }

  async addComment(authorId: string, input: AddCommentInput) {
    const task = await this.findOne(input.taskId);
    const comment = await this.prisma.comment.create({
      data: { taskId: input.taskId, body: input.body, authorId },
    });
    await this.activity.publish(
      BoardEventType.COMMENT_ADDED,
      task.boardId,
      task.id,
    );
    return comment;
  }

  // Prisma batches same-tick findUnique calls, so per-task lookups avoid N+1.
  board(task: Task) {
    return this.prisma.board.findUniqueOrThrow({ where: { id: task.boardId } });
  }

  assignee(task: Task) {
    return task.assigneeId
      ? this.prisma.user.findUnique({ where: { id: task.assigneeId } })
      : null;
  }

  async comments(taskId: string) {
    const comments = await this.prisma.task
      .findUnique({ where: { id: taskId } })
      .comments({ orderBy: { createdAt: 'asc' } });
    return comments ?? [];
  }

  author(comment: Comment) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: comment.authorId },
    });
  }

  private async assertAssignee(assigneeId: string | null | undefined) {
    if (!assigneeId) return;
    if (!(await this.prisma.user.count({ where: { id: assigneeId } }))) {
      throw new BadRequestException('Assignee not found');
    }
  }

  // Notify only when someone else hands the task to a new assignee.
  private async notifyAssignee(
    task: Task,
    actorId: string,
    previousAssigneeId: string | null,
  ) {
    if (
      !task.assigneeId ||
      task.assigneeId === previousAssigneeId ||
      task.assigneeId === actorId
    ) {
      return;
    }
    const assignedBy = await this.prisma.user.findUniqueOrThrow({
      where: { id: actorId },
    });
    await this.pubSub.publish(TASK_ASSIGNED, {
      taskAssigned: { task, assignedBy },
    });
  }
}
