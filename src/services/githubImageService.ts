/**
 * GitHub Image Service for uploading blog images to the repository
 * 
 * This service provides client-side GitHub API integration for uploading
 * images to the blog repository. Images are converted from base64 to binary
 * and uploaded via the GitHub Contents API.
 * 
 * Features:
 * - Base64 to binary conversion for GitHub API
 * - Environment variable validation
 * - Comprehensive error handling with German messages
 * - Progress tracking for UI feedback
 * - Connection validation and caching
 * - Retry logic for transient failures
 * - Security logging following auth.ts patterns
 */

import { BLOG_CONFIG } from '../types/blog';

/**
 * ProcessedImage interface matching ImageUploadModal
 */
export interface ProcessedImage {
  url: string; // base64 data URL
  name: string;
  size: number;
  width: number;
  height: number;
  type: string;
}

/**
 * Result interface for GitHub upload operations
 */
export interface GitHubUploadResult {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
  sha?: string; // For future updates/deletions
}

/**
 * GitHub API response for file operations
 */
interface GitHubApiResponse {
  content: {
    sha: string;
    download_url: string;
    html_url: string;
  };
  commit: {
    sha: string;
    html_url: string;
  };
}

/**
 * Progress callback for upload operations
 */
export type ProgressCallback = (progress: number) => void;

/**
 * GitHub configuration constants
 */
const GITHUB_API_BASE = 'https://api.github.com';
const MAX_RETRY_ATTEMPTS = 3;
const CONNECTION_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Cached connection status
 */
interface ConnectionCache {
  isValid: boolean;
  timestamp: number;
  error?: string;
}

let connectionCache: ConnectionCache | null = null;

/**
 * Log service events for monitoring (following auth.ts pattern)
 */
const logServiceEvent = (event: string, data?: unknown): void => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    event,
    data,
    service: 'github-image',
    userAgent: navigator.userAgent,
  };

  // Store recent service events in sessionStorage for debugging
  const events = JSON.parse(sessionStorage.getItem('github_service_events') || '[]');
  events.push(logEntry);
  
  // Keep only last 50 events
  if (events.length > 50) {
    events.shift();
  }
  
  sessionStorage.setItem('github_service_events', JSON.stringify(events));
  
  // Log to console in development
  if (import.meta.env.DEV) {
    console.log('[GitHub Service Event]', logEntry);
  }
};

/**
 * Validate GitHub environment variables
 */
const validateEnvironment = (): { valid: boolean; error?: string } => {
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  const repo = import.meta.env.VITE_GITHUB_REPO;
  
  if (!token) {
    logServiceEvent('env_validation_failed', { missing: 'VITE_GITHUB_TOKEN' });
    return { 
      valid: false, 
      error: 'VITE_GITHUB_TOKEN nicht konfiguriert' 
    };
  }
  
  if (!repo) {
    logServiceEvent('env_validation_failed', { missing: 'VITE_GITHUB_REPO' });
    return { 
      valid: false, 
      error: 'VITE_GITHUB_REPO nicht konfiguriert' 
    };
  }

  // Validate token format (basic check)
  if (!token.startsWith('ghp_') && !token.startsWith('github_pat_')) {
    logServiceEvent('env_validation_failed', { reason: 'invalid_token_format' });
    return { 
      valid: false, 
      error: 'Ungültiges GitHub-Token-Format' 
    };
  }

  // Validate repo format (owner/repo)
  if (!repo.includes('/') || repo.split('/').length !== 2) {
    logServiceEvent('env_validation_failed', { reason: 'invalid_repo_format' });
    return { 
      valid: false, 
      error: 'Ungültiges Repository-Format (erwarte: owner/repo)' 
    };
  }

  logServiceEvent('env_validation_success');
  return { valid: true };
};

/**
 * Get GitHub configuration from environment variables
 */
const getGitHubConfig = () => ({
  token: import.meta.env.VITE_GITHUB_TOKEN as string,
  repo: import.meta.env.VITE_GITHUB_REPO as string,
  branch: (import.meta.env.VITE_GITHUB_BRANCH as string) || 'main',
  owner: (import.meta.env.VITE_GITHUB_REPO as string).split('/')[0],
  repoName: (import.meta.env.VITE_GITHUB_REPO as string).split('/')[1],
});

/**
 * Convert base64 data URL to binary string for GitHub API
 */
const base64ToBase64Binary = (dataUrl: string): string => {
  // Extract base64 data from data URL (remove data:image/type;base64, prefix)
  const base64Data = dataUrl.split(',')[1];
  
  if (!base64Data) {
    throw new Error('Ungültiges Base64-Format');
  }
  
  return base64Data;
};

/**
 * Generate unique filename with timestamp
 */
const generateUniqueFilename = (originalName: string): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const extension = originalName.split('.').pop() || 'jpg';
  const baseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '-');
  
  return `${timestamp}-${baseName}.${extension}`;
};

