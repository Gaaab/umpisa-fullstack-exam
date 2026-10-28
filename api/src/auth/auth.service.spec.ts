import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import type { PrismaService } from '../prisma/prisma.service.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  const jwt = new JwtService({ secret: 'test' });
  const findUnique = vi.fn();
  const service = new AuthService(
    { user: { findUnique } } as unknown as PrismaService,
    jwt,
  );
  const user = {
    id: 'u1',
    email: 'alice@example.com',
    name: 'Alice',
    passwordHash: bcrypt.hashSync('secret', 4),
  };

  beforeEach(() => findUnique.mockReset());

  it('returns a signed token for valid credentials', async () => {
    findUnique.mockResolvedValue(user);
    const result = await service.login(user.email, 'secret');
    expect(result.user).toBe(user);
    expect(jwt.verify(result.accessToken)).toMatchObject({
      sub: 'u1',
      email: user.email,
    });
  });

  it('rejects a wrong password', async () => {
    findUnique.mockResolvedValue(user);
    await expect(service.login(user.email, 'nope')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects an unknown email', async () => {
    findUnique.mockResolvedValue(null);
    await expect(
      service.login('x@example.com', 'secret'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
