# System Architecture Overview

## Executive Summary

The Melanie Zeyer website is a serverless, client-side rendered application built with React and TypeScript, deployed on Netlify's edge network. The architecture prioritizes performance, simplicity, and maintainability through a JAMstack approach with static site generation and client-side interactivity.

## Core Architecture Principles

### 1. Serverless-First Design
- **Decision**: No backend servers, databases, or runtime dependencies
- **Rationale**: Eliminates infrastructure overhead, ensures infinite scalability, reduces operational complexity
- **Implementation**: Static build artifacts served via CDN with client-side logic

### 2. JAMstack Architecture
- **JavaScript**: React for dynamic UI interactions
- **APIs**: Third-party services via client-side SDKs (Netlify Identity, Forms)
- **Markup**: Pre-rendered HTML with client-side hydration
- **Benefits**: Security through reduced attack surface, performance via edge caching, simplified deployment

### 3. Content Management Strategy
- **Decap CMS**: Git-based headless CMS for content editing
- **Rationale**: No database required, version control for content, seamless developer workflow
- **Storage**: Markdown files in repository under version control

## Technology Stack

### Core Technologies
```
Frontend Framework:  React 18.3 with TypeScript 5.5
Build Tool:         Vite 5.4 (ESBuild for development, Rollup for production)
Routing:            React Router 7.9 (client-side routing)
Deployment:         Netlify (static hosting + serverless functions)
Authentication:     Netlify Identity (JWT-based, client-side)
CMS:               Decap CMS (formerly Netlify CMS)
Version Control:    Git with GitHub/GitLab integration
```

### Key Architectural Decisions

1. **Client-Side Rendering (CSR)**
   - Chosen over SSR/SSG for simplicity and real-time interactivity
   - Trade-off: Initial load performance vs. runtime flexibility
   - Mitigation: Aggressive code splitting and caching strategies

2. **Git-Based Content Management**
   - Content stored as Markdown in repository
   - Benefits: Version history, branching workflows, no database maintenance
   - Trade-off: Limited query capabilities vs. operational simplicity

3. **Edge-First Deployment**
   - Static assets served from Netlify's global CDN
   - Benefits: <50ms latency worldwide, automatic scaling
   - Configuration via `netlify.toml` for redirects and headers

## System Components

### Application Layers

```
┌─────────────────────────────────────────┐
│         Browser (Client Layer)          │
│  - React Components                     │
│  - Client-Side Router                   │
│  - State Management (React Hooks)      │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Static Assets (CDN Layer)          │
│  - HTML, CSS, JavaScript bundles       │
│  - Images and media files              │
│  - Markdown content files              │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│    Third-Party Services (API Layer)     │
│  - Netlify Identity (Authentication)    │
│  - Netlify Forms (Contact forms)       │
│  - Decap CMS (Content management)      │
└─────────────────────────────────────────┘
```

## Data Flow Architecture

### Content Publishing Flow
```
Author → Decap CMS → Git Repository → Build Process → CDN → Client
```

1. **Authoring**: Content created via Decap CMS web interface
2. **Storage**: Saved as Markdown files with frontmatter metadata
3. **Build**: Vite processes and bundles content during build
4. **Distribution**: Static files deployed to CDN edge nodes
5. **Consumption**: Client fetches and renders content

### Authentication Flow
```
User → Netlify Identity Widget → JWT Token → Protected Routes
```

1. **Login**: User authenticates via Netlify Identity widget
2. **Token**: JWT issued and stored in browser
3. **Validation**: Token verified client-side for route protection
4. **Session**: Maintained until logout or expiration

## Directory Structure

```
/
├── public/              # Static assets served directly
│   ├── admin/          # Decap CMS configuration
│   └── content/        # Markdown content files
│       ├── blog/       # Blog posts
│       └── authors/    # Author profiles
├── src/
│   ├── components/     # Reusable React components
│   ├── pages/          # Route-level page components
│   ├── services/       # Business logic and API integration
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions
├── dist/               # Build output (git-ignored)
└── netlify.toml        # Deployment configuration
```

## Integration Architecture

### Netlify Services Integration

1. **Netlify Identity**
   - Purpose: User authentication and authorization
   - Integration: JavaScript widget loaded client-side
   - Data: JWT tokens, user metadata

2. **Netlify Forms**
   - Purpose: Contact form submissions without backend
   - Integration: HTML form attributes detected at build
   - Data: Submissions stored in Netlify dashboard

3. **Decap CMS**
   - Purpose: Content management interface
   - Integration: Git Gateway API for repository access
   - Data: Markdown files with YAML frontmatter

### Build and Deploy Pipeline

```
Git Push → Netlify Build → Vite Build → Deploy to CDN
     ↓           ↓             ↓            ↓
   Trigger    Install      Bundle      Distribute
   Build      Dependencies  Assets     Globally
```

## Performance Architecture

### Optimization Strategies

1. **Code Splitting**: Route-based lazy loading
2. **Asset Optimization**: Image compression, WebP format
3. **Caching Strategy**: Immutable assets with fingerprinting
4. **Bundle Size**: <200KB initial JavaScript payload

### CDN Configuration

```yaml
Cache-Control Headers:
- Static assets: max-age=31536000 (1 year)
- HTML files: no-cache (always fresh)
- API responses: Varies by endpoint
```

## Security Model

### Security Layers

1. **Static Site Security**
   - No server-side code execution
   - No database to compromise
   - Reduced attack surface

2. **Authentication**
   - JWT-based authentication
   - Client-side validation only
   - No sensitive operations

3. **Content Security**
   - Git-based access control
   - Branch protection rules
   - Audit trail via Git history

## Scalability Characteristics

### Horizontal Scaling
- **Automatic**: CDN handles traffic distribution
- **Infinite**: No server bottlenecks
- **Global**: Edge nodes worldwide

### Vertical Scaling
- **Not applicable**: Serverless architecture
- **Build time**: Only constraint is build process duration

## Future Architecture Considerations

### Potential Enhancements

1. **Progressive Web App (PWA)**
   - Service worker for offline functionality
   - App manifest for installability

2. **Internationalization (i18n)**
   - Multi-language support
   - Locale-based routing

3. **Enhanced Analytics**
   - Client-side analytics integration
   - Performance monitoring

### Architecture Constraints

1. **No Server-Side Logic**: All processing must be client-side
2. **Static Build Time**: Dynamic content requires rebuild
3. **Git Storage Limits**: Content volume constrained by repository size

## Architectural Decision Records

### ADR-001: Serverless Architecture
- **Status**: Accepted
- **Context**: Need for low-maintenance, scalable solution
- **Decision**: Adopt serverless JAMstack architecture
- **Consequences**: No server costs, infinite scalability, limited to static+client logic

### ADR-002: Client-Side Authentication
- **Status**: Accepted
- **Context**: Authentication without backend
- **Decision**: Use Netlify Identity with JWT
- **Consequences**: Simple setup, limited to client validation

### ADR-003: Git-Based CMS
- **Status**: Accepted
- **Context**: Content management without database
- **Decision**: Implement Decap CMS with Git storage
- **Consequences**: Version controlled content, developer-friendly, no query language

---

*This architecture document represents the current state of the system and foundational decisions that are unlikely to change. Implementation details and specific configurations should be referenced in CLAUDE.md and component documentation.*