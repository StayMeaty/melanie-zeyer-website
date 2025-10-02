// Tina CMS type definitions for the Melanie project
// Comprehensive TypeScript interfaces for type-safe Tina CMS integration

import { BlogCategory, BlogStatus, BlogSEO } from './blog';

/**
 * Base Tina rich text node interface
 */
export interface TinaRichTextNode {
  /** Node type identifier */
  type: 'text' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'ul' | 'ol' | 'li' | 'blockquote' | 'hr' | 'br' | 'img' | 'a' | 'strong' | 'em' | 'code' | 'pre';
  /** Child nodes for composite elements */
  children?: TinaRichTextNode[];
  /** Text content for text nodes */
  text?: string;
  /** Bold formatting flag */
  bold?: boolean;
  /** Italic formatting flag */
  italic?: boolean;
  /** Underline formatting flag */
  underline?: boolean;
  /** Code formatting flag */
  code?: boolean;
  /** Link URL for anchor elements */
  url?: string;
  /** Image source for img elements */
  src?: string;
  /** Alt text for images */
  alt?: string;
  /** Title attribute */
  title?: string;
  /** Additional attributes */
  attrs?: Record<string, string | number | boolean>;
}

/**
 * Tina rich text content structure
 */
export interface TinaRichTextContent {
  /** Content type */
  type: 'rich-text';
  /** Root children nodes */
  children: TinaRichTextNode[];
  /** Content format version */
  version?: string;
}

/**
 * Tina markdown content structure
 */
export interface TinaMarkdownContent {
  /** Content type */
  type: 'markdown';
  /** Markdown content string */
  content: string;
  /** Frontmatter data */
  frontmatter?: Record<string, unknown>;
}

/**
 * Union type for all Tina content types
 */
export type TinaContent = TinaRichTextContent | TinaMarkdownContent | string;

/**
 * Tina SEO metadata interface
 */
export interface TinaSEO {
  /** Meta title for search engines */
  metaTitle?: string;
  /** Meta description for search engines */
  metaDescription?: string;
  /** Canonical URL */
  canonicalUrl?: string;
  /** Open Graph image */
  ogImage?: string;
  /** Open Graph title */
  ogTitle?: string;
  /** Open Graph description */
  ogDescription?: string;
  /** Twitter card title */
  twitterTitle?: string;
  /** Twitter card description */
  twitterDescription?: string;
  /** Twitter card image */
  twitterImage?: string;
  /** Twitter card type */
  twitterCard?: string;
  /** Keywords for SEO */
  keywords?: string[];
  /** Focus keyphrase for content optimization */
  focusKeyphrase?: string;
  /** Robots meta tag directives */
  robots?: string;
}

/**
 * Tina blog post data structure
 */
export interface TinaBlogPost {
  /** Unique post identifier */
  id: string;
  /** Post title */
  title: string;
  /** URL-friendly slug */
  slug?: string;
  /** Publication date */
  date: string;
  /** Post excerpt/summary */
  excerpt: string;
  /** Author identifier */
  author: string;
  /** Post category */
  category: string;
  /** Post tags */
  tags?: string[];
  /** Featured image */
  image?: string;
  /** Alt text for featured image */
  imageAlt?: string;
  /** Publication status */
  status?: string;
  /** Featured post flag */
  featured?: boolean;
  /** Rich text content */
  body: TinaContent;
  /** Estimated reading time in minutes */
  readingTime?: number;
  /** Last modified date */
  lastModified?: string;
  /** SEO metadata */
  seo?: TinaSEO;
}

/**
 * Tina blog post query response
 */
export interface TinaBlogPostResponse {
  /** Blog post data */
  blog: TinaBlogPost;
}

/**
 * Tina blog connection edge
 */
export interface TinaBlogEdge {
  /** Post node data */
  node: TinaBlogPost;
  /** Cursor for pagination */
  cursor?: string;
}

/**
 * Tina blog list response structure
 */
