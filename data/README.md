# CMS Data Files

## Important: Local vs Production Data

**The `cms-data.json` and `videos.json` files are now in `.gitignore`** to prevent local test changes from affecting production.

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
1. Backup your existing data files
2. Pull latest code from GitHub
3. Restore your data files (preserving your production content)
4. Install dependencies, build, and restart

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


