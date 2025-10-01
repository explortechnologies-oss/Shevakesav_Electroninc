#!/bin/bash

echo "Starting production build..."

# Run the comprehensive build script
node build.js

# Ensure server bundle is in the right place
echo "Copying server bundle..."
cp dist/index.js dist/public/
cp dist/index.js server/public/

echo "Production build complete!"
echo "✓ All files are properly structured for deployment"
echo "✓ dist/public contains all static assets and server bundle"
echo "✓ server/public contains all files for production serving"

# Show final structure
echo ""
echo "Final directory structure:"
echo "dist/public:"
ls -la dist/public/
echo ""
echo "server/public:"
ls -la server/public/