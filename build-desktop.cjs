#!/usr/bin/env node

// Desktop Application Build Script
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Building SHIVAKESHAVA ELECTRONICS Desktop Application...\n');

try {
  // Step 1: Build the web application
  console.log('📦 Building web application...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Step 2: Ensure dist directory exists
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
  }
  
  // Step 3: Build desktop application
  console.log('🖥️  Building desktop application...');
  execSync('npx electron-builder --config electron-builder.json', { stdio: 'inherit' });
  
  console.log('\n✅ Desktop application built successfully!');
  console.log('📁 Check the "dist-desktop" folder for the installer files.');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}