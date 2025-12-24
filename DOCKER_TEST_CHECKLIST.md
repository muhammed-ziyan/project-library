# Docker Setup Testing Checklist

This checklist helps verify that the Docker setup is working correctly.

## Pre-Build Checklist

- [ ] Docker is installed and running (`docker --version`)
- [ ] Docker Compose is installed (`docker-compose --version`)
- [ ] All required files exist:
  - [ ] `Dockerfile`
  - [ ] `docker-compose.yml`
  - [ ] `.dockerignore`
  - [ ] `start.sh`
  - [ ] `DOCKER.md`

## Build Process

### Step 1: Build the Docker Image

```bash
docker-compose build
```

**Expected Output**:
- ✅ All 4 stages complete successfully (deps, backend-builder, frontend-builder, runner)
- ✅ No errors during npm install
- ✅ Prisma client generates successfully
- ✅ Backend compiles without TypeScript errors
- ✅ Frontend builds successfully with standalone output
- ✅ Final image is created

**Troubleshooting**:
- If build fails at npm install: Check package.json files are present
- If Prisma generation fails: Check backend/prisma/schema.prisma exists
- If TypeScript compilation fails: Check backend/tsconfig.json configuration
- If Next.js build fails: Verify frontend/next.config.js has `output: 'standalone'`

### Step 2: Start the Container

```bash
docker-compose up
```

**Expected Output**:
- ✅ Container starts successfully
- ✅ Database setup completes (`prisma db push`)
- ✅ Backend server starts on port 3000
- ✅ Frontend server starts on port 5000
- ✅ No error messages in logs

**Check Logs For**:
- `📊 Setting up database...`
- `🔧 Generating Prisma client...`
- `🔌 Starting backend server on port 3000...`
- `✅ Backend is ready!`
- `🎨 Starting frontend server on port 5000...`
- `✅ Project Library is running!`

## Runtime Tests

### Test 1: Backend Health Check

```bash
curl http://localhost:3000/health
```

**Expected Response**:
```json
{"status":"ok"}
```

**Alternative (Browser)**:
- Open http://localhost:3000/health
- Should see JSON response with status "ok"

### Test 2: Frontend Access

**Browser Test**:
- Open http://localhost:5000
- ✅ Page loads without errors
- ✅ UI renders correctly
- ✅ No console errors (F12 Developer Tools)

### Test 3: API Communication

**Browser Test**:
- Navigate to browse page or projects page
- ✅ Projects load from backend API
- ✅ No CORS errors in console
- ✅ Data displays correctly

### Test 4: Database Persistence

```bash
# Stop the container
docker-compose down

# Start again
docker-compose up
```

**Expected**:
- ✅ Database file persists at `backend/prisma/dev.db`
- ✅ No data loss after restart
- ✅ Previous data is still available

### Test 5: File Storage Persistence

**Test Process**:
1. Upload a project or file through the admin interface
2. Stop the container: `docker-compose down`
3. Restart: `docker-compose up`
4. ✅ Uploaded files still exist in `backend/storage/`
5. ✅ Files are accessible through the application

### Test 6: Container Health Check

```bash
docker ps
```

**Expected**:
- ✅ Container shows as "healthy" in STATUS column
- ✅ Health check passes after startup period (~40 seconds)

```bash
# Detailed health status
docker inspect project-library | grep -A 5 Health
```

### Test 7: Graceful Shutdown

```bash
# Send SIGTERM to container
docker-compose stop
```

**Expected**:
- ✅ Shutdown message appears: "🛑 Shutting down gracefully..."
- ✅ Both services stop cleanly
- ✅ No error messages during shutdown
- ✅ Container exits with code 0

## Volume Tests

### Test 8: Volume Mounts

```bash
# Check volumes are mounted
docker inspect project-library | grep -A 10 Mounts
```

**Expected Mounts**:
- ✅ `./backend/prisma` → `/app/backend/prisma`
- ✅ `./backend/storage` → `/app/backend/storage`

### Test 9: Data Written to Host

```bash
# Check database exists on host
ls -lh backend/prisma/dev.db

# Check storage directory exists
ls -lh backend/storage/
```

**Expected**:
- ✅ `dev.db` file exists and has size > 0
- ✅ Storage directory exists

## Environment Variables

### Test 10: Environment Configuration

```bash
# Check environment variables in container
docker-compose exec app env | grep -E "DATABASE_URL|JWT_SECRET|NEXT_PUBLIC"
```

**Expected**:
- ✅ `DATABASE_URL=file:/app/backend/prisma/dev.db`
- ✅ `JWT_SECRET` is set (not default if .env file used)
- ✅ `NEXT_PUBLIC_API_URL=http://localhost:3000`

## Advanced Tests

### Test 11: Admin User Creation

```bash
# Access container shell
docker-compose exec app sh

# Navigate to backend
cd /app/backend

# Run seed script
npx tsx src/scripts/seed-admin.ts
```

**Expected**:
- ✅ Admin user created successfully
- ✅ Can login with admin credentials

### Test 12: Prisma Studio (Optional)

```bash
docker-compose exec app sh
cd /app/backend
npx prisma studio
```

**Expected**:
- ✅ Prisma Studio starts
- ✅ Can browse database tables
- ✅ Data is visible and correct

### Test 13: Resource Usage

```bash
docker stats project-library
```

**Monitor**:
- CPU usage (should be reasonable, < 50% under load)
- Memory usage (depends on data, typically < 500MB idle)
- Network I/O

### Test 14: Logs

```bash
# View logs
docker-compose logs -f

# Check for errors
docker-compose logs | grep -i error
```

**Expected**:
- ✅ No critical errors
- ✅ Application logs are visible
- ✅ Request logs show when accessing application

## Production Readiness

### Test 15: Security

```bash
# Check user running in container
docker-compose exec app whoami
```

**Expected**:
- ✅ Output is `appuser` (not root)

```bash
# Check file permissions
docker-compose exec app ls -la /app/backend/prisma
```

**Expected**:
- ✅ Files owned by `appuser:nodejs`

### Test 16: Environment Secrets

```bash
# Verify secrets are not hardcoded
docker-compose exec app env | grep SECRET
```

**Production Checklist**:
- [ ] JWT_SECRET is changed from default
- [ ] ADMIN_KEY is changed from default
- [ ] Secrets are set via .env file or environment
- [ ] .env file is in .gitignore

## Cleanup

### After Testing

```bash
# Stop and remove containers
docker-compose down

# Remove volumes (WARNING: deletes data)
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Complete cleanup
docker-compose down -v --rmi all
docker system prune -f
```

## Common Issues and Solutions

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| Port already in use | Another service on 3000/5000 | Change ports in docker-compose.yml |
| Build fails | Network issues | Check internet connection, retry build |
| Permission denied | Volume mount permissions | Check host directory permissions |
| Database locked | Multiple instances | Ensure only one container running |
| Health check fails | Backend not starting | Check logs: `docker-compose logs` |
| Frontend can't reach backend | Network config | Verify NEXT_PUBLIC_API_URL |

## Success Criteria

All tests should pass:
- [x] Docker image builds successfully
- [x] Container starts without errors
- [x] Backend health check passes
- [x] Frontend is accessible
- [x] API communication works
- [x] Database persists across restarts
- [x] File storage persists
- [x] Health checks pass
- [x] Graceful shutdown works
- [x] Runs as non-root user
- [x] Environment variables configured correctly

---

**Test Status**: Ready for testing

**Last Updated**: December 22, 2025