export interface TinaBlogListResponse {
  /** Blog connection with pagination */
  blogConnection: {
    /** Array of post edges */
    edges: TinaBlogEdge[];
    /** Page info for pagination */
    pageInfo?: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string;
      endCursor?: string;
    };
    /** Total count */
    totalCount?: number;
  };
}

/**
 * Tina query parameters for blog posts
 */
export interface TinaBlogQueryParams {
  /** Maximum number of posts to fetch */
  first?: number;
  /** Number of posts to skip */
  last?: number;
  /** Cursor for pagination */
  after?: string;
  /** Cursor for pagination */
  before?: string;
  /** Sort order */
  sort?: string;
  /** Sort direction */
  order?: 'asc' | 'desc';
  /** Filter criteria */
  filter?: {
    /** Filter by category */
    category?: {
      eq?: string;
      in?: string[];
    };
    /** Filter by status */
    status?: {
      eq?: string;
      in?: string[];
    };
    /** Filter by date */
    date?: {
      gte?: string;
      lte?: string;
    };
    /** Filter by featured flag */
    featured?: {
      eq?: boolean;
    };
  };
}

/**
 * Tina blog connection query parameters
 */
export interface TinaBlogConnectionParams extends TinaBlogQueryParams {
  /** Additional connection parameters */
  relativePath?: string;
}

/**
 * Tina update blog post parameters
 */
export interface TinaUpdateBlogParams {
  /** Relative path to the file */
  relativePath: string;
  /** Updated post data */
  params: Partial<TinaBlogPost>;
}

/**
 * Tina update blog post response
 */
export interface TinaUpdateBlogResponse {
  /** Updated blog post */
  updateBlog: TinaBlogPost;
}

/**
 * Tina queries interface
 */
export interface TinaQueries {
  /** Get single blog post */
  blog: (params: { relativePath: string }) => Promise<TinaBlogPostResponse>;
  /** Get blog post by relativePath */
  post: (params: { relativePath: string }) => Promise<{ post: TinaBlogPost }>;
  /** Get blog post connection */
  blogConnection: (params: TinaBlogConnectionParams) => Promise<TinaBlogListResponse>;
}

/**
 * Tina mutations interface
 */
export interface TinaMutations {
  /** Update blog post */
  updateBlog: (params: TinaUpdateBlogParams) => Promise<TinaUpdateBlogResponse>;
  /** Create a new post */
  createPost: (params: { relativePath: string; params: Partial<TinaBlogPost> }) => Promise<{ createPost: TinaBlogPost }>;
  /** Update an existing post */
  updatePost: (params: { relativePath: string; params: Partial<TinaBlogPost> }) => Promise<{ updatePost: TinaBlogPost }>;
  /** Delete a post */
  deletePost: (params: { relativePath: string }) => Promise<{ deletePost: boolean }>;
}

/**
 * Tina client interface
 */
export interface TinaClient {
  /** Available queries */
  queries: TinaQueries;
  /** Available mutations */
  mutations?: TinaMutations;
  /** Media management */
  media?: TinaMediaManager;
  /** Search functionality */
  search?: TinaSearchManager;
  /** Client configuration */
  config?: TinaClientConfig;
  /** Authentication status */
  isAuthenticated?: boolean;
}

/**
 * Tina client configuration interface
 */
export interface TinaClientConfig {
  /** Enable Tina CMS */
  enabled: boolean;
  /** Client ID for authentication */
  clientId?: string;
  /** Git branch to work with */
  branch: string;
  /** Connection timeout in milliseconds */
  connectionTimeout: number;
  /** Query timeout in milliseconds */
  queryTimeout: number;
  /** API endpoint URL */
  apiUrl?: string;
  /** Authentication token */
  token?: string;
  /** Repository */
  repository?: string;
  /** Search token */
  searchToken?: string;
  /** Local development flag */
  isLocalDevelopment?: boolean;
}

/**
 * Tina authentication session interface
 */
export interface TinaAuthSession {
  /** Session token */
  token: string;
  /** User information */
  user: {
    id: string;
    email: string;
    name?: string;
  };
  /** Session expiration timestamp */
  expiresAt: number;
  /** Session creation timestamp */
  createdAt: number;
  /** Session active status */
  active: boolean;
}

