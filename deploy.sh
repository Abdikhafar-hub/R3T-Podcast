#!/bin/bash

# Deployment script that preserves data files during git pull
# This ensures your CMS data and videos don't get reset

set -e  # Exit on error

echo "🚀 Starting deployment..."

# Define paths
DATA_DIR="data"
BACKUP_DIR=".data-backup"
CMS_FILE="$DATA_DIR/cms-data.json"
VIDEOS_FILE="$DATA_DIR/videos.json"
CMS_EXAMPLE="$DATA_DIR/cms-data.json.example"
VIDEOS_EXAMPLE="$DATA_DIR/videos.json.example"

# Step 1: Backup existing data files (if they exist)
echo "📦 Backing up data files..."
mkdir -p "$BACKUP_DIR"

if [ -f "$CMS_FILE" ]; then
  cp "$CMS_FILE" "$BACKUP_DIR/cms-data.json.backup"
  echo "  ✓ Backed up cms-data.json"
else
  echo "  ⚠ cms-data.json not found (will be created from example if needed)"
fi

if [ -f "$VIDEOS_FILE" ]; then
  cp "$VIDEOS_FILE" "$BACKUP_DIR/videos.json.backup"
  echo "  ✓ Backed up videos.json"
else
  echo "  ⚠ videos.json not found (will be created from example if needed)"
fi

# Step 2: Pull latest changes from GitHub
echo ""
echo "📥 Pulling latest changes from GitHub..."
git pull

# Step 3: Restore data files (preserve your production data)
echo ""
echo "🔄 Restoring data files..."

# Restore CMS data if backup exists, otherwise create from example
if [ -f "$BACKUP_DIR/cms-data.json.backup" ]; then
  cp "$BACKUP_DIR/cms-data.json.backup" "$CMS_FILE"
  echo "  ✓ Restored cms-data.json from backup"
elif [ -f "$CMS_EXAMPLE" ] && [ ! -f "$CMS_FILE" ]; then
  cp "$CMS_EXAMPLE" "$CMS_FILE"
  echo "  ✓ Created cms-data.json from example file"
fi

# Restore videos if backup exists, otherwise create from example
if [ -f "$BACKUP_DIR/videos.json.backup" ]; then
  cp "$BACKUP_DIR/videos.json.backup" "$VIDEOS_FILE"
  echo "  ✓ Restored videos.json from backup"
elif [ -f "$VIDEOS_EXAMPLE" ] && [ ! -f "$VIDEOS_FILE" ]; then
  cp "$VIDEOS_EXAMPLE" "$VIDEOS_FILE"
  echo "  ✓ Created videos.json from example file"
fi

# Step 4: Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Step 5: Build the application
echo ""
echo "🔨 Building application..."
npm run build

# Step 6: Restart the application (adjust based on your setup)
echo ""
echo "🔄 Restarting application..."
# Uncomment and modify based on your process manager:
# pm2 restart r3t-podcast
# systemctl restart r3t-podcast
# Or if using a different method, add it here

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Note: Your data files have been preserved:"
echo "   - $CMS_FILE"
echo "   - $VIDEOS_FILE"
echo ""
echo "💡 To manage content, use the admin panel at /admin"
