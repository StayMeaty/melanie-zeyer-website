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
  /** Keywords for SEO */
  keywords?: string[];
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