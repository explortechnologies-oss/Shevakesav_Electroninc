#!/bin/bash

# Post-build script to ensure proper directory structure for deployment
echo "Setting up deployment directory structure..."

# Create dist/public directory if it doesn't exist
if [ ! -d "dist/public" ]; then
    echo "Creating dist/public directory..."
    mkdir -p dist/public
fi

# Copy build files to dist/public (what deployment expects)
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo "Copying build files to dist/public for deployment..."
    cp -r dist/* dist/public/ 2>/dev/null || true
    
    # Remove any nested public directories in dist/public
    if [ -d "dist/public/public" ]; then
        echo "Removing nested public directory in dist/public..."
        rm -rf dist/public/public
    fi
fi

# Ensure server/public has the files too (for server compatibility)
if [ ! -d "server/public" ]; then
    echo "Creating server/public directory..."
    mkdir -p server/public
fi

if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo "Copying build files to server/public for server compatibility..."
    cp -r dist/* server/public/ 2>/dev/null || true
    
    # Remove any nested public directories in server/public
    if [ -d "server/public/public" ]; then
        echo "Removing nested public directory in server/public..."
        rm -rf server/public/public
    fi
fi

echo "✅ Deployment directory structure setup complete!"
echo "✅ Files are available in both dist/public/ (for deployment) and server/public/ (for server)"

# Verify the structure
echo ""
echo "📁 Directory structure verification:"
echo "dist/public contents:"
ls -la dist/public/ 2>/dev/null | head -5 || echo "  (directory not found)"
echo ""
echo "server/public contents:"
ls -la server/public/ 2>/dev/null | head -5 || echo "  (directory not found)"