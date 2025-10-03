/**
 * Content Migration Utility for Tina CMS
 * 
 * TypeScript utility for in-app migration of blog content to Tina format.
 * Includes localStorage migration, progress tracking, and error reporting.
 */

import { BlogMetadata, BlogCategory, BlogStatus, BlogSEO } from '../types/blog';

// Migration types
export interface MigrationProgress {
  total: number;
  completed: number;
  failed: number;
  currentItem: string;
  errors: MigrationError[];
}

export interface MigrationError {
  item: string;
  error: string;
  severity: 'error' | 'warning';
  timestamp: string;
}

export interface MigrationResult {
  success: boolean;
  migratedCount: number;
  failedCount: number;
  errors: MigrationError[];
  backupData?: unknown;
}

export interface LocalStorageDraft {
  id: string;
  title?: string;
  content?: string;
  slug?: string;
  date?: string;
  excerpt?: string;
  author?: string;
  category?: string;
  tags?: string[];
  status?: string;
  [key: string]: unknown;
}

export interface BackupItem {
  id: string;
  originalValue: string | null;
  [key: string]: unknown;
}

export interface TinaMigrationOptions {
  validateSchema: boolean;
  createBackup: boolean;
  preserveOriginal: boolean;
  onProgress?: (progress: MigrationProgress) => void;
  onError?: (error: MigrationError) => void;
}

// Default field values for Tina schema
const TINA_DEFAULTS = {
  tags: [],
  status: 'draft' as BlogStatus,
  featured: false,
  author: 'melanie',
  category: 'coaching' as BlogCategory,
  readingTime: undefined,
  seo: {
    metaTitle: '',
    metaDescription: '',
    keywords: [],
    twitterCard: 'summary_large_image' as const
  }
};

/**
 * Generate URL-friendly slug from title
 */
function generateSlug(title: string): string {
  if (!title) return '';
  
  return title
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Validate field against Tina schema requirements
 */
function validateField(fieldName: string, value: unknown): string | null {
  switch (fieldName) {
    case 'title':
      if (!value || typeof value !== 'string') return 'Title is required';
      if (value.length < 5) return 'Title must be at least 5 characters';
      if (value.length > 100) return 'Title should be max 100 characters';
      break;
      
    case 'slug':
      if (!value || typeof value !== 'string') return 'Slug is required';
      if (!/^[a-z0-9-]+$/.test(value)) {
        return 'Slug must contain only lowercase letters, numbers, and hyphens';
      }
      break;
      
    case 'excerpt':
      if (!value || typeof value !== 'string') return 'Excerpt is required';
      if (value.length < 50) return 'Excerpt should be at least 50 characters';
      if (value.length > 300) return 'Excerpt should be max 300 characters';
      break;
      
    case 'category': {
      const validCategories: BlogCategory[] = [
        'coaching', 'persoenlichkeitsentwicklung', 'lifestyle', 
        'business', 'gesundheit', 'mindset'
      ];
      if (!value || !validCategories.includes(value as BlogCategory)) {
        return `Category must be one of: ${validCategories.join(', ')}`;
      }
      break;
    }
      
    case 'status': {
      const validStatuses: BlogStatus[] = ['draft', 'published', 'archived'];
      if (!value || !validStatuses.includes(value as BlogStatus)) {
        return `Status must be one of: ${validStatuses.join(', ')}`;
      }
      break;
    }
      
    case 'tags':
      if (value && !Array.isArray(value)) {
        return 'Tags must be an array';
      }
      break;
  }
  
  return null;
}

/**
 * Convert localStorage draft to Tina-compatible format
 */
function convertDraftToTinaFormat(draft: LocalStorageDraft): BlogMetadata {
  const now = new Date().toISOString();
  
  // Generate slug from title if missing
  const slug = draft.slug || generateSlug(draft.title || '') || `draft-${Date.now()}`;
  
  // Create Tina-compatible metadata
  const tinaMetadata: BlogMetadata = {
    title: draft.title || 'Unbenannter Entwurf',
    slug: slug,
    date: draft.date || now,
    excerpt: draft.excerpt || 'Kurze Beschreibung des Beitrags...',
    author: (draft.author as string) || TINA_DEFAULTS.author,
    category: (draft.category as BlogCategory) || TINA_DEFAULTS.category,
    tags: Array.isArray(draft.tags) ? draft.tags : TINA_DEFAULTS.tags,
    image: draft.image as string | undefined,
    imageAlt: draft.imageAlt as string | undefined,
    status: (draft.status as BlogStatus) || TINA_DEFAULTS.status,
    featured: Boolean(draft.featured),
    seo: {
      ...TINA_DEFAULTS.seo,
      metaTitle: draft.title || '',
      metaDescription: draft.excerpt || '',
      ...(typeof draft.seo === 'object' ? draft.seo : {})
    } as BlogSEO,
    readingTime: typeof draft.readingTime === 'number' ? draft.readingTime : undefined,
    lastModified: draft.lastModified as string || now
  };
  
  return tinaMetadata;
}

/**
 * Find all localStorage items that look like blog drafts
 */
function findLocalStorageDrafts(): LocalStorageDraft[] {
  const drafts: LocalStorageDraft[] = [];
  
  // Common localStorage key patterns for blog drafts
  const blogKeyPatterns = [
    /^blog[_-]?draft/i,
    /^draft[_-]?blog/i,
    /^post[_-]?draft/i,
    /^draft[_-]?post/i,
    /^article[_-]?draft/i,
    /^draft[_-]?article/i,
    /blog.*editor/i,
    /editor.*blog/i
  ];
  
  // Scan localStorage for blog-related keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    
    const isBlogKey = blogKeyPatterns.some(pattern => pattern.test(key));
    
    if (isBlogKey) {
      try {
        const value = localStorage.getItem(key);
        if (!value) continue;
        
        let data: unknown;
        
        // Try to parse as JSON
        try {
          data = JSON.parse(value);
        } catch {
          // If not JSON, treat as plain text content
          data = { content: value, title: key };
        }
        
        // Convert to draft format
        const draft: LocalStorageDraft = {
          id: key,
          ...(typeof data === 'object' && data !== null ? data as Record<string, unknown> : { content: data })
        };
        
        drafts.push(draft);
        
      } catch (error) {
        console.warn(`Failed to process localStorage key ${key}:`, error);
      }
    }
  }
  
  return drafts;
}

