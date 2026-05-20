# Multi-stage build for Next.js web client in a pnpm monorepo
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

COPY apps/web ./apps/web
WORKDIR /app/apps/web
ARG NEXT_PUBLIC_API_URL="http://localhost:4000/api/v1"
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN pnpm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./

RUN pnpm install --prod --frozen-lockfile

WORKDIR /app/apps/web
EXPOSE 3000
CMD ["pnpm", "start"]
