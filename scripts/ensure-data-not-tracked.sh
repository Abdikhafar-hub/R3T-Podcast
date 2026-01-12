#!/bin/bash

# Script to ensure CMS data files are not tracked in git
# Run this if you suspect the files might be tracked

echo "🔍 Checking if CMS data files are tracked in git..."

PROTECTED_FILES=(
  "data/cms-data.json"
  "data/videos.json"
)

TRACKED=0

for file in "${PROTECTED_FILES[@]}"; do
  if git ls-files --error-unmatch "$file" > /dev/null 2>&1; then
    echo "  ❌ $file is tracked in git!"
    echo "     Removing from tracking (file will be kept locally)..."
    git rm --cached "$file" 2>/dev/null || true
    echo "     ✓ Removed $file from git tracking"
    TRACKED=1
  else
    echo "  ✓ $file is not tracked (correct)"
  fi
done

if [ $TRACKED -eq 0 ]; then
  echo ""
  echo "✅ All protected files are correctly ignored by git!"
else
  echo ""
  echo "⚠️  Some files were removed from tracking."
  echo "   You should commit this change:"
  echo "   git commit -m 'Remove CMS data files from git tracking'"
fi
