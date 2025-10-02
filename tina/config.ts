import { defineConfig } from "tinacms";
import { TinaBlogPost } from "../src/types/tina";

// Blog categories matching BlogCategory type from src/types/blog.ts
const BLOG_CATEGORIES = [
  { value: "coaching", label: "Coaching" },
  { value: "persoenlichkeitsentwicklung", label: "Persönlichkeitsentwicklung" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "business", label: "Business" },
  { value: "gesundheit", label: "Gesundheit" },
  { value: "mindset", label: "Mindset" },
] as const;

// Blog status options matching BlogStatus type
const BLOG_STATUS_OPTIONS = [
  { value: "draft", label: "Entwurf" },
  { value: "published", label: "Veröffentlicht" },
  { value: "archived", label: "Archiviert" },
] as const;

// Twitter card type options
const TWITTER_CARD_OPTIONS = [
  { value: "summary", label: "Summary" },
  { value: "summary_large_image", label: "Summary Large Image" },
] as const;

// Determine backend configuration based on environment
const getBackendConfig = () => {
  const isLocalDevelopment = process.env.NODE_ENV === 'development' && !process.env.VITE_GITHUB_TOKEN;
  
  if (isLocalDevelopment) {
    // Use filesystem for local development without GitHub token
    return {
      type: "filesystem" as const,
    };
  }
  
  // Use GitHub backend for production or when token is available
  const repo = process.env.VITE_GITHUB_REPO || "";
  const token = process.env.VITE_GITHUB_TOKEN || "";
  const branch = process.env.VITE_GITHUB_BRANCH || "main";
  
  if (!repo || !token) {
    console.warn('Tina: Missing repository or token configuration for GitHub backend');
    // Fallback to filesystem if GitHub config is incomplete
    return {
      type: "filesystem" as const,
    };
  }
  
  return {
    type: "github" as const,
    branch,
    repo,
    token,
    auth: {
      useLocalAuth: process.env.NODE_ENV === 'development',
    },
  };
};

