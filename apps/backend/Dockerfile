# Multi-stage build for NestJS backend in a pnpm monorepo
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/web/package.json ./apps/web/

RUN pnpm install --frozen-lockfile

COPY apps/backend ./apps/backend
WORKDIR /app/apps/backend
RUN npx prisma generate
RUN pnpm run build

FROM base AS runner
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/backend/package.json ./apps/backend/
RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma
COPY --from=builder /app/apps/backend/node_modules/.prisma ./apps/backend/node_modules/.prisma

WORKDIR /app/apps/backend
EXPOSE 4000
ENV NODE_ENV=production
CMD ["node", "dist/main"]
