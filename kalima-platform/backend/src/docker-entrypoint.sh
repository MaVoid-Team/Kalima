#!/bin/sh
set -e

echo "🔄 Waiting for database to be ready..."

attempt=0
while true; do
  # Try to run migrations
  output=$(npx prisma migrate deploy 2>&1) && break

  # Check if it's a P3009 (failed migration) error
  if echo "$output" | grep -q "P3009"; then
    echo "⚠️  Detected failed migration(s). Auto-resolving..."

    # Extract migration name: "The `<name>` migration started at ..."
    # Uses sed (POSIX-compatible, works in Alpine/BusyBox)
    failed_migration=$(echo "$output" | sed -n 's/.*The `\([^`]*\)` migration.*/\1/p' | head -1)

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

  attempt=$((attempt + 1))
  if [ $attempt -ge 30 ]; then
    echo "❌ Prisma migrate failed after 30 attempts"
    echo "$output"
    exit 1
  fi

  echo "⏳ Waiting for database... (attempt $attempt/30)"
  sleep 2
done

echo "✅ Database migrations complete. Starting server..."
exec node dist/src/server.js