/**
 * Create backup of current data before migration
 */
function createMigrationBackup(drafts: LocalStorageDraft[]): string {
  const backupData = {
    timestamp: new Date().toISOString(),
    source: 'localStorage',
    drafts: drafts.map(draft => ({
      ...draft,
      originalValue: localStorage.getItem(draft.id)
    }))
  };
  
  const backupKey = `migration-backup-${Date.now()}`;
  localStorage.setItem(backupKey, JSON.stringify(backupData));
  
  return backupKey;
}

/**
 * Restore from backup
 */
export function restoreFromBackup(backupKey: string): boolean {
  try {
    const backupData = localStorage.getItem(backupKey);
    if (!backupData) {
      throw new Error('Backup not found');
    }
    
    const backup = JSON.parse(backupData);
    
    // Restore original localStorage values
    backup.drafts.forEach((item: BackupItem) => {
      if (item.originalValue !== null) {
        localStorage.setItem(item.id, item.originalValue);
      } else {
        localStorage.removeItem(item.id);
      }
    });
    
    return true;
  } catch (error) {
    console.error('Failed to restore from backup:', error);
    return false;
  }
}

/**
 * Clear migration backup
 */
export function clearMigrationBackup(backupKey: string): void {
  localStorage.removeItem(backupKey);
}

/**
 * Migrate localStorage drafts to Tina format
 */
export async function migrateLocalStorageDrafts(
  options: TinaMigrationOptions = {
    validateSchema: true,
    createBackup: true,
    preserveOriginal: false
  }
): Promise<MigrationResult> {
  
  const errors: MigrationError[] = [];
  const migratedDrafts: BlogMetadata[] = [];
  let backupKey: string | undefined;
  
  try {
    // Find localStorage drafts
    const drafts = findLocalStorageDrafts();
    
    if (drafts.length === 0) {
      return {
        success: true,
        migratedCount: 0,
        failedCount: 0,
        errors: []
      };
    }
    
    // Create backup if requested
    if (options.createBackup) {
      backupKey = createMigrationBackup(drafts);
    }
    
    // Initialize progress tracking
    const progress: MigrationProgress = {
      total: drafts.length,
      completed: 0,
      failed: 0,
      currentItem: '',
      errors: []
    };
    
    // Process each draft
    for (const draft of drafts) {
      progress.currentItem = draft.title || draft.id;
      options.onProgress?.(progress);
      
      try {
        // Convert to Tina format
        const tinaMetadata = convertDraftToTinaFormat(draft);
        
        // Validate schema if requested
        if (options.validateSchema) {
          const validationErrors: string[] = [];
          
          Object.entries(tinaMetadata).forEach(([key, value]) => {
            const error = validateField(key, value);
            if (error) {
              validationErrors.push(`${key}: ${error}`);
            }
          });
          
          if (validationErrors.length > 0) {
            throw new Error(`Schema validation failed: ${validationErrors.join(', ')}`);
          }
        }
        
        // Store converted draft
        migratedDrafts.push(tinaMetadata);
        
        // Clear original localStorage item if not preserving
        if (!options.preserveOriginal) {
          localStorage.removeItem(draft.id);
        }
        
        progress.completed++;
        
      } catch (error) {
        const migrationError: MigrationError = {
          item: draft.title || draft.id,
          error: error instanceof Error ? error.message : String(error),
          severity: 'error',
          timestamp: new Date().toISOString()
        };
        
        errors.push(migrationError);
        progress.errors.push(migrationError);
        progress.failed++;
        
        options.onError?.(migrationError);
      }
    }
    
    // Save migrated drafts to a single localStorage key for Tina pickup
    if (migratedDrafts.length > 0) {
      const migratedKey = 'tina-migrated-drafts';
      const existingMigrated = localStorage.getItem(migratedKey);
      const existingDrafts = existingMigrated ? JSON.parse(existingMigrated) : [];
      
      const allDrafts = [...existingDrafts, ...migratedDrafts];
      localStorage.setItem(migratedKey, JSON.stringify(allDrafts));
    }
    
    // Final progress update
    options.onProgress?.(progress);
    
    return {
      success: progress.failed === 0,
      migratedCount: progress.completed,
      failedCount: progress.failed,
      errors,
      backupData: backupKey
    };
    
  } catch (error) {
    const migrationError: MigrationError = {
      item: 'Migration process',
      error: error instanceof Error ? error.message : String(error),
      severity: 'error',
      timestamp: new Date().toISOString()
    };
    
    return {
      success: false,
      migratedCount: 0,
      failedCount: 1,
      errors: [migrationError],
      backupData: backupKey
    };
  }
}

