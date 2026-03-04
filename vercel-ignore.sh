#!/bin/bash
# vercel-ignore.sh

# Only build if changes are NOT in mobile-app folder
if [ "$VERCEL_GIT_COMMIT_REF" = "main" ]; then
  # Check if mobile-app was changed
  git diff HEAD^ HEAD --quiet -- mobile-app/
  if [ $? -eq 0 ]; then
    # No changes in mobile-app, proceed with build
    echo "✅ Proceeding with build"
    exit 1
  else
    # Changes in mobile-app, skip build
    echo "🚫 Skipping build - mobile-app changes detected"
    exit 0
  fi
fi
