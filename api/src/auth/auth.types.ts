import { Field, InputType, ObjectType } from '@nestjs/graphql';
import type { Request } from 'express';
import { User } from '../users/user.model.js';

export const AUTH_COOKIE = 'token';

export interface JwtPayload {
  sub: string;
  email: string;
}

export type AuthRequest = Request & { user?: JwtPayload };

/** HTTP requests carry `req`; WebSocket subscriptions carry a verified `user`. */
export interface GqlContext {
  req?: AuthRequest;
  user?: JwtPayload;
}

@InputType()
export class LoginInput {
  @Field()
  email: string;

  @Field()
  password: string;
}

@ObjectType()
export class AuthPayload {
  @Field()
  accessToken: string;

  @Field(() => User)
  user: User;
}