/**
 * Tina CMS core instance interface
 */
export interface TinaCMSCore {
  /** CMS configuration */
  config: TinaClientConfig;
  /** CMS sidebar */
  sidebar?: {
    hidden: boolean;
  };
  /** CMS media management */
  media?: TinaMediaManager;
  /** CMS search functionality */
  search?: TinaSearchManager;
}

/**
 * Tina Provider props interface
 */
export interface TinaProviderProps {
  /** CMS instance */
  cms: TinaCMSCore;
  /** Children components */
  children: React.ReactNode;
}

/**
 * Tina hook result interface
 */
export interface TinaHookResult {
  /** Form data */
  data: TinaBlogPost | null;
  /** Form instance */
  form: TinaForm | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error?: Error;
}

/**
 * Tina form interface
 */
export interface TinaForm {
  /** Form values */
  values: Record<string, unknown>;
  /** Form meta information */
  meta: {
    touched: Record<string, boolean>;
    errors: Record<string, string>;
    isSubmitting: boolean;
    isValid: boolean;
  };
  /** Form methods */
  submit: () => Promise<void>;
  reset: () => void;
  setFieldValue: (field: string, value: unknown) => void;
  setFieldTouched: (field: string, touched?: boolean) => void;
}

/**
 * Tina field helper interface
 */
export interface TinaFieldHelper {
  (object: Record<string, unknown>, field: string): Record<string, unknown>;
}

/**
 * Tina form data interface for editor
 */
export interface TinaFormData {
  /** Form values */
  values: Record<string, unknown>;
  /** Form meta information */
  meta: {
    /** Field touched status */
    touched: Record<string, boolean>;
    /** Field error messages */
    errors: Record<string, string>;
    /** Form submission status */
    isSubmitting: boolean;
    /** Form validation status */
    isValid: boolean;
  };
  /** Form change handlers */
  handlers: {
    /** Handle field value change */
    setFieldValue: (field: string, value: unknown) => void;
    /** Handle field touch */
    setFieldTouched: (field: string, touched?: boolean) => void;
    /** Validate form */
    validateForm: () => Promise<boolean>;
    /** Submit form */
    submitForm: () => Promise<void>;
  };
}

/**
 * Tina editor props interface
 */
export interface TinaEditorProps {
  /** Query string for data fetching */
  query: string;
  /** Variables for the query */
  variables: Record<string, unknown>;
  /** Initial data */
  data?: unknown | null;
  /** Form submission handler */
  onSubmit?: (data: TinaFormData) => Promise<void>;
  /** Form change handler */
  onChange?: (data: TinaFormData) => void;
  /** Form change handler (alternate) */
  onFormChange?: (formData: TinaFormData) => void;
  /** Save handler - can accept various data formats */
  onSave?: (formData: TinaFormData | Record<string, unknown>) => Promise<void>;
  /** Custom form component */
  children?: React.ReactNode;
}

/**
 * Tina editor wrapper props interface
 */
export interface TinaEditorWrapperProps {
  /** Content file path */
  contentPath?: string;
  /** Initial data for the editor */
  initialData?: unknown;
  /** GraphQL query for loading data */
  query?: string;
  /** Variables for the GraphQL query */
  variables?: Record<string, unknown>;
  /** Save handler */
  onSave?: (data: TinaFormData) => Promise<void>;
  /** Publish handler */
  onPublish?: (data: TinaFormData) => Promise<void>;
  /** CSS class name */
  className?: string;
  /** Enable preview mode */
  enablePreview?: boolean;
  /** Auto-save interval in milliseconds */
  autoSaveInterval?: number;
}

/**
 * Tina config schema interface for tina/config.ts
 */
export interface TinaConfigSchema {
  /** Schema build configuration */
  build: {
    /** Output directory */
    outputFolder: string;
    /** Public folder */
    publicFolder: string;
  };
  /** Media configuration */
  media: {
    /** Tina media configuration */
    tina: {
      /** Media directory */
      mediaRoot: string;
      /** Public directory */
      publicFolder: string;
    };
  };
  /** Schema definition */
  schema: {
    /** Collections array */
    collections: TinaCollection[];
  };
}

