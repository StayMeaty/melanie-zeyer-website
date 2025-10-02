/**
 * LocalStorage Blog Drafts Export Script
 * 
 * This browser script exports localStorage draft blog posts and converts them
 * to Tina-compatible format. Run this in the browser console to export drafts.
 * 
 * Usage:
 * 1. Open the website in browser
 * 2. Open browser console (F12)
 * 3. Copy and paste this entire script
 * 4. Execute - it will download a JSON file with exported drafts
 */

(function exportLocalStorageDrafts() {
  'use strict';
  
  console.log('🔄 Starting localStorage drafts export...');
  
  // Field defaults matching Tina schema
  const FIELD_DEFAULTS = {
    tags: [],
    status: 'draft',
    featured: false,
    author: 'melanie',
    category: 'coaching',
    readingTime: null,
    lastModified: null,
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: [],
      twitterCard: 'summary_large_image'
    }
  };
  
  /**
   * Generate URL-friendly slug from title
   */
  function generateSlug(title) {
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
   * Convert localStorage draft to Tina format
   */
  function convertDraftToTinaFormat(draft, draftId) {
    const now = new Date().toISOString();
    
    // Generate slug from title or use draftId
    const slug = draft.slug || generateSlug(draft.title) || `draft-${draftId}`;
    
    // Create Tina-compatible post
    const tinaPost = {
      title: draft.title || 'Unbenannter Entwurf',
      slug: slug,
      date: draft.date || now,
      excerpt: draft.excerpt || 'Kurze Beschreibung des Beitrags...',
      author: draft.author || FIELD_DEFAULTS.author,
      category: draft.category || FIELD_DEFAULTS.category,
      tags: Array.isArray(draft.tags) ? draft.tags : FIELD_DEFAULTS.tags,
      image: draft.image || undefined,
      imageAlt: draft.imageAlt || undefined,
      status: 'draft', // Always draft for localStorage exports
      featured: Boolean(draft.featured),
      seo: {
        ...FIELD_DEFAULTS.seo,
        ...(draft.seo || {}),
        metaTitle: draft.seo?.metaTitle || draft.title || '',
        metaDescription: draft.seo?.metaDescription || draft.excerpt || ''
      },
      readingTime: draft.readingTime || null,
      lastModified: draft.lastModified || now,
      body: draft.content || draft.body || '# Inhalt\n\nHier kommt der Beitrag-Inhalt...',
      
      // Metadata for migration tracking
      _migration: {
        source: 'localStorage',
        originalId: draftId,
        exportedAt: now,
        originalData: draft
      }
    };
    
    return tinaPost;
  }
  
  /**
   * Find all blog-related items in localStorage
   */
  function findBlogDrafts() {
    const drafts = [];
    const blogKeys = [];
    
    // Common localStorage keys for blog drafts
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
    
    // Scan all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      // Check if key matches blog patterns
      const isBlogKey = blogKeyPatterns.some(pattern => pattern.test(key));
      
      if (isBlogKey) {
        blogKeys.push(key);
      }
    }
    
    console.log(`📦 Found ${blogKeys.length} potential blog draft keys:`, blogKeys);
    
    // Process each key
    blogKeys.forEach(key => {
      try {
        const value = localStorage.getItem(key);
        let data;
        
        // Try to parse as JSON
        try {
          data = JSON.parse(value);
        } catch (e) {
          // If not JSON, treat as plain text content
          data = { content: value, title: key };
        }
        
        // Convert to Tina format
        const tinaDraft = convertDraftToTinaFormat(data, key);
        drafts.push(tinaDraft);
        
        console.log(`✅ Processed draft: ${key} -> ${tinaDraft.title}`);
        
      } catch (error) {
        console.warn(`⚠️  Failed to process key ${key}:`, error.message);
      }
    });
    
    return drafts;
  }
  
  /**
   * Generate filename for the export
   */
  function generateExportFilename() {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    return `blog-drafts-export-${dateStr}-${timeStr}.json`;
  }
  
  /**
   * Download the export file
   */
  function downloadExport(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }
  
  /**
   * Main export function
   */
  function performExport() {
    try {
      // Find and convert drafts
      const drafts = findBlogDrafts();
      
      if (drafts.length === 0) {
        console.log('ℹ️  No blog drafts found in localStorage');
        alert('Keine Blog-Entwürfe im localStorage gefunden.');
        return;
      }
      
      // Create export data
      const exportData = {
        metadata: {
          exportedAt: new Date().toISOString(),
          exportedFrom: window.location.href,
          userAgent: navigator.userAgent,
          draftCount: drafts.length,
          format: 'tina-cms-compatible',
          version: '1.0.0'
        },
        drafts: drafts,
        instructions: {
          usage: 'Import these drafts into Tina CMS using the migration utilities',
          format: 'Each draft is in Tina-compatible format with all required fields',
          nextSteps: [
            '1. Save this file to your project directory',
            '2. Use the migration utilities to import into Tina',
            '3. Review and publish the imported drafts'
          ]
        }
      };
      
      // Generate filename and download
      const filename = generateExportFilename();
      downloadExport(exportData, filename);
      
      console.log(`✅ Export completed successfully!`);
      console.log(`📁 File: ${filename}`);
      console.log(`📊 Exported ${drafts.length} drafts`);
      
      alert(`Export erfolgreich! ${drafts.length} Entwürfe exportiert als ${filename}`);
      
      // Display summary
      console.table(drafts.map(draft => ({
        title: draft.title,
        category: draft.category,
        status: draft.status,
        lastModified: draft.lastModified
      })));
      
    } catch (error) {
      console.error('❌ Export failed:', error);
      alert(`Export fehlgeschlagen: ${error.message}`);
    }
  }
  
  // Execute the export
  performExport();
  
})();

/**
 * INSTRUCTIONS FOR USE:
 * 
 * 1. Copy this entire script
 * 2. Open your website in the browser 
 * 3. Open Developer Tools (F12)
 * 4. Go to Console tab
 * 5. Paste the script and press Enter
 * 6. The script will automatically download a JSON file with your drafts
 * 
 * The exported file will contain:
 * - All localStorage blog drafts converted to Tina format
 * - Metadata about the export
 * - Instructions for importing into Tina
 * 
 * After export, you can use the migration utilities to import the drafts:
 * - Move the JSON file to your project directory
 * - Use the contentMigration utility to import into Tina
 */