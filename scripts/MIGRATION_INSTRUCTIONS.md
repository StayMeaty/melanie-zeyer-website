# Content Migration to Tina CMS - Instructions

This guide explains how to use the migration tools to transfer existing blog content to Tina CMS format.

## Overview

The migration system includes:
- **Validation Script**: Check content compatibility with Tina schema
- **Migration Script**: Fix and update content files  
- **LocalStorage Export**: Export browser drafts
- **React Component**: In-app migration interface
- **TypeScript Utilities**: Programmatic migration support

## Migration Scripts

### 1. Content Validation
```bash
npm run migrate:validate
```
**Purpose**: Validates all existing blog content against Tina schema requirements.

**What it checks**:
- Required fields (title, slug, date, excerpt, author, category, status)
- Field value formats and constraints
- File naming conventions
- SEO metadata
- Category and status values

**Output**: Detailed validation report with errors and warnings.

### 2. Content Fix
```bash
npm run migrate:fix
```
**Purpose**: Automatically fixes content files to match Tina schema.

**What it fixes**:
- Adds missing required fields with defaults
- Converts field formats (e.g., date strings to ISO format)
- Generates slugs from titles
- Creates default SEO objects
- Normalizes boolean fields

**Note**: Manual fixes may still be needed for some issues.

### 3. Migration Report
```bash
npm run migrate:report
```
**Purpose**: Generates detailed migration report without making changes.

**Output**: Same as validation but saves comprehensive report to JSON file.

### 4. LocalStorage Export
```bash
npm run migrate:export
```
**Purpose**: Displays instructions for exporting localStorage drafts.

**Usage**:
1. Copy the contents of `scripts/exportLocalStorage.js`
2. Open your website in browser
3. Open Developer Tools (F12) → Console
4. Paste and execute the script
5. Downloads JSON file with exported drafts

## In-App Migration (React Component)

The `ContentMigration` component provides a user-friendly interface for migration:

### Features
- Visual progress tracking
- Error reporting
- Backup creation
- LocalStorage migration
- JSON file import
- Migration statistics

### Integration Example
```tsx
import { ContentMigration } from '../components';

function AdminPanel() {
  const [showMigration, setShowMigration] = useState(false);
  
  const handleMigrationComplete = (result) => {
    console.log('Migration completed:', result);
    // Handle completion
  };
  
  return (
    <div>
      <button onClick={() => setShowMigration(true)}>
        Migrate Content
      </button>
      
      {showMigration && (
        <ContentMigration
          onClose={() => setShowMigration(false)}
          onMigrationComplete={handleMigrationComplete}
        />
      )}
    </div>
  );
}
```

## TypeScript Utilities

Use the `contentMigration.ts` utilities for programmatic migration:

### Basic Usage
```typescript
import {
  migrateLocalStorageDrafts,
  importDraftData,
  getMigrationStats
} from '../utils/contentMigration';

// Migrate localStorage drafts
const result = await migrateLocalStorageDrafts({
  validateSchema: true,
  createBackup: true,
  preserveOriginal: false,
  onProgress: (progress) => console.log(progress),
  onError: (error) => console.error(error)
});

// Import external draft data
const importResult = await importDraftData(draftArray, options);

// Get migration statistics
const stats = getMigrationStats();
console.log(`LocalStorage drafts: ${stats.localStorageDrafts}`);
console.log(`Migrated drafts: ${stats.migratedDrafts}`);
```

### Available Functions

- `migrateLocalStorageDrafts()`: Migrate localStorage to Tina format
- `importDraftData()`: Import external draft data
- `getMigratedDrafts()`: Get migrated drafts from storage
- `clearMigratedDrafts()`: Clear migrated drafts
- `restoreFromBackup()`: Restore from migration backup
- `getMigrationStats()`: Get current migration statistics

## Migration Workflow

