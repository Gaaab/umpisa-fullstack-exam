import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AuthRequest } from './auth.types.js';
import { GqlAuthGuard } from './gql-auth.guard.js';

describe('GqlAuthGuard', () => {
  const jwt = new JwtService({ secret: 'test' });
  const guard = new GqlAuthGuard(jwt);
  const token = jwt.sign({ sub: 'u1', email: 'alice@example.com' });

  // GqlExecutionContext reads the GraphQL context from the third resolver arg.
  const contextFor = (req: object) =>
    ({
      getArgs: () => [{}, {}, { req }, {}],
      getClass: () => null,
      getHandler: () => null,
      getType: () => 'graphql',
    }) as unknown as ExecutionContext;

  it('accepts the auth cookie', () => {
    const req: Partial<AuthRequest> = { cookies: { token }, headers: {} };
    expect(guard.canActivate(contextFor(req))).toBe(true);
    expect(req.user?.sub).toBe('u1');
  });

  it('accepts a Bearer header', () => {
    const req = { headers: { authorization: `Bearer ${token}` } };
    expect(guard.canActivate(contextFor(req))).toBe(true);
  });

  it('rejects a missing token', () => {
    expect(() => guard.canActivate(contextFor({ headers: {} }))).toThrow(
      UnauthorizedException,
    );
  });

  it('rejects an invalid token', () => {
    const req = { headers: { authorization: 'Bearer bad' } };
    expect(() => guard.canActivate(contextFor(req))).toThrow(
      UnauthorizedException,
    );
  });
});
