# Docker Setup Summary

This document summarizes the Docker setup that has been created for the Project Library application.

## Files Created

### 1. Dockerfile (Multi-stage Build)
**Location**: `./Dockerfile`

A production-ready multi-stage Dockerfile that:
- **Stage 1 (deps)**: Installs all npm dependencies for root, backend, and frontend
- **Stage 2 (backend-builder)**: Builds the Fastify backend, generates Prisma client, compiles TypeScript
- **Stage 3 (frontend-builder)**: Builds Next.js with standalone output for optimal Docker deployment
- **Stage 4 (runner)**: Creates minimal runtime image with both services

**Key Features**:
- Uses Node.js 18 Alpine for smaller image size
- Non-root user (appuser) for security
- dumb-init for proper signal handling
- Health check using Node.js
- Exposes ports 3000 (backend) and 5000 (frontend)

### 2. docker-compose.yml (Production)
**Location**: `./docker-compose.yml`

Production-ready Docker Compose configuration that:
- Builds the multi-stage Dockerfile
- Maps ports 3000 (backend API) and 5000 (frontend)
- Configures environment variables with sensible defaults
- Persists SQLite database via volume mount
- Persists file storage via volume mount
- Includes health check and auto-restart policy

**Volumes**:
- `./backend/prisma:/app/backend/prisma` - Database persistence
- `./backend/storage:/app/backend/storage` - File storage persistence

### 3. start.sh (Container Startup Script)
**Location**: `./start.sh`

Bash script that runs inside the container to:
- Initialize the database with Prisma (`db push`)
- Generate Prisma client if needed
- Start backend server in the background
- Wait for backend health check
- Start frontend server
- Handle graceful shutdown on SIGTERM/SIGINT

### 4. .dockerignore
**Location**: `./.dockerignore`

Optimizes Docker build by excluding:
- `node_modules` directories
- Build outputs (`.next`, `dist`)
- Database files (`*.db`)
- Git files
- IDE configuration
- Development files
- Environment files (for security)

### 5. docker-compose.dev.yml (Development)
**Location**: `./docker-compose.dev.yml`

Development-focused configuration with:
- Separate backend and frontend services
- Volume mounts for hot-reloading
- Named volumes for node_modules
- Development environment variables

**Note**: This requires `Dockerfile.dev` in backend and frontend directories (not included yet).

### 6. DOCKER.md (Documentation)
**Location**: `./docs/DOCKER.md`

Comprehensive guide covering:
- Quick start instructions
- Docker commands reference
- Data persistence explanation
- Database management
- Troubleshooting tips
- Production deployment best practices

### 7. README.md Updates
**Location**: `./README.md`

Added Docker installation section with:
- Quick start for Docker users
- Link to comprehensive DOCKER.md guide
- Added DOCKER.md to documentation list

## Usage

### Quick Start

```bash
# Clone and navigate to the project
cd project-library

# Create .env file with secrets
cp .env.example .env
# Edit .env and set JWT_SECRET and ADMIN_KEY

# Build and run
docker-compose up --build

# Access the application
# Frontend: http://localhost:5000
# Backend: http://localhost:3000
```

### Common Commands

```bash
# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose up --build

# Clean everything
docker-compose down -v --rmi all
```

## Architecture

```
┌─────────────────────────────────────────┐
│          Docker Container               │
│  ┌────────────────────────────────────┐ │
│  │       Frontend (Next.js)           │ │
│  │       Port: 5000                   │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │       Backend (Fastify)            │ │
│  │       Port: 3000                   │ │
│  └───────────┬────────────────────────┘ │
│              │                           │
│  ┌───────────▼────────────────────────┐ │
│  │     SQLite Database                │ │
│  │     (Volume: ./backend/prisma)     │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │     File Storage                   │ │
│  │     (Volume: ./backend/storage)    │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## Data Persistence

Data is persisted through Docker volumes:

1. **SQLite Database**: `./backend/prisma/dev.db`
   - All user data, projects, enrollments, submissions
   - Survives container restarts and rebuilds

2. **File Storage**: `./backend/storage/`
   - Uploaded project files
   - User submissions
   - Survives container restarts and rebuilds

## Environment Variables

The Docker setup uses these environment variables (configured in docker-compose.yml):

**Backend**:
- `DATABASE_URL` - SQLite database path
- `PORT` - Backend port (3000)
- `JWT_SECRET` - Secret for JWT token signing (CHANGE IN PRODUCTION)
- `ADMIN_KEY` - Admin authentication key (CHANGE IN PRODUCTION)
- `FRONTEND_URL` - Frontend URL for CORS
- `STORAGE_PATH` - Path for file storage

**Frontend**:
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_APP_NAME` - Application name
- `NEXT_PUBLIC_APP_DESCRIPTION` - Application description

## Security Considerations

1. **Non-root User**: Container runs as user `appuser` (UID 1001)
2. **Secrets**: JWT_SECRET and ADMIN_KEY should be changed for production
3. **Environment Files**: .env files are excluded from Docker build context
4. **Health Checks**: Automated health monitoring

## Next Steps

1. **Test the Setup**:
   ```bash
   docker-compose up --build
   ```

2. **Seed Admin User** (optional):
   ```bash
   docker-compose exec app sh
   cd /app/backend
   npx tsx src/scripts/seed-admin.ts
   ```

3. **Production Deployment**:
   - Update JWT_SECRET and ADMIN_KEY with strong random values
   - Consider using PostgreSQL instead of SQLite
   - Set up HTTPS with reverse proxy (nginx, Traefik, Caddy)
   - Configure backups for database and storage
   - Set resource limits in docker-compose.yml

4. **Development**:
   - For local development without Docker, use `npm run dev`
   - For Docker with hot-reloading, create Dockerfile.dev files

## Troubleshooting

See [DOCKER.md](./docs/DOCKER.md) for comprehensive troubleshooting guide.

Common issues:
- **Port conflicts**: Change ports in docker-compose.yml
- **Permission issues**: Ensure backend/prisma and backend/storage directories exist
- **Build failures**: Try `docker system prune -f` and rebuild

## Files Reference

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage build configuration |
| `docker-compose.yml` | Production orchestration |
| `docker-compose.dev.yml` | Development orchestration |
| `start.sh` | Container startup script |
| `.dockerignore` | Build context exclusions |
| `docs/DOCKER.md` | Comprehensive Docker guide |
| `.env.example` | Environment variable template |

---

**Status**: ✅ Docker setup complete and ready to use!

