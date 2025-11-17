# ============================================
# Multi-stage Dockerfile for Task Service
# ============================================
FROM node:20-alpine AS base

# Install build dependencies
RUN apk add --no-cache openssl

WORKDIR /services

# ============================================
# Build shared module
# ============================================
FROM base AS shared-builder
WORKDIR /services/shared

# Copy shared module
COPY ../shared/package*.json ./
RUN npm ci --only=production

COPY ../shared/ ./

# Build shared module using Docker-specific tsconfig
RUN npx tsc --project tsconfig.docker.json

# ============================================
# Build task-service
# ============================================
FROM base AS builder
WORKDIR /services/task-service

# Copy shared build output
COPY --from=shared-builder /services/shared /services/shared

# Copy task-service package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy task-service source
COPY . .

# Generate Prisma Client for Alpine Linux
RUN npx prisma generate

# Build task-service
RUN npm run build

# ============================================
# Production stage
# ============================================
FROM node:20-alpine AS production

# Install runtime dependencies
RUN apk add --no-cache openssl

WORKDIR /services/task-service

# Copy shared module
COPY --from=shared-builder /services/shared /services/shared

# Copy task-service dependencies and build
COPY --from=builder /services/task-service/node_modules ./node_modules
COPY --from=builder /services/task-service/dist ./dist
COPY --from=builder /services/task-service/prisma ./prisma
COPY --from=builder /services/task-service/package*.json ./

# Regenerate Prisma for Alpine (just to be safe)
RUN npx prisma generate

# Expose port
EXPOSE 4000

# Start server
CMD ["npm", "run", "start"]
