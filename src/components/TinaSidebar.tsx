/**
 * Tina CMS Sidebar Component
 * Provides content tree navigation, search functionality, new post creation, and draft/published filter
 */

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BlogPostSummary, BlogStatus, BLOG_CATEGORIES } from '../types/blog';
import { APP_COLORS } from '../types';

interface TinaSidebarProps {
  posts?: BlogPostSummary[];
  selectedPostId?: string;
  onPostSelect?: (postId: string) => void;
  onNewPost?: () => void;
  onDeletePost?: (postId: string) => void;
  isLoading?: boolean;
  className?: string;
}

interface FilterOptions {
  status: BlogStatus | 'all';
  category: string;
  searchTerm: string;
}

const TinaSidebar: React.FC<TinaSidebarProps> = ({
  posts = [],
  selectedPostId,
  onPostSelect,
  onNewPost,
  // onDeletePost,
  isLoading = false,
  className = '',
}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    category: 'all',
    searchTerm: '',
  });

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['all']));
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  // Filter and group posts
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // Status filter
      if (filters.status !== 'all' && post.status !== filters.status) {
        return false;
      }

      // Category filter
      if (filters.category !== 'all' && post.category !== filters.category) {
        return false;
      }

      // Search filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        return (
          post.title.toLowerCase().includes(searchLower) ||
          post.excerpt.toLowerCase().includes(searchLower) ||
          post.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      return true;
    });
  }, [posts, filters]);

  // Group posts by category
  const groupedPosts = useMemo(() => {
    const groups: Record<string, BlogPostSummary[]> = {};
    
    filteredPosts.forEach(post => {
      if (!groups[post.category]) {
        groups[post.category] = [];
      }
      groups[post.category].push(post);
    });

    // Sort posts within each category by date (newest first)
    Object.keys(groups).forEach(category => {
      groups[category].sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
    });

    return groups;
  }, [filteredPosts]);

  const handleCategoryToggle = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const handleNewPost = async () => {
    setIsCreatingPost(true);
    try {
      if (onNewPost) {
        await onNewPost();
      }
    } catch (error) {
      console.error('Error creating new post:', error);
    } finally {
      setIsCreatingPost(false);
    }
  };

  const getCategoryDisplayName = (categoryKey: string) => {
    const category = BLOG_CATEGORIES.find(cat => cat.category === categoryKey);
    return category?.displayName || categoryKey;
  };

  const getCategoryIcon = (categoryKey: string) => {
    const category = BLOG_CATEGORIES.find(cat => cat.category === categoryKey);
    return category?.icon || '📝';
  };

  const getStatusIcon = (status: BlogStatus) => {
    switch (status) {
      case 'published': return '✅';
      case 'draft': return '📝';
      case 'archived': return '📦';
      default: return '❓';
    }
  };

  const styles: Record<string, React.CSSProperties> = {
    sidebar: {
      width: '100%',
      height: '100%',
      backgroundColor: 'white',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid #e5e7eb',
    },
    header: {
      padding: '1rem',
      borderBottom: '1px solid #e5e7eb',
      backgroundColor: '#f8f9fa',
    },
    title: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '1rem',
    },
    newPostButton: {
      width: '100%',
      padding: '0.75rem',
      backgroundColor: APP_COLORS.primary,
      color: 'white',
      border: 'none',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
    },
    newPostButtonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
    filters: {
      padding: '1rem',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    },
    filterGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    filterLabel: {
      fontSize: '0.75rem',
      fontWeight: '600',
      color: '#6b7280',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    searchInput: {
      width: '100%',
      padding: '0.5rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      outline: 'none',
      transition: 'border-color 0.2s',
    },
    select: {
      width: '100%',
      padding: '0.5rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      backgroundColor: 'white',
      outline: 'none',
    },
    content: {
      flex: 1,
      overflow: 'auto',
      padding: '0.5rem',
    },
    categoryGroup: {
      marginBottom: '1rem',
    },
    categoryHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.5rem',
      cursor: 'pointer',
      borderRadius: '0.375rem',
      transition: 'background-color 0.2s',
    },
    categoryHeaderHover: {
      backgroundColor: '#f3f4f6',
    },
    categoryInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    categoryName: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
    },
    categoryCount: {
      fontSize: '0.75rem',
      color: '#6b7280',
      backgroundColor: '#f3f4f6',
      padding: '0.125rem 0.375rem',
      borderRadius: '0.75rem',
    },
    categoryToggle: {
      fontSize: '0.75rem',
      color: '#9ca3af',
      transition: 'transform 0.2s',
    },
    categoryToggleExpanded: {
      transform: 'rotate(90deg)',
    },
    postList: {
      marginLeft: '1.5rem',
      marginTop: '0.5rem',
    },
    postItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.5rem',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
      marginBottom: '0.25rem',
      textDecoration: 'none',
      color: 'inherit',
    },
    postItemHover: {
      backgroundColor: '#f3f4f6',
    },
    postItemSelected: {
      backgroundColor: APP_COLORS.primary + '20',
      borderLeft: `3px solid ${APP_COLORS.primary}`,
    },
    postStatus: {
      fontSize: '0.75rem',
      flexShrink: 0,
    },
    postInfo: {
      flex: 1,
      minWidth: 0,
    },
    postTitle: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '0.25rem',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    postMeta: {
      fontSize: '0.75rem',
      color: '#6b7280',
    },
    emptyState: {
      textAlign: 'center',
      padding: '2rem 1rem',
      color: '#6b7280',
    },
    loadingState: {
      textAlign: 'center',
      padding: '2rem 1rem',
      color: '#6b7280',
    },
    spinner: {
      width: '1.5rem',
      height: '1.5rem',
      border: '2px solid #e5e7eb',
      borderTopColor: APP_COLORS.primary,
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
      margin: '0 auto 0.5rem',
    },
  };

  return (
    <div className={className} style={styles.sidebar}>
      {/* Header */}
      <div style={styles.header}>
        <h3 style={styles.title}>Inhalte</h3>
        <button
          onClick={handleNewPost}
          disabled={isCreatingPost}
          style={{
            ...styles.newPostButton,
            ...(isCreatingPost ? styles.newPostButtonDisabled : {}),
          }}
          onMouseEnter={(e) => {
            if (!isCreatingPost) {
              e.currentTarget.style.backgroundColor = '#007A96';
            }
          }}
          onMouseLeave={(e) => {
            if (!isCreatingPost) {
              e.currentTarget.style.backgroundColor = APP_COLORS.primary;
            }
          }}
        >
          {isCreatingPost ? (
            <>
              <div style={styles.spinner} />
              Erstelle...
            </>
          ) : (
            <>
              ➕ Neuer Beitrag
            </>
          )}
        </button>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        {/* Search */}
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Suchen</label>
          <input
            type="text"
            placeholder="Titel, Inhalt oder Tags..."
            value={filters.searchTerm}
            onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
            style={styles.searchInput}
            onFocus={(e) => {
              e.target.style.borderColor = APP_COLORS.primary;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d1d5db';
            }}
          />
        </div>

        {/* Status Filter */}
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as BlogStatus | 'all' }))}
            style={styles.select}
          >
            <option value="all">Alle Status</option>
            <option value="published">Veröffentlicht</option>
            <option value="draft">Entwürfe</option>
            <option value="archived">Archiviert</option>
          </select>
        </div>

        {/* Category Filter */}
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Kategorie</label>
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            style={styles.select}
          >
            <option value="all">Alle Kategorien</option>
            {BLOG_CATEGORIES.map(category => (
              <option key={category.category} value={category.category}>
                {category.displayName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {isLoading ? (
          <div style={styles.loadingState}>
            <div style={styles.spinner} />
            <p>Lade Beiträge...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div style={styles.emptyState}>
            <p>Keine Beiträge gefunden</p>
            {filters.searchTerm || filters.status !== 'all' || filters.category !== 'all' ? (
              <button
                onClick={() => setFilters({ status: 'all', category: 'all', searchTerm: '' })}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: APP_COLORS.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  marginTop: '1rem',
                }}
              >
                Filter zurücksetzen
              </button>
            ) : null}
          </div>
        ) : (
          Object.entries(groupedPosts).map(([category, categoryPosts]) => (
            <div key={category} style={styles.categoryGroup}>
              {/* Category Header */}
              <div
                style={styles.categoryHeader}
                onClick={() => handleCategoryToggle(category)}
                onMouseEnter={(e) => {
                  Object.assign(e.currentTarget.style, styles.categoryHeaderHover);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={styles.categoryInfo}>
                  <span>{getCategoryIcon(category)}</span>
                  <span style={styles.categoryName}>{getCategoryDisplayName(category)}</span>
                  <span style={styles.categoryCount}>{categoryPosts.length}</span>
                </div>
                <span
                  style={{
                    ...styles.categoryToggle,
                    ...(expandedCategories.has(category) ? styles.categoryToggleExpanded : {}),
                  }}
                >
                  ▶
                </span>
              </div>

              {/* Post List */}
              {expandedCategories.has(category) && (
                <div style={styles.postList}>
                  {categoryPosts.map(post => (
                    <Link
                      key={post.id}
                      to={`/admin/tina/edit/${post.slug}`}
                      style={{
                        ...styles.postItem,
                        ...(selectedPostId === post.id ? styles.postItemSelected : {}),
                      }}
                      onClick={() => onPostSelect?.(post.id)}
                      onMouseEnter={(e) => {
                        if (selectedPostId !== post.id) {
                          Object.assign(e.currentTarget.style, styles.postItemHover);
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedPostId !== post.id) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <div style={styles.postStatus}>
                        {getStatusIcon(post.status)}
                      </div>
                      <div style={styles.postInfo}>
                        <div style={styles.postTitle}>{post.title}</div>
                        <div style={styles.postMeta}>
                          {post.publishedAt.toLocaleDateString('de-DE')} • {post.author}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Global styles for spinner animation
if (typeof document !== 'undefined' && !document.getElementById('tina-sidebar-styles')) {
  const style = document.createElement('style');
  style.id = 'tina-sidebar-styles';
  style.innerHTML = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export default TinaSidebar;