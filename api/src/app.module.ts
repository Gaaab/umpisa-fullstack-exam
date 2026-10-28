import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import type { Context } from 'graphql-ws';
import type { IncomingMessage } from 'node:http';
import { join } from 'node:path';
import { AppResolver } from './app.resolver.js';
import { AuthModule } from './auth/auth.module.js';
import type { JwtPayload } from './auth/auth.types.js';
import { bearerToken, cookieToken } from './auth/token.js';
import { BoardsModule } from './boards/boards.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { TasksModule } from './tasks/tasks.module.js';
import { UsersResolver } from './users/users.resolver.js';

type WsExtra = { request: IncomingMessage; user?: JwtPayload };

@Module({
  imports: [
    AuthModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      inject: [JwtService],
      useFactory: (jwt: JwtService) => ({
        autoSchemaFile: join(process.cwd(), 'schema.gql'),
        sortSchema: true,
        subscriptions: {
          'graphql-ws': {
            // Web sends the auth cookie on the upgrade, Flutter sends connectionParams.
            onConnect: (ctx: Context<Record<string, unknown> | undefined>) => {
              const extra = ctx.extra as WsExtra;
              const token =
                bearerToken(ctx.connectionParams?.authorization) ??
                cookieToken(extra.request.headers.cookie);
              try {
                extra.user = jwt.verify<JwtPayload>(token ?? '');
                return true;
              } catch {
                return false;
              }
            },
          },
        },
        context: ({
          req,
          res,
          extra,
        }: {
          req: unknown;
          res: unknown;
          extra?: WsExtra;
        }) => (extra ? { user: extra.user } : { req, res }),
      }),
    }),
    PrismaModule,
    BoardsModule,
    TasksModule,
  ],
  providers: [AppResolver, UsersResolver],
})
export class AppModule {}
