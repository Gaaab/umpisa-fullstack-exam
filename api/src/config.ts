// Defaults match docker-compose so the app runs without a .env file.
export const config = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl:
    process.env.DATABASE_URL ??
    'postgresql://postgres:postgres@localhost:5432/taskboard',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-only-secret',
};