/**
 * Perform GitHub API request with error handling
 */
const githubApiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const config = getGitHubConfig();
  const url = `${GITHUB_API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${config.token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  // Handle rate limiting
  if (response.status === 403) {
    const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
    const rateLimitReset = response.headers.get('X-RateLimit-Reset');
    
    if (rateLimitRemaining === '0') {
      const resetTime = rateLimitReset ? new Date(parseInt(rateLimitReset) * 1000) : new Date();
      logServiceEvent('rate_limit_exceeded', { resetTime });
      throw new Error('GitHub-Rate-Limit erreicht. Versuchen Sie es später erneut.');
    }
  }

  return response;
};

/**
 * Check GitHub connection and permissions
 */
export const checkConnection = async (): Promise<boolean> => {
  // Check cache first
  if (connectionCache && Date.now() - connectionCache.timestamp < CONNECTION_CACHE_DURATION) {
    if (connectionCache.isValid) {
      logServiceEvent('connection_check_cached_success');
    } else {
      logServiceEvent('connection_check_cached_failed', { error: connectionCache.error });
    }
    return connectionCache.isValid;
  }

  try {
    // Validate environment
    const envValidation = validateEnvironment();
    if (!envValidation.valid) {
      connectionCache = {
        isValid: false,
        timestamp: Date.now(),
        error: envValidation.error,
      };
      return false;
    }

    const config = getGitHubConfig();
    
    // Test repository access
    const response = await githubApiRequest(`/repos/${config.repo}`);
    
    if (response.ok) {
      const repoData = await response.json();
      
      // Check if we have push permissions
      if (!repoData.permissions?.push) {
        const error = 'Keine Schreibberechtigung für das Repository';
        logServiceEvent('connection_check_failed', { reason: 'no_push_permission' });
        connectionCache = {
          isValid: false,
          timestamp: Date.now(),
          error,
        };
        return false;
      }
      
      logServiceEvent('connection_check_success', { repo: config.repo });
      connectionCache = {
        isValid: true,
        timestamp: Date.now(),
      };
      return true;
    } else {
      const errorText = await response.text();
      const error = response.status === 404 
        ? 'Repository nicht gefunden oder keine Berechtigung'
        : `GitHub-API-Fehler: ${response.status}`;
      
      logServiceEvent('connection_check_failed', { 
        status: response.status, 
        error: errorText 
      });
      
      connectionCache = {
        isValid: false,
        timestamp: Date.now(),
        error,
      };
      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
    logServiceEvent('connection_check_error', { error: errorMessage });
    
    connectionCache = {
      isValid: false,
      timestamp: Date.now(),
      error: `Verbindung zu GitHub fehlgeschlagen: ${errorMessage}`,
    };
    return false;
  }
};

/**
 * Upload image to GitHub repository with retry logic
 */
export const uploadImage = async (
  image: ProcessedImage,
  altText: string,
  progressCallback?: ProgressCallback
): Promise<GitHubUploadResult> => {
  logServiceEvent('upload_started', { 
    imageName: image.name, 
    imageSize: image.size,
    altText: altText.substring(0, 50) // Log only first 50 chars for privacy
  });

  progressCallback?.(10);

  try {
    // Validate environment
    const envValidation = validateEnvironment();
    if (!envValidation.valid) {
      return {
        success: false,
        error: `Konfigurationsfehler: ${envValidation.error}`,
      };
    }

    progressCallback?.(20);

    // Check connection
    const connectionValid = await checkConnection();
    if (!connectionValid) {
      return {
        success: false,
        error: connectionCache?.error || 'Verbindung zu GitHub fehlgeschlagen',
      };
    }

    progressCallback?.(30);

    // Validate image size
    if (image.size > BLOG_CONFIG.imageSettings.maxSize) {
      const maxSizeMB = (BLOG_CONFIG.imageSettings.maxSize / (1024 * 1024)).toFixed(1);
      return {
        success: false,
        error: `Datei zu groß. Maximum: ${maxSizeMB}MB`,
      };
    }

    progressCallback?.(40);

    // Generate unique filename
    const filename = generateUniqueFilename(image.name);
    const config = getGitHubConfig();
    const path = `public/content/blog/images/${filename}`;

    progressCallback?.(50);

    // Convert base64 to binary
    const base64Content = base64ToBase64Binary(image.url);

    progressCallback?.(60);

    // Prepare commit message
    const commitMessage = `Add blog image: ${filename} 🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>`;

    // Upload to GitHub with retry logic
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        logServiceEvent('upload_attempt', { attempt, filename, path });
        
        const response = await githubApiRequest(`/repos/${config.repo}/contents/${path}`, {
          method: 'PUT',
          body: JSON.stringify({
            message: commitMessage,
            content: base64Content,
            branch: config.branch,
            committer: {
              name: 'Claude Code',
              email: 'noreply@anthropic.com',
            },
            author: {
              name: 'Blog Admin',
              email: 'admin@melaniezeyer.de',
            },
          }),
        });

        progressCallback?.(70 + (attempt * 10));

        if (response.ok) {
          const result: GitHubApiResponse = await response.json();
          
          // Generate the public URL for the uploaded image
          const publicUrl = `https://raw.githubusercontent.com/${config.repo}/${config.branch}/${path}`;
          
          logServiceEvent('upload_success', { 
            filename,
            sha: result.content.sha,
            url: publicUrl,
            attempts: attempt
          });

          progressCallback?.(100);

          return {
            success: true,
            url: publicUrl,
            filename,
            sha: result.content.sha,
          };
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
          lastError = new Error(errorData.message || `HTTP ${response.status}`);
          
          // Don't retry on certain errors
          if (response.status === 401 || response.status === 403 || response.status === 422) {
            break;
          }
          
          logServiceEvent('upload_attempt_failed', { 
            attempt, 
            status: response.status, 
            error: errorData.message 
          });
          
          // Wait before retry (except on last attempt)
          if (attempt < MAX_RETRY_ATTEMPTS) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        logServiceEvent('upload_attempt_error', { 
          attempt, 
          error: lastError.message 
        });
        
        // Wait before retry (except on last attempt)
        if (attempt < MAX_RETRY_ATTEMPTS) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    // If we reach here, all attempts failed
    const errorMessage = lastError?.message.includes('rate limit') 
      ? 'GitHub-Rate-Limit erreicht. Versuchen Sie es später erneut.'
      : lastError?.message.includes('422')
      ? 'Datei existiert bereits. Neuen Namen wählen oder überschreiben?'
      : lastError?.message.includes('401')
      ? 'GitHub-Authentifizierung fehlgeschlagen. Überprüfen Sie die Konfiguration.'
      : lastError?.message.includes('403')
      ? 'Keine Berechtigung für das Repository. Überprüfen Sie die Zugriffsrechte.'
      : `Upload fehlgeschlagen: ${lastError?.message || 'Unbekannter Fehler'}`;

    logServiceEvent('upload_failed', { 
      filename,
      finalError: errorMessage,
      attempts: MAX_RETRY_ATTEMPTS
    });

    return {
      success: false,
      error: errorMessage,
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
    logServiceEvent('upload_error', { error: errorMessage });
    
    return {
      success: false,
      error: `Ein Fehler ist aufgetreten: ${errorMessage}`,
    };
  }
};

