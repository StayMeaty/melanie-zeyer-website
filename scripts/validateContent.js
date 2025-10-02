/**
 * Content Validation Script for Tina CMS
 * 
 * This script validates all existing blog content against the Tina schema requirements.
 * It reports missing required fields, invalid field values, and file naming conventions.
 * 
 * Usage:
 *   npm run migrate:validate
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tina schema configuration
const SCHEMA_CONFIG = {
  categories: [
    'coaching',
    'persoenlichkeitsentwicklung', 
    'lifestyle',
    'business',
    'gesundheit',
    'mindset'
  ],
  statuses: ['draft', 'published', 'archived'],
  twitterCards: ['summary', 'summary_large_image'],
  requiredFields: [
    'title',
    'slug', 
    'date',
    'excerpt',
    'author',
    'category',
    'status'
  ],
  authors: ['melanie'],
  filenamePattern: /^\d{4}-\d{2}-\d{2}-.+\.md$/
};

/**
 * Validation rule definitions
 */
const VALIDATION_RULES = {
  title: {
    required: true,
    minLength: 5,
    maxLength: 100,
    validate: (value) => {
      if (!value) return 'Title is required';
      if (value.length < 5) return 'Title must be at least 5 characters';
      if (value.length > 100) return 'Title should be max 100 characters';
      return null;
    }
  },
  
  slug: {
    required: true,
    pattern: /^[a-z0-9-]+$/,
    validate: (value) => {
      if (!value) return 'Slug is required';
      if (!/^[a-z0-9-]+$/.test(value)) {
        return 'Slug must contain only lowercase letters, numbers, and hyphens';
      }
      return null;
    }
  },
  
  date: {
    required: true,
    validate: (value) => {
      if (!value) return 'Date is required';
      const date = new Date(value);
      if (isNaN(date.getTime())) return 'Date must be a valid ISO date';
      return null;
    }
  },
  
  excerpt: {
    required: true,
    minLength: 50,
    maxLength: 300,
    validate: (value) => {
      if (!value) return 'Excerpt is required';
      if (value.length < 50) return 'Excerpt should be at least 50 characters';
      if (value.length > 300) return 'Excerpt should be max 300 characters';
      return null;
    }
  },
  
  author: {
    required: true,
    options: SCHEMA_CONFIG.authors,
    validate: (value) => {
      if (!value) return 'Author is required';
      if (!SCHEMA_CONFIG.authors.includes(value)) {
        return `Author must be one of: ${SCHEMA_CONFIG.authors.join(', ')}`;
      }
      return null;
    }
  },
  
  category: {
    required: true,
    options: SCHEMA_CONFIG.categories,
    validate: (value) => {
      if (!value) return 'Category is required';
      if (!SCHEMA_CONFIG.categories.includes(value)) {
        return `Category must be one of: ${SCHEMA_CONFIG.categories.join(', ')}`;
      }
      return null;
    }
  },
  
  status: {
    required: true,
    options: SCHEMA_CONFIG.statuses,
    validate: (value) => {
      if (!value) return 'Status is required';
      if (!SCHEMA_CONFIG.statuses.includes(value)) {
        return `Status must be one of: ${SCHEMA_CONFIG.statuses.join(', ')}`;
      }
      return null;
    }
  },
  
  tags: {
    required: false,
    validate: (value) => {
      if (value && !Array.isArray(value)) {
        return 'Tags must be an array';
      }
      return null;
    }
  },
  
  featured: {
    required: false,
    validate: (value) => {
      if (value !== undefined && typeof value !== 'boolean') {
        return 'Featured must be a boolean';
      }
      return null;
    }
  },
  
  readingTime: {
    required: false,
    validate: (value) => {
      if (value && (typeof value !== 'number' || value < 1 || value > 60)) {
        return 'Reading time must be a number between 1 and 60';
      }
      return null;
    }
  }
};

/**
 * SEO field validation rules
 */
const SEO_RULES = {
  metaTitle: {
    maxLength: 60,
    validate: (value) => {
      if (value && value.length > 60) {
        return 'Meta title should be max 60 characters';
      }
      return null;
    }
  },
  
  metaDescription: {
    maxLength: 160,
    validate: (value) => {
      if (value && value.length > 160) {
        return 'Meta description should be max 160 characters';
      }
      return null;
    }
  },
  
  twitterCard: {
    options: SCHEMA_CONFIG.twitterCards,
    validate: (value) => {
      if (value && !SCHEMA_CONFIG.twitterCards.includes(value)) {
        return `Twitter card must be one of: ${SCHEMA_CONFIG.twitterCards.join(', ')}`;
      }
      return null;
    }
  }
};

/**
 * Validate filename against Tina naming convention
 */
