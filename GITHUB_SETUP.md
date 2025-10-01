# GitHub Integration Setup Guide

This guide walks you through configuring GitHub integration for the blog management system, enabling direct image uploads to the repository.

## Overview

The blog system supports GitHub integration for:
- **Image uploads**: Direct upload to repository via GitHub API
- **Version control**: All images tracked in Git
- **Serverless compatibility**: No backend required
- **CMS integration**: Works with Decap CMS

## Prerequisites

- GitHub repository with push access
- Netlify account for deployment
- Node.js 18+ for local development

## 1. GitHub Personal Access Token Setup

### Generate Token

1. **Go to GitHub Settings**:
   - Visit: https://github.com/settings/tokens
   - Click "Generate new token (classic)"

2. **Configure Token**:
   - **Note**: "Melanie Blog Image Upload"
   - **Expiration**: 90 days (recommended for security)
   - **Scopes**: Select the following:
     - ✅ `repo` (Full control of private repositories)
     - ✅ `public_repo` (Access public repositories)

3. **Generate and Copy**:
   - Click "Generate token"
   - **IMPORTANT**: Copy the token immediately (it won't be shown again)
   - Format: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Security Notes

- **Token Access**: This token provides access to your repositories
- **Rotation**: Plan to regenerate every 90 days
- **Storage**: Store securely in environment variables only
- **Scope**: Use minimal required permissions

## 2. Environment Variables Configuration

### Local Development Setup

1. **Copy Example File**:
   ```bash
   cp .env.example .env
   ```

2. **Edit .env File** with your values:
   ```bash
   # Admin Authentication
   VITE_ADMIN_PASSWORD_HASH=7a377393dde690f9414e320b6b86d5806bc1f847a2a2c48cb967b782ac19417d

   # GitHub Integration for Blog Images
   VITE_GITHUB_TOKEN=ghp_your_actual_github_token_here
   VITE_GITHUB_REPO=StayMeaty/melanie-zeyer-website
   VITE_GITHUB_BRANCH=main
   ```

3. **Repository Format**:
   - Format: `owner/repository-name`
   - Example: `StayMeaty/melanie-zeyer-website`
   - **Case-sensitive**: Use exact GitHub repository name

### Generate Admin Password Hash

If you need to generate a new admin password hash:

```bash
node -e "console.log(require('crypto').createHash('sha256').update('your-password').digest('hex'))"
```

## 3. Netlify Production Configuration

### Environment Variables in Netlify UI

1. **Access Netlify Settings**:
   - Go to your site dashboard
   - Navigate to: **Site Settings** → **Environment Variables**

2. **Add Required Variables**:

   | Variable Name | Value | Notes |
   |---------------|-------|-------|
   | `VITE_GITHUB_TOKEN` | `ghp_xxxxx...` | Your GitHub token |
   | `VITE_GITHUB_REPO` | `owner/repo-name` | Repository identifier |
   | `VITE_GITHUB_BRANCH` | `main` | Target branch |
   | `VITE_ADMIN_PASSWORD_HASH` | `sha256-hash` | Admin password hash |
   | `NETLIFY_CMS_GITHUB_TOKEN` | `ghp_xxxxx...` | Same as VITE_GITHUB_TOKEN |
   | `NETLIFY_CMS_SITE_URL` | `https://melaniezeyer.de` | Site URL |

3. **Security Settings**:
   - ✅ Mark `VITE_GITHUB_TOKEN` as **sensitive**
   - ✅ Mark `VITE_ADMIN_PASSWORD_HASH` as **sensitive**
   - ✅ Enable **"Show in build logs"** for debugging

### Deploy Settings Verification

Your `netlify.toml` should include:

```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"
  # GitHub variables automatically injected from Netlify UI
```

## 4. Repository Permissions Verification

### Check Repository Access

1. **Repository Settings**:
   - Ensure your token has access to the target repository
   - Verify you can push to the target branch
   - Check if branch protection rules allow API pushes

2. **Directory Structure**:
   ```
   public/
   └── content/
       └── blog/
           └── images/     ← GitHub uploads go here
   ```

3. **API Rate Limits**:
   - **Authenticated**: 5,000 requests/hour
   - **Unauthenticated**: 60 requests/hour
   - **Monitor usage**: GitHub Settings → Developer settings

## 5. Testing the Integration

### Local Development Test

1. **Start Development Server**:
   ```bash
   npm run dev
   ```

2. **Access Admin Interface**:
   - Go to: http://localhost:3000/admin
   - Login with your admin password
   - Navigate to Blog Management

3. **Test Image Upload**:
   - Create or edit a blog post
   - Try uploading an image
   - Verify GitHub integration works

### Production Test

1. **Deploy to Netlify**:
   ```bash
   git add .
   git commit -m "feat: Configure GitHub integration"
   git push origin main
   ```

2. **Verify Production**:
   - Wait for deployment to complete
   - Access production admin: https://melaniezeyer.de/admin
   - Test image upload functionality

## 6. Troubleshooting

### Common Issues

#### ❌ GitHub Token Issues

**Symptoms**:
- "VITE_GITHUB_TOKEN nicht konfiguriert" error
- Upload fails with authentication error

**Solutions**:
1. **Token Expired**: Generate new token with same scopes
2. **Repository Access**: Verify token has access to repository
3. **Wrong Scopes**: Ensure `repo` scope is selected
4. **Rate Limits**: Wait for rate limit reset

#### ❌ Environment Variable Issues

**Symptoms**:
- Variables undefined in application
- Build failures

**Solutions**:
1. **Local**: Check `.env` file exists and syntax is correct
2. **Production**: Verify variables set in Netlify UI
3. **Case Sensitivity**: Use exact variable names
4. **Restart**: Restart dev server after changing `.env`

#### ❌ Repository Issues

**Symptoms**:
- Upload fails with "not found" error
- Permission denied errors

**Solutions**:
1. **Repository Name**: Check exact format `owner/repo-name`
2. **Branch Protection**: Verify API can push to target branch
3. **Permissions**: Ensure token has write access
4. **Directory**: Verify `public/content/blog/images/` exists

#### ❌ Build/Deploy Issues

**Symptoms**:
- Netlify build fails
- Variables not available in build

**Solutions**:
1. **Build Environment**: Check Node.js version (should be 18)
2. **Environment Variables**: Verify all required variables in Netlify UI
3. **Secrets Scanning**: Check SECRETS_SCAN_OMIT_KEYS in netlify.toml
4. **Build Logs**: Check Netlify deploy logs for errors

### Debug Commands

**Check Environment Variables Locally**:
```bash
# In development console
console.log({
  githubToken: import.meta.env.VITE_GITHUB_TOKEN ? 'SET' : 'NOT SET',
  githubRepo: import.meta.env.VITE_GITHUB_REPO,
  githubBranch: import.meta.env.VITE_GITHUB_BRANCH
});
```

**Test GitHub API Access**:
```bash
# Replace with your token and repo
curl -H "Authorization: token ghp_your_token" \
  https://api.github.com/repos/owner/repo-name
```

## 7. Security Best Practices

### Token Management

1. **Regular Rotation**:
   - Rotate tokens every 90 days
   - Update both local `.env` and Netlify UI
   - Test after rotation

2. **Access Control**:
   - Use minimal required scopes
   - Monitor token usage in GitHub settings
   - Revoke unused tokens

3. **Storage Security**:
   - Never commit tokens to Git
   - Use environment variables only
   - Keep `.env` in `.gitignore`

### Monitoring

1. **GitHub Settings**:
   - Monitor token usage
   - Check for unusual activity
   - Set up security alerts

2. **Netlify Logs**:
   - Monitor build logs for errors
   - Check function logs for API calls
   - Set up error notifications

## 8. Feature Verification Checklist

After setup, verify these features work:

- [ ] Local development environment loads GitHub variables
- [ ] Admin login works with password hash
- [ ] Blog management interface accessible
- [ ] Image upload shows GitHub option
- [ ] Images successfully upload to repository
- [ ] Uploaded images appear in blog posts
- [ ] Production deployment includes all variables
- [ ] Netlify build succeeds with GitHub integration
- [ ] CMS (Decap) can upload media files
- [ ] No console errors related to GitHub integration

## 9. Maintenance

### Regular Tasks

**Weekly**:
- Check image upload functionality
- Monitor GitHub API rate limit usage

**Monthly**:
- Review security logs
- Update dependencies if needed
- Verify token hasn't expired

**Every 90 Days**:
- Rotate GitHub token
- Update environment variables
- Test complete upload workflow

### Updates

When updating the integration:
1. Test in development first
2. Update documentation
3. Deploy to production
4. Verify functionality
5. Monitor for issues

## Support

For issues or questions:

1. **Check Console**: Browser dev tools for client-side errors
2. **Check Logs**: Netlify build/function logs
3. **GitHub API**: GitHub API status page
4. **Documentation**: This guide and code comments

---

**Last Updated**: 2025-10-01
**Version**: 1.0.0