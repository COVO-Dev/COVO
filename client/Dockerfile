# Client (Next.js) multi-stage Dockerfile

# Build stage
FROM node:20-alpine3.2 AS builder
WORKDIR /app

# Copy package manifest and yarn lock for proper caching
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --non-interactive

# Copy source and build
COPY . .
RUN yarn build

# Production stage
FROM node:20-alpine3.2 AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy package manifest and lock, install production deps only
COPY package.json yarn.lock ./
RUN yarn install --production --frozen-lockfile --non-interactive

# Copy built next app and public assets from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/package.json ./

EXPOSE 3000

# Use next start which serves the production build
CMD ["yarn", "start"]
