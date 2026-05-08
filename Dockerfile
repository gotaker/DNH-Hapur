# syntax=docker/dockerfile:1.7
# DNH Hapur — multi-stage image. Used identically in local Docker and on Railway.

ARG NODE_VERSION=22-alpine
ARG PNPM_VERSION=10.33.2

# ---------- Base ----------
FROM node:${NODE_VERSION} AS base
ARG PNPM_VERSION
ENV PNPM_HOME=/usr/local/share/pnpm \
    PATH=/usr/local/share/pnpm:$PATH \
    NEXT_TELEMETRY_DISABLED=1
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate \
    && apk add --no-cache libc6-compat
WORKDIR /app

# ---------- Dependencies (cached) ----------
# No --mount=type=cache here: Railway's Metal builder rejects unprefixed
# BuildKit cache mount ids. The normal layer cache (keyed on package.json
# + pnpm-lock.yaml) still gives us reproducibly fast rebuilds locally.
FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile || pnpm install

# ---------- Dev (used by docker-compose for `pnpm dev`) ----------
FROM base AS dev
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["pnpm", "dev"]

# ---------- Builder ----------
FROM base AS builder
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# ---------- Runner (prod image) ----------
FROM node:${NODE_VERSION} AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
WORKDIR /app

# Non-root for safety.
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Standalone output bundles the runtime; ship only what's required.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
