#!/bin/bash
set -e

# Build the package
npm run build

# Ensure we're logged in to npm (required for publish)
if ! npm whoami &>/dev/null; then
  echo ""
  echo "❌ Not logged in to npm. Run once:"
  echo "   npm login"
  echo ""
  echo "Then run ./publish.sh again."
  exit 1
fi

# Publish from dist folder
cd dist
npm publish
