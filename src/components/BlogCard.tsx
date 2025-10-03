import React from 'react';
import { Link } from 'react-router-dom';
import { BlogPostSummary, BLOG_CATEGORIES } from '../types/blog';
import { APP_CONFIG } from '../types';

interface BlogCardProps {
  post: BlogPostSummary;
}

const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  const categoryInfo = BLOG_CATEGORIES.find(cat => cat.category === post.category);
  const formattedDate = new Date(post.publishedAt).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const styles: Record<string, React.CSSProperties> = {
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: '1rem',
      overflow: 'hidden',
      boxShadow: '0 2px 20px rgba(0, 0, 0, 0.05)',
      border: `1px solid ${APP_CONFIG.colors.primary}10`,
      transition: 'all 0.3s ease',
      textDecoration: 'none',
      color: 'inherit',
      display: 'block',
      height: '100%',
    },
    cardHover: {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 30px rgba(0, 151, 178, 0.15)',
      borderColor: `${APP_CONFIG.colors.primary}30`,
    },
    imageContainer: {
      position: 'relative',
      width: '100%',
      height: '200px',
      overflow: 'hidden',
      backgroundColor: `${APP_CONFIG.colors.primary}05`,
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover' as const,
      transition: 'transform 0.3s ease',
    },
    imagePlaceholder: {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: `${APP_CONFIG.colors.primary}08`,
      color: APP_CONFIG.colors.secondary,
      fontSize: '2rem',
      fontFamily: "'Arimo', sans-serif",
    },
    categoryBadge: {
      position: 'absolute' as const,
      top: '1rem',
      left: '1rem',
      backgroundColor: categoryInfo?.color || APP_CONFIG.colors.primary,
      color: '#FFFFFF',
      padding: '0.5rem 1rem',
      borderRadius: '1rem',
      fontSize: '0.8rem',
      fontWeight: '600',
      fontFamily: "'Arimo', sans-serif",
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
    },
    featuredBadge: {
      position: 'absolute' as const,
      top: '1rem',
      right: '1rem',
      backgroundColor: APP_CONFIG.colors.accent,
      color: '#333',
      padding: '0.5rem 1rem',
      borderRadius: '1rem',
      fontSize: '0.8rem',
      fontWeight: '600',
      fontFamily: "'Arimo', sans-serif",
    },
    cardContent: {
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column' as const,
      height: 'calc(100% - 200px)',
    },
    title: {
      fontSize: 'clamp(1.1rem, 2.5vw, 1.3rem)',
      color: APP_CONFIG.colors.primary,
      fontWeight: '600',
      fontFamily: "'Sumana', serif",
      marginBottom: '0.75rem',
      lineHeight: '1.3',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    },
    excerpt: {
      color: APP_CONFIG.colors.secondary,
      fontSize: '0.95rem',
      lineHeight: '1.6',
      fontFamily: "'Arimo', sans-serif",
      marginBottom: '1rem',
      flex: 1,
      display: '-webkit-box',
      WebkitLineClamp: 3,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    },
    meta: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap' as const,
      gap: '0.5rem',
      marginTop: 'auto',
      paddingTop: '1rem',
      borderTop: `1px solid ${APP_CONFIG.colors.primary}10`,
    },
    authorDate: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.85rem',
      color: APP_CONFIG.colors.secondary,
      fontFamily: "'Arimo', sans-serif",
    },
    avatar: {
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      backgroundColor: APP_CONFIG.colors.accent,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.7rem',
      fontWeight: '600',
      color: '#333',
    },
    readingTime: {
      fontSize: '0.8rem',
      color: APP_CONFIG.colors.secondary,
      fontFamily: "'Arimo', sans-serif",
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
    },
    tags: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '0.5rem',
      marginTop: '0.75rem',
    },
    tag: {
      backgroundColor: `${APP_CONFIG.colors.primary}08`,
      color: APP_CONFIG.colors.primary,
      padding: '0.25rem 0.75rem',
      borderRadius: '1rem',
      fontSize: '0.75rem',
      fontFamily: "'Arimo', sans-serif",
      fontWeight: '500',
    },
  };

  const getAuthorInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Link
      to={`/blog/${post.slug}`}
      style={styles.card}
      onMouseEnter={(e) => {
        Object.assign(e.currentTarget.style, styles.cardHover);
        const img = e.currentTarget.querySelector('img');
        if (img) {
          img.style.transform = 'scale(1.05)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.05)';
        e.currentTarget.style.borderColor = `${APP_CONFIG.colors.primary}10`;
        const img = e.currentTarget.querySelector('img');
        if (img) {
          img.style.transform = 'scale(1)';
        }
      }}
    >
      <div style={styles.imageContainer}>
        {post.image ? (
          <img
            src={post.image}
            alt={post.imageAlt || post.title}
            style={styles.image}
          />
        ) : (
          <div style={styles.imagePlaceholder}>
            📝
          </div>
        )}
        
        <div style={styles.categoryBadge}>
          {categoryInfo?.displayName || post.category}
        </div>
        
        {post.featured && (
          <div style={styles.featuredBadge}>
            Empfohlen
          </div>
        )}
      </div>

      <div style={styles.cardContent}>
        <h3 style={styles.title}>{post.title}</h3>
        
        <p style={styles.excerpt}>{post.excerpt}</p>

        <div style={styles.meta}>
          <div style={styles.authorDate}>
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
            <span>•</span>
            <span>{formattedDate}</span>
          </div>

          {post.readingTime && (
            <div style={styles.readingTime}>
              🕒 {post.readingTime} Min. Lesezeit
            </div>
          )}
        </div>

        {post.tags.length > 0 && (
          <div style={styles.tags}>
            {post.tags.slice(0, 3).map((tag, index) => (
              <span key={index} style={styles.tag}>
                {tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span style={styles.tag}>+{post.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

export default BlogCard;