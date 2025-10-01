# Melanie Zeyer Website - Project Instructions

This document contains project-specific instructions and guidelines for AI assistance with the Melanie Zeyer website (melaniezeyer.de). These instructions supplement the global CLAUDE.md configuration.

## Project Context

You are working on a **teaser/coming soon website** for melaniezeyer.de. This is a single-page application built with React, TypeScript, and Vite, deployed serverlessly on Netlify. The site features an elegant particle effect system and is designed to create anticipation for the full website launch.

## Critical Requirements

### 1. Serverless Architecture (MANDATORY)
- **REQUIRED**: All code must be compatible with Netlify's serverless deployment
- **PROHIBITED**: Any backend servers, databases, or server-side processing
- **PROHIBITED**: API endpoints that require server runtime
- **REQUIRED**: Static site generation only
- **ALLOWED**: Client-side JavaScript and browser APIs only
- **ALLOWED**: Third-party services via client-side SDKs (if needed)

### 2. Language Requirements
- **CONTENT LANGUAGE**: All user-facing text MUST be in German
- **CODE LANGUAGE**: Code, comments, and documentation in English
- **CURRENT CONTENT**:
  - Title: "Hier entsteht gerade etwas großartiges!"
  - Subtitle: "Wir arbeiten an etwas Besonderem. Schauen Sie bald wieder vorbei."
  - CTA: "Bald verfügbar"
- **FUTURE CONTENT**: Maintain German language for all updates

### 3. Design System Preservation
- **COLORS**: Must maintain exact color values:
  ```typescript
  primary: '#0097B2'    // Teal blue - main headings
  secondary: '#70A6B0'  // Soft blue-gray - subtitles
  background: '#FFFFFF' // Pure white - page background
  accent: '#e8cd8c'     // Warm gold - particles, CTA
  ```
- **TYPOGRAPHY**: System font stack for performance
- **LAYOUT**: Centered, minimalist design approach
- **SPACING**: Maintain current padding/margin ratios

### 4. Particle Effect System
The particle system is a core feature. When modifying:
- **EMISSION POINT**: Always from logo center
- **PARAMETERS**: 
  - Max particles: 75 (performance limit)
  - Spawn rate: 0.8 (balanced for visual appeal)
  - Repulsion radius: 100px (optimal interaction zone)
  - Repulsion force: 0.3 (subtle but noticeable)
- **PERFORMANCE**: Must maintain 60 FPS on mid-range devices
- **ACCESSIBILITY**: Must respect `prefers-reduced-motion`
- **VISUAL**: Subtle glow effect with radial gradients

## Technical Constraints

### Build & Deployment
- **BUILD TOOL**: Vite 5.4+ (do not downgrade)
- **OUTPUT**: Static files in `dist/` directory
- **DEPLOYMENT**: Netlify via `netlify.toml` configuration
- **NODE VERSION**: 18.x (specified in Netlify config)
- **BUNDLE SIZE**: Keep total under 200KB gzipped

### Performance Requirements
- **Initial Load**: < 50KB JavaScript
- **LCP**: < 2.5 seconds on 3G
- **FID**: < 100ms
- **CLS**: < 0.1
- **Lighthouse Score**: Maintain 95+ in all categories

### Browser Compatibility
Minimum supported versions:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers: Last 2 major versions

### TypeScript Configuration
- **STRICT MODE**: Always enabled
- **NO UNUSED**: Variables and parameters must be used
- **NO IMPLICIT ANY**: All types must be explicit or inferred
- **TARGET**: ES2020 for modern features

## Development Workflow

### Commands Reference
```bash
# Core commands (VERIFY BEFORE USE)
npm run dev      # Start dev server on port 3000
npm run build    # Build for production to dist/
npm run preview  # Preview production build on port 4173
npm run lint     # Run ESLint checks

# Setup and verification commands
npm run verify-env # Verify environment variables setup
npm run setup      # Alias for verify-env (same command)

# Deployment (automatic via Netlify)
# Push to main branch triggers deployment
```

