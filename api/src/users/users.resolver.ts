import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { GqlAuthGuard } from '../auth/gql-auth.guard.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { User } from './user.model.js';

@Resolver(() => User)
@UseGuards(GqlAuthGuard)
export class UsersResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query(() => [User])
  users() {
    return this.prisma.user.findMany({ orderBy: { name: 'asc' } });
  }
}
