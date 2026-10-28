import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { AUTH_COOKIE, AuthRequest, JwtPayload } from './auth.types.js';

// Web sends the httpOnly cookie, Flutter sends a Bearer header.
@Injectable()
export class GqlAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const { req } = GqlExecutionContext.create(context).getContext<{
      req: AuthRequest;
    }>();
    const token =
      (req.cookies?.[AUTH_COOKIE] as string | undefined) ??
      req.headers.authorization?.replace(/^Bearer /, '');
    if (!token) throw new UnauthorizedException();

    try {
      req.user = this.jwt.verify<JwtPayload>(token);
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
