/**
 * Token Hash Generator Utility
 * DEVELOPMENT ONLY - Used to generate secure hashes for environment configuration
 * 
 * This utility should NEVER be included in production builds
 * It's only used during setup to generate the hash for VITE_TINA_TOKEN_HASH
 */

import { hashToken } from '../services/tinaTokenProxy';

/**
 * Generate a secure hash for a GitHub token
 * This function should only be run in development to set up the environment
 * 
 * Usage:
 * 1. Run this function with your GitHub token
 * 2. Copy the generated hash
 * 3. Add to your .env file as VITE_TINA_TOKEN_HASH=<hash>
 * 4. Never commit the actual token, only the hash
 */
export const generateTokenHashForSetup = async (token: string): Promise<void> => {
  if (import.meta.env.PROD) {
    console.error('❌ This utility should only be used in development!');
    return;
  }
  
  if (!token || !token.startsWith('ghp_')) {
    console.error('❌ Invalid GitHub token format. Token should start with "ghp_"');
    return;
  }
  
  try {
    console.log('🔐 Generating secure hash for your GitHub token...');
    
    const hash = await hashToken(token);
    
    console.log('\n✅ Token hash generated successfully!\n');
    console.log('Add the following to your .env file:');
    console.log('=====================================');
    console.log(`VITE_TINA_TOKEN_HASH=${hash}`);
    console.log('=====================================\n');
    console.log('Also make sure you have:');
    console.log('VITE_TINA_TOKEN=<your-github-token>');
    console.log('VITE_USE_TINA_CMS=true');
    console.log('VITE_GITHUB_REPO=<owner/repo>');
    console.log('VITE_GITHUB_BRANCH=main\n');
    console.log('⚠️  IMPORTANT SECURITY NOTES:');
    console.log('1. Never commit your actual token to version control');
    console.log('2. The hash is one-way and cannot be reversed to get the token');
    console.log('3. Keep your .env file in .gitignore');
    console.log('4. Rotate your token regularly (every 90 days recommended)');
    
  } catch (error) {
    console.error('❌ Failed to generate token hash:', error);
  }
};

/**
 * Verify that token hash matches environment configuration
 * Useful for debugging authentication issues
 */
export const verifyTokenHashMatch = async (token: string): Promise<void> => {
  if (import.meta.env.PROD) {
    console.error('❌ This utility should only be used in development!');
    return;
  }
  
  const expectedHash = import.meta.env.VITE_TINA_TOKEN_HASH;
  
  if (!expectedHash) {
    console.error('❌ VITE_TINA_TOKEN_HASH is not configured in environment');
    return;
  }
  
  try {
    const tokenHash = await hashToken(token);
    
    if (tokenHash === expectedHash) {
      console.log('✅ Token hash matches environment configuration!');
    } else {
      console.error('❌ Token hash does NOT match environment configuration');
      console.log('Expected hash:', expectedHash);
      console.log('Your token hash:', tokenHash);
      console.log('\nThis means the token you provided is different from the one configured.');
      console.log('Please update VITE_TINA_TOKEN_HASH with the correct hash.');
    }
  } catch (error) {
    console.error('❌ Failed to verify token hash:', error);
  }
};

// Example usage (comment out in production):
// To generate a hash for initial setup:
// generateTokenHashForSetup('ghp_your_github_token_here');

// To verify your token matches the configured hash:
// verifyTokenHashMatch('ghp_your_github_token_here');