/**
 * Get migrated drafts from localStorage
 */
export function getMigratedDrafts(): BlogMetadata[] {
  try {
    const migratedKey = 'tina-migrated-drafts';
    const data = localStorage.getItem(migratedKey);
    
    if (!data) return [];
    
    const drafts = JSON.parse(data);
    return Array.isArray(drafts) ? drafts : [];
    
  } catch (error) {
    console.error('Failed to get migrated drafts:', error);
    return [];
  }
}

/**
 * Clear migrated drafts from localStorage
 */
export function clearMigratedDrafts(): void {
  localStorage.removeItem('tina-migrated-drafts');
}

/**
 * Import external draft data (e.g., from exported JSON)
 */
export async function importDraftData(
  draftData: unknown[],
  options: TinaMigrationOptions = {
    validateSchema: true,
    createBackup: true,
    preserveOriginal: true
  }
): Promise<MigrationResult> {
  
  const errors: MigrationError[] = [];
  const migratedDrafts: BlogMetadata[] = [];
  
  try {
    if (!Array.isArray(draftData)) {
      throw new Error('Draft data must be an array');
    }
    
    // Initialize progress
    const progress: MigrationProgress = {
      total: draftData.length,
      completed: 0,
      failed: 0,
      currentItem: '',
      errors: []
    };
    
    // Process each draft
    for (const [index, draftItem] of draftData.entries()) {
      progress.currentItem = `Item ${index + 1}`;
      options.onProgress?.(progress);
      
      try {
        if (typeof draftItem !== 'object' || draftItem === null) {
          throw new Error('Draft item must be an object');
        }
        
        const draft = draftItem as LocalStorageDraft;
        draft.id = draft.id || `imported-${index}`;
        
        // Convert to Tina format
        const tinaMetadata = convertDraftToTinaFormat(draft);
        
        // Validate if requested
        if (options.validateSchema) {
          const validationErrors: string[] = [];
          
          Object.entries(tinaMetadata).forEach(([key, value]) => {
            const error = validateField(key, value);
            if (error) {
              validationErrors.push(`${key}: ${error}`);
            }
          });
          
          if (validationErrors.length > 0) {
            throw new Error(`Schema validation failed: ${validationErrors.join(', ')}`);
          }
        }
        
        migratedDrafts.push(tinaMetadata);
        progress.completed++;
        
      } catch (error) {
        const migrationError: MigrationError = {
          item: `Import item ${index + 1}`,
          error: error instanceof Error ? error.message : String(error),
          severity: 'error',
          timestamp: new Date().toISOString()
        };
        
        errors.push(migrationError);
        progress.errors.push(migrationError);
        progress.failed++;
        
        options.onError?.(migrationError);
      }
    }
    
    // Save imported drafts
    if (migratedDrafts.length > 0) {
      const migratedKey = 'tina-migrated-drafts';
      const existingMigrated = localStorage.getItem(migratedKey);
      const existingDrafts = existingMigrated ? JSON.parse(existingMigrated) : [];
      
      const allDrafts = [...existingDrafts, ...migratedDrafts];
      localStorage.setItem(migratedKey, JSON.stringify(allDrafts));
    }
    
    return {
      success: progress.failed === 0,
      migratedCount: progress.completed,
      failedCount: progress.failed,
      errors
    };
    
  } catch (error) {
    const migrationError: MigrationError = {
      item: 'Import process',
      error: error instanceof Error ? error.message : String(error),
      severity: 'error',
      timestamp: new Date().toISOString()
    };
    
    return {
      success: false,
      migratedCount: 0,
      failedCount: 1,
      errors: [migrationError]
    };
  }
}

/**
 * Get migration statistics
 */
export function getMigrationStats(): {
  localStorageDrafts: number;
  migratedDrafts: number;
  backupKeys: string[];
} {
  const localStorageDrafts = findLocalStorageDrafts().length;
  const migratedDrafts = getMigratedDrafts().length;
  
  // Find backup keys
  const backupKeys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('migration-backup-')) {
      backupKeys.push(key);
    }
  }
  
  return {
    localStorageDrafts,
    migratedDrafts,
    backupKeys
  };
}