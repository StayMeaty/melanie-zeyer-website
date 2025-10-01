import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BlogPost, BlogPostSummary, BLOG_CATEGORIES } from '../types/blog';
import { APP_CONFIG } from '../types';
import BlogCard from '../components/BlogCard';

// Mock data for demonstration - in real implementation, this would come from a CMS or API
const mockPost: BlogPost = {
  id: '1',
  title: 'Die Kraft der Selbstreflexion: Wie Sie Ihre Potentiale entdecken',
  slug: 'kraft-der-selbstreflexion',
  excerpt: 'Selbstreflexion ist der Schlüssel zu persönlichem Wachstum. Entdecken Sie praktische Methoden, um Ihre Stärken zu erkennen und Ihr volles Potenzial zu entfalten.',
  category: 'persoenlichkeitsentwicklung',
  tags: ['Selbstreflexion', 'Potenziale', 'Persönlichkeit'],
  author: 'melanie',
  authorData: {
    id: 'melanie',
    name: 'Melanie Zeyer',
    email: 'melanie@melaniezeyer.de',
    bio: 'Melanie ist eine erfahrene Coach und Trainerin mit über 10 Jahren Erfahrung in der Persönlichkeitsentwicklung. Sie hilft Menschen dabei, ihre Potentiale zu entdecken und erfolgreich umzusetzen.',
    avatar: undefined,
    website: 'https://melaniezeyer.de',
    social: {
      instagram: 'melaniezeyer',
      linkedin: 'melaniezeyer',
    }
  },
  publishedAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
  readingTime: 8,
  featured: true,
  viewCount: 245,
  commentCount: 12,
  date: '2024-01-15',
  image: undefined,
  imageAlt: undefined,
  status: 'published',
  content: `
# Die Kraft der Selbstreflexion: Wie Sie Ihre Potentiale entdecken

Selbstreflexion ist eine der mächtigsten Werkzeuge für persönliches Wachstum und Entwicklung. In unserer schnelllebigen Zeit nehmen wir uns oft nicht die Zeit, innezuhalten und uns selbst zu betrachten. Dabei liegt genau hier der Schlüssel zu einem erfüllteren und erfolgreicheren Leben.

## Was ist Selbstreflexion?

Selbstreflexion bedeutet, bewusst über sich selbst nachzudenken – über die eigenen Gedanken, Gefühle, Verhaltensweisen und Erfahrungen. Es ist ein Prozess der Selbstbeobachtung und Selbstanalyse, der uns dabei hilft, uns selbst besser zu verstehen.

### Die Vorteile der Selbstreflexion

- **Selbstbewusstsein stärken**: Sie lernen Ihre Stärken und Schwächen besser kennen
- **Klarheit gewinnen**: Ihre Ziele und Werte werden deutlicher
- **Bessere Entscheidungen treffen**: Mit mehr Selbstkenntnis fällt es leichter, die richtigen Entscheidungen zu treffen
- **Persönliches Wachstum**: Sie können gezielt an sich arbeiten und sich weiterentwickeln

## Praktische Methoden für die Selbstreflexion

### 1. Das Tagebuch schreiben

Führen Sie regelmäßig ein Reflexionstagebuch. Notieren Sie sich täglich:
- Was ist heute gut gelaufen?
- Was könnte ich verbessern?
- Was habe ich über mich gelernt?
- Welche Emotionen habe ich erlebt?

### 2. Die 5-Warum-Technik

Wenn Sie vor einer Herausforderung stehen, fragen Sie sich fünfmal "Warum?", um zur Wurzel des Problems zu gelangen:
- Warum fühle ich mich gestresst?
- Warum habe ich zu viele Aufgaben?
- Warum kann ich nicht "Nein" sagen?
- Warum ist mir die Anerkennung anderer so wichtig?
- Warum fehlt mir Selbstvertrauen?

### 3. Feedback einholen

Bitten Sie vertrauensvolle Personen um ehrliches Feedback zu Ihrem Verhalten und Ihren Stärken. Oft sehen andere Dinge, die wir selbst nicht bemerken.

## Ihre Potentiale entdecken

Selbstreflexion hilft Ihnen dabei, Ihre verborgenen Potentiale zu entdecken:

### Erkenne deine Stärken

- In welchen Situationen fühlen Sie sich besonders kompetent?
- Was fällt Ihnen leicht, während andere damit kämpfen?
- Wofür erhalten Sie häufig Komplimente?

### Identifiziere deine Leidenschaften

- Was bereitet Ihnen echte Freude?
- Bei welchen Aktivitäten vergessen Sie die Zeit?
- Wovon träumen Sie?

### Verstehe deine Werte

- Was ist Ihnen wirklich wichtig im Leben?
- Welche Prinzipien leiten Ihre Entscheidungen?
- Wofür stehen Sie ein?

## Der Weg zu kontinuierlicher Entwicklung

Selbstreflexion ist kein einmaliger Prozess, sondern eine lebenslange Reise. Hier sind einige Tipps für den Alltag:

1. **Schaffen Sie sich regelmäßige Reflexionszeiten**: Planen Sie bewusst Zeit für Selbstreflexion ein
2. **Seien Sie ehrlich zu sich selbst**: Vermeiden Sie Selbsttäuschung und Beschönigung
3. **Praktizieren Sie Selbstmitgefühl**: Seien Sie nicht zu streng mit sich selbst
4. **Setzen Sie kleine Schritte um**: Große Veränderungen beginnen mit kleinen Schritten

## Fazit

Die Kraft der Selbstreflexion liegt in ihrer Fähigkeit, uns zu helfen, bewusster und authentischer zu leben. Wenn Sie beginnen, sich regelmäßig Zeit für Selbstreflexion zu nehmen, werden Sie feststellen, dass Sie nicht nur Ihre Potentiale besser erkennen, sondern auch mutiger werden, diese zu leben.

Denken Sie daran: Jeder Moment der Selbstreflexion ist ein Schritt in Richtung Ihres authentischen Selbst. Beginnen Sie heute – Ihr zukünftiges Ich wird es Ihnen danken.
  `,
  htmlContent: '',
};

