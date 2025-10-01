#!/bin/bash

echo "Building for production..."
npm run build

echo "Creating proper directory structure for deployment..."
mkdir -p dist/public
cp -r dist/* dist/public/ 2>/dev/null || true
cp -r dist/assets dist/public/ 2>/dev/null || true
cp dist/index.html dist/public/ 2>/dev/null || true

echo "Copying build files to server public directory..."
cp -r dist/* server/public/

echo "Production build complete! Files are ready for deployment."
echo "API routes and static files should now work correctly."