/**
 * Test utility for Tina CMS authentication
 * Run this in browser console to test GitHub integration
 */

import { 
  getTinaConfig, 
  checkGitHubTokenScopes, 
  testGitHubRepoAccess 
} from '../services/tinaAuth';

/**
 * Test Tina authentication configuration and GitHub access
 */
export async function testTinaAuth() {
  console.log('🔍 Testing Tina CMS Authentication...\n');
  
  // Get configuration
  const config = getTinaConfig();
  console.log('📋 Configuration:');
  console.log('  - Enabled:', config.enabled);
  console.log('  - Repository:', config.repository || 'Not set');
  console.log('  - Branch:', config.branch);
  console.log('  - Token:', config.hasToken ? 'Set (hidden)' : 'Not set');
  console.log('  - Local Dev Mode:', config.isLocalDevelopment);
  console.log('  - Use Local Auth:', config.useLocalAuth);
  console.log('');
  
  // Check if we can proceed with testing
  if (!config.hasToken) {
    console.error('❌ No token configured. Set VITE_TINA_TOKEN or VITE_GITHUB_TOKEN');
    return false;
  }
  
  if (!config.repository) {
    console.error('❌ No repository configured. Set VITE_GITHUB_REPO');
    return false;
  }
  
  // Test token scopes
  console.log('🔐 Checking GitHub token scopes...');
  try {
    const scopeResult = await checkGitHubTokenScopes();
    console.log('  - Scopes:', scopeResult.scopes.join(', ') || 'None');
    console.log('  - Has required scopes:', scopeResult.hasRequiredScopes ? '✅' : '❌');
    
    if (!scopeResult.hasRequiredScopes) {
      console.error('  - Missing scopes:', scopeResult.missingScopes.join(', '));
      console.log('\n💡 Token needs "repo" and "workflow" scopes');
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to check token scopes:', error);
    return false;
  }
  
  // Test repository access
  console.log('\n🔗 Testing repository access...');
  try {
    const accessResult = await testGitHubRepoAccess(
      config.repository,
      config.branch
    );
    
    if (accessResult.success) {
      console.log('✅ Repository access successful!');
      if (accessResult.details) {
        console.log('  - Repository found:', accessResult.details.hasRepo ? '✅' : '❌');
        console.log('  - Branch exists:', accessResult.details.hasBranch ? '✅' : '❌');
        console.log('  - Write access:', accessResult.details.hasWriteAccess ? '✅' : '❌');
      }
    } else {
      console.error('❌ Repository access failed:', accessResult.error);
      if (accessResult.details) {
        console.log('  - Repository found:', accessResult.details.hasRepo ? '✅' : '❌');
        console.log('  - Branch exists:', accessResult.details.hasBranch ? '✅' : '❌');
        console.log('  - Write access:', accessResult.details.hasWriteAccess ? '✅' : '❌');
      }
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to test repository access:', error);
    return false;
  }
  
  // Test API rate limit
  console.log('\n📊 API Rate Limit:');
  console.log('  - Rate limit check skipped for security (token not exposed)');
  console.log('  - This is a security improvement - tokens should never be in client code');
  
  console.log('\n✅ All tests passed! Tina CMS is properly configured.');
  return true;
}

/**
 * Quick test function for browser console
 * Usage: await window.testTina()
 */
// Add test function to global window object for browser console access
declare global {
  interface Window {
    testTina?: typeof testTinaAuth;
  }
}

if (typeof window !== 'undefined') {
  window.testTina = testTinaAuth;
  console.log('💡 Tina test available. Run: await window.testTina()');
}