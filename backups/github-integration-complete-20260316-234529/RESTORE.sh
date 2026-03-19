#!/bin/bash
# Restore Script for StudyLens
# Usage: ./RESTORE.sh

BACKUP_DIR="/home/z/my-project/backups/github-integration-complete-20260316-234529"
PROJECT_DIR="/home/z/my-project"

echo "Restoring StudyLens from backup..."

# Restore environment variables
cp "$BACKUP_DIR/env.backup" "$PROJECT_DIR/.env"
echo "✅ Restored .env"

# Restore Prisma schema
cp "$BACKUP_DIR/schema.prisma" "$PROJECT_DIR/prisma/schema.prisma"
echo "✅ Restored schema.prisma"

# Restore external APIs
cp "$BACKUP_DIR/external-apis.ts" "$PROJECT_DIR/src/lib/external-apis.ts"
echo "✅ Restored external-apis.ts"

# Restore constants
cp "$BACKUP_DIR/constants.ts" "$PROJECT_DIR/src/lib/constants.ts"
echo "✅ Restored constants.ts"

# Restore API route
cp "$BACKUP_DIR/resources-route.ts" "$PROJECT_DIR/src/app/api/resources/route.ts"
echo "✅ Restored resources route"

# Restore browse page
cp "$BACKUP_DIR/browse-page.tsx" "$PROJECT_DIR/src/app/browse/page.tsx"
echo "✅ Restored browse page"

# Restore database
cp "$BACKUP_DIR/database.backup" "$PROJECT_DIR/db/custom.db"
echo "✅ Restored database"

# Regenerate Prisma client
cd "$PROJECT_DIR"
bun run db:push
echo "✅ Regenerated Prisma client"

echo ""
echo "🎉 Restore complete! Restart the dev server to apply changes."
