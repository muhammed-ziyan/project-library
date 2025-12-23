# Multi-stage Dockerfile for Project Library
# Builds both Frontend (Next.js) and Backend (Fastify)

# ========================================
# Stage 1: Base Dependencies
# ========================================
FROM node:18-alpine AS deps
WORKDIR /app

# Copy package files for all workspaces
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm ci --workspaces=false
RUN cd backend && npm ci
RUN cd frontend && npm ci

# ========================================
# Stage 2: Build Backend
# ========================================
FROM node:18-alpine AS backend-builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules

# Copy backend source
COPY backend ./backend

# Generate Prisma client and build
WORKDIR /app/backend
RUN npx prisma generate
RUN npm run build

# ========================================
# Stage 3: Build Frontend
# ========================================
FROM node:18-alpine AS frontend-builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules

# Copy frontend source
COPY frontend ./frontend

# Build Next.js with standalone output
WORKDIR /app/frontend
RUN npm run build

# ========================================
# Stage 4: Runtime
# ========================================
FROM node:18-alpine AS runner
WORKDIR /app

# Install dumb-init for proper signal handling and wget for health checks
RUN apk add --no-cache dumb-init wget

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser

# Copy backend built files
COPY --from=backend-builder --chown=appuser:nodejs /app/backend/dist ./backend/dist
COPY --from=backend-builder --chown=appuser:nodejs /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder --chown=appuser:nodejs /app/backend/prisma ./backend/prisma
COPY --from=backend-builder --chown=appuser:nodejs /app/backend/package.json ./backend/

# Copy frontend built files (standalone output)
COPY --from=frontend-builder --chown=appuser:nodejs /app/frontend/.next/standalone ./
COPY --from=frontend-builder --chown=appuser:nodejs /app/frontend/.next/static ./frontend/.next/static
COPY --from=frontend-builder --chown=appuser:nodejs /app/frontend/public ./frontend/public

# Create directories for storage and database
RUN mkdir -p /app/backend/storage/projects /app/backend/prisma
RUN chown -R appuser:nodejs /app/backend/storage /app/backend/prisma

# Copy startup script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh && chown appuser:nodejs /app/start.sh

# Switch to non-root user
USER appuser

# Expose ports
EXPOSE 3000 5000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL="file:/app/backend/prisma/dev.db"
ENV STORAGE_PATH="/app/backend/storage"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["/app/start.sh"]