/**
 * Get public URL for an image in the repository
 */
export const getImageUrl = (filename: string): string => {
  const config = getGitHubConfig();
  return `https://raw.githubusercontent.com/${config.repo}/${config.branch}/public/content/blog/images/${filename}`;
};

/**
 * Delete image from repository (optional functionality)
 */
export const deleteImage = async (filename: string, sha?: string): Promise<void> => {
  logServiceEvent('delete_started', { filename });

  try {
    // Validate environment
    const envValidation = validateEnvironment();
    if (!envValidation.valid) {
      throw new Error(`Konfigurationsfehler: ${envValidation.error}`);
    }

    // Check connection
    const connectionValid = await checkConnection();
    if (!connectionValid) {
      throw new Error(connectionCache?.error || 'Verbindung zu GitHub fehlgeschlagen');
    }

    const config = getGitHubConfig();
    const path = `public/content/blog/images/${filename}`;

    // If SHA not provided, get it first
    let fileSha = sha;
    if (!fileSha) {
      const getResponse = await githubApiRequest(`/repos/${config.repo}/contents/${path}`);
      if (getResponse.ok) {
        const fileData = await getResponse.json();
        fileSha = fileData.sha;
      } else {
        throw new Error('Datei nicht gefunden');
      }
    }

    // Delete file
    const response = await githubApiRequest(`/repos/${config.repo}/contents/${path}`, {
      method: 'DELETE',
      body: JSON.stringify({
        message: `Delete blog image: ${filename} 🤖 Generated with Claude Code`,
        sha: fileSha,
        branch: config.branch,
        committer: {
          name: 'Claude Code',
          email: 'noreply@anthropic.com',
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    logServiceEvent('delete_success', { filename });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
    logServiceEvent('delete_error', { filename, error: errorMessage });
    throw error;
  }
};

/**
 * Clear connection cache (useful for testing or manual refresh)
 */
export const clearConnectionCache = (): void => {
  connectionCache = null;
  logServiceEvent('cache_cleared');
};

/**
 * Get service event logs (for admin dashboard)
 */
export const getServiceLogs = (): unknown[] => {
  const events = sessionStorage.getItem('github_service_events');
  return events ? JSON.parse(events) : [];
};

/**
 * Default export object implementing the GitHubImageService interface
 */
const GitHubImageService = {
  uploadImage,
  checkConnection,
  getImageUrl,
  deleteImage,
  clearConnectionCache,
  getServiceLogs,
};

export default GitHubImageService;