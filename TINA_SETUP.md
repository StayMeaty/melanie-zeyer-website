# Tina CMS Setup Guide

This guide provides step-by-step instructions for setting up Tina CMS with GitHub backend for the Melanie Zeyer website.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [GitHub Token Generation](#github-token-generation)
4. [Environment Configuration](#environment-configuration)
5. [Local Development Setup](#local-development-setup)
6. [Production Deployment](#production-deployment)
7. [Security Best Practices](#security-best-practices)
8. [Troubleshooting](#troubleshooting)
9. [Token Rotation](#token-rotation)

## Overview

Tina CMS provides a Git-based content management system that allows editing content directly through a user-friendly interface while maintaining version control through GitHub. The system supports two modes:

- **Local Development**: Uses filesystem backend for immediate changes without GitHub
- **Production**: Uses GitHub backend for version-controlled content management

## Prerequisites

Before setting up Tina CMS, ensure you have:

1. A GitHub account with access to your repository
2. Node.js 18+ installed locally
3. The repository cloned locally
4. Admin access to your Netlify deployment (for production)

## GitHub Token Generation

### Step 1: Access GitHub Token Settings

1. Log in to your GitHub account
2. Click your profile picture → **Settings**
3. Scroll down to **Developer settings** (bottom of sidebar)
4. Click **Personal access tokens** → **Tokens (classic)**

### Step 2: Generate New Token

1. Click **Generate new token** → **Generate new token (classic)**
2. **Note**: Give it a descriptive name (e.g., "Tina CMS - Melanie Website")
3. **Expiration**: Choose 90 days (recommended for security)

### Step 3: Select Required Scopes

Select the following scopes:

- ✅ **repo** (Full control of private repositories)
  - Includes: repo:status, repo_deployment, public_repo, repo:invite
- ✅ **workflow** (Update GitHub Action workflows)

These scopes are required for:
- Reading and writing content files
- Creating and updating branches
- Managing pull requests
- Updating GitHub Actions if needed

### Step 4: Generate and Save Token

1. Click **Generate token** at the bottom
2. **IMPORTANT**: Copy the token immediately (starts with `ghp_`)
3. Store it securely - you won't be able to see it again!

## Environment Configuration

### Local Development (.env.local)

Create a `.env.local` file in your project root:

```bash
# Enable Tina CMS
VITE_USE_TINA_CMS=true

# GitHub Configuration
VITE_GITHUB_TOKEN=ghp_your_personal_access_token_here
VITE_GITHUB_REPO=username/repository-name
VITE_GITHUB_BRANCH=main

# Optional: Use same token for Tina
VITE_TINA_TOKEN=ghp_your_personal_access_token_here
VITE_TINA_BRANCH=main
```

### Production (Netlify Environment Variables)

In Netlify Dashboard:

1. Go to **Site settings** → **Environment variables**
2. Add the following variables:

```bash
VITE_USE_TINA_CMS=true
VITE_GITHUB_TOKEN=ghp_your_personal_access_token_here
VITE_GITHUB_REPO=username/repository-name
VITE_GITHUB_BRANCH=main
VITE_TINA_TOKEN=ghp_your_personal_access_token_here
```

## Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Access Tina CMS

1. Open browser to `http://localhost:3000`
2. Navigate to `/admin`
3. If using filesystem mode (no token), you can edit immediately
4. If using GitHub mode, authentication will use your token

### 5. Local Filesystem Mode

For quick local development without GitHub:

1. Don't set `VITE_TINA_TOKEN` in `.env.local`
2. Tina will use filesystem backend automatically
3. Changes are immediate but not committed to Git
4. Perfect for testing and development

## Production Deployment

### 1. Environment Variables

Ensure all required environment variables are set in Netlify:

- `VITE_USE_TINA_CMS=true`
- `VITE_GITHUB_TOKEN` or `VITE_TINA_TOKEN`
- `VITE_GITHUB_REPO`
- `VITE_GITHUB_BRANCH`

### 2. Deploy to Netlify

```bash
# Push to main branch (triggers auto-deploy)
git push origin main
```

### 3. Verify Deployment

1. Visit your production URL
2. Navigate to `/admin`
3. Verify GitHub authentication works
4. Test content editing and saving

### 4. Content Workflow

In production:

1. Edit content through Tina interface
2. Changes are committed to GitHub
3. Netlify auto-deploys on commit
4. Content updates appear after deployment

## Security Best Practices

### Token Security

1. **Never commit tokens to Git**
   - Use `.env.local` (gitignored)
   - Use Netlify environment variables

2. **Token Permissions**
   - Use minimum required scopes
   - Only `repo` and `workflow` needed

3. **Token Rotation**
   - Rotate tokens every 90 days
   - Set calendar reminders
   - Keep backup token during rotation

### Access Control

1. **Repository Settings**
   - Keep repository private if sensitive
   - Use branch protection rules
   - Require PR reviews for main branch

2. **Netlify Settings**
   - Enable HTTPS only
   - Set security headers
   - Use environment variables

3. **Content Security**
   - Review all content changes
   - Monitor GitHub commit history
   - Set up GitHub notifications

### Security Headers

Add to `netlify.toml`:

```toml
[[headers]]
  for = "/admin/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

## Troubleshooting

### Common Issues

#### 1. "Invalid GitHub Token" Error

**Symptoms**: Cannot authenticate with GitHub

**Solutions**:
- Verify token starts with `ghp_`
- Check token hasn't expired
- Ensure token has `repo` and `workflow` scopes
- Verify token is in environment variables

#### 2. "Repository Not Found" Error

**Symptoms**: Cannot access repository

**Solutions**:
- Check repository name format: `owner/repo`
- Verify you have access to the repository
- Ensure repository exists and isn't deleted
- Check for typos in repository name

#### 3. "Branch Not Found" Error

**Symptoms**: Cannot find specified branch

**Solutions**:
- Verify branch name (usually `main` or `master`)
- Check branch exists in repository
- Ensure branch name in config matches GitHub

#### 4. "Insufficient Permissions" Error

**Symptoms**: Cannot write to repository

**Solutions**:
- Verify token has `repo` scope
- Check you have write access to repository
- Ensure branch protection allows your token

#### 5. Local Development Issues

**Symptoms**: Tina not working locally

**Solutions**:
- Check Node.js version (18+ required)
- Clear node_modules and reinstall
- Verify `.env.local` file exists
- Check for port conflicts (3000)

### Debug Mode

Enable debug logging:

```javascript
// In browser console
localStorage.setItem('tina:debug', 'true');
```

View security logs:

```javascript
// In browser console
JSON.parse(sessionStorage.getItem('tina_security_logs'));
```

### Testing Token Access

Use the built-in test function:

```javascript
import { testGitHubRepoAccess } from '@/services/tinaAuth';

const result = await testGitHubRepoAccess(
  'ghp_your_token',
  'owner/repo',
  'main'
);

console.log(result);
```

## Token Rotation

### Why Rotate Tokens?

- Security best practice
- Limits exposure if compromised
- Required by many security policies
- GitHub recommends 90-day rotation

### Rotation Process

#### Step 1: Generate New Token

1. Follow [GitHub Token Generation](#github-token-generation) steps
2. Name it with date (e.g., "Tina CMS - 2024-Q1")

#### Step 2: Test New Token Locally

```bash
# Update .env.local
VITE_GITHUB_TOKEN=ghp_new_token_here

# Test locally
npm run dev
```

#### Step 3: Update Production

1. In Netlify, update `VITE_GITHUB_TOKEN`
2. Trigger redeploy
3. Verify new token works

#### Step 4: Revoke Old Token

After confirming new token works:

1. Go to GitHub → Settings → Personal access tokens
2. Find old token
3. Click **Delete**

### Automation Tips

1. **Calendar Reminders**: Set quarterly reminders
2. **Documentation**: Log rotation dates
3. **Team Communication**: Notify team of rotations
4. **Backup Tokens**: Keep temporary backup during rotation

## Advanced Configuration

### Custom Media Storage

Configure image upload path in `tina/config.ts`:

```javascript
media: {
  tina: {
    mediaRoot: "public/content/blog/images",
    publicFolder: "public",
  },
},
```

### Branch-Based Workflows

For staging environments:

```bash
# Staging branch
VITE_TINA_BRANCH=staging

# Production branch  
VITE_TINA_BRANCH=main
```

### API Rate Limiting

GitHub API has rate limits:

- **Authenticated**: 5,000 requests/hour
- **Unauthenticated**: 60 requests/hour

Monitor usage:

```javascript
import { checkGitHubTokenScopes } from '@/services/tinaAuth';

const response = await fetch('https://api.github.com/rate_limit', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const limits = await response.json();
console.log('Remaining:', limits.rate.remaining);
console.log('Reset at:', new Date(limits.rate.reset * 1000));
```

## Support and Resources

### Official Documentation

- [Tina CMS Docs](https://tina.io/docs/)
- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
- [Netlify Environment Variables](https://docs.netlify.com/configure-builds/environment-variables/)

### Community Support

- [Tina CMS Discord](https://discord.com/invite/zumN63Ybpf)
- [GitHub Discussions](https://github.com/tinacms/tinacms/discussions)

### Project-Specific Help

For issues specific to this project:

1. Check this documentation first
2. Review error messages in browser console
3. Check Netlify deploy logs
4. Contact project maintainer

## Conclusion

Tina CMS provides a powerful, Git-based content management system. Following this guide ensures a secure, properly configured setup that maintains version control while providing an intuitive editing interface.

Remember to:
- Keep tokens secure
- Rotate tokens regularly
- Monitor repository access
- Test changes locally first
- Document any custom configurations

Last Updated: 2025-01-10