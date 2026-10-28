import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { Response } from 'express';
import { User } from '../users/user.model.js';
import { AuthService } from './auth.service.js';
import {
  AUTH_COOKIE,
  AuthPayload,
  LoginInput,
  type JwtPayload,
} from './auth.types.js';
import { CurrentUser } from './current-user.decorator.js';
import { GqlAuthGuard } from './gql-auth.guard.js';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

@Resolver()
export class AuthResolver {
  constructor(private readonly auth: AuthService) {}

  @Mutation(() => AuthPayload)
  async login(
    @Args('input') input: LoginInput,
    @Context('res') res: Response,
  ): Promise<AuthPayload> {
    const payload = await this.auth.login(input.email, input.password);
    // Add `secure: true` when served over HTTPS.
    res.cookie(AUTH_COOKIE, payload.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: WEEK_MS,
    });
    return payload;
  }

  @Mutation(() => Boolean)
  logout(@Context('res') res: Response): boolean {
    res.clearCookie(AUTH_COOKIE);
    return true;
  }

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  me(@CurrentUser() user: JwtPayload) {
    return this.auth.me(user.sub);
  }
}
