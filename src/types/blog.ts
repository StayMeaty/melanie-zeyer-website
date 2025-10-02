// Blog feature type definitions for the Melanie project

/**
 * Blog categories for content organization
 */
export type BlogCategory = 
  | 'coaching' 
  | 'persoenlichkeitsentwicklung' 
  | 'lifestyle' 
  | 'business' 
  | 'gesundheit'
  | 'mindset';

/**
 * Blog post tags for detailed categorization
 */
export type BlogTag = string;

/**
 * Blog post status enumeration
 */
export type BlogStatus = 'draft' | 'published' | 'archived';

/**
 * Author information interface
 */
export interface BlogAuthor {
  /** Author's unique identifier */
  id: string;
  /** Author's display name */
  name: string;
  /** Author's email address */
  email: string;
  /** Short biographical description */
  bio?: string;
  /** Profile image URL or path */
  avatar?: string;
  /** Author's website URL */
  website?: string;
  /** Social media links */
  social?: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
}

/**
 * SEO metadata interface
 */
export interface BlogSEO {
  /** Meta title for search engines */
  metaTitle?: string;
  /** Meta description for search engines */
  metaDescription?: string;
  /** Canonical URL */
  canonicalUrl?: string;
  /** Open Graph image */
  ogImage?: string;
  /** Open Graph title */
  ogTitle?: string;
  /** Open Graph description */
  ogDescription?: string;
  /** Twitter card title */
  twitterTitle?: string;
  /** Twitter card description */
  twitterDescription?: string;
  /** Twitter card image */
  twitterImage?: string;
  /** Twitter card type */
  twitterCard?: 'summary' | 'summary_large_image';
  /** Keywords for SEO */
  keywords?: string[];
  /** Focus keyphrase for content optimization */
  focusKeyphrase?: string;
  /** Robots meta tag directives */
  robots?: string;
  /** Schema.org structured data */
  structuredData?: Record<string, unknown>;
}

/**
 * Blog post frontmatter metadata interface
 * Used for parsing markdown frontmatter
 */
export interface BlogMetadata {
  /** Post title */
  title: string;
  /** URL-friendly slug */
  slug: string;
  /** Publication date */
  date: string;
  /** Post excerpt/summary */
  excerpt: string;
  /** Author identifier */
  author: string;
  /** Post category */
  category: BlogCategory;
  /** Post tags */
  tags: BlogTag[];
  /** Featured image */
  image?: string;
  /** Alt text for featured image */
  imageAlt?: string;
  /** Publication status */
  status: BlogStatus;
  /** Featured post flag */
  featured?: boolean;
  /** SEO metadata */
  seo?: BlogSEO;
  /** Estimated reading time in minutes */
  readingTime?: number;
  /** Last modified date */
  lastModified?: string;
}

/**
 * Complete blog post interface
 */
export interface BlogPost extends BlogMetadata {
  /** Unique post identifier */
  id: string;
  /** Full post content (HTML or markdown) */
  content: string;
  /** Compiled HTML content */
  htmlContent?: string;
  /** Author object (resolved from author ID) */
  authorData?: BlogAuthor;
  /** Publication date as Date object */
  publishedAt: Date;
  /** Last modification date as Date object */
  updatedAt: Date;
  /** View count */
  viewCount?: number;
  /** Comment count */
  commentCount?: number;
  /** Featured post flag */
  featured?: boolean;
}

/**
 * Blog post summary interface for listings
 */
export interface BlogPostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: BlogCategory;
  tags: BlogTag[];
  author: string;
  authorData?: Pick<BlogAuthor, 'name' | 'avatar'>;
  publishedAt: Date;
  readingTime?: number;
  image?: string;
  imageAlt?: string;
  featured?: boolean;
  viewCount?: number;
  commentCount?: number;
  status: BlogStatus;
}

/**
 * Blog comment interface
 */
export interface BlogComment {
  /** Unique comment identifier */
  id: string;
  /** Associated post ID */
  postId: string;
  /** Parent comment ID for replies */
  parentId?: string;
  /** Commenter's name */
  name: string;
  /** Commenter's email */
  email: string;
  /** Commenter's website */
  website?: string;
  /** Comment content */
  content: string;
  /** Comment submission date */
  createdAt: Date;
  /** Comment approval status */
  approved: boolean;
  /** Spam detection flag */
  isSpam?: boolean;
  /** IP address for moderation */
  ipAddress?: string;
  /** User agent for moderation */
  userAgent?: string;
}

