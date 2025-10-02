// Generate token hash for secure storage
// Run: node generate-token-hash.js

const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('GitHub Token Hash Generator');
console.log('============================\n');

rl.question('Enter your GitHub token (ghp_...): ', (token) => {
  if (!token || !token.startsWith('ghp_')) {
    console.error('\n❌ Invalid token format. GitHub tokens start with "ghp_"');
    rl.close();
    return;
  }

  // Generate SHA-256 hash
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  
  console.log('\n✅ Token hash generated successfully!\n');
  console.log('Add these to your Netlify environment variables:');
  console.log('================================================\n');
  console.log(`VITE_GITHUB_TOKEN=${token}`);
  console.log(`VITE_GITHUB_TOKEN_HASH=${hash}`);
  console.log('\nAlso add:');
  console.log(`VITE_GITHUB_REPO=StayMeaty/melanie-zeyer-website`);
  console.log(`VITE_GITHUB_BRANCH=master`);
  console.log(`VITE_USE_TINA_CMS=true`);
  console.log('\n================================================');
  console.log('\n⚠️  SECURITY REMINDER:');
  console.log('- Never commit these values to git');
  console.log('- Keep your token secret');
  console.log('- Rotate tokens every 90 days');
  
  rl.close();
});