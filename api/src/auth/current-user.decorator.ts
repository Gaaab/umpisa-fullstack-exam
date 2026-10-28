import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { AuthRequest } from './auth.types.js';

export const CurrentUser = createParamDecorator(
  (_: unknown, context: ExecutionContext) =>
    GqlExecutionContext.create(context).getContext<{ req: AuthRequest }>().req
      .user,
);