### File Modification Rules
1. **NEVER** modify files in `dist/` (generated)
2. **NEVER** modify `package-lock.json` directly
3. **ALWAYS** test locally before committing
4. **ALWAYS** run lint before committing

### Component Development
When creating new components:
1. Place in `src/components/`
2. Use TypeScript with explicit types
3. Export from `src/components/index.ts`
4. Follow existing component patterns
5. Include proper prop interfaces

## Code Style & Conventions

### React Components
```typescript
// REQUIRED: Functional components with TypeScript
interface ComponentProps {
  prop1: string;
  prop2?: number; // Optional props marked with ?
}

const Component: React.FC<ComponentProps> = ({ prop1, prop2 = 10 }) => {
  // Implementation
};

export default Component;
```

### State Management
- **LOCAL STATE**: Use React hooks (useState, useRef)
- **GLOBAL STATE**: Not needed for current scope
- **SIDE EFFECTS**: useEffect with proper cleanup

### Styling Approach
- **INLINE STYLES**: Current approach for performance
- **STYLE OBJECTS**: Defined within components
- **RESPONSIVE**: Use clamp() for fluid sizing
- **UNITS**: rem for text, px for fixed elements

## Content Management

### Current Content Structure
Located in `src/types/index.ts`:
```typescript
export const APP_CONFIG: AppConfig = {
  colors: APP_COLORS,
  title: 'Hier entsteht gerade etwas großartiges!',
  subtitle: 'Wir arbeiten an etwas Besonderem. Schauen Sie bald wieder vorbei.',
}
```

### Updating Content
1. Modify APP_CONFIG in `src/types/index.ts`
2. Maintain German language
3. Keep messages concise and impactful
4. Test responsive text sizing

## Future Feature Considerations

### Phase 2 Features (Potential)
Consider these for future implementation:
1. **Newsletter Signup**
   - Client-side form
   - Integration with Netlify Forms or external service
   - GDPR compliance for German market

2. **Social Media Links**
   - Icon components
   - External link handling
   - Accessibility considerations

3. **Launch Countdown**
   - Client-side timer
   - Timezone handling
   - Responsive display

4. **Content Sections**
   - About section
   - Services preview
   - Contact information

### Implementation Guidelines
When adding new features:
1. **MAINTAIN SERVERLESS**: No backend dependencies
2. **PRESERVE PERFORMANCE**: Monitor bundle size
3. **ENSURE ACCESSIBILITY**: WCAG 2.1 AA compliance
4. **KEEP GERMAN LANGUAGE**: All user content
5. **TEST RESPONSIVENESS**: Mobile-first approach

## Testing Approach

### Current Testing
- **Manual Testing**: Browser testing required
- **Build Verification**: `npm run build` must succeed
- **Lint Checks**: Zero errors/warnings

### Future Testing Strategy
When adding tests:
1. Use Vitest for unit tests
2. React Testing Library for components
3. Test particle system performance
4. Verify accessibility with axe-core

## Security Considerations

### Current Security Measures
- No user input (no XSS risk)
- No backend (no injection risks)
- HTTPS enforced by Netlify
- No sensitive data storage

### Security Guidelines
- **NEVER** add API keys to frontend code
- **NEVER** store user data in localStorage
- **ALWAYS** validate external integrations
- **ALWAYS** use HTTPS for external resources

## Deployment Process

### Automatic Deployment
1. Push to main branch
2. Netlify triggers build
3. Runs `npm run build`
4. Deploys `dist/` to CDN
5. Updates DNS automatically

### Environment Variables
If needed in future:
- Define in Netlify UI
- Access via `import.meta.env`
- Prefix with `VITE_` for client access

## Error Handling

### Current Error Handling
- Logo load errors: Graceful hide
- Particle system: Automatic disable on error
- Canvas support: Feature detection

