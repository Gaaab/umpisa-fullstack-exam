FROM node:24-alpine
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /app

# Prisma's postinstall generate needs the schema and config before install.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml prisma.config.ts ./
COPY prisma ./prisma
COPY src/config.ts ./src/config.ts
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

ENV NODE_ENV=production
EXPOSE 4000
CMD ["sh", "-c", "pnpm prisma migrate deploy && node dist/seed.js && node dist/main.js"]
