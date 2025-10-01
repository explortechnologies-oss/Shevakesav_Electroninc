#!/bin/bash

# Fix build script to ensure proper file structure for deployment
echo "Fixing build structure for deployment..."

# Remove any nested public directories
if [ -d "server/public/public" ]; then
    echo "Removing nested public directory..."
    rm -rf server/public/public
fi

# Ensure server/public exists and has the right files
if [ ! -d "server/public" ]; then
    echo "Creating server/public directory..."
    mkdir -p server/public
fi

# If dist exists but server/public is empty, copy files over
if [ -d "dist" ] && [ ! -f "server/public/index.html" ]; then
    echo "Copying build files from dist to server/public..."
    cp -r dist/* server/public/
    
    # Remove any nested public directories that might have been copied
    if [ -d "server/public/public" ]; then
        rm -rf server/public/public
    fi
fi

echo "Build structure fixed successfully!"
echo "Files in server/public:"
ls -la server/public/