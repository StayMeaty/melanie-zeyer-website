import React, { useState, useMemo } from 'react';
import { BlogPostSummary, BlogCategory, BLOG_CATEGORIES, BLOG_CONFIG } from '../types/blog';
import { APP_CONFIG } from '../types';
import BlogCard from '../components/BlogCard';

// Mock data for demonstration - in real implementation, this would come from a CMS or API
const mockPosts: BlogPostSummary[] = [
  {
    id: '1',
    title: 'Die Kraft der Selbstreflexion: Wie Sie Ihre Potentiale entdecken',
    slug: 'kraft-der-selbstreflexion',
    excerpt: 'Selbstreflexion ist der Schlüssel zu persönlichem Wachstum. Entdecken Sie praktische Methoden, um Ihre Stärken zu erkennen und Ihr volles Potenzial zu entfalten.',
    category: 'persoenlichkeitsentwicklung',
    tags: ['Selbstreflexion', 'Potenziale', 'Persönlichkeit'],
    author: 'melanie',
    authorData: { name: 'Melanie Zeyer', avatar: undefined },
    publishedAt: new Date('2024-01-15'),
    readingTime: 8,
    featured: true,
    viewCount: 245,
    commentCount: 12,
    status: 'published',
  },
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
    viewCount: 189,
    commentCount: 8,
    status: 'published',
  },
  {
    id: '3',
    title: 'Erfolgreich gründen: Die ersten Schritte in die Selbstständigkeit',
    slug: 'erfolgreich-gruenden-erste-schritte',
    excerpt: 'Der Schritt in die Selbstständigkeit ist aufregend und herausfordernd zugleich. Hier erfahren Sie, wie Sie Ihre Geschäftsidee erfolgreich umsetzen.',
    category: 'business',
    tags: ['Gründung', 'Selbstständigkeit', 'Unternehmen'],
    author: 'melanie',
    authorData: { name: 'Melanie Zeyer', avatar: undefined },
    publishedAt: new Date('2024-01-05'),
    readingTime: 12,
    featured: true,
    viewCount: 321,
    commentCount: 15,
    status: 'published',
  },
];

