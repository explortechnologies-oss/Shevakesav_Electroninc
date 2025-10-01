#!/usr/bin/env node

import { execSync } from 'child_process';

console.log('🚀 Starting deployment build process...');

try {
  // Run the standard npm build process
  console.log('📦 Running npm build...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Run the post-build script to fix directory structure
  console.log('🔧 Fixing directory structure for deployment...');
  execSync('./scripts/post-build.sh', { stdio: 'inherit' });
  
  console.log('✅ Deployment build completed successfully!');
  console.log('📁 Files are properly structured in dist/public/ for deployment');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}