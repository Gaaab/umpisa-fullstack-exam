import bcrypt from 'bcryptjs';
import { TaskStatus } from './generated/prisma/enums.js';
import { PrismaService } from './prisma/prisma.service.js';

const DEMO_PASSWORD = 'password123';
const users = [
  { email: 'alice@example.com', name: 'Alice Santos' },
  { email: 'bob@example.com', name: 'Bob Reyes' },
  { email: 'carol@example.com', name: 'Carol Cruz' },
];

const prisma = new PrismaService();
const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
const [alice, bob, carol] = await Promise.all(
  users.map((user) =>
    prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: { ...user, passwordHash },
    }),
  ),
);

// Demo boards are created once so restarts keep user edits.
if ((await prisma.board.count()) === 0) {
  const { IN_PROGRESS, DONE } = TaskStatus;
  await prisma.board.create({
    data: {
      name: 'Website relaunch',
      ownerId: alice.id,
      tasks: {
        create: [
          { title: 'Draft homepage copy', status: DONE, assigneeId: carol.id },
          {
            title: 'Pick a new type scale',
            description: 'Compare two pairings at body and display sizes.',
            status: IN_PROGRESS,
            assigneeId: alice.id,
            comments: {
              create: [
                {
                  body: 'Leaning towards the humanist sans.',
                  authorId: carol.id,
                },
                {
                  body: 'Agreed, it reads better at small sizes.',
                  authorId: alice.id,
                },
              ],
            },
          },
          { title: 'Set up redirects from old URLs', assigneeId: bob.id },
          { title: 'Write launch announcement' },
        ],
      },
    },
  });
  await prisma.board.create({
    data: {
      name: 'Mobile app beta',
      ownerId: bob.id,
      tasks: {
        create: [
          {
            title: 'Invite 20 beta testers',
            status: IN_PROGRESS,
            assigneeId: bob.id,
          },
          {
            title: 'Fix login on slow networks',
            description: 'Requests time out after 10s on 3G.',
            assigneeId: alice.id,
          },
          { title: 'App Store screenshots', assigneeId: carol.id },
        ],
      },
    },
  });
}

await prisma.$disconnect();
console.log(`Seeded ${users.length} users (password: ${DEMO_PASSWORD})`);
