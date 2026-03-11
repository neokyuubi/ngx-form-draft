#!/bin/bash
set -e

# Ensure we're logged in to npm (required for publish)
if ! npm whoami &>/dev/null; then
  echo ""
  echo "❌ Not logged in to npm. Run once:"
  echo "   npm login"
  echo ""
  echo "Then run ./publish.sh again."
  exit 1
fi

# Bump version if current is already published on npm
current=$(node -p "require('./package.json').version")
published=$(npm view ngx-form-draft version 2>/dev/null) || published=""
if [ -n "$published" ] && [ "$current" = "$published" ]; then
  echo "Version $current already published on npm. Bumping patch..."
  npm version patch --no-git-tag-version
  newVersion=$(node -p "require('./package.json').version")
  echo "Bumped to $newVersion"
  if [ -f demo/package.json ]; then
    node -e "
    const p = require('./demo/package.json');
    const root = require('./package.json');
    p.version = root.version;
    if (p.dependencies && p.dependencies['ngx-form-draft']) {
      p.dependencies['ngx-form-draft'] = '^' + root.version;
    }
    require('fs').writeFileSync('./demo/package.json', JSON.stringify(p, null, 2) + '\n');
    "
    echo "Updated demo/package.json to $newVersion"
  fi
  # Push version bump before publishing to npm
  git add package.json
  [ -f demo/package.json ] && git add demo/package.json
  git commit -m "chore: release v${newVersion}"
  git push
  echo "Pushed v${newVersion} to origin."
fi

# Build the package
npm run build

# Publish from dist folder
cd dist
npm publish
