import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { AUTH_COOKIE, type GqlContext, type JwtPayload } from './auth.types.js';
import { bearerToken } from './token.js';

// Web sends the httpOnly cookie, Flutter sends a Bearer header.
// Subscriptions are verified once in onConnect and carry `user` on the context.
@Injectable()
export class GqlAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const { req, user } =
      GqlExecutionContext.create(context).getContext<GqlContext>();
    if (user) return true;

    const token =
      (req?.cookies?.[AUTH_COOKIE] as string | undefined) ??
      bearerToken(req?.headers?.authorization);
    if (!token) throw new UnauthorizedException();

    try {
      req!.user = this.jwt.verify<JwtPayload>(token);
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
