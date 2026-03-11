#!/bin/bash
set -e

# Prepares a release and creates the GitHub release (tag).
# CI/CD then runs: build + publish to npm + build demo + deploy Pages.
# Do NOT run npm build or npm publish here — the workflow does that.

current=$(node -p "require('./package.json').version")

# If this version is already released (tag exists), bump patch
if git rev-parse "v${current}" &>/dev/null; then
  echo "Tag v${current} already exists. Bumping patch..."
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
  version=$newVersion
else
  version=$current
fi

# Commit and push version (so CI has the right package.json)
# Include lock files so nothing is left uncommitted
git add package.json
[ -f demo/package.json ] && git add demo/package.json
[ -f package-lock.json ] && git add package-lock.json
[ -f demo/package-lock.json ] && git add demo/package-lock.json
if ! git diff --staged --quiet 2>/dev/null; then
  git commit -m "chore: release v${version}"
  git push
fi

# Create GitHub release → triggers CI: build, npm publish, demo deploy
if gh release view "v${version}" &>/dev/null; then
  echo "Release v${version} already exists on GitHub. Nothing to do."
else
  gh release create "v${version}" --title "v${version}" --notes "v${version}"
  echo "Release v${version} created. CI will build and publish to npm."
fi