### Step 1: Pre-Migration Check
```bash
npm run migrate:validate
```
Review the validation report and note any issues.

### Step 2: Fix Content (if needed)
```bash
npm run migrate:fix
```
Let the script fix automatic issues. Review and manually fix remaining problems.

### Step 3: Export LocalStorage Drafts
1. Run `npm run migrate:export` for instructions
2. Execute the browser script to export drafts
3. Save the downloaded JSON file

### Step 4: Use In-App Migration
1. Open the admin interface
2. Access the Content Migration component
3. Configure migration options:
   - ✅ Validate Schema: Check data against Tina requirements
   - ✅ Create Backup: Create backup before migration
   - ⬜ Preserve Original: Keep original localStorage data
4. Click "LocalStorage Entwürfe migrieren"
5. Or import the JSON file from Step 3

### Step 5: Verify Migration
1. Check migration results in the interface
2. Review any errors or warnings
3. Test migrated content in Tina CMS
4. Clear migration data when satisfied

## Common Issues and Solutions

### Issue: Invalid Category Values
**Error**: "Invalid category: [value]. Must be one of: coaching, persoenlichkeitsentwicklung, ..."

**Solution**: Update category field to use allowed values:
- `coaching`
- `persoenlichkeitsentwicklung`
- `lifestyle`
- `business`
- `gesundheit`
- `mindset`

### Issue: Missing Required Fields
**Error**: "Missing required field: [field]"

**Solution**: Add the missing field to frontmatter:
```yaml
title: "Post Title"
slug: "post-slug"
date: "2024-01-01T10:00:00.000Z"
excerpt: "Post description..."
author: "melanie"
category: "coaching"
status: "published"
```

### Issue: Invalid Field Formats
**Error**: "Slug must contain only lowercase letters, numbers, and hyphens"

**Solution**: Fix slug format:
```yaml
# ❌ Wrong
slug: "My Post Title!"

# ✅ Correct  
slug: "my-post-title"
```

### Issue: Image Without Alt Text
**Warning**: "Image alt text is recommended when an image is specified"

**Solution**: Add imageAlt field:
```yaml
image: "/path/to/image.jpg"
imageAlt: "Description of the image"
```

## File Structure After Migration

```
public/content/blog/
├── 2024-01-15-willkommen-zu-meinem-blog.md     ✅ Tina compatible
├── 2024-03-15-blog-start-coaching-reise.md     ✅ Tina compatible
├── 2024-03-16-selbstentwicklung-schluessel.md  ✅ Tina compatible
├── images/                                      📁 Image assets
└── manifest.json                                📄 File manifest
```

Each markdown file will have:
- All required fields
- Proper field formats
- Valid category/status values
- Complete SEO metadata
- Image alt text (when images present)

## Backup and Recovery

### Automatic Backups
The migration system creates automatic backups when enabled:
- Backup key format: `migration-backup-[timestamp]`
- Stored in localStorage with original data
- Can be restored using the admin interface

### Manual Backup
Before migration, consider backing up:
1. Export current localStorage: Use browser export script
2. Copy markdown files: Make filesystem backup
3. Document current structure: Note any custom fields

### Recovery Options
If migration fails:
1. Use "Wiederherstellen" button for specific backups
2. Restore from filesystem backup
3. Clear migrated data and restart process

## Support and Troubleshooting

### Debug Information
Migration components provide detailed logging:
- Progress tracking with item counts
- Error details with timestamps
- Validation reports with specific issues
- Migration statistics

### Getting Help
1. Check validation report for specific errors
2. Review browser console for debug logs
3. Examine generated migration reports
4. Test with small subset of content first

### Best Practices
- Always validate before fixing
- Create backups before migration
- Test migration with non-critical content first
- Review migrated content in Tina before going live
- Keep migration reports for documentation

---

**Note**: This migration is designed for the specific Tina CMS schema defined in `tina/config.ts`. If the schema changes, migration scripts may need updates.