function validateFilename(filename) {
  const errors = [];
  const warnings = [];
  
  if (!SCHEMA_CONFIG.filenamePattern.test(filename)) {
    errors.push('Filename must follow pattern: YYYY-MM-DD-slug.md');
  }
  
  if (filename.length > 100) {
    warnings.push('Filename is very long, consider shortening');
  }
  
  return { errors, warnings };
}

/**
 * Validate frontmatter fields
 */
function validateFrontmatter(frontmatter) {
  const errors = [];
  const warnings = [];
  
  // Validate all fields using rules
  Object.keys(VALIDATION_RULES).forEach(field => {
    const rule = VALIDATION_RULES[field];
    const value = frontmatter[field];
    
    const error = rule.validate(value);
    if (error) {
      if (rule.required || value !== undefined) {
        errors.push(`${field}: ${error}`);
      }
    }
  });
  
  // Validate SEO fields
  if (frontmatter.seo && typeof frontmatter.seo === 'object') {
    Object.keys(SEO_RULES).forEach(field => {
      const rule = SEO_RULES[field];
      const value = frontmatter.seo[field];
      
      const error = rule.validate(value);
      if (error) {
        warnings.push(`seo.${field}: ${error}`);
      }
    });
  }
  
  // Special validations
  if (frontmatter.image && !frontmatter.imageAlt) {
    warnings.push('Image alt text is recommended when an image is specified');
  }
  
  if (frontmatter.seo?.keywords && !Array.isArray(frontmatter.seo.keywords)) {
    errors.push('seo.keywords: Must be an array');
  }
  
  return { errors, warnings };
}

/**
 * Validate content body
 */
function validateContentBody(content) {
  const warnings = [];
  
  if (!content || content.trim().length === 0) {
    warnings.push('Content body is empty');
  }
  
  if (content && content.length < 100) {
    warnings.push('Content is very short (less than 100 characters)');
  }
  
  // Check for common markdown issues
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Check for multiple consecutive empty lines
    if (index > 0 && line === '' && lines[index - 1] === '' && lines[index + 1] === '') {
      warnings.push(`Line ${lineNum}: Multiple consecutive empty lines`);
    }
    
    // Check for malformed links
    if (line.includes('](') && !line.match(/\[([^\]]*)\]\(([^)]*)\)/)) {
      warnings.push(`Line ${lineNum}: Potentially malformed markdown link`);
    }
  });
  
  return { warnings };
}

/**
 * Validate a single blog post file
 */
function validateBlogPost(filePath) {
  const filename = path.basename(filePath);
  const result = {
    filename,
    filePath,
    errors: [],
    warnings: [],
    info: []
  };
  
  try {
    // Validate filename
    const filenameValidation = validateFilename(filename);
    result.errors.push(...filenameValidation.errors);
    result.warnings.push(...filenameValidation.warnings);
    
    // Read and parse file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data: frontmatter, content } = matter(fileContent);
    
    // Validate frontmatter
    const frontmatterValidation = validateFrontmatter(frontmatter);
    result.errors.push(...frontmatterValidation.errors);
    result.warnings.push(...frontmatterValidation.warnings);
    
    // Validate content
    const contentValidation = validateContentBody(content);
    result.warnings.push(...contentValidation.warnings);
    
    // Collect info
    result.info.push(`Word count: ~${content.split(/\s+/).length}`);
    result.info.push(`Character count: ${content.length}`);
    
    if (frontmatter.tags) {
      result.info.push(`Tags: ${frontmatter.tags.length}`);
    }
    
    if (frontmatter.seo) {
      const seoFields = Object.keys(frontmatter.seo).filter(k => frontmatter.seo[k]);
      result.info.push(`SEO fields: ${seoFields.length}`);
    }
    
  } catch (error) {
    result.errors.push(`Failed to process file: ${error.message}`);
  }
  
  return result;
}

/**
 * Get all blog files from the content directory
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
 * Check file naming conventions across all files
 */
function checkNamingConventions(files) {
  const conventions = {
    datePrefixed: 0,
    slugFormat: 0,
    duplicateSlugs: new Set(),
    issues: []
  };
  
  const slugs = new Map();
  
  files.forEach(filePath => {
    const filename = path.basename(filePath, '.md');
    
    // Check date prefix
    if (/^\d{4}-\d{2}-\d{2}-/.test(filename)) {
      conventions.datePrefixed++;
    }
    
    // Extract slug (part after date)
    const match = filename.match(/^\d{4}-\d{2}-\d{2}-(.+)$/);
    if (match) {
      const slug = match[1];
      
      // Check slug format
      if (/^[a-z0-9-]+$/.test(slug)) {
        conventions.slugFormat++;
      }
      
      // Check for duplicate slugs
      if (slugs.has(slug)) {
        conventions.duplicateSlugs.add(slug);
        conventions.issues.push(`Duplicate slug detected: ${slug}`);
      } else {
        slugs.set(slug, filename);
      }
    }
  });
  
  return conventions;
}

/**
 * Generate comprehensive validation report
 */
