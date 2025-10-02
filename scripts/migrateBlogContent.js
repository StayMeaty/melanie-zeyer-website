/**
 * Blog Content Migration Script for Tina CMS
 * 
 * This script migrates existing blog posts from the current format to Tina CMS format.
 * It reads all markdown files from public/content/blog/, validates against Tina schema,
 * fixes any schema mismatches, and generates a migration report.
 * 
 * Usage:
 *   npm run migrate:validate  // Validate content only
 *   npm run migrate:fix       // Fix and update content files
 *   npm run migrate:report    // Generate detailed report
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Blog configuration matching Tina schema
const BLOG_CATEGORIES = [
  'coaching',
  'persoenlichkeitsentwicklung', 
  'lifestyle',
  'business',
  'gesundheit',
  'mindset'
];

const BLOG_STATUS_OPTIONS = ['draft', 'published', 'archived'];
const TWITTER_CARD_OPTIONS = ['summary', 'summary_large_image'];

// Required fields according to Tina schema
const REQUIRED_FIELDS = [
  'title',
  'slug', 
  'date',
  'excerpt',
  'author',
  'category',
  'status'
];

// Field defaults for missing values
const FIELD_DEFAULTS = {
  tags: [],
  status: 'published',
  featured: false,
  author: 'melanie',
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
 * Validate a single blog post against Tina schema
 */
function validateBlogPost(frontmatter, filename) {
  const errors = [];
  const warnings = [];
  
  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    if (!frontmatter[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  // Validate field values
  if (frontmatter.title && frontmatter.title.length < 5) {
    errors.push('Title must be at least 5 characters long');
  }
  
  if (frontmatter.title && frontmatter.title.length > 100) {
    warnings.push('Title should be max 100 characters (currently ' + frontmatter.title.length + ')');
  }
  
  if (frontmatter.slug && !/^[a-z0-9-]+$/.test(frontmatter.slug)) {
    errors.push('Slug must contain only lowercase letters, numbers, and hyphens');
  }
  
  if (frontmatter.excerpt && frontmatter.excerpt.length < 50) {
    warnings.push('Excerpt should be at least 50 characters long');
  }
  
  if (frontmatter.excerpt && frontmatter.excerpt.length > 300) {
    warnings.push('Excerpt should be max 300 characters (currently ' + frontmatter.excerpt.length + ')');
  }
  
  if (frontmatter.category && !BLOG_CATEGORIES.includes(frontmatter.category)) {
    errors.push(`Invalid category: ${frontmatter.category}. Must be one of: ${BLOG_CATEGORIES.join(', ')}`);
  }
  
  if (frontmatter.status && !BLOG_STATUS_OPTIONS.includes(frontmatter.status)) {
    errors.push(`Invalid status: ${frontmatter.status}. Must be one of: ${BLOG_STATUS_OPTIONS.join(', ')}`);
  }
  
  // Validate SEO fields
  if (frontmatter.seo) {
    if (frontmatter.seo.metaTitle && frontmatter.seo.metaTitle.length > 60) {
      warnings.push('SEO meta title should be max 60 characters');
    }
    
    if (frontmatter.seo.metaDescription && frontmatter.seo.metaDescription.length > 160) {
      warnings.push('SEO meta description should be max 160 characters');
    }
    
    if (frontmatter.seo.twitterCard && !TWITTER_CARD_OPTIONS.includes(frontmatter.seo.twitterCard)) {
      errors.push(`Invalid Twitter card type: ${frontmatter.seo.twitterCard}`);
    }
  }
  
  // Validate image alt text requirement
  if (frontmatter.image && !frontmatter.imageAlt) {
    warnings.push('Image alt text is recommended when an image is specified');
  }
  
  // Validate reading time
  if (frontmatter.readingTime && (frontmatter.readingTime < 1 || frontmatter.readingTime > 60)) {
    warnings.push('Reading time should be between 1 and 60 minutes');
  }
  
  return { errors, warnings };
}

/**
 * Fix frontmatter to match Tina schema requirements
 */
function fixFrontmatter(frontmatter, filename) {
  const fixed = { ...frontmatter };
  const fixes = [];
  
  // Add missing fields with defaults
  Object.keys(FIELD_DEFAULTS).forEach(field => {
    if (!fixed[field]) {
      fixed[field] = FIELD_DEFAULTS[field];
      fixes.push(`Added default ${field}`);
    }
  });
  
  // Fix tags array
  if (fixed.tags && !Array.isArray(fixed.tags)) {
    fixed.tags = [];
    fixes.push('Converted tags to array');
  }
  
  // Ensure SEO object exists
  if (!fixed.seo || typeof fixed.seo !== 'object') {
    fixed.seo = { ...FIELD_DEFAULTS.seo };
    fixes.push('Added default SEO object');
  } else {
    // Merge with default SEO values
    fixed.seo = { ...FIELD_DEFAULTS.seo, ...fixed.seo };
  }
  
  // Generate slug if missing
  if (!fixed.slug && fixed.title) {
    fixed.slug = fixed.title
      .toLowerCase()
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    fixes.push('Generated slug from title');
  }
  
  // Fix date format if needed
  if (fixed.date && !fixed.date.includes('T')) {
    // Assume it's a date-only string, add time
    fixed.date = fixed.date + 'T10:00:00.000Z';
    fixes.push('Added time to date field');
  }
  
  // Set lastModified if missing
  if (!fixed.lastModified) {
    fixed.lastModified = new Date().toISOString();
    fixes.push('Set lastModified to current time');
  }
  
  // Ensure boolean fields are boolean
  if (typeof fixed.featured !== 'boolean') {
    fixed.featured = Boolean(fixed.featured);
    fixes.push('Converted featured to boolean');
  }
  
  return { fixed, fixes };
}

/**
 * Process a single markdown file
 */
function processMarkdownFile(filePath, shouldFix = false) {
  const filename = path.basename(filePath);
  
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data: frontmatter, content } = matter(fileContent);
    
    // Validate current frontmatter
    const validation = validateBlogPost(frontmatter, filename);
    
    let fixes = [];
    let updatedFrontmatter = frontmatter;
    
    if (shouldFix) {
      const fixResult = fixFrontmatter(frontmatter, filename);
      updatedFrontmatter = fixResult.fixed;
      fixes = fixResult.fixes;
      
      // Re-validate after fixes
      const revalidation = validateBlogPost(updatedFrontmatter, filename);
      validation.errors = revalidation.errors;
      validation.warnings = revalidation.warnings;
      
      // Write back the fixed file
      if (fixes.length > 0) {
        const newContent = matter.stringify(content, updatedFrontmatter);
        fs.writeFileSync(filePath, newContent, 'utf8');
      }
    }
    
    return {
      filename,
      valid: validation.errors.length === 0,
      errors: validation.errors,
      warnings: validation.warnings,
      fixes: fixes,
      frontmatter: updatedFrontmatter
    };
    
  } catch (error) {
    return {
      filename,
      valid: false,
      errors: [`Failed to process file: ${error.message}`],
      warnings: [],
      fixes: [],
      frontmatter: null
    };
  }
}

