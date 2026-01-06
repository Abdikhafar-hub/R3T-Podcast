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

