
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

# Copy node_modules from builder to keep Prisma CLI available for migrations
COPY --from=builder /app/node_modules ./node_modules

# Copy compiled output
COPY --from=builder /app/dist ./dist

# Copy Prisma config and migrations for runtime migrate deploy
COPY prisma.config.ts ./
COPY src/apps/store-api/prisma/schema.prisma ./src/apps/store-api/prisma/schema.prisma
COPY src/apps/store-api/prisma/migrations ./src/apps/store-api/prisma/migrations

EXPOSE 5000

# Run pending migrations, then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/server.js"][root@Kalima backend]# cat Dockerfile 

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

# Copy node_modules from builder to keep Prisma CLI available for migrations
COPY --from=builder /app/node_modules ./node_modules

# Copy compiled output
COPY --from=builder /app/dist ./dist

# Copy Prisma config and migrations for runtime migrate deploy
COPY prisma.config.ts ./
COPY src/apps/store-api/prisma/schema.prisma ./src/apps/store-api/prisma/schema.prisma
COPY src/apps/store-api/prisma/migrations ./src/apps/store-api/prisma/migrations

EXPOSE 5000

# Run pending migrations, then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/server.js"]