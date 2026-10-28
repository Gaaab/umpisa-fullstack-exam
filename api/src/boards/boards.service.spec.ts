import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service.js';
import { BoardsService } from './boards.service.js';

describe('BoardsService', () => {
  const board = {
    id: 'b1',
    name: 'Launch',
    ownerId: 'owner',
    createdAt: new Date(),
  };
  const prisma = {
    board: { findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
  };
  const service = new BoardsService(prisma as unknown as PrismaService);

  beforeEach(() => {
    vi.resetAllMocks();
    prisma.board.findUnique.mockResolvedValue(board);
  });

  it('throws NotFound for a missing board', async () => {
    prisma.board.findUnique.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('lets the owner rename the board', async () => {
    prisma.board.update.mockResolvedValue({ ...board, name: 'Relaunch' });
    await expect(
      service.update('owner', 'b1', 'Relaunch'),
    ).resolves.toMatchObject({
      name: 'Relaunch',
    });
  });

  it('forbids other users from renaming or deleting', async () => {
    await expect(service.update('someone', 'b1', 'x')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    await expect(service.remove('someone', 'b1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(prisma.board.delete).not.toHaveBeenCalled();
  });

  it('returns the id after the owner deletes', async () => {
    await expect(service.remove('owner', 'b1')).resolves.toBe('b1');
    expect(prisma.board.delete).toHaveBeenCalledWith({ where: { id: 'b1' } });
  });
});
