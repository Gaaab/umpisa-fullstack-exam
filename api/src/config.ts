// Optional local overrides; real env vars (Docker, CI) always win.
try {
  process.loadEnvFile();
} catch {
  // No .env file: use the defaults below.
}

// Defaults match docker-compose so the app runs without a .env file.
export const config = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl:
    process.env.DATABASE_URL ??
    'postgresql://postgres:postgres@localhost:5432/taskboard',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-only-secret',
};
