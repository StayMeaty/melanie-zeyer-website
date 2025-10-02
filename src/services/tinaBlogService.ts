// Tina CMS blog service for loading posts via GraphQL
// Integrates with existing blog service while maintaining backward compatibility

import {
  BlogPost,
  BlogStatus,
  BlogSEO,
  BLOG_CONFIG,
} from '../types/blog';
import {
  TinaBlogPost,
  TinaBlogListResponse,
  TinaContent,
  TinaRichTextNode,
  isTinaRichTextContent,
  isTinaRichTextNode,
  isTinaBlogPost,
  isValidBlogCategory,
  isValidBlogStatus,
  mapTinaSEOToBlogSEO,
  createTinaError,
} from '../types/tina';
import { tinaClient } from './tinaClient';
import { generateSlug } from './blogContent';


/**
 * Cache for Tina blog posts
 */
interface TinaCacheEntry {
  posts: BlogPost[];
  lastModified: number;
}

/**
 * Tina blog service cache
 */
class TinaBlogCache {
  private cache: TinaCacheEntry | null = null;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  get(): BlogPost[] | null {
    if (!this.cache) return null;
    
    // Check if cache entry is still valid
    if (Date.now() - this.cache.lastModified > this.CACHE_TTL) {
      this.cache = null;
      return null;
    }
    
    return this.cache.posts;
  }

  set(posts: BlogPost[]): void {
    this.cache = {
      posts,
      lastModified: Date.now(),
    };
  }

  clear(): void {
    this.cache = null;
  }
}

// Global cache instance
const tinaBlogCache = new TinaBlogCache();

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
 * Convert Tina rich text content to plain text for reading time calculation
 * @param richTextContent - Tina rich text content object
 * @returns Plain text string
 */