/**
 * GitHub integration configuration interface
 */
export interface GitHubConfig {
  /** Enable GitHub integration */
  enabled: boolean;
  /** Repository in format "owner/repo" */
  repository: string;
  /** Target branch */
  branch: string;
  /** Path for blog images in repository */
  imagePath: string;
  /** GitHub token from environment variable */
  token?: string;
  /** Raw GitHub content base URL */
  baseUrl: string;
  /** GitHub API base URL */
  apiUrl: string;
  /** Number of retries for rate limit errors */
  rateLimitRetries: number;
  /** Connection timeout in milliseconds */
  connectionTimeout: number;
  /** Upload timeout in milliseconds */
  uploadTimeout: number;
}

/**
 * Image storage configuration interface
 */
export interface ImageStorageConfig {
  /** Enable GitHub storage */
  enableGitHub: boolean;
  /** Enable localStorage fallback */
  enableLocalStorage: boolean;
  /** Default storage method */
  defaultStorage: 'github' | 'localStorage';
  /** Maximum file size for GitHub uploads */
  maxGitHubSize: number;
  /** Maximum total size for localStorage */
  maxLocalStorageSize: number;
  /** Fallback behavior when primary storage fails */
  fallbackBehavior: 'localStorage' | 'error';
  /** Synchronization behavior between storage types */
  syncBehavior: 'auto' | 'manual' | 'disabled';
}

/**
 * GitHub image metadata interface
 */
export interface GitHubImageMetadata {
  /** Image filename */
  filename: string;
  /** Full path in repository */
  path: string;
  /** Public URL for the image */
  url: string;
  /** Alt text for accessibility */
  altText?: string;
  /** File size in bytes */
  size: number;
  /** Upload timestamp */
  uploadedAt: string;
  /** GitHub SHA hash for the file */
  sha: string;
  /** Storage type identifier */
  storageType: 'github';
}

/**
 * Storage type union
 */
export type ImageStorageType = 'github' | 'localStorage';

/**
 * Image upload result interface
 */
export interface ImageUploadResult {
  /** Upload success status */
  success: boolean;
  /** Storage type used */
  storageType: ImageStorageType;
  /** Public URL for the uploaded image */
  url: string;
  /** Final filename */
  filename: string;
  /** Error message if upload failed */
  error?: string;
  /** GitHub SHA hash (GitHub only) */
  sha?: string;
  /** Additional metadata */
  metadata?: GitHubImageMetadata;
}

/**
 * GitHub configuration validation result
 */
export interface GitHubConfigValidation {
  /** Has valid GitHub token */
  hasToken: boolean;
  /** Has repository configured */
  hasRepository: boolean;
  /** Repository format is valid (owner/repo) */
  repositoryFormat: boolean;
  /** Configuration is complete and valid */
  isConfigured: boolean;
}

/**
 * Blog configuration interface
 */
export interface BlogConfig {
  /** Number of posts per page */
  postsPerPage: number;
  /** Enable comments system */
  enableComments: boolean;
  /** Require comment moderation */
  moderateComments: boolean;
  /** Enable post search */
  enableSearch: boolean;
  /** Enable RSS feed */
  enableRss: boolean;
  /** Site base URL for RSS */
  siteUrl: string;
  /** Default author ID */
  defaultAuthor: string;
  /** Supported categories */
  categories: readonly BlogCategory[];
  /** Date format for display */
  dateFormat: string;
  /** Reading speed (words per minute) */
  readingSpeed: number;
  /** Maximum excerpt length */
  excerptLength: number;
  /** Image upload settings */
  imageSettings: {
    maxSize: number; // in bytes
    allowedTypes: readonly string[];
    thumbnailSizes: readonly number[];
    supportedStorageTypes: readonly ImageStorageType[];
    preferredStorage: ImageStorageType;
  };
  /** GitHub integration configuration */
  github: GitHubConfig;
  /** Image storage configuration */
  imageStorage: ImageStorageConfig;
  /** Feature flags */
  features: {
    githubIntegration: boolean;
    hybridImageStorage: boolean;
    offlineImageSupport: boolean;
  };
}

/**
 * Admin user interface for blog management
 */
