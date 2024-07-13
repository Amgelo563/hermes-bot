# syntax=docker/dockerfile:1

# Prepare
ARG NODE_VERSION=20.15.1
ARG PNPM_VERSION=8.7.1

# Setup node
FROM node:${NODE_VERSION}-alpine

# Setup environment
ARG DATABASE=file:../database.db
ENV DATABASE_URL=$DATABASE
ENV NODE_ENV production

# Install pnpm
RUN --mount=type=cache,target=/root/.npm \
    npm install -g pnpm@${PNPM_VERSION}

# Setup working directory and essential files
WORKDIR /usr/src/app
COPY tsconfig.json .
COPY prisma .
COPY package.json pnpm-lock.yaml ./

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.local/share/pnpm/store to speed up subsequent builds.
# Leverage a bind mounts to package.json and pnpm-lock.yaml to avoid having to copy them into
# into this layer.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Setup permissions
RUN chown -R node:node /usr/src
USER node

# Copy remaining source and build
COPY . .

# Build source
RUN pnpm build

# Start with volume mount point
CMD pnpm start