function generateValidationReport(results, namingConventions) {
  const timestamp = new Date().toISOString();
  const totalFiles = results.length;
  const validFiles = results.filter(r => r.errors.length === 0).length;
  const filesWithWarnings = results.filter(r => r.warnings.length > 0).length;
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);
  
  const report = {
    metadata: {
      timestamp,
      totalFiles,
      validFiles,
      invalidFiles: totalFiles - validFiles,
      filesWithWarnings,
      totalErrors,
      totalWarnings,
      tinaCompatible: totalErrors === 0
    },
    
    namingConventions: {
      datePrefixedFiles: namingConventions.datePrefixed,
      correctSlugFormat: namingConventions.slugFormat,
      duplicateSlugs: Array.from(namingConventions.duplicateSlugs),
      issues: namingConventions.issues
    },
    
    validationResults: results.map(r => ({
      filename: r.filename,
      valid: r.errors.length === 0,
      errorCount: r.errors.length,
      warningCount: r.warnings.length,
      errors: r.errors,
      warnings: r.warnings,
      info: r.info
    })),
    
    summary: {
      readyForTina: totalErrors === 0,
      recommendedActions: generateRecommendations(results, namingConventions)
    }
  };
  
  return report;
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(results, namingConventions) {
  const recommendations = [];
  
  const invalidFiles = results.filter(r => r.errors.length > 0);
  if (invalidFiles.length > 0) {
    recommendations.push(
      `Fix ${invalidFiles.length} files with validation errors before migrating to Tina`
    );
  }
  
  const filesWithWarnings = results.filter(r => r.warnings.length > 0);
  if (filesWithWarnings.length > 0) {
    recommendations.push(
      `Review ${filesWithWarnings.length} files with warnings for optimal Tina compatibility`
    );
  }
  
  if (namingConventions.duplicateSlugs.size > 0) {
    recommendations.push(
      `Resolve ${namingConventions.duplicateSlugs.size} duplicate slug(s) to prevent conflicts`
    );
  }
  
  if (namingConventions.datePrefixed < results.length) {
    recommendations.push(
      'Consider adding date prefixes to all filenames for consistent organization'
    );
  }
  
  if (recommendations.length === 0) {
    recommendations.push('All content is ready for Tina CMS migration!');
  }
  
  return recommendations;
}

/**
 * Main validation function
 */
function runValidation() {
  console.log('🔍 Starting content validation for Tina CMS...');
  
  try {
    // Get all blog files
    const blogFiles = getBlogFiles();
    console.log(`📁 Found ${blogFiles.length} blog files`);
    
    if (blogFiles.length === 0) {
      console.log('ℹ️  No blog files found to validate');
      return;
    }
    
    // Validate each file
    const results = [];
    blogFiles.forEach(filePath => {
      const result = validateBlogPost(filePath);
      results.push(result);
      
      // Log progress
      const status = result.errors.length === 0 ? '✅' : '❌';
      const warningCount = result.warnings.length > 0 ? ` (${result.warnings.length} warnings)` : '';
      console.log(`${status} ${result.filename}${warningCount}`);
    });
    
    // Check naming conventions
    const namingConventions = checkNamingConventions(blogFiles);
    
    // Generate comprehensive report
    const report = generateValidationReport(results, namingConventions);
    
    // Save report
    const reportFilename = `validation-report-${report.metadata.timestamp.split('T')[0]}.json`;
    const reportPath = path.join(__dirname, reportFilename);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    
    // Display summary
    console.log('\n📊 Validation Summary:');
    console.log(`   Total files: ${report.metadata.totalFiles}`);
    console.log(`   Valid files: ${report.metadata.validFiles}`);
    console.log(`   Files with errors: ${report.metadata.invalidFiles}`);
    console.log(`   Files with warnings: ${report.metadata.filesWithWarnings}`);
    console.log(`   Total errors: ${report.metadata.totalErrors}`);
    console.log(`   Total warnings: ${report.metadata.totalWarnings}`);
    
    console.log('\n📋 File Naming:');
    console.log(`   Date-prefixed files: ${namingConventions.datePrefixed}/${blogFiles.length}`);
    console.log(`   Correct slug format: ${namingConventions.slugFormat}/${blogFiles.length}`);
    console.log(`   Duplicate slugs: ${namingConventions.duplicateSlugs.size}`);
    
    console.log('\n🎯 Recommendations:');
    report.summary.recommendedActions.forEach(rec => {
      console.log(`   • ${rec}`);
    });
    
    console.log(`\n📋 Detailed report saved to: ${reportPath}`);
    
    // Exit with appropriate code
    if (report.metadata.totalErrors > 0) {
      console.log('\n❌ Validation failed - content needs fixes before Tina migration');
      process.exit(1);
    } else {
      console.log('\n✅ All content is valid for Tina CMS migration!');
    }
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  }
}

// Run validation
runValidation();