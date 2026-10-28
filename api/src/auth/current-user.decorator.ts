import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { GqlContext } from './auth.types.js';

export const CurrentUser = createParamDecorator(
  (_: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context).getContext<GqlContext>();
    return ctx.req?.user ?? ctx.user;
  },
);
