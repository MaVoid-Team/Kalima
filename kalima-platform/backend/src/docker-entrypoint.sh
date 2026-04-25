#!/bin/sh
set -e

echo "🔄 Waiting for database to be ready..."

# 1. Wait for the database to accept connections (retry up to 30 times)
attempt=0
until npx prisma migrate deploy 2>/dev/null; do
  attempt=$((attempt + 1))

  # Check if it's a P3009 (failed migration) error — resolve it automatically
  output=$(npx prisma migrate deploy 2>&1 || true)
  if echo "$output" | grep -q "P3009"; then
    echo "⚠️  Detected failed migration(s). Auto-resolving..."

    # Extract the failed migration name from the error output
    # The error message contains: The `<migration_name>` migration started at ...
    failed_migration=$(echo "$output" | grep -oP 'The `\K[^`]+' | head -1)

    if [ -n "$failed_migration" ]; then
      echo "📌 Marking migration as applied: $failed_migration"
      npx prisma migrate resolve --applied "$failed_migration" 2>&1 || true

      # Retry deploy after resolving
      echo "🔄 Retrying prisma migrate deploy..."
      if npx prisma migrate deploy 2>&1; then
        echo "✅ Migrations applied successfully after resolving failed migration."
        break
      fi
    fi
  fi

  if [ $attempt -ge 30 ]; then
    echo "❌ Prisma migrate failed after 30 attempts"
    exit 1
  fi

  echo "⏳ Waiting for database... (attempt $attempt/30)"
  sleep 2
done

echo "✅ Database migrations complete. Starting server..."
exec node dist/src/server.js