const mockRelatedPosts: BlogPostSummary[] = [
  {
    id: '2',
    title: 'Work-Life-Balance: Mythos oder erreichbares Ziel?',
    slug: 'work-life-balance-mythos-oder-ziel',
    excerpt: 'In unserer schnelllebigen Welt scheint Work-Life-Balance unerreichbar. Doch mit den richtigen Strategien können Sie Beruf und Privatleben harmonisch verbinden.',
    category: 'lifestyle',
    tags: ['Work-Life-Balance', 'Stress', 'Zeitmanagement'],
    author: 'melanie',
    authorData: { name: 'Melanie Zeyer', avatar: undefined },
    publishedAt: new Date('2024-01-10'),
    readingTime: 6,
    featured: false,
  },
  {
    id: '3',
    title: 'Mindset-Training: Negative Gedankenmuster durchbrechen',
    slug: 'mindset-training-negative-gedankenmuster',
    excerpt: 'Erfahren Sie, wie Sie destruktive Denkmuster erkennen und durch positive, unterstützende Gedanken ersetzen können.',
    category: 'mindset',
    tags: ['Mindset', 'Gedanken', 'Training'],
    author: 'melanie',
    authorData: { name: 'Melanie Zeyer', avatar: undefined },
    publishedAt: new Date('2024-01-08'),
    readingTime: 10,
    featured: false,
  },
];

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      if (slug === 'kraft-der-selbstreflexion') {
        setPost(mockPost);
        setRelatedPosts(mockRelatedPosts);
      }
      setIsLoading(false);
    }, 500);
  }, [slug]);

  const styles: Record<string, React.CSSProperties> = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '2rem',
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px',
      fontSize: '1.2rem',
      color: APP_CONFIG.colors.secondary,
      fontFamily: "'Arimo', sans-serif",
    },
    breadcrumb: {
      marginBottom: '2rem',
      fontSize: '0.9rem',
      color: APP_CONFIG.colors.secondary,
      fontFamily: "'Arimo', sans-serif",
    },
    breadcrumbLink: {
      color: APP_CONFIG.colors.primary,
      textDecoration: 'none',
      transition: 'color 0.3s ease',
    },
    header: {
      marginBottom: '3rem',
      paddingBottom: '2rem',
      borderBottom: `1px solid ${APP_CONFIG.colors.primary}10`,
    },
    category: {
      display: 'inline-block',
      backgroundColor: APP_CONFIG.colors.primary,
      color: '#FFFFFF',
      padding: '0.5rem 1rem',
      borderRadius: '1rem',
      fontSize: '0.8rem',
      fontWeight: '600',
      fontFamily: "'Arimo', sans-serif",
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
      marginBottom: '1rem',
    },
    title: {
      fontSize: 'clamp(2rem, 5vw, 3rem)',
      color: APP_CONFIG.colors.primary,
      fontWeight: '700',
      fontFamily: "'Sumana', serif",
      marginBottom: '1rem',
      lineHeight: '1.2',
    },
    excerpt: {
      fontSize: '1.2rem',
      color: APP_CONFIG.colors.secondary,
      fontFamily: "'Arimo', sans-serif",
      lineHeight: '1.6',
      marginBottom: '2rem',
      fontStyle: 'italic',
    },
    meta: {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap' as const,
      gap: '1rem',
      marginBottom: '1.5rem',
      fontSize: '0.9rem',
      color: APP_CONFIG.colors.secondary,
      fontFamily: "'Arimo', sans-serif",
    },
    author: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    avatar: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      backgroundColor: APP_CONFIG.colors.accent,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.8rem',
      fontWeight: '600',
      color: '#333',
    },
    tags: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '0.5rem',
      marginBottom: '2rem',
    },
    tag: {
      backgroundColor: `${APP_CONFIG.colors.primary}08`,
      color: APP_CONFIG.colors.primary,
      padding: '0.5rem 1rem',
      borderRadius: '1rem',
      fontSize: '0.8rem',
      fontFamily: "'Arimo', sans-serif",
      fontWeight: '500',
      textDecoration: 'none',
      transition: 'all 0.3s ease',
    },
    tagHover: {
      backgroundColor: `${APP_CONFIG.colors.primary}15`,
    },
    featuredImage: {
      width: '100%',
      height: '400px',
      objectFit: 'cover' as const,
      borderRadius: '1rem',
      marginBottom: '3rem',
    },
    content: {
      lineHeight: '1.8',
      fontSize: '1.1rem',
      color: '#333',
      fontFamily: "'Arimo', sans-serif",
      marginBottom: '4rem',
    },
    authorSection: {
      backgroundColor: `${APP_CONFIG.colors.primary}05`,
      borderRadius: '1rem',
      padding: '2rem',
      marginBottom: '4rem',
      border: `1px solid ${APP_CONFIG.colors.primary}10`,
    },
    authorSectionTitle: {
      fontSize: '1.4rem',
      color: APP_CONFIG.colors.primary,
      fontWeight: '600',
      fontFamily: "'Sumana', serif",
      marginBottom: '1rem',
    },
    authorInfo: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'flex-start',
    },
    authorDetails: {
      flex: 1,
    },
    authorName: {
      fontSize: '1.2rem',
      fontWeight: '600',
      color: APP_CONFIG.colors.primary,
      fontFamily: "'Sumana', serif",
      marginBottom: '0.5rem',
    },
    authorBio: {
      color: APP_CONFIG.colors.secondary,
      lineHeight: '1.6',
      marginBottom: '1rem',
    },
    authorLinks: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
    },
    authorLink: {
      color: APP_CONFIG.colors.primary,
      textDecoration: 'none',
      fontSize: '0.9rem',
      fontWeight: '500',
      transition: 'color 0.3s ease',
    },
    shareSection: {
      backgroundColor: '#FFFFFF',
      borderRadius: '1rem',
      padding: '2rem',
      marginBottom: '4rem',
      boxShadow: '0 2px 20px rgba(0, 0, 0, 0.05)',
      border: `1px solid ${APP_CONFIG.colors.primary}10`,
      textAlign: 'center',
    },
    shareTitle: {
      fontSize: '1.2rem',
      color: APP_CONFIG.colors.primary,
      fontWeight: '600',
      fontFamily: "'Sumana', serif",
      marginBottom: '1rem',
    },
    shareButtons: {
      display: 'flex',
      justifyContent: 'center',
      gap: '1rem',
      flexWrap: 'wrap' as const,
    },
    shareButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1.5rem',
      borderRadius: '2rem',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontFamily: "'Arimo', sans-serif",
      fontWeight: '600',
      textDecoration: 'none',
      transition: 'all 0.3s ease',
    },
    relatedSection: {
      marginBottom: '4rem',
    },
    relatedTitle: {
      fontSize: '2rem',
      color: APP_CONFIG.colors.primary,
      fontWeight: '600',
      fontFamily: "'Sumana', serif",
      textAlign: 'center',
      marginBottom: '2rem',
    },
    relatedGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2rem',
    },
    backLink: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: APP_CONFIG.colors.primary,
      textDecoration: 'none',
      fontSize: '1rem',
      fontWeight: '600',
      fontFamily: "'Arimo', sans-serif",
      marginTop: '2rem',
      transition: 'color 0.3s ease',
    },
  };

  const getAuthorInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleShare = (platform: string) => {
    if (!post) return;
    
    const url = window.location.href;
    const title = post.title;
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        alert('Link kopiert!');
        break;
    }
  };

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        Artikel wird geladen...
      </div>
    );
  }

  if (!post) {
    return (
      <div style={styles.container}>
        <h1>Artikel nicht gefunden</h1>
        <p>Der angeforderte Artikel konnte nicht gefunden werden.</p>
        <Link to="/blog" style={styles.backLink}>
          ← Zurück zum Blog
        </Link>
      </div>
    );
  }

  const categoryInfo = BLOG_CATEGORIES.find(cat => cat.category === post.category);

  return (
    <div style={styles.container}>
      <nav style={styles.breadcrumb}>
        <Link to="/blog" style={styles.breadcrumbLink}>Blog</Link>
        {' > '}
        <Link to={`/blog?category=${post.category}`} style={styles.breadcrumbLink}>
          {categoryInfo?.displayName}
        </Link>
        {' > '}
        <span>{post.title}</span>
      </nav>

      <article>
        <header style={styles.header}>
          <div style={styles.category}>
            {categoryInfo?.displayName || post.category}
          </div>
          
          <h1 style={styles.title}>{post.title}</h1>
          
          <p style={styles.excerpt}>{post.excerpt}</p>
          
          <div style={styles.meta}>
            <div style={styles.author}>
              {post.authorData?.avatar ? (
                <img
                  src={post.authorData.avatar}
                  alt={post.authorData.name}
                  style={styles.avatar}
                />
              ) : (
                <div style={styles.avatar}>
                  {getAuthorInitials(post.authorData?.name || post.author)}
                </div>
              )}
              <span>{post.authorData?.name || post.author}</span>
            </div>
            <span>•</span>
            <span>{formatDate(post.publishedAt)}</span>
            {post.readingTime && (
              <>
                <span>•</span>
                <span>{post.readingTime} Min. Lesezeit</span>
              </>
            )}
            {post.viewCount && (
              <>
                <span>•</span>
                <span>{post.viewCount} Aufrufe</span>
              </>
            )}
          </div>
          
          {post.tags.length > 0 && (
            <div style={styles.tags}>
              {post.tags.map((tag, index) => (
                <Link
                  key={index}
                  to={`/blog?search=${encodeURIComponent(tag)}`}
                  style={styles.tag}
                  onMouseEnter={(e) => {
                    Object.assign(e.currentTarget.style, styles.tagHover);
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = `${APP_CONFIG.colors.primary}08`;
                  }}
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </header>

        {post.image && (
          <img
            src={post.image}
            alt={post.imageAlt || post.title}
            style={styles.featuredImage}
          />
        )}

        <div 
          style={styles.content}
          dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br>') }}
        />
      </article>

      {post.authorData && (
        <section style={styles.authorSection}>
          <h3 style={styles.authorSectionTitle}>Über die Autorin</h3>
          <div style={styles.authorInfo}>
            {post.authorData.avatar ? (
              <img
                src={post.authorData.avatar}
                alt={post.authorData.name}
                style={{ ...styles.avatar, width: '64px', height: '64px', fontSize: '1.2rem' }}
              />
            ) : (
              <div style={{ ...styles.avatar, width: '64px', height: '64px', fontSize: '1.2rem' }}>
                {getAuthorInitials(post.authorData.name)}
              </div>
            )}
            <div style={styles.authorDetails}>
              <h4 style={styles.authorName}>{post.authorData.name}</h4>
              {post.authorData.bio && (
                <p style={styles.authorBio}>{post.authorData.bio}</p>
              )}
              <div style={styles.authorLinks}>
                {post.authorData.website && (
                  <a
                    href={post.authorData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.authorLink}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = APP_CONFIG.colors.accent;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = APP_CONFIG.colors.primary;
                    }}
                  >
                    Website besuchen
                  </a>
                )}
                {post.authorData.social?.instagram && (
                  <a
                    href={`https://instagram.com/${post.authorData.social.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.authorLink}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = APP_CONFIG.colors.accent;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = APP_CONFIG.colors.primary;
                    }}
                  >
                    Instagram
                  </a>
                )}
                {post.authorData.social?.linkedin && (
                  <a
                    href={`https://linkedin.com/in/${post.authorData.social.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.authorLink}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = APP_CONFIG.colors.accent;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = APP_CONFIG.colors.primary;
                    }}
                  >
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      <section style={styles.shareSection}>
        <h3 style={styles.shareTitle}>Artikel teilen</h3>
        <div style={styles.shareButtons}>
          <button
            style={{
              ...styles.shareButton,
              backgroundColor: '#1DA1F2',
              color: '#FFFFFF',
            }}
            onClick={() => handleShare('twitter')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            📱 Twitter
          </button>
          <button
            style={{
              ...styles.shareButton,
              backgroundColor: '#4267B2',
              color: '#FFFFFF',
            }}
            onClick={() => handleShare('facebook')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            📘 Facebook
          </button>
          <button
            style={{
              ...styles.shareButton,
              backgroundColor: '#0077B5',
              color: '#FFFFFF',
            }}
            onClick={() => handleShare('linkedin')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            💼 LinkedIn
          </button>
          <button
            style={{
              ...styles.shareButton,
              backgroundColor: APP_CONFIG.colors.accent,
              color: '#333',
            }}
            onClick={() => handleShare('copy')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            🔗 Link kopieren
          </button>
        </div>
      </section>

      {relatedPosts.length > 0 && (
        <section style={styles.relatedSection}>
          <h3 style={styles.relatedTitle}>Ähnliche Artikel</h3>
          <div style={styles.relatedGrid}>
            {relatedPosts.map(relatedPost => (
              <BlogCard key={relatedPost.id} post={relatedPost} />
            ))}
          </div>
        </section>
      )}

      <Link to="/blog" style={styles.backLink}>
        ← Zurück zum Blog
      </Link>
    </div>
  );
};

export default BlogPostPage;