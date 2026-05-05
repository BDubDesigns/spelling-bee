# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (for Docker layer caching)
COPY package.json package-lock.json turbo.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/server/package.json ./packages/server/
COPY packages/client/package.json ./packages/client/

# Install all dependencies (including dev)
RUN npm ci

# Copy source code
COPY tsconfig.base.json ./
COPY packages/ ./packages/

# Build all packages
RUN npm run build

# Prune dev dependencies after build
RUN npm prune --omit=dev

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Copy built application
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/server/package.json ./packages/server/
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/server/src/data ./packages/server/src/data
COPY --from=builder /app/packages/client/dist ./packages/client/dist

# Expose port
EXPOSE 3000

# Environment
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the server
CMD ["node", "packages/server/dist/index.js"]
