#!/bin/bash
# Docker build script for Universal Content Discovery MVP
# Production-ready build with version tagging for hackathon demo

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}🐳 Universal Content Discovery - Docker Build Script${NC}\n"

# Get version from package.json
VERSION=$(node -p "require('$PROJECT_DIR/package.json').version")
echo -e "${GREEN}📦 Version: ${VERSION}${NC}"

# Build timestamp
BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
echo -e "${GREEN}🕐 Build Date: ${BUILD_DATE}${NC}"

# Git commit hash (if available)
if git rev-parse --git-dir > /dev/null 2>&1; then
    GIT_COMMIT=$(git rev-parse --short HEAD)
    echo -e "${GREEN}🔖 Git Commit: ${GIT_COMMIT}${NC}"
else
    GIT_COMMIT="unknown"
    echo -e "${YELLOW}⚠️  Not a git repository${NC}"
fi

# Image name
IMAGE_NAME="universal-content-discovery"
REGISTRY="${DOCKER_REGISTRY:-}"

# Tags
TAGS=(
    "${VERSION}"
    "latest"
    "${VERSION}-${GIT_COMMIT}"
    "hackathon-demo"
)

# Build arguments
BUILD_ARGS=(
    "--build-arg VERSION=${VERSION}"
    "--build-arg BUILD_DATE=${BUILD_DATE}"
    "--build-arg GIT_COMMIT=${GIT_COMMIT}"
)

echo -e "\n${BLUE}🏗️  Building Docker image...${NC}"

# Build the image
docker build \
    -t "${IMAGE_NAME}:${VERSION}" \
    -t "${IMAGE_NAME}:latest" \
    -t "${IMAGE_NAME}:${VERSION}-${GIT_COMMIT}" \
    -t "${IMAGE_NAME}:hackathon-demo" \
    "${BUILD_ARGS[@]}" \
    -f "${PROJECT_DIR}/Dockerfile" \
    "${PROJECT_DIR}"

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ Build successful!${NC}"
    echo -e "\n${BLUE}🏷️  Tagged images:${NC}"
    for tag in "${TAGS[@]}"; do
        echo -e "  ${GREEN}→${NC} ${IMAGE_NAME}:${tag}"
    done
else
    echo -e "\n${RED}❌ Build failed!${NC}"
    exit 1
fi

# Display image size
echo -e "\n${BLUE}📊 Image size:${NC}"
docker images "${IMAGE_NAME}:latest" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# Verify image
echo -e "\n${BLUE}🔍 Verifying image...${NC}"
docker run --rm "${IMAGE_NAME}:latest" node --version
docker run --rm "${IMAGE_NAME}:latest" node -e "console.log('✅ Image verification successful')"

# Optional: Push to registry
if [ -n "${REGISTRY}" ] && [ "${PUSH_IMAGE}" = "true" ]; then
    echo -e "\n${BLUE}📤 Pushing to registry: ${REGISTRY}${NC}"

    for tag in "${TAGS[@]}"; do
        FULL_TAG="${REGISTRY}/${IMAGE_NAME}:${tag}"
        echo -e "${YELLOW}Pushing ${FULL_TAG}...${NC}"
        docker tag "${IMAGE_NAME}:${tag}" "${FULL_TAG}"
        docker push "${FULL_TAG}"
    done

    echo -e "\n${GREEN}✅ Push complete!${NC}"
fi

echo -e "\n${GREEN}🎉 Docker build complete!${NC}"
echo -e "\n${BLUE}💡 Quick Start:${NC}"
echo -e "  ${YELLOW}# Run with docker-compose${NC}"
echo -e "  docker-compose up -d"
echo -e ""
echo -e "  ${YELLOW}# Or run standalone${NC}"
echo -e "  docker run -p 3000:3000 --env-file .env ${IMAGE_NAME}:latest"
echo -e ""
echo -e "  ${YELLOW}# View logs${NC}"
echo -e "  docker-compose logs -f"
echo -e ""
echo -e "  ${YELLOW}# Health check${NC}"
echo -e "  curl http://localhost:3000/api/health"
echo -e ""
