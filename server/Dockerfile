# Server (TypeScript Node) multi-stage Dockerfile

# Builder stage: install deps and compile TypeScript to build/
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# Copy package files and tsconfig
COPY package*.json tsconfig.json ./

# Install all deps (dev + prod) for build
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Production stage: install only production deps and copy compiled output
FROM node:20-alpine AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production

# Copy package manifest and install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled build output from builder
COPY --from=builder /usr/src/app/build ./build

# Copy any runtime files required (example client_secret.json)
# If you rely on other files in src at runtime, adjust accordingly
COPY --from=builder /usr/src/app/src/client_secret.json ./src/client_secret.json

EXPOSE 8000

# Run the compiled server
CMD ["node", "build/index.js"]
