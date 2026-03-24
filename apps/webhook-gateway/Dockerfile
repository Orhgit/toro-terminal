# ── Stage 1: Install & Build ────────────────────────────────
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace root files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy only the packages this app depends on
COPY apps/webhook-gateway/package.json ./apps/webhook-gateway/
COPY packages/database/package.json    ./packages/database/
COPY packages/ai-core/package.json     ./packages/ai-core/
COPY packages/typescript-config/        ./packages/typescript-config/

# Install deps
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/database/   ./packages/database/
COPY packages/ai-core/    ./packages/ai-core/
COPY apps/webhook-gateway/ ./apps/webhook-gateway/

# Build
RUN pnpm turbo build --filter=@repo/webhook-gateway

# ── Stage 2: Production ────────────────────────────────────
FROM node:22-alpine AS runner

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

ENV NODE_ENV=production

# Copy built output + prod dependencies
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/apps/webhook-gateway/package.json ./apps/webhook-gateway/
COPY --from=builder /app/apps/webhook-gateway/dist/        ./apps/webhook-gateway/dist/
COPY --from=builder /app/packages/database/                ./packages/database/
COPY --from=builder /app/packages/ai-core/                 ./packages/ai-core/
COPY --from=builder /app/packages/typescript-config/        ./packages/typescript-config/
COPY --from=builder /app/node_modules/                     ./node_modules/
COPY --from=builder /app/apps/webhook-gateway/node_modules/ ./apps/webhook-gateway/node_modules/

EXPOSE 4002

CMD ["node", "apps/webhook-gateway/dist/server.js"]
