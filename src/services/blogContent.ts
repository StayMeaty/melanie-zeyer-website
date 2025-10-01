// Blog content service for loading and managing blog posts from markdown files
// Serverless-compatible implementation for Netlify deployment

import matter from 'gray-matter';
import {
  BlogPost,
  BlogPostSummary,
  BlogCategory,
  BlogMetadata,
  BlogPagination,
  BlogSearchResult,
  BlogStatus,
  BlogSEO,
  BLOG_CONFIG,
} from '../types/blog';

/**
 * Interface for post cache entry
 */
interface PostCacheEntry {
  post: BlogPost;
  lastModified: number;
}

/**
 * Cache for processed blog posts to improve performance
 */
class PostCache {
  private cache = new Map<string, PostCacheEntry>();
  private allPostsCache: BlogPost[] | null = null;
  private allPostsCacheTime: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  get(slug: string): BlogPost | null {
    const entry = this.cache.get(slug);
    if (!entry) return null;
    
    // Check if cache entry is still valid
    if (Date.now() - entry.lastModified > this.CACHE_TTL) {
      this.cache.delete(slug);
      return null;
    }
    
    return entry.post;
  }

  set(slug: string, post: BlogPost): void {
    this.cache.set(slug, {
      post,
      lastModified: Date.now(),
    });
  }

  getAllPosts(): BlogPost[] | null {
    if (Date.now() - this.allPostsCacheTime > this.CACHE_TTL) {
      this.allPostsCache = null;
      return null;
    }
    return this.allPostsCache;
  }

  setAllPosts(posts: BlogPost[]): void {
    this.allPostsCache = posts;
    this.allPostsCacheTime = Date.now();
  }

  clear(): void {
    this.cache.clear();
    this.allPostsCache = null;
    this.allPostsCacheTime = 0;
  }
}

// Global cache instance
const postCache = new PostCache();

/**
 * Generate URL-friendly slug from title
 * @param title - The post title
 * @returns URL-friendly slug
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[äöüß]/g, (match) => {
      const replacements: { [key: string]: string } = {
        'ä': 'ae',
        'ö': 'oe',
        'ü': 'ue',
        'ß': 'ss',
      };
      return replacements[match] || match;
    })
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Calculate reading time based on word count
 * @param content - The post content
 * @returns Reading time in minutes
 */
function calculateReadingTime(content: string): number {
  const wordsPerMinute = BLOG_CONFIG.readingSpeed;
  const wordCount = content.trim().split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  return Math.max(1, readingTime); // Minimum 1 minute
}

/**
 * Parse frontmatter and validate required fields
 * @param frontmatter - Raw frontmatter data
 * @param filename - File name for error reporting
 * @returns Validated blog metadata
 */
function parseFrontmatter(frontmatter: Record<string, unknown>, filename: string): BlogMetadata {
  // Validate required fields
  const requiredFields = ['title', 'date', 'excerpt', 'author', 'category'];
  for (const field of requiredFields) {
    if (!frontmatter[field]) {
      throw new Error(`Datei ${filename}: Pflichtfeld '${field}' fehlt`);
    }
  }

  // Validate category
  const category = frontmatter.category as string;
  if (!BLOG_CONFIG.categories.includes(category as BlogCategory)) {
    throw new Error(`Datei ${filename}: Ungültige Kategorie '${category}'`);
  }

  // Generate slug if not provided
  const slug = frontmatter.slug ? String(frontmatter.slug) : generateSlug(String(frontmatter.title));

  return {
    title: String(frontmatter.title),
    slug,
    date: String(frontmatter.date),
    excerpt: String(frontmatter.excerpt),
    author: String(frontmatter.author),
    category: category as BlogCategory,
    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags.map(String) : [],
    image: frontmatter.image ? String(frontmatter.image) : undefined,
    imageAlt: frontmatter.imageAlt ? String(frontmatter.imageAlt) : undefined,
    status: (frontmatter.status as BlogStatus) || 'published',
    seo: frontmatter.seo as BlogSEO | undefined,
    readingTime: frontmatter.readingTime ? Number(frontmatter.readingTime) : undefined,
    lastModified: frontmatter.lastModified ? String(frontmatter.lastModified) : undefined,
  };
}

/**
 * Convert blog metadata to complete blog post
 * @param metadata - Blog metadata
 * @param content - Post content
 * @returns Complete blog post
 */
function createBlogPost(metadata: BlogMetadata, content: string): BlogPost {
  const publishedAt = new Date(metadata.date);
  const updatedAt = metadata.lastModified ? new Date(metadata.lastModified) : publishedAt;
  
  // Calculate reading time if not provided
  const readingTime = metadata.readingTime || calculateReadingTime(content);

  return {
    ...metadata,
    id: metadata.slug,
    content,
    publishedAt,
    updatedAt,
    readingTime,
  };
}

/**
 * Load and parse a single markdown file
 * @param filePath - Path to the markdown file
 * @returns Parsed blog post
 */
