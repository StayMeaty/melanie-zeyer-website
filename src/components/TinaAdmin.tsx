/**
 * Simplified Tina CMS Admin Interface
 * Clean, user-friendly content management dashboard
 */

import React, { useState } from 'react';
import { useTinaAuth } from '../services/tinaAuth';
import { APP_COLORS } from '../types';

// Mock blog posts data for demonstration
const mockBlogPosts = [
  {
    id: '1',
    title: 'Willkommen auf meiner neuen Website',
    status: 'published' as const,
    date: '2024-03-15',
    excerpt: 'Ein erster Einblick in meine Arbeit und Vision...'
  },
  {
    id: '2', 
    title: 'Die Kraft der Persönlichkeitsentwicklung',
    status: 'draft' as const,
    date: '2024-03-10',
    excerpt: 'Wie Sie Ihr volles Potenzial entdecken können...'
  },
  {
    id: '3',
    title: 'Coaching im digitalen Zeitalter',
    status: 'published' as const,
    date: '2024-03-05',
    excerpt: 'Moderne Ansätze für persönliches Wachstum...'
  }
];

interface ContentDashboardProps {
  onNavigate: (section: string) => void;
}

const ContentDashboard: React.FC<ContentDashboardProps> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredPosts = mockBlogPosts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const stats = {
    total: mockBlogPosts.length,
    published: mockBlogPosts.filter(p => p.status === 'published').length,
    drafts: mockBlogPosts.filter(p => p.status === 'draft').length
  };
  
  return (
    <div style={styles.dashboard}>
      {/* Quick Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.total}</div>
          <div style={styles.statLabel}>Gesamt</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.published}</div>
          <div style={styles.statLabel}>Veröffentlicht</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.drafts}</div>
          <div style={styles.statLabel}>Entwürfe</div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div style={styles.actionsGrid}>
        <button 
          className="action-button"
          style={styles.actionButton}
          onClick={() => onNavigate('new-post')}
        >
          <div style={styles.actionIcon}>✏️</div>
          <div style={styles.actionText}>
            <div style={styles.actionTitle}>Neuer Beitrag</div>
            <div style={styles.actionSubtitle}>Blog-Artikel erstellen</div>
          </div>
        </button>
        
        <button 
          className="action-button"
          style={styles.actionButton}
          onClick={() => onNavigate('media')}
        >
          <div style={styles.actionIcon}>🖼️</div>
          <div style={styles.actionText}>
            <div style={styles.actionTitle}>Medien verwalten</div>
            <div style={styles.actionSubtitle}>Bilder und Dateien</div>
          </div>
        </button>
        
        <button 
          className="action-button"
          style={styles.actionButton}
          onClick={() => onNavigate('settings')}
        >
          <div style={styles.actionIcon}>⚙️</div>
          <div style={styles.actionText}>
            <div style={styles.actionTitle}>Einstellungen</div>
            <div style={styles.actionSubtitle}>Website konfigurieren</div>
          </div>
        </button>
      </div>
      
      {/* Recent Posts */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>Letzte Beiträge</h3>
          <div style={styles.searchBox}>
            <input
              type="text"
              placeholder="Beiträge suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              style={styles.searchInput}
            />
          </div>
        </div>
        
        <div style={styles.postsList}>
          {filteredPosts.map(post => (
            <div key={post.id} className="post-card" style={styles.postCard}>
              <div style={styles.postHeader}>
                <h4 style={styles.postTitle}>{post.title}</h4>
                <span style={{
                  ...styles.statusBadge,
                  ...(post.status === 'published' ? styles.statusPublished : styles.statusDraft)
                }}>
                  {post.status === 'published' ? 'Veröffentlicht' : 'Entwurf'}
                </span>
              </div>
              <p style={styles.postExcerpt}>{post.excerpt}</p>
              <div style={styles.postFooter}>
                <span style={styles.postDate}>{new Date(post.date).toLocaleDateString('de-DE')}</span>
                <div style={styles.postActions}>
                  <button className="action-btn" style={styles.actionBtn}>Bearbeiten</button>
                  <button className="action-btn" style={styles.actionBtn}>Vorschau</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface TinaAdminProps {
  className?: string;
}

const TinaAdmin: React.FC<TinaAdminProps> = ({ className = '' }) => {
  const { isAuthenticated, isLoading, login } = useTinaAuth();
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  const handleLogin = async () => {
    setLoginError(null);
    const result = await login();
    if (!result.success) {
      setLoginError('Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.');
    }
  };
  
  const handleNavigate = (section: string) => {
    setCurrentSection(section);
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };
  
  const renderContent = () => {
    switch (currentSection) {
      case 'dashboard':
        return <ContentDashboard onNavigate={handleNavigate} />;
      case 'posts':
        return (
          <div style={styles.placeholder}>
            <div style={styles.placeholderIcon}>📝</div>
            <h3 style={styles.placeholderTitle}>Blog-Beiträge</h3>
            <p style={styles.placeholderText}>Hier können Sie alle Blog-Beiträge verwalten</p>
          </div>
        );
      case 'new-post':
        return (
          <div style={styles.placeholder}>
            <div style={styles.placeholderIcon}>✏️</div>
            <h3 style={styles.placeholderTitle}>Neuer Beitrag</h3>
            <p style={styles.placeholderText}>Erstellen Sie einen neuen Blog-Artikel</p>
          </div>
        );
      case 'media':
        return (
          <div style={styles.placeholder}>
            <div style={styles.placeholderIcon}>🖼️</div>
            <h3 style={styles.placeholderTitle}>Medien</h3>
            <p style={styles.placeholderText}>Verwalten Sie Ihre Bilder und Dateien</p>
          </div>
        );
      case 'settings':
        return (
          <div style={styles.placeholder}>
            <div style={styles.placeholderIcon}>⚙️</div>
            <h3 style={styles.placeholderTitle}>Einstellungen</h3>
            <p style={styles.placeholderText}>Konfigurieren Sie Ihre Website</p>
          </div>
        );
      default:
        return <ContentDashboard onNavigate={handleNavigate} />;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={className} style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner} />
          <span style={styles.loadingText}>Wird geladen...</span>
        </div>
      </div>
    );
  }

  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <div className={className} style={styles.container}>
        <div style={styles.authContainer}>
          <div style={styles.authCard}>
            <div style={styles.authIcon}>🔑</div>
            <h1 style={styles.authTitle}>Content Management</h1>
            <p style={styles.authSubtitle}>
              Melden Sie sich an, um Ihre Inhalte zu verwalten
            </p>
            
            <button 
              onClick={handleLogin}
              style={styles.loginButton}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#0081a0';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = APP_COLORS.primary;
              }}
            >
              Mit GitHub anmelden
            </button>
            
            {loginError && (
              <div style={styles.errorMessage}>
                {loginError}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Authenticated state - render admin dashboard
  return (
    <div className={`tina-admin ${className}`} style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <button
            className="menu-button"
            style={styles.menuButton}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <h1 style={styles.siteTitle}>melaniezeyer.de</h1>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.userInfo}>Content Management</span>
        </div>
      </header>
      
      {/* Main Layout */}
      <div style={styles.layout}>
        {/* Sidebar */}
        {sidebarOpen && (
          <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`} style={styles.sidebar}>
            <div style={styles.sidebarContent}>
              {[
                { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                { id: 'posts', label: 'Beiträge', icon: '📝' },
                { id: 'new-post', label: 'Neuer Beitrag', icon: '✏️' },
                { id: 'media', label: 'Medien', icon: '🖼️' },
                { id: 'settings', label: 'Einstellungen', icon: '⚙️' }
              ].map(item => (
                <button
                  key={item.id}
                  className="nav-item"
                  style={{
                    ...styles.navItem,
                    ...(currentSection === item.id ? styles.navItemActive : {})
                  }}
                  onClick={() => handleNavigate(item.id)}
                >
                  <span style={styles.navIcon}>{item.icon}</span>
                  <span style={styles.navLabel}>{item.label}</span>
                </button>
              ))}
            </div>
          </nav>
        )}
        
        {/* Main Content */}
        <main className="main" style={{
          ...styles.main,
          marginLeft: sidebarOpen ? '250px' : '0'
        }}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

// Comprehensive styles for the simplified admin interface
const styles: Record<string, React.CSSProperties> = {
  // Base layout
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  
  // Loading state
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    flexDirection: 'column' as const,
  },
  loadingSpinner: {
    width: '2rem',
    height: '2rem',
    border: '3px solid #e2e8f0',
    borderTopColor: APP_COLORS.primary,
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    marginTop: '1rem',
    color: '#64748b',
    fontSize: '0.875rem',
  },
  
  // Authentication
  authContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '1rem',
  },
  authCard: {
    backgroundColor: 'white',
    borderRadius: '1rem',
    padding: '3rem 2rem',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    textAlign: 'center' as const,
    maxWidth: '400px',
    width: '100%',
  },
  authIcon: {
    fontSize: '3rem',
    marginBottom: '1.5rem',
  },
  authTitle: {
    fontSize: '1.875rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '0.5rem',
    margin: 0,
  },
  authSubtitle: {
    color: '#64748b',
    marginBottom: '2rem',
    lineHeight: '1.5',
  },
  loginButton: {
    backgroundColor: APP_COLORS.primary,
    color: 'white',
    border: 'none',
    padding: '0.875rem 2rem',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    width: '100%',
  },
  errorMessage: {
    marginTop: '1rem',
    padding: '0.75rem',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
  },
  
  // Header
  header: {
    backgroundColor: 'white',
    borderBottom: '1px solid #e2e8f0',
    padding: '0 1.5rem',
    height: '4rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky' as const,
    top: 0,
    zIndex: 10,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  menuButton: {
    display: 'none',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '1.25rem',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '0.25rem',
    '@media (max-width: 768px)': {
      display: 'block',
    },
  } as React.CSSProperties,
  siteTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: APP_COLORS.primary,
    margin: 0,
  },
  userInfo: {
    color: '#64748b',
    fontSize: '0.875rem',
  },
  
  // Layout
  layout: {
    position: 'relative' as const,
    height: 'calc(100vh - 4rem)',
  },
  
  // Sidebar
  sidebar: {
    position: 'fixed' as const,
    left: 0,
    top: '4rem',
    width: '250px',
    height: 'calc(100vh - 4rem)',
    backgroundColor: 'white',
    borderRight: '1px solid #e2e8f0',
    zIndex: 5,
  },
  sidebarContent: {
    padding: '1rem 0',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    width: '100%',
    padding: '0.75rem 1.5rem',
    backgroundColor: 'transparent',
    border: 'none',
    textAlign: 'left' as const,
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#64748b',
    transition: 'all 0.2s',
  },
  navItemActive: {
    backgroundColor: '#f1f5f9',
    color: APP_COLORS.primary,
    borderRight: `3px solid ${APP_COLORS.primary}`,
  },
  navIcon: {
    fontSize: '1rem',
  },
  navLabel: {
    flex: 1,
  },
  
  // Main content
  main: {
    padding: '2rem',
    transition: 'margin-left 0.3s',
    maxWidth: '100%',
  },
  
  // Dashboard
  dashboard: {
    maxWidth: '1200px',
  },
  
  // Stats grid
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    textAlign: 'center' as const,
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: '700',
    color: APP_COLORS.primary,
    marginBottom: '0.5rem',
  },
  statLabel: {
    fontSize: '0.875rem',
    color: '#64748b',
    fontWeight: '500',
  },
  
  // Actions grid
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left' as const,
  },
  actionIcon: {
    fontSize: '1.5rem',
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '0.25rem',
  },
  actionSubtitle: {
    fontSize: '0.875rem',
    color: '#64748b',
  },
  
  // Sections
  section: {
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap' as const,
    gap: '1rem',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0,
  },
  
  // Search
  searchBox: {
    position: 'relative' as const,
  },
  searchInput: {
    padding: '0.5rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    width: '250px',
    outline: 'none',
  },
  
  // Posts list
  postsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  postCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    padding: '1.25rem',
    transition: 'all 0.2s',
  },
  postHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.5rem',
    gap: '1rem',
  },
  postTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0,
    flex: 1,
  },
  statusBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '500',
    flexShrink: 0,
  },
  statusPublished: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  statusDraft: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  postExcerpt: {
    color: '#64748b',
    fontSize: '0.875rem',
    lineHeight: '1.5',
    marginBottom: '1rem',
  },
  postFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
  },
  postDate: {
    fontSize: '0.75rem',
    color: '#94a3b8',
  },
  postActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  actionBtn: {
    padding: '0.375rem 0.75rem',
    backgroundColor: 'transparent',
    border: '1px solid #d1d5db',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    cursor: 'pointer',
    color: '#64748b',
    transition: 'all 0.2s',
  },
  
  // Placeholder content
  placeholder: {
    textAlign: 'center' as const,
    padding: '4rem 2rem',
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  placeholderIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
  placeholderTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '0.5rem',
  },
  placeholderText: {
    color: '#64748b',
    fontSize: '1rem',
  },
};

// Global styles for animations
if (typeof document !== 'undefined' && !document.getElementById('tina-admin-styles')) {
  const style = document.createElement('style');
  style.id = 'tina-admin-styles';
  style.innerHTML = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    /* Responsive sidebar */
    @media (max-width: 768px) {
      .tina-admin .menu-button {
        display: block !important;
      }
      .tina-admin .sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s;
      }
      .tina-admin .sidebar.open {
        transform: translateX(0);
      }
      .tina-admin .main {
        margin-left: 0 !important;
      }
    }
    
    /* Hover effects */
    .tina-admin .action-button:hover {
      border-color: ${APP_COLORS.primary};
      box-shadow: 0 4px 12px rgba(0,151,178,0.15);
      transform: translateY(-1px);
    }
    
    .tina-admin .nav-item:hover {
      background-color: #f8fafc;
      color: ${APP_COLORS.primary};
    }
    
    .tina-admin .post-card:hover {
      border-color: ${APP_COLORS.primary};
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    .tina-admin .action-btn:hover {
      border-color: ${APP_COLORS.primary};
      color: ${APP_COLORS.primary};
    }
    
    .tina-admin .search-input:focus {
      border-color: ${APP_COLORS.primary};
      box-shadow: 0 0 0 3px rgba(0,151,178,0.1);
    }
  `;
  document.head.appendChild(style);
}

export default TinaAdmin;