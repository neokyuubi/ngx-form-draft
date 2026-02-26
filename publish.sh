#!/bin/bash
set -e

# Build the package
npm run build

# Publish from dist folder
cd dist
npm publish
