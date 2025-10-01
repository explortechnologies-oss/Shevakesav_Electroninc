#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('Building for production...');

// Run the original build commands
execSync('vite build', { stdio: 'inherit' });
execSync('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });

console.log('Creating proper directory structure for deployment...');

// Helper functions
const mkdir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const copyRecursive = (src, dest) => {
  if (!fs.existsSync(src)) {
    console.log(`Warning: Source path ${src} does not exist`);
    return;
  }
  
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    mkdir(dest);
    const items = fs.readdirSync(src);
    items.forEach(item => {
      copyRecursive(path.join(src, item), path.join(dest, item));
    });
  } else {
    mkdir(path.dirname(dest));
    fs.copyFileSync(src, dest);
  }
};

// Create necessary directories
mkdir('dist/public');
mkdir('server/public');

// Copy built frontend files to both locations (for deployment compatibility)
const filesToCopy = ['index.html', 'assets'];

filesToCopy.forEach(file => {
  const srcPath = path.join('dist', file);
  if (fs.existsSync(srcPath)) {
    // Copy to dist/public for deployment
    copyRecursive(srcPath, path.join('dist', 'public', file));
    // Copy to server/public for production serving
    copyRecursive(srcPath, path.join('server', 'public', file));
    console.log(`Copied ${file} to both dist/public and server/public`);
  }
});

// Also copy any additional files that might be in the dist root
const distFiles = fs.readdirSync('dist').filter(item => {
  const itemPath = path.join('dist', item);
  return fs.statSync(itemPath).isFile() && !['index.js'].includes(item);
});

distFiles.forEach(file => {
  const srcPath = path.join('dist', file);
  copyRecursive(srcPath, path.join('dist', 'public', file));
  copyRecursive(srcPath, path.join('server', 'public', file));
  console.log(`Copied ${file} to both dist/public and server/public`);
});

console.log('Production build complete! Files are ready for deployment.');
console.log('✓ Built files are in dist/public for deployment');
console.log('✓ Built files are in server/public for production serving');