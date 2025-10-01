#!/usr/bin/env node

/**
 * Environment Variables Verification Script
 * Verifies that all required environment variables are properly configured
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log(`\n${colors.bold}${colors.blue}=== ${title} ===${colors.reset}`);
}

function checkEnvFile() {
  logSection('Checking .env File');
  
  const projectRoot = path.dirname(__dirname);
  const envPath = path.join(projectRoot, '.env');
  const envExamplePath = path.join(projectRoot, '.env.example');
  
  // Check if .env exists
  if (!fs.existsSync(envPath)) {
    log('yellow', '⚠️  .env file not found');
    if (fs.existsSync(envExamplePath)) {
      log('blue', '💡 Copy .env.example to .env and configure your values');
      log('blue', '   cp .env.example .env');
    }
    return false;
  }
  
  log('green', '✅ .env file exists');
  
  // Read and parse .env file
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  return envVars;
}

function checkRequiredVariables(envVars) {
  logSection('Checking Required Variables');
  
  const requiredVars = [
    {
      name: 'VITE_ADMIN_PASSWORD_HASH',
      description: 'Admin password hash (SHA-256)',
      validator: (value) => value && value.length === 64,
      example: '7a377393dde690f9414e320b6b86d5806bc1f847a2a2c48cb967b782ac19417d'
    },
    {
      name: 'VITE_GITHUB_TOKEN',
      description: 'GitHub Personal Access Token',
      validator: (value) => value && value.startsWith('ghp_'),
      example: 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
    },
    {
      name: 'VITE_GITHUB_REPO',
      description: 'GitHub repository (owner/repo-name)',
      validator: (value) => value && value.includes('/') && value.split('/').length === 2,
      example: 'StayMeaty/melanie-zeyer-website'
    }
  ];
  
  const optionalVars = [
    {
      name: 'VITE_GITHUB_BRANCH',
      description: 'GitHub branch (defaults to "main")',
      validator: (value) => !value || value.length > 0,
      example: 'main'
    }
  ];
  
  let allValid = true;
  
  // Check required variables
  console.log('\n📋 Required Variables:');
  requiredVars.forEach(variable => {
    const value = envVars[variable.name];
    const isValid = variable.validator(value);
    
    if (isValid) {
      log('green', `✅ ${variable.name}: Set and valid`);
    } else if (value) {
      log('red', `❌ ${variable.name}: Invalid format`);
      log('yellow', `   Expected: ${variable.description}`);
      log('yellow', `   Example: ${variable.example}`);
      allValid = false;
    } else {
      log('red', `❌ ${variable.name}: Not set`);
      log('yellow', `   Description: ${variable.description}`);
      log('yellow', `   Example: ${variable.example}`);
      allValid = false;
    }
  });
  
  // Check optional variables
  console.log('\n📋 Optional Variables:');
  optionalVars.forEach(variable => {
    const value = envVars[variable.name];
    const isValid = variable.validator(value);
    
    if (value && isValid) {
      log('green', `✅ ${variable.name}: ${value}`);
    } else if (value && !isValid) {
      log('yellow', `⚠️  ${variable.name}: Invalid format`);
      log('yellow', `   Example: ${variable.example}`);
    } else {
      log('blue', `ℹ️  ${variable.name}: Not set (will use default)`);
    }
  });
  
  return allValid;
}

function checkNetlifyConfig() {
  logSection('Checking Netlify Configuration');
  
  const projectRoot = path.dirname(__dirname);
  const netlifyConfigPath = path.join(projectRoot, 'netlify.toml');
  
  if (!fs.existsSync(netlifyConfigPath)) {
    log('red', '❌ netlify.toml not found');
    return false;
  }
  
  const netlifyConfig = fs.readFileSync(netlifyConfigPath, 'utf8');
  
  // Check for required sections
  const requiredSections = [
    '[build]',
    '[build.environment]',
    '[template.environment]'
  ];
  
  const requiredComments = [
    'VITE_GITHUB_TOKEN',
    'VITE_GITHUB_REPO',
    'NETLIFY_CMS_GITHUB_TOKEN'
  ];
  
  let allSectionsPresent = true;
  
  requiredSections.forEach(section => {
    if (netlifyConfig.includes(section)) {
      log('green', `✅ ${section} section found`);
    } else {
      log('red', `❌ ${section} section missing`);
      allSectionsPresent = false;
    }
  });
  
  requiredComments.forEach(comment => {
    if (netlifyConfig.includes(comment)) {
      log('green', `✅ ${comment} documented`);
    } else {
      log('yellow', `⚠️  ${comment} not documented in comments`);
    }
  });
  
  return allSectionsPresent;
}

function generateSetupInstructions() {
  logSection('Setup Instructions');
  
  console.log(`
${colors.bold}1. Generate GitHub Personal Access Token:${colors.reset}
   • Go to: https://github.com/settings/tokens
   • Click "Generate new token (classic)"
   • Description: "Melanie Blog Image Upload"
   • Scopes: ✅ repo, ✅ public_repo
   • Copy the generated token

${colors.bold}2. Configure .env file:${colors.reset}
   • Copy .env.example to .env
   • Add your GitHub token and repository info
   • Generate admin password hash if needed

${colors.bold}3. For Netlify deployment:${colors.reset}
   • Go to Netlify Site Settings → Environment Variables
   • Add all VITE_* variables from your .env file
   • Mark VITE_GITHUB_TOKEN as sensitive

${colors.bold}4. Test the setup:${colors.reset}
   • Run: npm run dev
   • Visit: http://localhost:3000/admin
   • Test image upload functionality
  `);
}

function main() {
  console.log(`${colors.bold}${colors.blue}Environment Variables Verification${colors.reset}`);
  console.log('Checking GitHub integration setup for Melanie blog...\n');
  
  const envVars = checkEnvFile();
  
  if (!envVars) {
    log('red', '\n❌ Setup incomplete: .env file missing');
    generateSetupInstructions();
    process.exit(1);
  }
  
  const varsValid = checkRequiredVariables(envVars);
  const netlifyValid = checkNetlifyConfig();
  
  logSection('Summary');
  
  if (varsValid && netlifyValid) {
    log('green', '🎉 All checks passed! GitHub integration is properly configured.');
    log('blue', '\n🚀 You can now:');
    log('blue', '   • Start development: npm run dev');
    log('blue', '   • Test admin interface: http://localhost:3000/admin');
    log('blue', '   • Upload images via GitHub integration');
    process.exit(0);
  } else {
    log('red', '❌ Setup incomplete. Please fix the issues above.');
    generateSetupInstructions();
    process.exit(1);
  }
}

// Run the verification
main();