async function loadMarkdownFile(filePath: string): Promise<BlogPost> {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const fileContent = await response.text();
    const { data: frontmatter, content } = matter(fileContent);
    
    const filename = filePath.split('/').pop() || filePath;
    const metadata = parseFrontmatter(frontmatter, filename);
    
    return createBlogPost(metadata, content);
  } catch (error) {
    console.error(`Fehler beim Laden der Datei ${filePath}:`, error);
    throw new Error(`Blog-Post konnte nicht geladen werden: ${filePath}`);
  }
}

/**
 * Get list of markdown files from the blog content directory
 * In a serverless environment, we need to maintain a manifest of available files
 * @returns Array of file paths
 */
async function getMarkdownFiles(): Promise<string[]> {
  // In a real implementation, you would either:
  // 1. Maintain a manifest file with all blog post paths
  // 2. Use a build-time process to generate the file list
  // 3. Use a content management system API
  
  // For now, we'll attempt to load a manifest file
  try {
    const response = await fetch('/content/blog/manifest.json');
    if (response.ok) {
      const manifest = await response.json();
      return manifest.files || [];
    }
  } catch {
    console.warn('Blog manifest nicht gefunden, verwende leere Liste');
  }
  
  // Fallback: return empty array (no posts available)
  return [];
}

/**
 * Load all blog posts from markdown files
 * @returns Array of all blog posts
 */
export async function loadAllPosts(): Promise<BlogPost[]> {
  try {
    // Check cache first
    const cachedPosts = postCache.getAllPosts();
    if (cachedPosts) {
      return cachedPosts;
    }

    const fileList = await getMarkdownFiles();
    const posts: BlogPost[] = [];
    
    // Load posts in parallel with error handling
    const loadPromises = fileList.map(async (filePath) => {
      try {
        const post = await loadMarkdownFile(`/content/blog/${filePath}`);
        return post;
      } catch (error) {
        console.error(`Fehler beim Laden von ${filePath}:`, error);
        return null;
      }
    });

    const results = await Promise.all(loadPromises);
    
    // Filter out failed loads and draft posts (unless in development)
    for (const post of results) {
      if (post && (post.status === 'published' || import.meta.env.DEV)) {
        posts.push(post);
      }
    }

    // Sort posts by date (newest first)
    posts.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

    // Cache the results
    postCache.setAllPosts(posts);

    return posts;
  } catch (error) {
    console.error('Fehler beim Laden aller Blog-Posts:', error);
    throw new Error('Blog-Posts konnten nicht geladen werden');
  }
}

/**
 * Load a specific blog post by slug
 * @param slug - The post slug
 * @returns Blog post or null if not found
 */
export async function loadPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    // Check cache first
    const cachedPost = postCache.get(slug);
    if (cachedPost) {
      return cachedPost;
    }

    // Load all posts and find the one with matching slug
    const allPosts = await loadAllPosts();
    const post = allPosts.find(p => p.slug === slug) || null;
    
    if (post) {
      postCache.set(slug, post);
    }
    
    return post;
  } catch (error) {
    console.error(`Fehler beim Laden des Posts mit Slug '${slug}':`, error);
    return null;
  }
}

/**
 * Get posts filtered by category
 * @param category - Blog category to filter by
 * @returns Array of posts in the specified category
 */
export async function getPostsByCategory(category: BlogCategory): Promise<BlogPostSummary[]> {
  try {
    const allPosts = await loadAllPosts();
    const categoryPosts = allPosts
      .filter(post => post.category === category)
      .map(post => createPostSummary(post));
    
    return categoryPosts;
  } catch (error) {
    console.error(`Fehler beim Laden der Posts für Kategorie '${category}':`, error);
    throw new Error(`Posts für Kategorie '${category}' konnten nicht geladen werden`);
  }
}

/**
 * Get posts filtered by tag
 * @param tag - Tag to filter by
 * @returns Array of posts with the specified tag
 */
export async function getPostsByTag(tag: string): Promise<BlogPostSummary[]> {
  try {
    const allPosts = await loadAllPosts();
    const tagPosts = allPosts
      .filter(post => post.tags.includes(tag))
      .map(post => createPostSummary(post));
    
    return tagPosts;
  } catch (error) {
    console.error(`Fehler beim Laden der Posts für Tag '${tag}':`, error);
    throw new Error(`Posts für Tag '${tag}' konnten nicht geladen werden`);
  }
}

/**
 * Get the most recent blog posts
 * @param limit - Maximum number of posts to return
 * @returns Array of recent posts
 */
export async function getRecentPosts(limit: number = 5): Promise<BlogPostSummary[]> {
  try {
    const allPosts = await loadAllPosts();
    return allPosts
      .slice(0, limit)
      .map(post => createPostSummary(post));
  } catch (error) {
    console.error(`Fehler beim Laden der neuesten Posts:`, error);
    throw new Error('Neueste Posts konnten nicht geladen werden');
  }
}

/**
 * Search posts by title and content
 * @param query - Search query
 * @returns Search results with matching posts
 */
