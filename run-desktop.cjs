#!/usr/bin/env node

// Desktop Application Launcher Script
// This script sets up the environment and runs the Electron desktop app

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting SHIVAKESHAVA ELECTRONICS Desktop Application...\n');

// Set environment variables for local development
process.env.NODE_ENV = 'local';
process.env.USE_LOCAL_DB = 'true';

// Launch Electron
const electronPath = path.join(__dirname, 'node_modules', '.bin', 'electron');
const mainScript = path.join(__dirname, 'electron-main.js');

const electronProcess = spawn(electronPath, [mainScript], {
  stdio: 'inherit',
  env: process.env
});

electronProcess.on('close', (code) => {
  console.log(`\n✅ Desktop application closed with code ${code}`);
  process.exit(code);
});

electronProcess.on('error', (error) => {
  console.error('❌ Failed to start desktop application:', error);
  process.exit(1);
});