/**
 * Tina collection interface
 */
export interface TinaCollection {
  /** Collection name */
  name: string;
  /** Collection label */
  label: string;
  /** File path pattern */
  path: string;
  /** File format */
  format?: 'md' | 'mdx' | 'json' | 'yaml';
  /** File matching configuration */
  match?: {
    include?: string;
    exclude?: string;
  };
  /** UI configuration */
  ui?: {
    /** Filename configuration */
    filename?: {
      readonly?: boolean;
      slugify?: (values: TinaBlogPost) => string;
    };
    /** Default values */
    defaultItem?: Partial<TinaBlogPost>;
  };
  /** Collection fields */
  fields: TinaField[];
}

/**
 * Tina field interface
 */
export interface TinaField {
  /** Field type */
  type: 'string' | 'number' | 'boolean' | 'datetime' | 'image' | 'rich-text' | 'reference' | 'object';
  /** Field name */
  name: string;
  /** Field label */
  label: string;
  /** Field description */
  description?: string;
  /** Required field flag */
  required?: boolean;
  /** List field flag */
  list?: boolean;
  /** UI configuration */
  ui?: {
    /** Component type */
    component?: string;
    /** Validation function */
    validate?: (value: unknown) => string | undefined;
    /** Parse function */
    parse?: (value: unknown) => unknown;
    /** Format function */
    format?: (value: unknown) => unknown;
  };
  /** Field options for select fields */
  options?: Array<{
    value: string;
    label: string;
  }>;
  /** Sub-fields for object type */
  fields?: TinaField[];
  /** Templates for rich-text */
  templates?: TinaTemplate[];
}

/**
 * Tina template interface for rich text
 */
export interface TinaTemplate {
  /** Template name */
  name: string;
  /** Template label */
  label: string;
  /** Template fields */
  fields: TinaField[];
}

/**
 * Type guard for TinaRichTextNode
 */
export function isTinaRichTextNode(node: unknown): node is TinaRichTextNode {
  return (
    typeof node === 'object' &&
    node !== null &&
    'type' in node &&
    typeof (node as TinaRichTextNode).type === 'string'
  );
}

/**
 * Type guard for TinaRichTextContent
 */
export function isTinaRichTextContent(content: unknown): content is TinaRichTextContent {
  return (
    typeof content === 'object' &&
    content !== null &&
    'type' in content &&
    (content as TinaRichTextContent).type === 'rich-text' &&
    'children' in content &&
    Array.isArray((content as TinaRichTextContent).children)
  );
}

/**
 * Type guard for TinaMarkdownContent
 */
export function isTinaMarkdownContent(content: unknown): content is TinaMarkdownContent {
  return (
    typeof content === 'object' &&
    content !== null &&
    'type' in content &&
    (content as TinaMarkdownContent).type === 'markdown' &&
    'content' in content &&
    typeof (content as TinaMarkdownContent).content === 'string'
  );
}

/**
 * Type guard for TinaBlogPost
 */
export function isTinaBlogPost(post: unknown): post is TinaBlogPost {
  return (
    typeof post === 'object' &&
    post !== null &&
    'id' in post &&
    'title' in post &&
    'date' in post &&
    'excerpt' in post &&
    'author' in post &&
    'category' in post &&
    typeof (post as TinaBlogPost).id === 'string' &&
    typeof (post as TinaBlogPost).title === 'string' &&
    typeof (post as TinaBlogPost).date === 'string' &&
    typeof (post as TinaBlogPost).excerpt === 'string' &&
    typeof (post as TinaBlogPost).author === 'string' &&
    typeof (post as TinaBlogPost).category === 'string'
  );
}

/**
 * Type guard for TinaClient
 */
export function isTinaClient(client: unknown): client is TinaClient {
  return (
    typeof client === 'object' &&
    client !== null &&
    'queries' in client &&
    typeof (client as TinaClient).queries === 'object' &&
    (client as TinaClient).queries !== null
  );
}

