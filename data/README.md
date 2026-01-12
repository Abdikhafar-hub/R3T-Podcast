# CMS Data Files

## Important: Local vs Production Data

**The `cms-data.json` and `videos.json` files are now in `.gitignore`** to prevent local test changes from affecting production.

### 🛡️ Protection System

To prevent accidental loss of admin edits, we've implemented multiple protection layers:

1. **`.gitignore`**: Files are excluded from git tracking
2. **Pre-commit hook**: Prevents accidentally committing these files (blocks commits if staged)
3. **Deployment script**: Automatically backs up and restores data files during deployment
4. **API fallback**: If data files don't exist, the API falls back to example files

### ⚠️ If Files Are Accidentally Tracked

If `cms-data.json` or `videos.json` somehow get tracked in git, run:

```bash
# Remove from git tracking (keeps local file)
git rm --cached data/cms-data.json
git rm --cached data/videos.json

# Commit the removal
git commit -m "Remove CMS data files from git tracking"
```

The deployment script will also automatically detect and remove tracked files.

## Setup Instructions

### For Local Development:
1. Copy the example files to create your local data files:
   ```bash
   cp data/cms-data.json.example data/cms-data.json
   cp data/videos.json.example data/videos.json
   ```

2. Make your test changes locally - they won't be committed to git.

### For Production Deployment:
1. On your production server, ensure `cms-data.json` and `videos.json` exist.
2. You can either:
   - Copy from the example files: `cp data/cms-data.json.example data/cms-data.json`
   - Or upload your production data file directly to the server
   - Or use the admin panel at `/admin` to manage content

## Why This Setup?

- **Local testing**: You can test with dummy data/images without affecting production
- **Production safety**: Production data won't be overwritten by local changes
- **Version control**: Only the example/template files are tracked in git

## Managing Content

Use the admin panel at `/admin` to update content. Changes made through the admin panel will update the data files on the server where the admin panel is accessed.

## Deployment on Server

### ⚠️ Important: Preserving Data During Deployment

Since `cms-data.json` and `videos.json` are gitignored, they won't be pulled from GitHub. However, if these files don't exist or get deleted during deployment, your content will revert to the example files.

**Use the deployment script to preserve your data:**

```bash
./deploy.sh
```

This script will:
1. **Backup** your existing data files
2. **Check and remove** any tracked data files from git (if accidentally committed)
3. **Pull** latest code from GitHub
4. **Restore** your data files (preserving your production content)
5. Install dependencies, build, and restart

**Always use this script for deployments to ensure admin edits are preserved!**

### Manual Deployment (if not using the script)

If you prefer to deploy manually, follow these steps:

```bash
# 1. Backup your data files first
cp data/cms-data.json data/cms-data.json.backup
cp data/videos.json data/videos.json.backup

# 2. Pull from GitHub
git pull

# 3. Restore your data files
cp data/cms-data.json.backup data/cms-data.json
cp data/videos.json.backup data/videos.json

# 4. Install, build, and restart
npm install
npm run build
# Restart your application (pm2, systemctl, etc.)
```

**Why this is necessary:** The data files are gitignored to prevent local test changes from affecting production. However, this means they need to be manually preserved during deployments.