/**
 * Get all markdown files from blog directory
 */
function getBlogFiles() {
  const blogDir = path.join(__dirname, '..', 'public', 'content', 'blog');
  
  if (!fs.existsSync(blogDir)) {
    throw new Error(`Blog directory not found: ${blogDir}`);
  }
  
  return fs.readdirSync(blogDir)
    .filter(file => file.endsWith('.md') && file !== 'README.md')
    .map(file => path.join(blogDir, file));
}

/**
 * Generate migration report
 */
function generateReport(results, shouldFix) {
  const timestamp = new Date().toISOString();
  const totalFiles = results.length;
  const validFiles = results.filter(r => r.valid).length;
  const invalidFiles = totalFiles - validFiles;
  const filesWithWarnings = results.filter(r => r.warnings.length > 0).length;
  const filesWithFixes = results.filter(r => r.fixes.length > 0).length;
  
  const report = {
    timestamp,
    operation: shouldFix ? 'migration' : 'validation',
    summary: {
      totalFiles,
      validFiles,
      invalidFiles,
      filesWithWarnings,
      filesWithFixes
    },
    results: results.map(r => ({
      filename: r.filename,
      valid: r.valid,
      errorCount: r.errors.length,
      warningCount: r.warnings.length,
      fixCount: r.fixes.length,
      details: {
        errors: r.errors,
        warnings: r.warnings,
        fixes: r.fixes
      }
    }))
  };
  
  // Write report to file
  const reportFilename = `migration-report-${timestamp.split('T')[0]}.json`;
  const reportPath = path.join(__dirname, reportFilename);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  
  return { report, reportPath };
}

/**
 * Main migration function
 */
function migrate(mode = 'validate') {
  console.log(`🔄 Starting blog content ${mode}...`);
  
  try {
    const blogFiles = getBlogFiles();
    console.log(`📁 Found ${blogFiles.length} blog files`);
    
    const shouldFix = mode === 'fix';
    const results = [];
    
    // Process each file
    for (const filePath of blogFiles) {
      const result = processMarkdownFile(filePath, shouldFix);
      results.push(result);
      
      // Log progress
      const status = result.valid ? '✅' : '❌';
      const fixInfo = result.fixes.length > 0 ? ` (${result.fixes.length} fixes applied)` : '';
      console.log(`${status} ${result.filename}${fixInfo}`);
      
      if (result.errors.length > 0) {
        result.errors.forEach(error => console.log(`   ❌ ${error}`));
      }
      
      if (result.warnings.length > 0) {
        result.warnings.forEach(warning => console.log(`   ⚠️  ${warning}`));
      }
    }
    
    // Generate report
    const { report, reportPath } = generateReport(results, shouldFix);
    
    // Summary
    console.log('\n📊 Migration Summary:');
    console.log(`   Total files: ${report.summary.totalFiles}`);
    console.log(`   Valid files: ${report.summary.validFiles}`);
    console.log(`   Invalid files: ${report.summary.invalidFiles}`);
    console.log(`   Files with warnings: ${report.summary.filesWithWarnings}`);
    
    if (shouldFix) {
      console.log(`   Files fixed: ${report.summary.filesWithFixes}`);
    }
    
    console.log(`\n📋 Detailed report saved to: ${reportPath}`);
    
    if (report.summary.invalidFiles > 0) {
      console.log('\n⚠️  Some files still have validation errors.');
      console.log('   Please review the report and fix manually.');
      process.exit(1);
    } else {
      console.log('\n✅ All files are valid for Tina CMS!');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// CLI interface
const mode = process.argv[2] || 'validate';

if (!['validate', 'fix', 'report'].includes(mode)) {
  console.error('Usage: node migrateBlogContent.js [validate|fix|report]');
  process.exit(1);
}

if (mode === 'report') {
  migrate('validate');
} else {
  migrate(mode);
}