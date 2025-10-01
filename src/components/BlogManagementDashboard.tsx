import React, { useState, useEffect, useMemo } from 'react';
import { BlogPost, BlogStatus, BlogCategory, BLOG_CATEGORIES } from '../types/blog';
import { loadAllPosts } from '../services/blogContent';
import { APP_CONFIG } from '../types/index';

interface BlogManagementDashboardProps {
  onEdit: (post: BlogPost) => void;
  onDelete: (post: BlogPost) => void;
  onView: (post: BlogPost) => void;
  onCreateNew: () => void;
}

interface BlogStats {
  totalPosts: number;
  published: number;
  drafts: number;
  totalViews: number;
}

interface FilterState {
  search: string;
  category: BlogCategory | 'all';
  status: BlogStatus | 'all';
  dateFrom: string;
  dateTo: string;
}

type SortField = 'title' | 'category' | 'status' | 'author' | 'date' | 'views';
type SortDirection = 'asc' | 'desc';

const BlogManagementDashboard: React.FC<BlogManagementDashboardProps> = ({
  onEdit,
  onDelete,
  onView,
  onCreateNew,
}) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(10);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: '',
  });

  // Load posts on component mount
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const allPosts = await loadAllPosts();
        setPosts(allPosts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Fehler beim Laden der Beiträge');
        console.error('Error loading posts:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  // Calculate blog statistics
  const stats: BlogStats = useMemo(() => {
    const totalPosts = posts.length;
    const published = posts.filter(post => post.status === 'published').length;
    const drafts = posts.filter(post => post.status === 'draft').length;
    const totalViews = posts.reduce((sum, post) => sum + (post.viewCount || 0), 0);

    return { totalPosts, published, drafts, totalViews };
  }, [posts]);

  // Filter and sort posts
  const filteredAndSortedPosts = useMemo(() => {
    const filtered = posts.filter(post => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matches = 
          post.title.toLowerCase().includes(searchLower) ||
          post.excerpt.toLowerCase().includes(searchLower) ||
          post.author.toLowerCase().includes(searchLower) ||
          post.tags.some(tag => tag.toLowerCase().includes(searchLower));
        
        if (!matches) return false;
      }

      // Category filter
      if (filters.category !== 'all' && post.category !== filters.category) {
        return false;
      }

      // Status filter
      if (filters.status !== 'all' && post.status !== filters.status) {
        return false;
      }

      // Date range filter
      if (filters.dateFrom) {
        const postDate = new Date(post.date);
        const fromDate = new Date(filters.dateFrom);
        if (postDate < fromDate) return false;
      }

      if (filters.dateTo) {
        const postDate = new Date(post.date);
        const toDate = new Date(filters.dateTo);
        if (postDate > toDate) return false;
      }

      return true;
    });

    // Sort posts
    filtered.sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (sortField) {
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'author':
          aValue = a.author;
          bValue = b.author;
          break;
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'views':
          aValue = a.viewCount || 0;
          bValue = b.viewCount || 0;
          break;
        default:
          aValue = a.title;
          bValue = b.title;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [posts, filters, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const currentPosts = filteredAndSortedPosts.slice(startIndex, startIndex + postsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, postsPerPage]);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPosts(new Set(currentPosts.map(post => post.id)));
    } else {
      setSelectedPosts(new Set());
    }
  };

  // Handle individual select
  const handleSelectPost = (postId: string, checked: boolean) => {
    const newSelected = new Set(selectedPosts);
    if (checked) {
      newSelected.add(postId);
    } else {
      newSelected.delete(postId);
    }
    setSelectedPosts(newSelected);
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedPosts.size === 0) return;
    
    const confirmed = window.confirm(
      `Möchten Sie wirklich ${selectedPosts.size} Beitrag${selectedPosts.size > 1 ? 'e' : ''} löschen?`
    );
    
    if (confirmed) {
      const postsToDelete = posts.filter(post => selectedPosts.has(post.id));
      for (const post of postsToDelete) {
        onDelete(post);
      }
      setSelectedPosts(new Set());
    }
  };

  // Get category display name
  const getCategoryDisplayName = (category: BlogCategory): string => {
    const categoryInfo = BLOG_CATEGORIES.find(cat => cat.category === category);
    return categoryInfo?.displayName || category;
  };

  // Get status badge color
  const getStatusColor = (status: BlogStatus): string => {
    switch (status) {
      case 'published':
        return '#22c55e';
      case 'draft':
        return '#f59e0b';
      case 'archived':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  // Get status display name
  const getStatusDisplayName = (status: BlogStatus): string => {
    switch (status) {
      case 'published':
        return 'Veröffentlicht';
      case 'draft':
        return 'Entwurf';
      case 'archived':
        return 'Archiviert';
      default:
        return status;
    }
  };

  const styles: Record<string, React.CSSProperties> = {
    container: {
      padding: '2rem',
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
    },
    title: {
      fontSize: '1.75rem',
      fontWeight: 'bold',
      color: APP_CONFIG.colors.primary,
      margin: 0,
    },
    createButton: {
      backgroundColor: APP_CONFIG.colors.primary,
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: '500',
      transition: 'all 0.2s ease',
    },
    createButtonHover: {
      backgroundColor: '#007a92',
      transform: 'translateY(-1px)',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem',
    },
    statCard: {
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      border: `1px solid ${APP_CONFIG.colors.primary}10`,
    },
    statTitle: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginBottom: '0.5rem',
      fontWeight: '500',
    },
    statValue: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: APP_CONFIG.colors.primary,
      margin: 0,
    },
    filtersContainer: {
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '2rem',
    },
    filtersGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
    },
    filterGroup: {
      display: 'flex',
      flexDirection: 'column',
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '0.5rem',
    },
    input: {
      padding: '0.5rem',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      fontSize: '0.875rem',
      transition: 'border-color 0.2s ease',
    },
    inputFocus: {
      borderColor: APP_CONFIG.colors.primary,
      outline: 'none',
    },
    select: {
      padding: '0.5rem',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      fontSize: '0.875rem',
      backgroundColor: 'white',
      cursor: 'pointer',
    },
    tableContainer: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      overflow: 'hidden',
    },
    tableHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 1.5rem',
      borderBottom: '1px solid #e5e7eb',
      backgroundColor: '#f9fafb',
    },
    bulkActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    bulkText: {
      fontSize: '0.875rem',
      color: '#6b7280',
    },
    deleteButton: {
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      padding: '0.5rem 1rem',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.875rem',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    tableHead: {
      backgroundColor: '#f9fafb',
    },
    th: {
      padding: '0.75rem 1rem',
      textAlign: 'left',
      fontWeight: '600',
      color: '#374151',
      fontSize: '0.875rem',
      borderBottom: '1px solid #e5e7eb',
      cursor: 'pointer',
      userSelect: 'none',
      transition: 'background-color 0.2s ease',
    },
    thHover: {
      backgroundColor: '#f3f4f6',
    },
    sortIcon: {
      marginLeft: '0.25rem',
      fontSize: '0.75rem',
      color: '#9ca3af',
    },
    td: {
      padding: '1rem',
      borderBottom: '1px solid #f3f4f6',
      fontSize: '0.875rem',
    },
    tr: {
      transition: 'background-color 0.2s ease',
    },
    trHover: {
      backgroundColor: '#f9fafb',
    },
    checkbox: {
      width: '16px',
      height: '16px',
      cursor: 'pointer',
    },
    statusBadge: {
      padding: '0.25rem 0.75rem',
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontWeight: '500',
      color: 'white',
      display: 'inline-block',
    },
    actionButton: {
      padding: '0.25rem 0.5rem',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.75rem',
      fontWeight: '500',
      marginRight: '0.5rem',
      transition: 'all 0.2s ease',
    },
    viewButton: {
      backgroundColor: APP_CONFIG.colors.primary,
      color: 'white',
    },
    editButton: {
      backgroundColor: '#f59e0b',
      color: 'white',
    },
    deleteButtonSmall: {
      backgroundColor: '#dc3545',
      color: 'white',
    },
    pagination: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 1.5rem',
      borderTop: '1px solid #e5e7eb',
      backgroundColor: '#f9fafb',
    },
    paginationInfo: {
      fontSize: '0.875rem',
      color: '#6b7280',
    },
    paginationControls: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    paginationButton: {
      padding: '0.5rem 0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      backgroundColor: 'white',
      cursor: 'pointer',
      fontSize: '0.875rem',
      color: '#374151',
      transition: 'all 0.2s ease',
    },
    paginationButtonActive: {
      backgroundColor: APP_CONFIG.colors.primary,
      borderColor: APP_CONFIG.colors.primary,
      color: 'white',
    },
    paginationButtonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    pageSelect: {
      padding: '0.5rem',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      fontSize: '0.875rem',
      backgroundColor: 'white',
      cursor: 'pointer',
      marginLeft: '0.5rem',
    },
    loadingSkeleton: {
      padding: '2rem',
      textAlign: 'center',
      color: '#6b7280',
    },
    emptyState: {
      padding: '4rem 2rem',
      textAlign: 'center',
      color: '#6b7280',
    },
    emptyIcon: {
      fontSize: '3rem',
      marginBottom: '1rem',
      opacity: 0.5,
    },
    emptyTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      marginBottom: '0.5rem',
      color: '#374151',
    },
    emptyDescription: {
      fontSize: '0.875rem',
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingSkeleton}>
          <div style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
            Lade Blog-Beiträge...
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f4f6',
              borderTop: `4px solid ${APP_CONFIG.colors.primary}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>⚠️</div>
          <h3 style={styles.emptyTitle}>Fehler beim Laden</h3>
          <p style={styles.emptyDescription}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Blog-Verwaltung</h1>
        <button
          style={styles.createButton}
          onClick={onCreateNew}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.createButtonHover)}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = APP_CONFIG.colors.primary;
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Neuer Beitrag
        </button>
      </div>

      {/* Statistics Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statTitle}>Gesamte Beiträge</div>
          <div style={styles.statValue}>{stats.totalPosts}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statTitle}>Veröffentlicht</div>
          <div style={styles.statValue}>{stats.published}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statTitle}>Entwürfe</div>
          <div style={styles.statValue}>{stats.drafts}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statTitle}>Gesamtaufrufe</div>
          <div style={styles.statValue}>{stats.totalViews.toLocaleString('de-DE')}</div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filtersContainer}>
        <div style={styles.filtersGrid}>
          <div style={styles.filterGroup}>
            <label style={styles.label}>Suche</label>
            <input
              type="text"
              placeholder="Titel, Autor, Tags..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              style={styles.input}
              onFocus={(e) => Object.assign(e.currentTarget.style, styles.inputFocus)}
              onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
            />
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.label}>Kategorie</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value as BlogCategory | 'all' })}
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

          <div style={styles.filterGroup}>
            <label style={styles.label}>Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as BlogStatus | 'all' })}
              style={styles.select}
            >
              <option value="all">Alle Status</option>
              <option value="published">Veröffentlicht</option>
              <option value="draft">Entwurf</option>
              <option value="archived">Archiviert</option>
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.label}>Datum von</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              style={styles.input}
            />
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.label}>Datum bis</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              style={styles.input}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={styles.tableContainer}>
        {/* Table Header with Bulk Actions */}
        <div style={styles.tableHeader}>
          <div style={styles.bulkActions}>
            {selectedPosts.size > 0 && (
              <>
                <span style={styles.bulkText}>
                  {selectedPosts.size} Beitrag{selectedPosts.size > 1 ? 'e' : ''} ausgewählt
                </span>
                <button
                  style={styles.deleteButton}
                  onClick={handleBulkDelete}
                >
                  Ausgewählte löschen
                </button>
              </>
            )}
          </div>
          <div style={styles.bulkActions}>
            <span style={styles.bulkText}>
              {filteredAndSortedPosts.length} von {posts.length} Beiträgen
            </span>
            <select
              value={postsPerPage}
              onChange={(e) => setPostsPerPage(Number(e.target.value))}
              style={styles.pageSelect}
            >
              <option value={5}>5 pro Seite</option>
              <option value={10}>10 pro Seite</option>
              <option value={25}>25 pro Seite</option>
              <option value={50}>50 pro Seite</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        {currentPosts.length > 0 ? (
          <table style={styles.table}>
            <thead style={styles.tableHead}>
              <tr>
                <th style={styles.th}>
                  <input
                    type="checkbox"
                    style={styles.checkbox}
                    checked={selectedPosts.size === currentPosts.length && currentPosts.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th
                  style={styles.th}
                  onClick={() => handleSort('title')}
                  onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.thHover)}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                >
                  Titel
                  {sortField === 'title' && (
                    <span style={styles.sortIcon}>
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th
                  style={styles.th}
                  onClick={() => handleSort('category')}
                  onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.thHover)}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                >
                  Kategorie
                  {sortField === 'category' && (
                    <span style={styles.sortIcon}>
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th
                  style={styles.th}
                  onClick={() => handleSort('status')}
                  onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.thHover)}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                >
                  Status
                  {sortField === 'status' && (
                    <span style={styles.sortIcon}>
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th
                  style={styles.th}
                  onClick={() => handleSort('author')}
                  onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.thHover)}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                >
                  Autor
                  {sortField === 'author' && (
                    <span style={styles.sortIcon}>
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th
                  style={styles.th}
                  onClick={() => handleSort('date')}
                  onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.thHover)}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                >
                  Datum
                  {sortField === 'date' && (
                    <span style={styles.sortIcon}>
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th
                  style={styles.th}
                  onClick={() => handleSort('views')}
                  onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.thHover)}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                >
                  Aufrufe
                  {sortField === 'views' && (
                    <span style={styles.sortIcon}>
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th style={{ ...styles.th, cursor: 'default' }}>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {currentPosts.map((post) => (
                <tr
                  key={post.id}
                  style={styles.tr}
                  onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.trHover)}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={styles.td}>
                    <input
                      type="checkbox"
                      style={styles.checkbox}
                      checked={selectedPosts.has(post.id)}
                      onChange={(e) => handleSelectPost(post.id, e.target.checked)}
                    />
                  </td>
                  <td style={styles.td}>
                    <div style={{ fontWeight: '500', color: '#374151' }}>{post.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                      {post.excerpt.substring(0, 80)}...
                    </div>
                  </td>
                  <td style={styles.td}>
                    {getCategoryDisplayName(post.category)}
                  </td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: getStatusColor(post.status),
                      }}
                    >
                      {getStatusDisplayName(post.status)}
                    </span>
                  </td>
                  <td style={styles.td}>{post.author}</td>
                  <td style={styles.td}>
                    {new Date(post.date).toLocaleDateString('de-DE')}
                  </td>
                  <td style={styles.td}>
                    {(post.viewCount || 0).toLocaleString('de-DE')}
                  </td>
                  <td style={styles.td}>
                    <button
                      style={{ ...styles.actionButton, ...styles.viewButton }}
                      onClick={() => onView(post)}
                      title="Beitrag anzeigen"
                    >
                      Anzeigen
                    </button>
                    <button
                      style={{ ...styles.actionButton, ...styles.editButton }}
                      onClick={() => onEdit(post)}
                      title="Beitrag bearbeiten"
                    >
                      Bearbeiten
                    </button>
                    <button
                      style={{ ...styles.actionButton, ...styles.deleteButtonSmall }}
                      onClick={() => {
                        if (window.confirm(`Möchten Sie den Beitrag "${post.title}" wirklich löschen?`)) {
                          onDelete(post);
                        }
                      }}
                      title="Beitrag löschen"
                    >
                      Löschen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📝</div>
            <h3 style={styles.emptyTitle}>Keine Beiträge gefunden</h3>
            <p style={styles.emptyDescription}>
              {filters.search || filters.category !== 'all' || filters.status !== 'all'
                ? 'Versuchen Sie, Ihre Filter zu ändern oder einen neuen Beitrag zu erstellen.'
                : 'Erstellen Sie Ihren ersten Blog-Beitrag, um loszulegen.'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={styles.pagination}>
            <div style={styles.paginationInfo}>
              Zeige {startIndex + 1}-{Math.min(startIndex + postsPerPage, filteredAndSortedPosts.length)} von {filteredAndSortedPosts.length} Beiträgen
            </div>
            <div style={styles.paginationControls}>
              <button
                style={{
                  ...styles.paginationButton,
                  ...(currentPage === 1 ? styles.paginationButtonDisabled : {})
                }}
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Vorherige
              </button>
              
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page: number;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={page}
                    style={{
                      ...styles.paginationButton,
                      ...(page === currentPage ? styles.paginationButtonActive : {})
                    }}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                );
              })}
              
              <button
                style={{
                  ...styles.paginationButton,
                  ...(currentPage === totalPages ? styles.paginationButtonDisabled : {})
                }}
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Nächste
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogManagementDashboard;