import bcrypt from 'bcryptjs';
import { PrismaService } from './prisma/prisma.service.js';

const DEMO_PASSWORD = 'password123';
const users = [
  { email: 'alice@example.com', name: 'Alice Santos' },
  { email: 'bob@example.com', name: 'Bob Reyes' },
  { email: 'carol@example.com', name: 'Carol Cruz' },
];

const prisma = new PrismaService();
const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
for (const user of users) {
  await prisma.user.upsert({
    where: { email: user.email },
    update: {},
    create: { ...user, passwordHash },
  });
}
await prisma.$disconnect();
console.log(`Seeded ${users.length} users (password: ${DEMO_PASSWORD})`);
