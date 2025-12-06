# Docker Quick Start - 30 Seconds to Demo

## One-Command Deploy

```bash
npm run docker:prod
```

Then open: **http://localhost:3000**

## What This Does

1. Builds optimized Docker image (~150MB)
2. Tags with version and git hash
3. Starts container with docker-compose
4. Runs health checks
5. Makes app available on port 3000

## Files Created

✅ **Dockerfile** - Multi-stage production build
✅ **docker-compose.yml** - Service orchestration
✅ **.dockerignore** - Build optimization
✅ **scripts/docker-build.sh** - Automated build
✅ **package.json** - Docker scripts
✅ **logs/** - Log directory

## Docker Commands

| Command | What It Does |
|---------|--------------|
| `npm run docker:build` | Build image |
| `npm run docker:run` | Start app |
| `npm run docker:stop` | Stop app |
| `npm run docker:logs` | View logs |
| `npm run docker:restart` | Restart |
| `npm run docker:clean` | Full cleanup |
| `npm run docker:prod` | **Build + Run** |

## Pre-Flight Checklist

Before running, make sure:

1. **Docker is running**
   ```bash
   docker --version
   docker-compose --version
   ```

2. **Environment file exists**
   ```bash
   cp .env.example .env
   # Add your API keys to .env
   ```

3. **Port 3000 is available**
   ```bash
   lsof -i :3000
   ```

## Health Check

After starting:

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "mcpConnected": true,
  "timestamp": "2025-12-06T15:00:00.000Z"
}
```

## Troubleshooting

### Port in use?
```bash
# Change port in .env
PORT=3001
```

### Container won't start?
```bash
# Check logs
npm run docker:logs

# Rebuild
npm run docker:clean && npm run docker:prod
```

### Need to rebuild?
```bash
npm run docker:stop
npm run docker:build
npm run docker:run
```

## Full Documentation

- **Detailed Guide**: `/home/evafive/agentic-pancakes/DEPLOYMENT.md`
- **Docker Docs**: `/home/evafive/agentic-pancakes/docs/DOCKER.md`

---

**You're ready for the hackathon demo!** 🎉
