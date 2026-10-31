import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TaskStatus } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BoardActivity } from './board-activity.js';
import { BoardEventType } from './board-event.model.js';
import type { Board } from './board.model.js';

@Injectable()
export class BoardsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activity: BoardActivity,
  ) {}

  findAll() {
    return this.prisma.board.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const board = await this.prisma.board.findUnique({ where: { id } });
    if (!board) throw new NotFoundException('Board not found');
    return board;
  }

  async create(ownerId: string, name: string) {
    const board = await this.prisma.board.create({ data: { name, ownerId } });
    await this.activity.publish(BoardEventType.BOARD_CREATED, board.id);
    return board;
  }

  async update(userId: string, id: string, name: string) {
    await this.findOwned(userId, id);
    const board = await this.prisma.board.update({
      where: { id },
      data: { name },
    });
    await this.activity.publish(BoardEventType.BOARD_UPDATED, id);
    return board;
  }

  async remove(userId: string, id: string) {
    await this.findOwned(userId, id);
    await this.prisma.board.delete({ where: { id } });
    await this.activity.publish(BoardEventType.BOARD_DELETED, id);
    return id;
  }

  // Prisma batches same-tick findUnique calls, so per-board lookups avoid N+1.
  owner(board: Board) {
    return this.prisma.user.findUniqueOrThrow({ where: { id: board.ownerId } });
  }

  async tasks(boardId: string) {
    const tasks = await this.prisma.board
      .findUnique({ where: { id: boardId } })
      .tasks({ orderBy: { createdAt: 'asc' } });
    return tasks ?? [];
  }

  async openTaskCount(boardId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      select: {
        _count: {
          select: { tasks: { where: { status: { not: TaskStatus.DONE } } } },
        },
      },
    });
    return board?._count.tasks ?? 0;
  }

  private async findOwned(userId: string, id: string) {
    const board = await this.findOne(id);
    if (board.ownerId !== userId) {
      throw new ForbiddenException('Only the board owner can change it');
    }
    return board;
  }
}
