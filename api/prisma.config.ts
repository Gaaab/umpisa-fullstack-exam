import { defineConfig } from 'prisma/config';
import { config } from './src/config.js';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'node dist/seed.js',
  },
  datasource: {
    url: config.databaseUrl,
  },
});
