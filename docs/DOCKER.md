# Docker Deployment Guide

Production-ready Docker deployment for Universal Content Discovery MVP.

## Quick Start

### 1. Build the Docker Image

```bash
npm run docker:build
```

This runs the `scripts/docker-build.sh` script which:
- Builds a multi-stage Docker image
- Tags with version, git commit, and "hackathon-demo"
- Verifies the image
- Shows image size and metadata

### 2. Run with Docker Compose

```bash
npm run docker:run
```

The application will be available at `http://localhost:3000`

### 3. View Logs

```bash
npm run docker:logs
```

### 4. Stop the Application

```bash
npm run docker:stop
```

## Available Docker Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `docker:build` | `bash scripts/docker-build.sh` | Build Docker image with version tagging |
| `docker:run` | `docker-compose up -d` | Start application in detached mode |
| `docker:stop` | `docker-compose down` | Stop and remove containers |
| `docker:logs` | `docker-compose logs -f` | Follow application logs |
| `docker:restart` | `docker-compose restart` | Restart the application |
| `docker:clean` | `docker-compose down -v && docker system prune -f` | Clean up volumes and unused resources |
| `docker:prod` | `npm run docker:build && npm run docker:run` | Build and run in one command |

## Docker Image Details

### Multi-Stage Build

The Dockerfile uses a multi-stage build for optimal image size:

1. **Builder Stage** (node:20-alpine)
   - Installs all dependencies (including devDependencies)
   - Builds TypeScript to JavaScript
   - ~500MB

2. **Production Stage** (node:20-alpine)
   - Only production dependencies
   - Compiled JavaScript code
   - Non-root user for security
   - ~150MB final image

### Security Features

- Non-root user (`nodejs:nodejs`)
- Minimal Alpine Linux base
- Only production dependencies
- Read-only data volumes
- Health checks enabled

### Image Tags

Each build creates multiple tags:
- `universal-content-discovery:latest` - Latest build
- `universal-content-discovery:1.0.0` - Version from package.json
- `universal-content-discovery:1.0.0-abc1234` - Version + git commit
- `universal-content-discovery:hackathon-demo` - Hackathon demo tag

## Docker Compose Configuration

### Services

- **universal-content-discovery**: Main application service
  - Port: 3000
  - Health checks: Every 30s
  - Auto-restart: unless-stopped
  - Resource limits: 2 CPU, 2GB RAM

### Volumes

```yaml
volumes:
  - ./data:/app/data:ro           # Read-only catalog data
  - ./logs:/app/logs              # Writable logs directory
  - ./agentdb.db:/app/agentdb.db  # Vector database
```

### Environment Variables

Set in `.env` file:

```bash
# API Keys
TMDB_API_KEY=your_tmdb_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# Application
PORT=3000
NODE_ENV=production
LOG_LEVEL=info

# Database
AGENTDB_PATH=./agentdb.db

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

## Health Checks

The application includes built-in health checks:

### Docker Health Check
```bash
docker inspect --format='{{.State.Health.Status}}' ucd-app
```

### Manual Health Check
```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
  "status": "ok",
  "mcpConnected": true,
  "timestamp": "2025-12-06T15:00:00.000Z"
}
```

## Production Deployment

### 1. Environment Setup

Create `.env` file from `.env.example`:
```bash
cp .env.example .env
# Edit .env with production values
```

### 2. Build Production Image

```bash
npm run docker:build
```

### 3. Run in Production

```bash
npm run docker:prod
```

### 4. Monitor Logs

```bash
npm run docker:logs
```

### 5. Health Monitoring

```bash
# Check container health
docker ps

# View health check logs
docker inspect ucd-app | jq '.[0].State.Health'

# Test endpoint
curl http://localhost:3000/api/health
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs

# Check specific service logs
docker-compose logs universal-content-discovery

# Inspect container
docker inspect ucd-app
```

### Permission Issues

```bash
# Fix permissions on volumes
chmod -R 755 ./data
chmod -R 777 ./logs
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port in .env
PORT=3001
```

### Database Issues

```bash
# Check database file permissions
ls -la agentdb.db

# Recreate database volume
docker-compose down -v
docker-compose up -d
```

## Resource Management

### View Resource Usage

```bash
docker stats ucd-app
```

### Modify Resource Limits

Edit `docker-compose.yml`:

```yaml
deploy:
  resources:
    limits:
      cpus: '4'      # Increase CPU limit
      memory: 4G     # Increase memory limit
```

### Clean Up Resources

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Full cleanup
npm run docker:clean
```

## Advanced Configuration

### Custom Registry Push

```bash
# Set registry and enable push
export DOCKER_REGISTRY=registry.example.com
export PUSH_IMAGE=true

npm run docker:build
```

### Multi-Platform Build

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t universal-content-discovery:latest \
  .
```

### Development Override

Create `docker-compose.override.yml`:

```yaml
version: '3.8'
services:
  universal-content-discovery:
    volumes:
      - ./src:/app/src
    command: npm run dev
```

## Performance Optimization

### Enable BuildKit

```bash
export DOCKER_BUILDKIT=1
npm run docker:build
```

### Layer Caching

The Dockerfile is optimized for layer caching:
1. Package files copied first
2. Dependencies installed (cached unless package.json changes)
3. Source code copied last (changes frequently)

### Image Size Optimization

- Multi-stage build: ~70% size reduction
- Alpine Linux base: Minimal footprint
- Production-only dependencies: ~40% reduction
- No devDependencies in final image

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Docker Build

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker image
        run: npm run docker:build
      - name: Test container
        run: |
          docker-compose up -d
          sleep 10
          curl http://localhost:3000/api/health
```

## Support

For issues or questions:
- Check logs: `npm run docker:logs`
- Health check: `curl http://localhost:3000/api/health`
- Container status: `docker ps -a`
- Resource usage: `docker stats`