const Blog: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const styles: Record<string, React.CSSProperties> = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem',
    },
    hero: {
      textAlign: 'center',
      marginBottom: '3rem',
      padding: '2rem 0',
    },
    title: {
      fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
      color: APP_CONFIG.colors.primary,
      fontWeight: '700',
      fontFamily: "'Sumana', serif",
      marginBottom: '1rem',
      lineHeight: '1.2',
    },
    subtitle: {
      fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
      color: APP_CONFIG.colors.secondary,
      fontWeight: '400',
      fontFamily: "'Arimo', sans-serif",
      lineHeight: '1.6',
      maxWidth: '600px',
      margin: '0 auto',
    },
    content: {
      display: 'grid',
      gridTemplateColumns: '1fr 300px',
      gap: '3rem',
      alignItems: 'start',
    },
    contentMobile: {
      display: 'block',
    },
    main: {
      minHeight: '600px',
    },
    searchSection: {
      marginBottom: '2rem',
    },
    searchInput: {
      width: '100%',
      padding: '1rem 1.5rem',
      border: `2px solid ${APP_CONFIG.colors.primary}20`,
      borderRadius: '2rem',
      fontSize: '1rem',
      fontFamily: "'Arimo', sans-serif",
      outline: 'none',
      backgroundColor: '#FFFFFF',
      transition: 'border-color 0.3s ease',
    },
    searchInputFocus: {
      borderColor: APP_CONFIG.colors.primary,
    },
    postsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '2rem',
      marginBottom: '3rem',
    },
    sidebar: {
      position: 'sticky' as const,
      top: '2rem',
    },
    sidebarSection: {
      backgroundColor: '#FFFFFF',
      borderRadius: '1rem',
      padding: '1.5rem',
      marginBottom: '2rem',
      boxShadow: '0 2px 20px rgba(0, 0, 0, 0.05)',
      border: `1px solid ${APP_CONFIG.colors.primary}10`,
    },
    sidebarTitle: {
      fontSize: '1.2rem',
      color: APP_CONFIG.colors.primary,
      fontWeight: '600',
      fontFamily: "'Sumana', serif",
      marginBottom: '1rem',
    },
    categoryList: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
    },
    categoryItem: {
      marginBottom: '0.5rem',
    },
    categoryButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      padding: '0.75rem 1rem',
      border: 'none',
      backgroundColor: 'transparent',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontSize: '0.95rem',
      fontFamily: "'Arimo', sans-serif",
      color: APP_CONFIG.colors.secondary,
      transition: 'all 0.3s ease',
      textAlign: 'left',
    },
    categoryButtonActive: {
      backgroundColor: `${APP_CONFIG.colors.primary}10`,
      color: APP_CONFIG.colors.primary,
      fontWeight: '600',
    },
    categoryButtonHover: {
      backgroundColor: `${APP_CONFIG.colors.primary}05`,
      color: APP_CONFIG.colors.primary,
    },
    categoryCount: {
      fontSize: '0.8rem',
      backgroundColor: `${APP_CONFIG.colors.accent}30`,
      color: APP_CONFIG.colors.primary,
      padding: '0.25rem 0.5rem',
      borderRadius: '1rem',
      fontWeight: '600',
    },
    pagination: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '1rem',
      marginTop: '3rem',
    },
    paginationButton: {
      padding: '0.75rem 1.5rem',
      border: `2px solid ${APP_CONFIG.colors.primary}`,
      backgroundColor: 'transparent',
      color: APP_CONFIG.colors.primary,
      borderRadius: '2rem',
      cursor: 'pointer',
      fontSize: '0.95rem',
      fontFamily: "'Arimo', sans-serif",
      fontWeight: '600',
      transition: 'all 0.3s ease',
    },
    paginationButtonActive: {
      backgroundColor: APP_CONFIG.colors.primary,
      color: '#FFFFFF',
    },
    paginationButtonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    noResults: {
      textAlign: 'center',
      padding: '3rem',
      color: APP_CONFIG.colors.secondary,
      fontSize: '1.1rem',
      fontFamily: "'Arimo', sans-serif",
    },
    resultsCount: {
      marginBottom: '1.5rem',
      color: APP_CONFIG.colors.secondary,
      fontSize: '0.95rem',
      fontFamily: "'Arimo', sans-serif",
    },
  };

  // Filter and search logic
  const filteredPosts = useMemo(() => {
    let filtered = [...mockPosts];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [selectedCategory, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredPosts.length / BLOG_CONFIG.postsPerPage);
  const startIndex = (currentPage - 1) * BLOG_CONFIG.postsPerPage;
  const endIndex = startIndex + BLOG_CONFIG.postsPerPage;
  const currentPosts = filteredPosts.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  const handleCategoryChange = (category: BlogCategory | 'all') => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const getCategoryPostCount = (category: BlogCategory | 'all'): number => {
    if (category === 'all') return mockPosts.length;
    return mockPosts.filter(post => post.category === category).length;
  };

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.title}>Blog</h1>
        <p style={styles.subtitle}>
          Inspiration, Tipps und Einsichten für Ihre persönliche und berufliche Entwicklung
        </p>
      </div>

      <div style={window.innerWidth <= 768 ? styles.contentMobile : styles.content}>
        <main style={styles.main}>
          <div style={styles.searchSection}>
            <input
              type="text"
              placeholder="Blog durchsuchen..."
              value={searchQuery}
              onChange={handleSearchChange}
              style={styles.searchInput}
              onFocus={(e) => {
                Object.assign(e.currentTarget.style, styles.searchInputFocus);
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = `${APP_CONFIG.colors.primary}20`;
              }}
            />
          </div>

          <div style={styles.resultsCount}>
            {filteredPosts.length} {filteredPosts.length === 1 ? 'Artikel' : 'Artikel'} gefunden
          </div>

          {currentPosts.length > 0 ? (
            <>
              <div style={styles.postsGrid}>
                {currentPosts.map(post => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>

              {totalPages > 1 && (
                <div style={styles.pagination}>
                  <button
                    style={{
                      ...styles.paginationButton,
                      ...(currentPage === 1 ? styles.paginationButtonDisabled : {})
                    }}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    onMouseEnter={(e) => {
                      if (currentPage > 1) {
                        Object.assign(e.currentTarget.style, styles.paginationButtonActive);
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage > 1) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = APP_CONFIG.colors.primary;
                      }
                    }}
                  >
                    Vorherige
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      style={{
                        ...styles.paginationButton,
                        ...(page === currentPage ? styles.paginationButtonActive : {})
                      }}
                      onClick={() => setCurrentPage(page)}
                      onMouseEnter={(e) => {
                        if (page !== currentPage) {
                          Object.assign(e.currentTarget.style, styles.paginationButtonActive);
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (page !== currentPage) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = APP_CONFIG.colors.primary;
                        }
                      }}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    style={{
                      ...styles.paginationButton,
                      ...(currentPage === totalPages ? styles.paginationButtonDisabled : {})
                    }}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    onMouseEnter={(e) => {
                      if (currentPage < totalPages) {
                        Object.assign(e.currentTarget.style, styles.paginationButtonActive);
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage < totalPages) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = APP_CONFIG.colors.primary;
                      }
                    }}
                  >
                    Nächste
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={styles.noResults}>
              <p>Keine Artikel gefunden. Versuchen Sie andere Suchbegriffe oder wählen Sie eine andere Kategorie.</p>
            </div>
          )}
        </main>

        <aside style={styles.sidebar}>
          <div style={styles.sidebarSection}>
            <h3 style={styles.sidebarTitle}>Kategorien</h3>
            <ul style={styles.categoryList}>
              <li style={styles.categoryItem}>
                <button
                  style={{
                    ...styles.categoryButton,
                    ...(selectedCategory === 'all' ? styles.categoryButtonActive : {})
                  }}
                  onClick={() => handleCategoryChange('all')}
                  onMouseEnter={(e) => {
                    if (selectedCategory !== 'all') {
                      Object.assign(e.currentTarget.style, styles.categoryButtonHover);
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCategory !== 'all') {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = APP_CONFIG.colors.secondary;
                    }
                  }}
                >
                  <span>Alle Artikel</span>
                  <span style={styles.categoryCount}>{getCategoryPostCount('all')}</span>
                </button>
              </li>
              {BLOG_CATEGORIES.map(category => (
                <li key={category.category} style={styles.categoryItem}>
                  <button
                    style={{
                      ...styles.categoryButton,
                      ...(selectedCategory === category.category ? styles.categoryButtonActive : {})
                    }}
                    onClick={() => handleCategoryChange(category.category)}
                    onMouseEnter={(e) => {
                      if (selectedCategory !== category.category) {
                        Object.assign(e.currentTarget.style, styles.categoryButtonHover);
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedCategory !== category.category) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = APP_CONFIG.colors.secondary;
                      }
                    }}
                  >
                    <span>{category.displayName}</span>
                    <span style={styles.categoryCount}>{getCategoryPostCount(category.category)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Blog;