export interface AdminUser {
  /** Unique user identifier */
  id: string;
  /** User's email address */
  email: string;
  /** User's display name */
  name: string;
  /** User's role */
  role: 'admin' | 'editor' | 'author';
  /** Account creation date */
  createdAt: Date;
  /** Last login date */
  lastLogin?: Date;
  /** Account active status */
  active: boolean;
  /** User permissions */
  permissions: {
    canCreatePosts: boolean;
    canEditPosts: boolean;
    canDeletePosts: boolean;
    canManageComments: boolean;
    canManageUsers: boolean;
    canManageSettings: boolean;
  };
}

/**
 * Blog pagination interface
 */
export interface BlogPagination {
  /** Current page number */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Total number of posts */
  totalPosts: number;
  /** Posts per page */
  perPage: number;
  /** Has previous page */
  hasPrevious: boolean;
  /** Has next page */
  hasNext: boolean;
  /** Previous page number */
  previousPage?: number;
  /** Next page number */
  nextPage?: number;
}

/**
 * Blog search result interface
 */
export interface BlogSearchResult {
  /** Search query */
  query: string;
  /** Matching posts */
  posts: BlogPostSummary[];
  /** Total results found */
  totalResults: number;
  /** Search execution time */
  searchTime: number;
  /** Pagination info */
  pagination: BlogPagination;
}

/**
 * Blog category with metadata
 */
export interface BlogCategoryInfo {
  /** Category identifier */
  category: BlogCategory;
  /** Display name in German */
  displayName: string;
  /** Category description */
  description?: string;
  /** Category slug for URLs */
  slug: string;
  /** Post count in this category */
  postCount: number;
  /** Category color for UI */
  color?: string;
  /** Category icon */
  icon?: string;
}

/**
 * Blog archive structure
 */
export interface BlogArchive {
  /** Archive year */
  year: number;
  /** Months in the year */
  months: Array<{
    month: number;
    monthName: string;
    postCount: number;
    posts: BlogPostSummary[];
  }>;
  /** Total posts in year */
  totalPosts: number;
}

/**
 * Blog analytics interface
 */
export interface BlogAnalytics {
  /** Total post views */
  totalViews: number;
  /** Total published posts */
  totalPosts: number;
  /** Total comments */
  totalComments: number;
  /** Most popular posts */
  popularPosts: Array<{
    post: BlogPostSummary;
    views: number;
  }>;
  /** Views by category */
  categoryViews: Array<{
    category: BlogCategory;
    views: number;
  }>;
  /** Monthly view statistics */
  monthlyViews: Array<{
    month: string;
    views: number;
  }>;
}

/**
 * Blog RSS feed item interface
 */
export interface BlogRSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  guid: string;
  category: string[];
  author: string;
  content: string;
}

/**
 * Required Environment Variables for GitHub Integration:
 * 
 * VITE_GITHUB_TOKEN - GitHub Personal Access Token with repo access
 * VITE_GITHUB_REPO - Repository in format "owner/repo" 
 * VITE_GITHUB_BRANCH - Target branch (optional, defaults to "main")
 * 
 * Example .env configuration:
 * VITE_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
 * VITE_GITHUB_REPO=username/melaniezeyer-website  
 * VITE_GITHUB_BRANCH=main
 */

/**
 * GitHub configuration defaults
 */
export const GITHUB_CONFIG: GitHubConfig = {
  enabled: Boolean(import.meta.env.VITE_GITHUB_TOKEN),
  repository: import.meta.env.VITE_GITHUB_REPO || '',
  branch: import.meta.env.VITE_GITHUB_BRANCH || 'main',
  imagePath: 'public/content/blog/images',
  token: import.meta.env.VITE_GITHUB_TOKEN,
  baseUrl: 'https://raw.githubusercontent.com',
  apiUrl: 'https://api.github.com',
  rateLimitRetries: 3,
  connectionTimeout: 10000, // 10 seconds
  uploadTimeout: 30000, // 30 seconds
};

/**
 * Image storage configuration defaults
 */
export const IMAGE_STORAGE_CONFIG: ImageStorageConfig = {
  enableGitHub: Boolean(import.meta.env.VITE_GITHUB_TOKEN),
  enableLocalStorage: true,
  defaultStorage: import.meta.env.VITE_GITHUB_TOKEN ? 'github' : 'localStorage',
  maxGitHubSize: 5 * 1024 * 1024, // 5MB (same as current)
  maxLocalStorageSize: 10 * 1024 * 1024, // 10MB total
  fallbackBehavior: 'localStorage',
  syncBehavior: 'auto',
};

/**
 * Default blog configuration
 */