export async function searchPosts(query: string): Promise<BlogSearchResult> {
  const startTime = Date.now();
  
  try {
    if (!query.trim()) {
      return {
        query: '',
        posts: [],
        totalResults: 0,
        searchTime: Date.now() - startTime,
        pagination: createEmptyPagination(),
      };
    }

    const allPosts = await loadAllPosts();
    const searchTerm = query.toLowerCase().trim();
    
    const matchingPosts = allPosts.filter(post => {
      const titleMatch = post.title.toLowerCase().includes(searchTerm);
      const excerptMatch = post.excerpt.toLowerCase().includes(searchTerm);
      const contentMatch = post.content.toLowerCase().includes(searchTerm);
      const tagMatch = post.tags.some(tag => tag.toLowerCase().includes(searchTerm));
      
      return titleMatch || excerptMatch || contentMatch || tagMatch;
    });

    const searchResults = matchingPosts.map(post => createPostSummary(post));
    
    return {
      query,
      posts: searchResults,
      totalResults: searchResults.length,
      searchTime: Date.now() - startTime,
      pagination: createEmptyPagination(), // No pagination for search results for now
    };
  } catch (error) {
    console.error(`Fehler bei der Suche nach '${query}':`, error);
    throw new Error('Suche konnte nicht durchgeführt werden');
  }
}

/**
 * Get paginated blog posts
 * @param page - Page number (1-based)
 * @param perPage - Posts per page
 * @returns Paginated posts with pagination info
 */
export async function getPaginatedPosts(
  page: number = 1,
  perPage: number = BLOG_CONFIG.postsPerPage
): Promise<{ posts: BlogPostSummary[]; pagination: BlogPagination }> {
  try {
    const allPosts = await loadAllPosts();
    const totalPosts = allPosts.length;
    const totalPages = Math.ceil(totalPosts / perPage);
    
    // Validate page number
    const currentPage = Math.max(1, Math.min(page, totalPages));
    const startIndex = (currentPage - 1) * perPage;
    const endIndex = Math.min(startIndex + perPage, totalPosts);
    
    const posts = allPosts
      .slice(startIndex, endIndex)
      .map(post => createPostSummary(post));

    const pagination: BlogPagination = {
      currentPage,
      totalPages,
      totalPosts,
      perPage,
      hasPrevious: currentPage > 1,
      hasNext: currentPage < totalPages,
      previousPage: currentPage > 1 ? currentPage - 1 : undefined,
      nextPage: currentPage < totalPages ? currentPage + 1 : undefined,
    };

    return { posts, pagination };
  } catch (error) {
    console.error(`Fehler beim Laden der Seite ${page}:`, error);
    throw new Error('Seite konnte nicht geladen werden');
  }
}

/**
 * Convert a full blog post to a summary for listings
 * @param post - Full blog post
 * @returns Blog post summary
 */
function createPostSummary(post: BlogPost): BlogPostSummary {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    category: post.category,
    tags: post.tags,
    author: post.author,
    authorData: post.authorData ? {
      name: post.authorData.name,
      avatar: post.authorData.avatar,
    } : undefined,
    publishedAt: post.publishedAt,
    readingTime: post.readingTime,
    image: post.image,
    imageAlt: post.imageAlt,
    featured: post.featured,
    viewCount: post.viewCount,
    commentCount: post.commentCount,
  };
}

/**
 * Create empty pagination object
 * @returns Empty pagination object
 */
function createEmptyPagination(): BlogPagination {
  return {
    currentPage: 1,
    totalPages: 0,
    totalPosts: 0,
    perPage: BLOG_CONFIG.postsPerPage,
    hasPrevious: false,
    hasNext: false,
  };
}

/**
 * Clear all cached data (useful for development/testing)
 */
export function clearCache(): void {
  postCache.clear();
}

/**
 * Get all available tags from all posts
 * @returns Array of unique tags with post counts
 */
export async function getAllTags(): Promise<Array<{ tag: string; count: number }>> {
  try {
    const allPosts = await loadAllPosts();
    const tagCounts = new Map<string, number>();
    
    allPosts.forEach(post => {
      post.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });
    
    return Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count); // Sort by count descending
  } catch (error) {
    console.error('Fehler beim Laden der Tags:', error);
    throw new Error('Tags konnten nicht geladen werden');
  }
}

/**
 * Get post statistics
 * @returns Basic statistics about the blog
 */
export async function getBlogStats(): Promise<{
  totalPosts: number;
  totalCategories: number;
  totalTags: number;
  averageReadingTime: number;
}> {
  try {
    const allPosts = await loadAllPosts();
    const allTags = await getAllTags();
    
    const totalReadingTime = allPosts.reduce((sum, post) => sum + (post.readingTime || 0), 0);
    const averageReadingTime = allPosts.length > 0 ? Math.round(totalReadingTime / allPosts.length) : 0;
    
    const categories = new Set(allPosts.map(post => post.category));
    
    return {
      totalPosts: allPosts.length,
      totalCategories: categories.size,
      totalTags: allTags.length,
      averageReadingTime,
    };
  } catch (error) {
    console.error('Fehler beim Laden der Blog-Statistiken:', error);
    throw new Error('Blog-Statistiken konnten nicht geladen werden');
  }
}