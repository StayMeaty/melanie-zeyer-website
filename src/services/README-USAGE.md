# Blog Content Service - Usage Examples

This document provides usage examples for the blog content service.

## Basic Usage

```typescript
import {
  loadAllPosts,
  loadPostBySlug,
  getPostsByCategory,
  getPostsByTag,
  getRecentPosts,
  searchPosts,
  getPaginatedPosts,
  generateSlug,
  getAllTags,
  getBlogStats,
  clearCache,
} from './blogContent';

// Load all published blog posts
const allPosts = await loadAllPosts();

// Load a specific post by slug
const post = await loadPostBySlug('willkommen-zu-meinem-blog');

// Get posts by category
const coachingPosts = await getPostsByCategory('coaching');

// Get posts by tag
const taggedPosts = await getPostsByTag('persönlichkeitsentwicklung');

// Get recent posts
const recentPosts = await getRecentPosts(5);

// Search posts
const searchResults = await searchPosts('coaching mindset');

// Get paginated posts
const { posts, pagination } = await getPaginatedPosts(1, 10);

// Generate slug from title
const slug = generateSlug('Mein neuer Blog-Post Titel');

// Get all tags with counts
const tags = await getAllTags();

// Get blog statistics
const stats = await getBlogStats();

// Clear cache (development only)
clearCache();
```

## Error Handling

All functions follow the async error handling pattern from ContactForm.tsx:

```typescript
try {
  const posts = await loadAllPosts();
  // Handle success
} catch (error) {
  console.error('Fehler beim Laden der Posts:', error);
  // Handle error gracefully
}
```

## Markdown File Structure

Blog posts should be placed in `/public/content/blog/` with the following frontmatter:

```markdown
---
title: "Post Title"
slug: "post-slug" # Optional, auto-generated from title
date: "2024-01-15"
excerpt: "Short description"
author: "melanie"
category: "coaching" # Must be valid BlogCategory
tags: ["tag1", "tag2"]
image: "/assets/blog/image.jpg" # Optional
imageAlt: "Image description" # Optional
status: "published" # or "draft"
featured: true # Optional
seo: # Optional SEO metadata
  metaTitle: "SEO Title"
  metaDescription: "SEO Description"
  keywords: ["keyword1", "keyword2"]
lastModified: "2024-01-15" # Optional
---

# Your blog content here

Content in markdown format...
```

## Manifest File

The service requires a manifest file at `/public/content/blog/manifest.json`:

```json
{
  "files": [
    "2024-01-15-willkommen-zu-meinem-blog.md",
    "2024-01-20-selbstfindung-im-neuen-jahr.md"
  ],
  "lastUpdated": "2024-03-01T10:00:00Z",
  "version": "1.0.0"
}
```

## Performance Notes

- Posts are cached for 5 minutes to improve performance
- Use `clearCache()` in development when updating content
- Large content files should be optimized for bundle size
- Images should be optimized and served from CDN

## German Language Support

- All user-facing error messages are in German
- Content should be in German
- Comments and code are in English (per project standards)
- Slug generation handles German umlauts (ä→ae, ö→oe, ü→ue, ß→ss)