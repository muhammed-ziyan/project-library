# Docker Setup Guide

This guide explains how to run the Project Library using Docker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (version 20.10 or higher)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0 or higher)

## Quick Start

1. **Clone the repository** (if you haven't already)
   ```bash
   git clone <repository-url>
   cd project-library
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update the secrets:
   - `JWT_SECRET`: Used for JWT token signing
   - `ADMIN_KEY`: Used for admin authentication

3. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:5000
   - Backend API: http://localhost:3000
   - Health check: http://localhost:3000/health

## Docker Commands

### Build the image
```bash
docker-compose build
```

### Start the services
```bash
docker-compose up
```

### Start in detached mode (background)
```bash
docker-compose up -d
```

### Stop the services
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f
```

### Rebuild and restart
```bash
docker-compose up --build
```

### Remove all containers, volumes, and images
```bash
docker-compose down -v --rmi all
```

## Data Persistence

The following data is persisted using Docker volumes:

- **SQLite Database**: `./backend/prisma/dev.db`
  - Contains all user data, projects, enrollments, and submissions
  
- **File Storage**: `./backend/storage/`
  - Contains uploaded project files and user submissions

These directories are mounted as volumes, so data persists even when containers are stopped or removed.

## Database Management

### Reset the database
To reset the database, stop the containers and delete the database file:

```bash
docker-compose down
rm backend/prisma/dev.db
docker-compose up
```

### Run database migrations
The startup script automatically runs `prisma db push` to sync the schema. If you need to run migrations manually:

```bash
docker-compose exec app sh
cd /app/backend
npx prisma migrate dev
```

### Access Prisma Studio
To inspect the database with Prisma Studio:

```bash
docker-compose exec app sh
cd /app/backend
npx prisma studio
```

## Seeding Data

To seed the database with an admin user:

```bash
docker-compose exec app sh
cd /app/backend
npx tsx src/scripts/seed-admin.ts
```

## Troubleshooting

### Port already in use
If ports 3000 or 5000 are already in use, you can change them in `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # Changed from 3000:3000
  - "5001:5000"  # Changed from 5000:5000
```

### Container won't start
Check the logs:
```bash
docker-compose logs -f
```

### Permission issues
If you encounter permission issues with volumes, ensure the directories exist and have proper permissions:

```bash
mkdir -p backend/prisma backend/storage
chmod -R 755 backend/prisma backend/storage
```

### Clean rebuild
If you're experiencing issues, try a clean rebuild:

```bash
docker-compose down -v
docker system prune -f
docker-compose up --build
```

## Production Deployment

For production deployment, make sure to:

1. **Update secrets** in `.env`:
   - Use strong, random values for `JWT_SECRET` and `ADMIN_KEY`
   - Never commit `.env` to version control

2. **Use PostgreSQL** instead of SQLite:
   - Update `backend/prisma/schema.prisma` datasource
   - Update `DATABASE_URL` environment variable
   - Add PostgreSQL service to `docker-compose.yml`

3. **Enable HTTPS**:
   - Use a reverse proxy (nginx, Traefik, Caddy)
   - Configure SSL certificates (Let's Encrypt recommended)

4. **Set resource limits**:
   ```yaml
   services:
     app:
       deploy:
         resources:
           limits:
             cpus: '2'
             memory: 2G
   ```

5. **Configure backups**:
   - Regular database backups
   - File storage backups
   - Use proper backup strategies for SQLite or PostgreSQL

## Architecture

The Docker setup uses a multi-stage build:

1. **deps**: Installs all npm dependencies
2. **backend-builder**: Builds the Fastify backend
3. **frontend-builder**: Builds the Next.js frontend (standalone)
4. **runner**: Final image with both services running

Both frontend and backend run in the same container, managed by the `start.sh` script.

## Development vs Production

This Docker setup is suitable for both development and production:

- **Development**: Use `docker-compose up` with volume mounts for live code changes
- **Production**: Build once, deploy anywhere with proper environment configuration

For local development without Docker, see the main [README.md](README.md).


