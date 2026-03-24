# ---- Build Stage ----
FROM node:current-alpine3.23 AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --force

# Copy TypeScript config and source
COPY tsconfig.json ./
COPY prisma.config.ts ./
COPY src/ ./src/

# Generate Prisma client
RUN npx prisma generate

# Compile TypeScript
RUN npm run build

# ---- Production Stage ----
FROM node:current-alpine3.23 AS production

WORKDIR /app

# Copy node_modules from builder — keeps the Prisma CLI available for migrations
COPY --from=builder /app/node_modules ./node_modules

# Copy compiled output
COPY --from=builder /app/dist ./dist

# Copy Prisma config + migrations so `prisma migrate deploy` can resolve them at runtime
COPY prisma.config.ts ./
COPY src/apps/store-api/prisma/schema.prisma ./src/apps/store-api/prisma/schema.prisma
COPY src/apps/store-api/prisma/migrations ./src/apps/store-api/prisma/migrations

EXPOSE 5000

# Retry migrations while database boots, then start server
CMD ["sh", "-c", "attempt=0; until npx prisma migrate deploy; do attempt=$((attempt+1)); if [ $attempt -ge 30 ]; then echo 'Prisma migrate failed after 30 attempts'; exit 1; fi; echo 'Waiting for database...'; sleep 2; done; node dist/src/server.js"]