### Error Handling Principles
1. **NEVER** show technical errors to users
2. **ALWAYS** provide fallback behavior
3. **LOG** errors to console in development
4. **CONSIDER** error tracking service for production

## Performance Optimization

### Current Optimizations
- Minimal dependencies
- Canvas-based animations
- Throttled particle spawning
- Efficient re-renders

### Optimization Guidelines
1. **MEASURE**: Use Lighthouse and devtools
2. **LAZY LOAD**: Future images and components
3. **MINIMIZE**: CSS and JavaScript
4. **CACHE**: Leverage browser caching
5. **CDN**: Utilize Netlify's edge network

## Accessibility Requirements

### Current Implementation
- Semantic HTML structure
- ARIA attributes on decorative elements
- Respects motion preferences
- Keyboard navigable

### Accessibility Checklist
- [ ] Color contrast AA compliant
- [ ] Focus indicators visible
- [ ] Screen reader compatible
- [ ] Keyboard navigation works
- [ ] Motion can be disabled
- [ ] Images have alt text

## Monitoring & Maintenance

### Regular Maintenance Tasks
1. **Weekly**: Check site availability
2. **Monthly**: Update dependencies (security)
3. **Quarterly**: Performance audit
4. **Annually**: Full accessibility review

### Monitoring Metrics
- Uptime: 99.9% target
- Load time: < 3s on 3G
- Error rate: < 0.1%
- Core Web Vitals: All green

## Blog System Architecture

### Overview
The website includes a comprehensive blog system with client-side authentication and content management capabilities. The blog is fully serverless-compatible, using markdown files for content storage and client-side rendering for all functionality.

### Core Components

#### 1. Type Definitions (`src/types/blog.ts`)
Comprehensive TypeScript interfaces and types for the blog system:
- **BlogPost**: Complete post structure with metadata and content
- **BlogMetadata**: Frontmatter data from markdown files
- **BlogCategory**: Six predefined categories (coaching, persoenlichkeitsentwicklung, lifestyle, business, gesundheit, mindset)
- **BlogStatus**: Post states (draft, published, archived)
- **BlogAuthor**: Author information with social links
- **BlogSEO**: SEO metadata for search optimization
- **AdminUser**: User roles and permissions system
- **BlogConfig**: System-wide configuration settings

Default configuration includes:
- Posts per page: 12
- Comments enabled with moderation
- Search functionality enabled
- RSS feed support
- Reading speed: 200 words/minute
- Max image size: 5MB

#### 2. Authentication System (`src/services/auth.ts`)

**Client-Side Password Protection:**
- SHA-256 password hashing using Web Crypto API
- Password hash stored in environment variable `VITE_ADMIN_PASSWORD_HASH`
- Session-based authentication with configurable duration (4 hours default)
- "Remember Me" option extends session to 24 hours
- Login attempt tracking with lockout after 5 failed attempts (15-minute lockout)
- CSRF token generation for form protection
- Security event logging to sessionStorage for debugging

**Session Management:**
- Sessions stored in sessionStorage (default) or localStorage ("Remember Me")
- Automatic session expiration checking
- Session refresh every minute
- Secure token generation using crypto.getRandomValues()

**Security Features:**
- Account lockout mechanism
- Security event logging
- CSRF protection
- Session expiration
- No backend dependencies (fully client-side)

#### 3. Content Service (`src/services/blogContent.ts`)

**Markdown Processing:**
- Gray-matter for frontmatter parsing
- Support for all BlogMetadata fields
- Automatic slug generation from titles (German character support)
- Reading time calculation (200 words/minute)
- Content caching with 5-minute TTL

**Data Loading:**
- Loads markdown files from `/public/content/blog/`
- Requires manifest.json for file listing (serverless constraint)
- Parallel loading with error handling
- Automatic sorting by date (newest first)
- Draft posts hidden in production, visible in development

