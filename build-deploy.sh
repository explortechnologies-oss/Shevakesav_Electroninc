#!/bin/bash

# Build the application
echo "Building the application..."
npm run build

# Copy built files to server/public for production serving
echo "Copying files for production serving..."
mkdir -p server/public
cp -r dist/* server/public/

echo "Build complete! Ready for deployment."
echo "✓ index.html is now at the root of dist directory"
echo "✓ Production files are ready in server/public"