export default defineConfig({
  // Client ID for Tina Cloud (future enhancement)
  clientId: process.env.VITE_TINA_CLIENT_ID || null,
  
  // Token for authentication
  token: process.env.VITE_GITHUB_TOKEN || null,
  
  // Backend configuration (filesystem for local, GitHub for production)
  backend: getBackendConfig(),
  
  // TypeScript generation configuration
  codegenOptions: {
    addTypename: true,
    strictMode: true,
    noImplicitAny: true,
    skipCodegen: false,
    outputDir: 'tina/__generated__',
    gqlTypesFile: 'types.ts',
  },
  
  // Media configuration
  media: (() => {
    const isLocalDevelopment = process.env.NODE_ENV === 'development' && !process.env.VITE_GITHUB_TOKEN;
    
    if (isLocalDevelopment) {
      // Local development - use local filesystem
      return {
        tina: {
          mediaRoot: "public/content/blog/images",
          publicFolder: "public",
          static: true,
        },
      };
    }
    
    // Production or development with GitHub token - use GitHub for media storage
    return {
      tina: {
        mediaRoot: "content/blog/images",
        publicFolder: "public",
        static: false,
      },
    };
  })(),

  // Build configuration
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },

  // Schema configuration matching TypeScript interfaces exactly
  schema: {
    collections: [
      {
        name: "blog",
        label: "Blog Beiträge",
        path: "public/content/blog",
        format: "md",
        match: {
          include: "**/*",
          exclude: "images/**/*",
        },
        ui: {
          filename: {
            readonly: false,
            slugify: (values: Partial<TinaBlogPost>) => {
              const date = new Date(values.date || new Date()).toISOString().split('T')[0];
              const slug = values.slug || values.title?.toLowerCase()
                .replace(/ä/g, 'ae')
                .replace(/ö/g, 'oe')
                .replace(/ü/g, 'ue')
                .replace(/ß/g, 'ss')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
              return `${date}-${slug}`;
            },
          },
        },
        defaultItem: () => ({
          title: 'Neuer Blog Beitrag',
          slug: '',
          date: new Date().toISOString(),
          excerpt: '',
          author: 'melanie',
          category: 'coaching',
          tags: [],
          status: 'draft',
          featured: false,
          seo: {
            metaTitle: '',
            metaDescription: '',
            keywords: [],
            twitterCard: 'summary_large_image',
          }
        }),
        fields: [
          // Basic Post Information
          {
            type: "string",
            name: "title",
            label: "Titel",
            description: "Der Haupttitel des Blog-Beitrags",
            isTitle: true,
            required: true,
            ui: {
              validate: (value) => {
                if (!value || value.length < 5) {
                  return "Titel muss mindestens 5 Zeichen lang sein";
                }
                if (value.length > 100) {
                  return "Titel darf maximal 100 Zeichen lang sein";
                }
              }
            }
          },
          {
            type: "string",
            name: "slug",
            label: "URL-Slug",
            description: "URL-freundlicher Bezeichner für den Beitrag (wird automatisch generiert)",
            required: true,
            ui: {
              validate: (value) => {
                if (!value) return "Slug ist erforderlich";
                if (!/^[a-z0-9-]+$/.test(value)) {
                  return "Slug darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten";
                }
              }
            }
          },
          {
            type: "datetime",
            name: "date",
            label: "Veröffentlichungsdatum",
            description: "Datum und Uhrzeit der Veröffentlichung",
            required: true,
            ui: {
              dateFormat: "DD.MM.YYYY",
              timeFormat: "HH:mm",
            }
          },
          {
            type: "string",
            name: "excerpt",
            label: "Kurzbeschreibung",
            description: "Kurze Zusammenfassung des Beitrags für Vorschau und SEO (150-300 Zeichen empfohlen)",
            required: true,
            ui: {
              component: "textarea",
              validate: (value) => {
                if (!value || value.length < 50) {
                  return "Kurzbeschreibung muss mindestens 50 Zeichen lang sein";
                }
                if (value.length > 300) {
                  return "Kurzbeschreibung sollte maximal 300 Zeichen lang sein";
                }
              }
            }
          },
          {
            type: "string",
            name: "author",
            label: "Autor",
            description: "Autor-ID für diesen Beitrag",
            options: [
              { value: "melanie", label: "Melanie Zeyer" }
            ],
            required: true,
          },
          {
            type: "string",
            name: "category",
            label: "Kategorie",
            description: "Hauptkategorie für diesen Beitrag",
            options: BLOG_CATEGORIES,
            required: true,
          },
          {
            type: "string",
            name: "tags",
            label: "Tags",
            description: "Schlagwörter zur detaillierten Kategorisierung (drücken Sie Enter nach jedem Tag)",
            list: true,
            ui: {
              component: "tags",
            }
          },
          
          // Media Fields
          {
            type: "image",
            name: "image",
            label: "Hauptbild",
            description: "Titelbild für den Beitrag (empfohlen: 1200x630px für optimale Social Media Darstellung)",
          },
          {
            type: "string",
            name: "imageAlt",
            label: "Bildbeschreibung",
            description: "Alternative Beschreibung für das Hauptbild (wichtig für Barrierefreiheit)",
            ui: {
              validate: (value, allValues) => {
                if (allValues.image && !value) {
                  return "Bildbeschreibung ist erforderlich wenn ein Bild ausgewählt ist";
                }
              }
            }
          },
          
          // Publication Settings
          {
            type: "string",
            name: "status",
            label: "Status",
            description: "Veröffentlichungsstatus des Beitrags",
            options: BLOG_STATUS_OPTIONS,
            required: true,
          },
          {
            type: "boolean",
            name: "featured",
            label: "Hervorgehoben",
            description: "Als featured Post markieren (wird prominent angezeigt)",
          },
          
          // SEO Configuration
          {
            type: "object",
            name: "seo",
            label: "SEO Einstellungen",
            description: "Suchmaschinenoptimierung und Social Media Einstellungen",
            ui: {
              visualSelector: true,
            },
            fields: [
              {
                type: "string",
                name: "metaTitle",
                label: "Meta Titel",
                description: "SEO-Titel für Suchmaschinen (max. 60 Zeichen empfohlen)",
                ui: {
                  validate: (value) => {
                    if (value && value.length > 60) {
                      return "Meta Titel sollte maximal 60 Zeichen lang sein";
                    }
                  }
                }
              },
              {
                type: "string",
                name: "metaDescription",
                label: "Meta Beschreibung",
                description: "SEO-Beschreibung für Suchmaschinen (max. 160 Zeichen empfohlen)",
                ui: {
                  component: "textarea",
                  validate: (value) => {
                    if (value && value.length > 160) {
                      return "Meta Beschreibung sollte maximal 160 Zeichen lang sein";
                    }
                  }
                },
              },
              {
                type: "string",
                name: "canonicalUrl",
                label: "Canonical URL",
                description: "Kanonische URL für Duplicate Content Vermeidung",
              },
              {
                type: "image",
                name: "ogImage",
                label: "Open Graph Bild",
                description: "Spezielles Bild für Social Media Sharing (1200x630px empfohlen)",
              },
              {
                type: "string",
                name: "ogTitle",
                label: "Open Graph Titel",
                description: "Titel für Social Media Sharing (falls abweichend vom Meta Titel)",
              },
              {
                type: "string",
                name: "ogDescription",
                label: "Open Graph Beschreibung",
                description: "Beschreibung für Social Media Sharing",
                ui: {
                  component: "textarea",
                },
              },
              {
                type: "string",
                name: "twitterTitle",
                label: "Twitter Titel",
                description: "Spezieller Titel für Twitter Cards",
              },
              {
                type: "string",
                name: "twitterDescription",
                label: "Twitter Beschreibung",
                description: "Beschreibung für Twitter Cards",
                ui: {
                  component: "textarea",
                },
              },
              {
                type: "image",
                name: "twitterImage",
                label: "Twitter Bild",
                description: "Spezielles Bild für Twitter Cards",
              },
              {
                type: "string",
                name: "twitterCard",
                label: "Twitter Card Typ",
                description: "Art der Twitter Card Darstellung",
                options: TWITTER_CARD_OPTIONS,
              },
              {
                type: "string",
                name: "keywords",
                label: "Keywords",
                description: "SEO-Keywords für diesen Beitrag",
                list: true,
                ui: {
                  component: "tags",
                }
              },
              {
                type: "string",
                name: "focusKeyphrase",
                label: "Focus Keyphrase",
                description: "Haupt-Keyword für Content-Optimierung",
              },
              {
                type: "string",
                name: "robots",
                label: "Robots Meta Tag",
                description: "Anweisungen für Suchmaschinen-Crawler (z.B. 'noindex, nofollow')",
              },
            ],
          },
          
          // Metadata Fields
          {
            type: "number",
            name: "readingTime",
            label: "Lesezeit (Minuten)",
            description: "Geschätzte Lesezeit in Minuten (wird automatisch berechnet wenn leer)",
            ui: {
              validate: (value) => {
                if (value && (value < 1 || value > 60)) {
                  return "Lesezeit muss zwischen 1 und 60 Minuten liegen";
                }
              }
            }
          },
          {
            type: "datetime",
            name: "lastModified",
            label: "Zuletzt geändert",
            description: "Zeitpunkt der letzten Änderung (wird automatisch gesetzt)",
            ui: {
              dateFormat: "DD.MM.YYYY",
              timeFormat: "HH:mm",
            }
          },
          
          // Content Field
          {
            type: "rich-text",
            name: "body",
            label: "Inhalt",
            description: "Der Hauptinhalt des Blog-Beitrags",
            isBody: true,
            templates: [
              {
                name: "Quote",
                label: "Zitat",
                fields: [
                  {
                    type: "string",
                    name: "text",
                    label: "Zitat Text",
                    ui: { component: "textarea" }
                  },
                  {
                    type: "string",
                    name: "author",
                    label: "Autor des Zitats"
                  }
                ]
              },
              {
                name: "CallToAction",
                label: "Call-to-Action",
                fields: [
                  {
                    type: "string",
                    name: "text",
                    label: "CTA Text"
                  },
                  {
                    type: "string",
                    name: "link",
                    label: "Link URL"
                  },
                  {
                    type: "string",
                    name: "style",
                    label: "Style",
                    options: ["primary", "secondary", "outline"]
                  }
                ]
              }
            ]
          },
        ],
      },
      
      // Authors Collection
      {
        name: "authors",
        label: "Autoren",
        path: "public/content/authors",
        format: "json",
        ui: {
          filename: {
            readonly: false,
            slugify: (values) => values.id || values.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          },
        },
        defaultItem: () => ({
          name: '',
          email: '',
          bio: '',
          social: {
            instagram: '',
            linkedin: '',
            twitter: '',
          }
        }),
        fields: [
          {
            type: "string",
            name: "name",
            label: "Name",
            description: "Vollständiger Name des Autors",
            required: true,
          },
          {
            type: "string",
            name: "email",
            label: "E-Mail",
            description: "E-Mail-Adresse des Autors",
            required: true,
            ui: {
              validate: (value) => {
                if (!value) return "E-Mail ist erforderlich";
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                  return "Bitte geben Sie eine gültige E-Mail-Adresse ein";
                }
              }
            }
          },
          {
            type: "string",
            name: "bio",
            label: "Biografie",
            description: "Kurze Beschreibung des Autors",
            ui: {
              component: "textarea",
            },
          },
          {
            type: "image",
            name: "avatar",
            label: "Profilbild",
            description: "Profilbild des Autors (empfohlen: quadratisch, mindestens 200x200px)",
          },
          {
            type: "string",
            name: "website",
            label: "Website",
            description: "Persönliche Website des Autors",
            ui: {
              validate: (value) => {
                if (value && !value.match(/^https?:\/\/.+/)) {
                  return "Website URL muss mit http:// oder https:// beginnen";
                }
              }
            }
          },
          {
            type: "object",
            name: "social",
            label: "Social Media",
            description: "Links zu Social Media Profilen",
            fields: [
              {
                type: "string",
                name: "instagram",
                label: "Instagram",
                description: "Instagram Benutzername oder URL",
              },
              {
                type: "string",
                name: "linkedin",
                label: "LinkedIn",
                description: "LinkedIn Profil URL",
              },
              {
                type: "string",
                name: "twitter",
                label: "Twitter",
                description: "Twitter Handle oder URL",
              },
            ],
          },
        ],
      },
    ],
  },
});