/**
 * Type guard for TinaAuthSession
 */
export function isTinaAuthSession(session: unknown): session is TinaAuthSession {
  return (
    typeof session === 'object' &&
    session !== null &&
    'token' in session &&
    'user' in session &&
    'expiresAt' in session &&
    typeof (session as TinaAuthSession).token === 'string' &&
    typeof (session as TinaAuthSession).expiresAt === 'number'
  );
}

/**
 * Validates if a category string is a valid BlogCategory
 */
export function isValidBlogCategory(category: string): category is BlogCategory {
  const validCategories: readonly string[] = [
    'coaching',
    'persoenlichkeitsentwicklung',
    'lifestyle',
    'business',
    'gesundheit',
    'mindset'
  ];
  return validCategories.includes(category);
}

/**
 * Validates if a status string is a valid BlogStatus
 */
export function isValidBlogStatus(status: string): status is BlogStatus {
  const validStatuses: readonly string[] = ['draft', 'published', 'archived'];
  return validStatuses.includes(status);
}

/**
 * Converts Tina SEO to BlogSEO format
 */
export function mapTinaSEOToBlogSEO(tinaSEO?: TinaSEO): BlogSEO | undefined {
  if (!tinaSEO) return undefined;

  return {
    metaTitle: tinaSEO.metaTitle,
    metaDescription: tinaSEO.metaDescription,
    canonicalUrl: tinaSEO.canonicalUrl,
    ogImage: tinaSEO.ogImage,
    ogTitle: tinaSEO.ogTitle,
    ogDescription: tinaSEO.ogDescription,
    twitterTitle: tinaSEO.twitterTitle,
    twitterDescription: tinaSEO.twitterDescription,
    twitterImage: tinaSEO.twitterImage,
    twitterCard: (tinaSEO.twitterCard === 'summary' || tinaSEO.twitterCard === 'summary_large_image') 
      ? tinaSEO.twitterCard 
      : undefined,
    keywords: tinaSEO.keywords,
    focusKeyphrase: tinaSEO.focusKeyphrase,
    robots: tinaSEO.robots,
  };
}

/**
 * Default Tina client configuration
 */
export const DEFAULT_TINA_CONFIG: TinaClientConfig = {
  enabled: import.meta.env.VITE_USE_TINA_CMS === 'true',
  clientId: import.meta.env.VITE_TINA_CLIENT_ID,
  branch: import.meta.env.VITE_GITHUB_BRANCH || 'main',
  connectionTimeout: 10000, // 10 seconds
  queryTimeout: 15000, // 15 seconds
  apiUrl: import.meta.env.VITE_TINA_API_URL,
  token: import.meta.env.VITE_GITHUB_TOKEN,
} as const;

/**
 * Error types for Tina operations
 */
export interface TinaError extends Error {
  /** Error code */
  code?: string;
  /** Additional error details */
  details?: Record<string, unknown>;
  /** Original error */
  originalError?: Error;
}

/**
 * Creates a TinaError with proper typing
 */
export function createTinaError(
  message: string,
  code?: string,
  details?: Record<string, unknown>,
  originalError?: Error
): TinaError {
  const error = new Error(message) as TinaError;
  error.code = code;
  error.details = details;
  error.originalError = originalError;
  return error;
}

/**
 * Type for Tina query executor function
 */
export type TinaQueryExecutor<T> = (client: TinaClient) => Promise<T>;

/**
 * Type for Tina mutation executor function
 */
export type TinaMutationExecutor<T> = (client: TinaClient) => Promise<T>;

/**
 * Tina media manager interface
 */
export interface TinaMediaManager {
  /** Upload a file */
  upload: (params: {
    file: File;
    directory: string;
    filename: string;
  }) => Promise<{ url: string }>;
}

/**
 * Tina search manager interface
 */
export interface TinaSearchManager {
  /** Search posts */
  posts: (query: {
    term: string;
    filters?: TinaBlogQueryParams;
    limit?: number;
  }) => Promise<{ results: TinaBlogPost[] }>;
}