**Query Functions:**
- `loadAllPosts()`: Get all published posts
- `loadPostBySlug()`: Get single post by URL slug
- `getPostsByCategory()`: Filter by category
- `getPostsByTag()`: Filter by tag
- `getRecentPosts()`: Get latest posts
- `searchPosts()`: Full-text search in title, excerpt, content, and tags
- `getPaginatedPosts()`: Paginated post listings
- `getAllTags()`: Get all unique tags with counts
- `getBlogStats()`: Basic blog statistics

#### 4. CMS Integration (Decap CMS)

**Configuration Location:** `public/admin/config.yml`

**Features:**
- Git-based content management via Netlify Identity
- Editorial workflow (draft/review/publish)
- Local development backend support
- German language interface
- Media upload to `public/content/blog/images/`

**Content Collections:**
1. **Blog Posts:**
   - Location: `public/content/blog/`
   - Slug format: `{{year}}-{{month}}-{{day}}-{{slug}}`
   - Full markdown editor with preview
   - All BlogMetadata fields supported
   - SEO settings group
   - Featured post flag

2. **Authors:**
   - Location: `public/content/authors/`
   - Author profiles with social links
   - Avatar image support

**Access:** Available at `/admin` route (requires authentication)

#### 5. React Components

**Blog Pages:**
- `src/pages/Blog.tsx`: Main blog listing page with category filter and search
- `src/pages/BlogPost.tsx`: Individual post display with related posts
- `src/components/BlogCard.tsx`: Post card component for listings
- `src/components/BlogManagement.tsx`: Admin interface for post management

**Admin Components:**
- `src/components/AdminLogin.tsx`: Login form with password protection
- `src/components/AdminDashboard.tsx`: Main admin dashboard
- `src/components/ProtectedRoute.tsx`: Route protection with permission checking

#### 6. Routing Structure

```typescript
// Public routes
/blog                 // Blog listing page
/blog/:slug          // Individual blog post

// Admin routes (protected)
/admin               // Admin dashboard
/admin/login         // Login page
/admin/blog          // Blog management interface
```

### Content Storage

**Directory Structure:**
```
public/
├── content/
│   ├── blog/
│   │   ├── images/          // Blog post images
│   │   ├── manifest.json    // File listing for serverless
│   │   └── *.md            // Blog post markdown files
│   └── authors/            // Author profiles
└── admin/
    ├── config.yml          // Decap CMS configuration
    └── index.html          // CMS entry point
```

**Markdown File Format:**
```markdown
---
title: "Post Title"
slug: "url-friendly-slug"
date: "2024-01-01T10:00:00.000Z"
excerpt: "Short description"
author: "melanie"
category: "coaching"
tags: ["tag1", "tag2"]
image: "/content/blog/images/hero.jpg"
imageAlt: "Description"
status: "published"
featured: false
seo:
  metaTitle: "SEO Title"
  metaDescription: "SEO Description"
---

Post content in markdown format...
```

### Security Considerations

1. **Authentication Security:**
   - Password never transmitted or stored in plain text
   - Client-side hashing before comparison
   - Session tokens use cryptographically secure random values
   - Automatic session expiration

2. **Content Security:**
   - All content sanitized before rendering
   - No user-generated content without authentication
   - CSRF protection on all forms
   - XSS prevention through React's default escaping

3. **Deployment Security:**
   - HTTPS enforced by Netlify
   - No sensitive data in frontend code
   - Environment variables for secrets
   - Git-based version control for content

### Environment Variables

Required environment variables for blog functionality:

```bash
# Admin password hash (generate using hashPassword function)
VITE_ADMIN_PASSWORD_HASH=<sha256-hash>

# Optional: Netlify Identity (for CMS)
NETLIFY_IDENTITY_ENDPOINT=<identity-url>
```

### Development Workflow

1. **Creating Blog Posts:**
   - Option 1: Create markdown files directly in `public/content/blog/`
   - Option 2: Use Decap CMS at `/admin` (requires setup)
   - Option 3: Use the admin interface at `/admin/blog`

2. **Managing Content:**
   - Edit markdown files for quick changes
   - Use CMS for full editorial workflow
   - Admin dashboard for post management