export const BLOG_CONFIG: BlogConfig = {
  postsPerPage: 12,
  enableComments: true,
  moderateComments: true,
  enableSearch: true,
  enableRss: true,
  siteUrl: 'https://melaniezeyer.de',
  defaultAuthor: 'melanie',
  categories: [
    'coaching',
    'persoenlichkeitsentwicklung',
    'lifestyle',
    'business',
    'gesundheit',
    'mindset'
  ] as const,
  dateFormat: 'DD.MM.YYYY',
  readingSpeed: 200,
  excerptLength: 150,
  imageSettings: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
    thumbnailSizes: [150, 300, 600, 1200] as const,
    supportedStorageTypes: ['github', 'localStorage'] as const,
    preferredStorage: IMAGE_STORAGE_CONFIG.defaultStorage,
  },
  github: GITHUB_CONFIG,
  imageStorage: IMAGE_STORAGE_CONFIG,
  features: {
    githubIntegration: Boolean(import.meta.env.VITE_GITHUB_TOKEN),
    hybridImageStorage: true,
    offlineImageSupport: true,
  },
} as const;

/**
 * Blog category display information
 */
export const BLOG_CATEGORIES: readonly BlogCategoryInfo[] = [
  {
    category: 'coaching',
    displayName: 'Coaching',
    description: 'Professionelle Begleitung für persönliche und berufliche Entwicklung',
    slug: 'coaching',
    postCount: 0,
    color: '#0097B2',
    icon: 'user-check',
  },
  {
    category: 'persoenlichkeitsentwicklung',
    displayName: 'Persönlichkeitsentwicklung',
    description: 'Wege zur Selbstfindung und persönlichen Weiterentwicklung',
    slug: 'persoenlichkeitsentwicklung',
    postCount: 0,
    color: '#70A6B0',
    icon: 'trending-up',
  },
  {
    category: 'lifestyle',
    displayName: 'Lifestyle',
    description: 'Inspiration für ein bewusstes und erfülltes Leben',
    slug: 'lifestyle',
    postCount: 0,
    color: '#e8cd8c',
    icon: 'heart',
  },
  {
    category: 'business',
    displayName: 'Business',
    description: 'Unternehmertum und berufliche Entwicklung',
    slug: 'business',
    postCount: 0,
    color: '#2D3748',
    icon: 'briefcase',
  },
  {
    category: 'gesundheit',
    displayName: 'Gesundheit',
    description: 'Körperliche und mentale Gesundheit im Fokus',
    slug: 'gesundheit',
    postCount: 0,
    color: '#68D391',
    icon: 'activity',
  },
  {
    category: 'mindset',
    displayName: 'Mindset',
    description: 'Die richtige Einstellung für Erfolg und Zufriedenheit',
    slug: 'mindset',
    postCount: 0,
    color: '#9F7AEA',
    icon: 'brain',
  },
] as const;

/**
 * Validates GitHub configuration
 */
export const validateGitHubConfig = (): GitHubConfigValidation => {
  const config = BLOG_CONFIG.github;
  const hasToken = !!config.token;
  const hasRepository = !!config.repository;
  const repositoryFormat = /^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/.test(config.repository);
  
  return {
    hasToken,
    hasRepository,
    repositoryFormat,
    isConfigured: hasToken && hasRepository && repositoryFormat,
  };
};

/**
 * Gets image upload configuration based on current settings
 */
export const getImageUploadConfig = (): {
  canUseGitHub: boolean;
  canUseLocalStorage: boolean;
  defaultMethod: ImageStorageType;
} => {
  const validation = validateGitHubConfig();
  const storage = BLOG_CONFIG.imageStorage;
  
  return {
    canUseGitHub: storage.enableGitHub && validation.isConfigured,
    canUseLocalStorage: storage.enableLocalStorage,
    defaultMethod: validation.isConfigured ? storage.defaultStorage : 'localStorage',
  };
};

/**
 * Default admin permissions for different roles
 */
export const ADMIN_PERMISSIONS = {
  admin: {
    canCreatePosts: true,
    canEditPosts: true,
    canDeletePosts: true,
    canManageComments: true,
    canManageUsers: true,
    canManageSettings: true,
  },
  editor: {
    canCreatePosts: true,
    canEditPosts: true,
    canDeletePosts: true,
    canManageComments: true,
    canManageUsers: false,
    canManageSettings: false,
  },
  author: {
    canCreatePosts: true,
    canEditPosts: true,
    canDeletePosts: false,
    canManageComments: false,
    canManageUsers: false,
    canManageSettings: false,
  },
} as const;