function extractTextFromTinaContent(richTextContent: TinaContent): string {
  if (!richTextContent) return '';
  
  try {
    // Handle string content
    if (typeof richTextContent === 'string') {
      return richTextContent;
    }
    
    // Handle markdown content
    if ('type' in richTextContent && richTextContent.type === 'markdown') {
      return richTextContent.content;
    }
    
    // Handle rich text content
    if (isTinaRichTextContent(richTextContent)) {
      return extractTextFromRichTextNodes(richTextContent.children);
    }
    
    // Handle array of nodes directly
    if (Array.isArray(richTextContent)) {
      return extractTextFromRichTextNodes(richTextContent as TinaRichTextNode[]);
    }
    
    // Fallback: stringify and estimate
    const stringified = JSON.stringify(richTextContent);
    return stringified.replace(/[{}[\]",:]/g, ' ').replace(/\s+/g, ' ').trim();
  } catch (error) {
    console.warn('Fehler beim Extrahieren des Textes aus Tina Content:', error);
    return '';
  }
}

/**
 * Extract text from an array of rich text nodes
 * @param nodes - Array of Tina rich text nodes
 * @returns Plain text string
 */
function extractTextFromRichTextNodes(nodes: TinaRichTextNode[]): string {
  if (!Array.isArray(nodes)) return '';
  
  return nodes.map(node => {
    if (!isTinaRichTextNode(node)) return '';
    
    // Extract text from text nodes
    if (node.text) {
      return node.text;
    }
    
    // Recursively extract from children
    if (node.children) {
      return extractTextFromRichTextNodes(node.children);
    }
    
    return '';
  }).join(' ');
}

/**
 * Convert Tina rich text content to markdown-like string
 * @param richTextContent - Tina rich text content object
 * @returns Markdown string
 */
function convertTinaContentToMarkdown(richTextContent: TinaContent): string {
  if (!richTextContent) return '';
  
  try {
    // Handle string content
    if (typeof richTextContent === 'string') {
      return richTextContent;
    }
    
    // Handle markdown content
    if ('type' in richTextContent && richTextContent.type === 'markdown') {
      return richTextContent.content;
    }
    
    // Handle rich text content
    if (isTinaRichTextContent(richTextContent)) {
      return convertRichTextNodesToMarkdown(richTextContent.children);
    }
    
    // Fallback: return a stringified version
    return JSON.stringify(richTextContent, null, 2);
  } catch (error) {
    console.warn('Fehler beim Konvertieren des Tina Contents zu Markdown:', error);
    return '';
  }
}

/**
 * Convert rich text nodes to markdown
 * @param nodes - Array of Tina rich text nodes
 * @returns Markdown string
 */
function convertRichTextNodesToMarkdown(nodes: TinaRichTextNode[]): string {
  if (!Array.isArray(nodes)) return '';
  
  return nodes.map(node => {
    if (!isTinaRichTextNode(node)) return '';
    
    // Handle text nodes with formatting
    if (node.text) {
      let text = node.text;
      if (node.bold) text = `**${text}**`;
      if (node.italic) text = `*${text}*`;
      if (node.code) text = `\`${text}\``;
      return text;
    }
    
    // Handle structural elements
    const childContent = node.children ? convertRichTextNodesToMarkdown(node.children) : '';
    
    switch (node.type) {
      case 'h1': return `# ${childContent}\n\n`;
      case 'h2': return `## ${childContent}\n\n`;
      case 'h3': return `### ${childContent}\n\n`;
      case 'h4': return `#### ${childContent}\n\n`;
      case 'h5': return `##### ${childContent}\n\n`;
      case 'h6': return `###### ${childContent}\n\n`;
      case 'p': return `${childContent}\n\n`;
      case 'blockquote': return `> ${childContent}\n\n`;
      case 'ul': return `${childContent}\n`;
      case 'ol': return `${childContent}\n`;
      case 'li': return `- ${childContent}\n`;
      case 'a': return `[${childContent}](${node.url || ''})`;
      case 'img': return `![${node.alt || ''}](${node.src || ''})`;
      case 'hr': return '---\n\n';
      case 'br': return '\n';
      default: return childContent;
    }
  }).join('');
}

/**
 * Map Tina blog post response to BlogPost interface
 * @param tinaPost - Raw Tina blog post data
 * @returns Mapped BlogPost object
 */
function mapTinaPostToBlogPost(tinaPost: TinaBlogPost): BlogPost {
  const contentText = extractTextFromTinaContent(tinaPost.body);
  const contentMarkdown = convertTinaContentToMarkdown(tinaPost.body);
  
  // Validate required fields
  if (!tinaPost.title || !tinaPost.date || !tinaPost.excerpt || !tinaPost.author || !tinaPost.category) {
    throw createTinaError(
      `Unvollständige Tina Post Daten: ${tinaPost.id || 'unbekannt'}`,
      'INVALID_POST_DATA',
      { postId: tinaPost.id, missingFields: { title: !tinaPost.title, date: !tinaPost.date, excerpt: !tinaPost.excerpt, author: !tinaPost.author, category: !tinaPost.category } }
    );
  }

  // Validate and convert category
  if (!isValidBlogCategory(tinaPost.category)) {
    console.warn(`Ungültige Kategorie in Tina Post ${tinaPost.id}: ${tinaPost.category}`);
    throw createTinaError(
      `Ungültige Blog-Kategorie: ${tinaPost.category}`,
      'INVALID_CATEGORY',
      { postId: tinaPost.id, category: tinaPost.category }
    );
  }

  // Generate slug if not provided
  const slug = tinaPost.slug || generateSlug(tinaPost.title);

  const publishedAt = new Date(tinaPost.date);
  const updatedAt = tinaPost.lastModified ? new Date(tinaPost.lastModified) : publishedAt;
  
  // Calculate reading time if not provided
  const readingTime = tinaPost.readingTime || calculateReadingTime(contentText);

  // Validate and convert status
  const status: BlogStatus = tinaPost.status && isValidBlogStatus(tinaPost.status) 
    ? tinaPost.status 
    : 'published';

  // Map SEO data using type-safe conversion
  const seo: BlogSEO | undefined = mapTinaSEOToBlogSEO(tinaPost.seo);

  return {
    id: slug,
    title: tinaPost.title,
    slug,
    date: tinaPost.date,
    excerpt: tinaPost.excerpt,
    author: tinaPost.author,
    category: tinaPost.category,
    tags: tinaPost.tags || [],
    image: tinaPost.image,
    imageAlt: tinaPost.imageAlt,
    status,
    content: contentMarkdown,
    publishedAt,
    updatedAt,
    readingTime,
    seo,
    featured: tinaPost.featured || false,
  };
}

/**
 * Load all blog posts from Tina CMS
 * @returns Array of blog posts
 */
export async function loadPostsFromTina(): Promise<BlogPost[]> {
  try {
    // Check if Tina is enabled
    if (!tinaClient.isEnabled()) {
      console.warn('Tina CMS ist nicht aktiviert - verwende Alternative');
      return [];
    }

    // Check cache first
    const cachedPosts = tinaBlogCache.get();
    if (cachedPosts) {
      return cachedPosts;
    }

    // Check connection
    const isConnected = await tinaClient.checkConnection();
    if (!isConnected) {
      console.warn('Tina CMS Verbindung fehlgeschlagen - verwende Alternative');
      return [];
    }

    // Execute GraphQL query using real Tina client
    const client = await tinaClient.getClient();
    
    // Check if client has the expected queries structure
    if (!client || !client.queries || typeof client.queries.blogConnection !== 'function') {
      throw new Error('Tina Client nicht vollständig konfiguriert - Queries fehlen');
    }
    
    // Query all blog posts with full content
    const response = await client.queries.blogConnection({
      first: 100, // Adjust limit as needed
      sort: 'date',
      order: 'desc',
    }) as TinaBlogListResponse;

    if (!response?.blogConnection?.edges) {
      console.warn('Keine Blog Posts von Tina CMS erhalten');
      return [];
    }

    // Map Tina posts to BlogPost interface
    const posts: BlogPost[] = [];
    const loadPromises = response.blogConnection.edges.map(async (edge) => {
      try {
        // Validate the node structure before mapping
        if (!isTinaBlogPost(edge.node)) {
          console.error(`Ungültige Tina Post Struktur:`, edge.node);
          return null;
        }
        
        const mappedPost = mapTinaPostToBlogPost(edge.node);
        return mappedPost;
      } catch (error) {
        console.error(`Fehler beim Mapping von Tina Post ${edge.node.id}:`, error);
        return null;
      }
    });

    const results = await Promise.all(loadPromises);
    
    // Filter out failed mappings and draft posts (unless in development)
    for (const post of results) {
      if (post && (post.status === 'published' || import.meta.env.DEV)) {
        posts.push(post);
      }
    }

    // Sort posts by date (newest first)
    posts.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

    // Cache the results
    tinaBlogCache.set(posts);

    console.log(`${posts.length} Blog Posts von Tina CMS geladen`);
    return posts;

  } catch (error) {
    console.error('Fehler beim Laden der Posts von Tina CMS:', error);
    
    // Don't throw error - allow fallback to other methods
    console.warn('Fallback zu alternativen Post-Quellen nach Tina Fehler');
    return [];
  }
}

/**
 * Load a specific blog post by slug from Tina CMS
 * @param slug - The post slug
 * @returns Blog post or null if not found
 */
export async function loadPostBySlugFromTina(slug: string): Promise<BlogPost | null> {
  try {
    // Check if Tina is enabled
    if (!tinaClient.isEnabled()) {
      console.warn('Tina CMS ist nicht aktiviert');
      return null;
    }

    // Try direct query first for better performance
    const client = await tinaClient.getClient();
    
    if (!client || !client.queries || typeof client.queries.post !== 'function') {
      throw new Error('Tina Client queries not available');
    }
    
    // Query specific post by relativePath (slug.md)
    const response = await client.queries.post({
      relativePath: `${slug}.md`,
    });

    if (response?.post && isTinaBlogPost(response.post)) {
      return mapTinaPostToBlogPost(response.post);
    }

    // Fallback: Load all posts and find the one with matching slug
    console.warn(`Direct query for slug '${slug}' failed, trying collection search`);
    const allPosts = await loadPostsFromTina();
    return allPosts.find(post => post.slug === slug) || null;
    
  } catch (error) {
    console.error(`Fehler beim Laden des Tina Posts mit Slug '${slug}':`, error);
    return null;
  }
}

/**
 * Check if Tina CMS is available and properly configured
 * @returns True if Tina is available
 */
export async function isTinaAvailable(): Promise<boolean> {
  try {
    if (!tinaClient.isEnabled()) {
      return false;
    }

    return await tinaClient.checkConnection();
  } catch (error) {
    console.warn('Tina Verfügbarkeitsprüfung fehlgeschlagen:', error);
    return false;
  }
}

/**
 * Clear Tina cache
 */
export function clearTinaCache(): void {
  tinaBlogCache.clear();
}

/**
 * Create a new blog post via Tina CMS
 * @param postData - Blog post data
 * @returns Created blog post or null if failed
 */
export async function createPostWithTina(postData: Partial<BlogPost>): Promise<BlogPost | null> {
  try {
    if (!tinaClient.isEnabled()) {
      throw new Error('Tina CMS ist nicht aktiviert');
    }

    // Generate filename based on title or current date
    const slug = postData.slug || generateSlug(postData.title || 'neuer-beitrag');
    const filename = `${slug}.md`;

    // Prepare Tina mutation data
    const tinaData = {
      title: postData.title || 'Neuer Beitrag',
      slug,
      date: postData.date || new Date().toISOString(),
      excerpt: postData.excerpt || '',
      author: postData.author || 'melanie',
      category: postData.category || 'coaching',
      tags: postData.tags || [],
      image: postData.image || '',
      imageAlt: postData.imageAlt || '',
      status: postData.status || 'draft',
      featured: postData.featured || false,
      body: {
        type: 'markdown' as const,
        content: postData.content || '# Neuer Beitrag\n\nInhalt hier hinzufügen...',
      },
      seo: postData.seo || {
        metaTitle: postData.title || 'Neuer Beitrag',
        metaDescription: postData.excerpt || '',
      },
    };

    // Execute create mutation
    const client = await tinaClient.getClient();
    
    if (!client || !client.mutations || typeof client.mutations.createPost !== 'function') {
      throw new Error('Tina Client mutations not available');
    }
    
    const response = await client.mutations.createPost({
      relativePath: filename,
      params: tinaData,
    });

    if (response?.createPost && isTinaBlogPost(response.createPost)) {
      const createdPost = mapTinaPostToBlogPost(response.createPost);
      
      // Clear cache to force reload
      clearTinaCache();
      
      console.log(`Neuer Post erstellt: ${createdPost.title}`);
      return createdPost;
    }

    throw new Error('Ungültige Antwort von Tina Create Mutation');
    
  } catch (error) {
    console.error('Fehler beim Erstellen eines neuen Posts mit Tina:', error);
    return null;
  }
}

/**
 * Update an existing blog post via Tina CMS
 * @param slug - Post slug
 * @param postData - Updated post data
 * @returns Updated blog post or null if failed
 */
export async function updatePostWithTina(slug: string, postData: Partial<BlogPost>): Promise<BlogPost | null> {
  try {
    if (!tinaClient.isEnabled()) {
      throw new Error('Tina CMS ist nicht aktiviert');
    }

    const filename = `${slug}.md`;

    // Prepare Tina mutation data
    const tinaData = {
      ...postData,
      lastModified: new Date().toISOString(),
      body: postData.content ? {
        type: 'markdown' as const,
        content: postData.content,
      } : undefined,
    };

    // Execute update mutation
    const client = await tinaClient.getClient();
    
    if (!client || !client.mutations || typeof client.mutations.updatePost !== 'function') {
      throw new Error('Tina Client mutations not available');
    }
    
    const response = await client.mutations.updatePost({
      relativePath: filename,
      params: tinaData,
    });

    if (response?.updatePost && isTinaBlogPost(response.updatePost)) {
      const updatedPost = mapTinaPostToBlogPost(response.updatePost);
      
      // Clear cache to force reload
      clearTinaCache();
      
      console.log(`Post aktualisiert: ${updatedPost.title}`);
      return updatedPost;
    }

    throw new Error('Ungültige Antwort von Tina Update Mutation');
    
  } catch (error) {
    console.error(`Fehler beim Aktualisieren des Posts '${slug}' mit Tina:`, error);
    return null;
  }
}

/**
 * Delete a blog post via Tina CMS
 * @param slug - Post slug
 * @returns True if successful, false if failed
 */
export async function deletePostWithTina(slug: string): Promise<boolean> {
  try {
    if (!tinaClient.isEnabled()) {
      throw new Error('Tina CMS ist nicht aktiviert');
    }

    const filename = `${slug}.md`;

    // Execute delete mutation
    const client = await tinaClient.getClient();
    
    if (!client || !client.mutations || typeof client.mutations.deletePost !== 'function') {
      throw new Error('Tina Client mutations not available');
    }
    
    await client.mutations.deletePost({
      relativePath: filename,
    });

    // Clear cache to force reload
    clearTinaCache();
    
    console.log(`Post gelöscht: ${slug}`);
    return true;
    
  } catch (error) {
    console.error(`Fehler beim Löschen des Posts '${slug}' mit Tina:`, error);
    return false;
  }
}

/**
 * Upload media file via Tina CMS
 * @param file - File to upload
 * @param folder - Target folder (relative to media root)
 * @returns Uploaded file URL or null if failed
 */
export async function uploadMediaWithTina(file: File, folder = ''): Promise<string | null> {
  try {
    if (!tinaClient.isEnabled()) {
      throw new Error('Tina CMS ist nicht aktiviert');
    }

    // Validate file type and size
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    
    if (file.size > maxSize) {
      throw new Error(`Datei zu groß: ${(file.size / 1024 / 1024).toFixed(1)}MB (max. 5MB)`);
    }
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Dateityp nicht unterstützt: ${file.type}`);
    }

    // Execute media upload
    const client = await tinaClient.getClient();
    
    if (!client || !client.media || typeof client.media.upload !== 'function') {
      throw new Error('Tina Client media upload not available');
    }
    
    // Upload file to configured media folder
    const uploadPath = folder ? `${folder}/${file.name}` : file.name;
    
    const response = await client.media.upload({
      file,
      directory: 'content/blog/images',
      filename: uploadPath,
    });

    if (response?.url) {
      console.log(`Medien-Datei hochgeladen: ${response.url}`);
      return response.url;
    }

    throw new Error('Ungültige Antwort von Tina Media Upload');
    
  } catch (error) {
    console.error('Fehler beim Hochladen der Medien-Datei mit Tina:', error);
    return null;
  }
}

/**
 * Search posts via Tina CMS
 * @param searchTerm - Search term
 * @param filters - Additional filters
 * @returns Filtered blog posts
 */
export async function searchPostsWithTina(
  searchTerm: string,
  _filters: {
    category?: string;
    status?: string;
    tags?: string[];
  } = {}
): Promise<BlogPost[]> {
  try {
    if (!tinaClient.isEnabled()) {
      console.warn('Tina CMS ist nicht aktiviert - verwende lokale Suche');
      return [];
    }

    // Build search query with filters
    const searchQuery = {
      term: searchTerm,
      filters: {}, // Search filters object
      limit: 50,
    };

    // Execute search query
    const client = await tinaClient.getClient();
    
    let response;
    if (!client || !client.search || typeof client.search.posts !== 'function') {
      // Fallback to regular query with client-side filtering
      const allPosts = await loadPostsFromTina();
      response = {
        results: allPosts.filter(post => {
          const searchLower = searchTerm.toLowerCase();
          return (
            post.title.toLowerCase().includes(searchLower) ||
            post.excerpt.toLowerCase().includes(searchLower) ||
            post.content.toLowerCase().includes(searchLower) ||
            post.tags.some(tag => tag.toLowerCase().includes(searchLower))
          );
        }),
      };
    } else {
      response = await client.search.posts(searchQuery);
    }

    if (response?.results && Array.isArray(response.results)) {
      const posts = response.results
        .filter(result => isTinaBlogPost(result))
        .map(result => mapTinaPostToBlogPost(result));
      
      console.log(`${posts.length} Posts gefunden für Suchbegriff: "${searchTerm}"`);
      return posts;
    }

    return [];
    
  } catch (error) {
    console.error(`Fehler bei der Tina Suche für "${searchTerm}":`, error);
    return [];
  }
}

/**
 * Get Tina configuration
 */
export function getTinaConfig() {
  return tinaClient.getConfig();
}