3. **Testing:**
   - Draft posts visible in development mode
   - Use `npm run dev` to test locally
   - Preview at `/blog` route

### Performance Optimizations

1. **Caching Strategy:**
   - 5-minute TTL for processed posts
   - Session-based cache for better performance
   - Lazy loading of post content

2. **Loading Optimization:**
   - Parallel markdown file loading
   - Post summaries for listings (reduced payload)
   - Pagination to limit initial load

3. **Search Performance:**
   - Client-side full-text search
   - Indexed on demand
   - Results cached during session

### Future Enhancements

Potential improvements maintaining serverless architecture:

1. **Comments System:**
   - Integration with Disqus or similar service
   - Netlify Forms for comment submission
   - Moderation through admin interface

2. **Newsletter Integration:**
   - Email subscription via Netlify Forms
   - Integration with email service (Mailchimp, ConvertKit)
   - GDPR-compliant signup process

3. **Analytics:**
   - Client-side view tracking
   - Popular posts widget
   - Reading statistics

4. **RSS Feed:**
   - Static RSS generation at build time
   - Automatic feed updates on deploy

### Troubleshooting

**Common Issues:**

1. **Posts not appearing:**
   - Check `status` field is "published"
   - Verify manifest.json includes the file
   - Clear cache with `clearCache()`

2. **Authentication failures:**
   - Verify VITE_ADMIN_PASSWORD_HASH is set
   - Check for account lockout (15-minute wait)
   - Clear browser storage and retry

3. **CMS not loading:**
   - Ensure Netlify Identity is configured
   - Check git-gateway settings
   - Verify branch permissions

4. **Image upload issues:**
   - Check file size (max 5MB)
   - Verify format (JPG, PNG, WebP only)
   - Ensure correct path in markdown

## Communication Style

When providing updates or explanations:
1. **BE CONCISE**: Short, clear explanations
2. **BE TECHNICAL**: Include relevant details
3. **BE SPECIFIC**: Exact file paths and line numbers
4. **BE PRACTICAL**: Focus on implementation
5. **NO EMOJIS**: Professional communication only

## Version Control

### Commit Guidelines
```bash
# Format: type: description
feat: Add newsletter signup form
fix: Correct particle spawn position
style: Update color scheme
perf: Optimize particle rendering
docs: Update README
```

### Branch Strategy
- **main**: Production branch (auto-deploys)
- **develop**: Development branch (if needed)
- **feature/***: Feature branches

## Important Reminders

1. **THIS IS A SERVERLESS SITE** - No backend code allowed
2. **CONTENT IN GERMAN** - All user-facing text
3. **MAINTAIN COLORS** - Exact hex values required
4. **PRESERVE PARTICLES** - Core visual feature
5. **OPTIMIZE PERFORMANCE** - Every KB matters
6. **ENSURE ACCESSIBILITY** - WCAG 2.1 AA minimum
7. **TEST BEFORE DEPLOY** - Build must succeed

## Project Commands Documentation

```bash
# BUILD COMMANDS (VERIFIED)
npm run build    # Production build to dist/
npm run preview  # Preview production build

# TEST COMMANDS (VERIFIED)
npm run lint     # ESLint validation

# DEVELOPMENT COMMANDS (VERIFIED)
npm run dev      # Start development server

# SETUP COMMANDS (VERIFIED)
npm run verify-env # Verify environment variables configuration
npm run setup      # Alias for verify-env

# VALIDATION COMMANDS (RUN AFTER CHANGES)
npm run build && npm run preview  # Full validation cycle
```

---

**Priority Order for Decisions:**
1. Serverless compatibility
2. Performance impact
3. User experience
4. Accessibility
5. Code maintainability

**When in doubt:**
- Choose the simpler solution
- Prioritize performance
- Maintain current architecture
- Ask for clarification

---

*This document should be updated when making significant architectural changes or adding new features.*

*Last Updated: 2025-09-26*