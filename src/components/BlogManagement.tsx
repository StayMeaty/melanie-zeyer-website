import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BlogPost } from '../types/blog';
import { clearPostCaches } from '../services/blogContent';
import { useBlogData } from '../contexts/BlogDataContext';
import BlogManagementDashboard from './BlogManagementDashboard';
import BlogEditor from './BlogEditor';
import BlogStatistics from './BlogStatistics';
import CategoryTagManager from './CategoryTagManager';
import DraftManager from './DraftManager';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import ImageUploadModal from './ImageUploadModal';

interface BlogManagementProps {
  initialView?: ViewType;
}

type ViewType = 'overview' | 'statistics' | 'categories' | 'drafts' | 'create' | 'edit';

interface TabConfig {
  key: ViewType;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>;
}

const BlogManagement: React.FC<BlogManagementProps> = ({ initialView = 'overview' }) => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();
  const { posts, isLoading, error: contextError, refreshPosts } = useBlogData();
  
  // State management
  const [currentView, setCurrentView] = useState<ViewType>(initialView);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Combined error state
  const error = contextError || localError;
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // Posts are loaded from context - no separate loading needed

  // Load specific post when editing with slug
  useEffect(() => {
    if (initialView === 'edit' && slug && posts.length > 0) {
      const post = posts.find(p => p.slug === slug);
      if (post) {
        setEditingPost(post);
      } else {
        setLocalError(`Beitrag mit Slug "${slug}" nicht gefunden`);
        setCurrentView('overview');
      }
    }
  }, [initialView, slug, posts]);

  // Clear success messages after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Tab configuration
  const tabs: TabConfig[] = [
    { key: 'overview', label: 'Übersicht', component: BlogManagementDashboard },
    { key: 'statistics', label: 'Statistiken', component: BlogStatistics },
    { key: 'categories', label: 'Kategorien & Tags', component: CategoryTagManager },
    { key: 'drafts', label: 'Entwürfe', component: DraftManager },
  ];

  // CRUD Operations
  const handleCreateNew = useCallback(() => {
    setEditingPost(null);
    setCurrentView('create');
  }, []);

  const handleEdit = useCallback((post: BlogPost) => {
    setEditingPost(post);
    setCurrentView('edit');
  }, []);

  const handleView = useCallback((post: BlogPost) => {
    // Open blog post in new tab
    const blogUrl = `/blog/${post.slug}`;
    window.open(blogUrl, '_blank');
  }, []);

  const handleSave = useCallback(async (post: BlogPost) => {
    try {
      // Save to localStorage as draft or published
      const draftsJson = localStorage.getItem('blog_drafts');
      const drafts: BlogPost[] = draftsJson ? JSON.parse(draftsJson) : [];
      
      // Update or add post
      const existingIndex = drafts.findIndex(d => d.slug === post.slug);
      if (existingIndex >= 0) {
        drafts[existingIndex] = post;
      } else {
        drafts.push(post);
      }
      
      localStorage.setItem('blog_drafts', JSON.stringify(drafts));
      
      // Clear cache to ensure fresh data
      clearPostCaches();
      
      // Refresh posts list
      await refreshPosts();
      
      // Return to overview
      setCurrentView('overview');
      setEditingPost(null);
      setSuccessMessage(post.status === 'published' ? 'Beitrag erfolgreich veröffentlicht!' : 'Entwurf gespeichert!');
    } catch (err) {
      console.error('Error saving post:', err);
      setLocalError('Fehler beim Speichern des Beitrags');
    }
  }, [refreshPosts]);

  const handleDelete = useCallback((post: BlogPost) => {
    setDeleteTarget(post);
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    
    try {
      // Remove from localStorage
      const draftsJson = localStorage.getItem('blog_drafts');
      const drafts: BlogPost[] = draftsJson ? JSON.parse(draftsJson) : [];
      const updatedDrafts = drafts.filter(d => d.slug !== deleteTarget.slug);
      localStorage.setItem('blog_drafts', JSON.stringify(updatedDrafts));
      
      // Clear cache to ensure fresh data
      clearPostCaches();
      
      // Refresh posts list
      await refreshPosts();
      
      setShowDeleteModal(false);
      setDeleteTarget(null);
      setSuccessMessage('Beitrag erfolgreich gelöscht!');
    } catch (err) {
      console.error('Error deleting post:', err);
      setLocalError('Fehler beim Löschen des Beitrags');
    }
  }, [deleteTarget, refreshPosts]);

  const handleCancel = useCallback(() => {
    setCurrentView('overview');
    setEditingPost(null);
  }, []);

  const handleRefresh = useCallback(() => {
    refreshPosts();
  }, [refreshPosts]);

  const handleExport = useCallback(() => {
    const dataStr = JSON.stringify(posts, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `blog-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setSuccessMessage('Blog-Daten erfolgreich exportiert!');
  }, [posts]);

  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importedPosts = JSON.parse(e.target?.result as string);
        if (Array.isArray(importedPosts)) {
          localStorage.setItem('blog_drafts', JSON.stringify(importedPosts));
          
          // Clear cache to ensure fresh data
          clearPostCaches();
          
          await refreshPosts();
          setSuccessMessage('Blog-Daten erfolgreich importiert!');
        } else {
          setLocalError('Ungültiges Dateiformat');
        }
      } catch (err) {
        console.error('Error importing data:', err);
        setLocalError('Fehler beim Importieren der Daten');
      }
    };
    reader.readAsText(file);
  }, [refreshPosts]);

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
      padding: '1rem',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#0097B2',
      margin: 0,
    },
    backLink: {
      color: '#0097B2',
      textDecoration: 'none',
      fontSize: '0.9rem',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '0.25rem 0.5rem',
      borderRadius: '4px',
      transition: 'background-color 0.2s',
    },
    headerActions: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
    },
    button: {
      backgroundColor: '#0097B2',
      color: 'white',
      border: 'none',
      padding: '0.5rem 1rem',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.9rem',
    },
    secondaryButton: {
      backgroundColor: '#70A6B0',
      color: 'white',
      border: 'none',
      padding: '0.5rem 1rem',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.9rem',
    },
    hiddenInput: {
      display: 'none',
    },
    tabContainer: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      overflow: 'hidden',
    },
    tabBar: {
      display: 'flex',
      borderBottom: '1px solid #e9ecef',
    },
    tab: {
      padding: '1rem 1.5rem',
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.9rem',
      borderBottom: '3px solid transparent',
      transition: 'all 0.2s ease',
    },
    activeTab: {
      padding: '1rem 1.5rem',
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.9rem',
      borderBottom: '3px solid #0097B2',
      color: '#0097B2',
      fontWeight: 'bold',
    },
    content: {
      padding: '2rem',
      minHeight: '500px',
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '300px',
      color: '#666',
    },
    errorContainer: {
      padding: '1rem',
      backgroundColor: '#f8d7da',
      color: '#721c24',
      borderRadius: '4px',
      marginBottom: '1rem',
    },
    successContainer: {
      padding: '1rem',
      backgroundColor: '#d4edda',
      color: '#155724',
      borderRadius: '4px',
      marginBottom: '1rem',
    },
  };

  // Render current view content
  const renderContent = () => {
    if (isLoading) {
      return (
        <div style={styles.loadingContainer}>
          Lade Blog-Verwaltung...
        </div>
      );
    }

    if (currentView === 'create' || currentView === 'edit') {
      return (
        <BlogEditor
          post={editingPost || undefined}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      );
    }

    const currentTab = tabs.find(tab => tab.key === currentView);
    if (!currentTab) return null;

    const Component = currentTab.component;
    const commonProps = {
      posts,
      onEdit: handleEdit,
      onDelete: handleDelete,
      onRefresh: handleRefresh,
    };

    if (currentView === 'overview') {
      return (
        <Component
          {...commonProps}
          onView={handleView}
          onCreateNew={handleCreateNew}
        />
      );
    }

    return <Component {...commonProps} />;
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Blog Verwaltung</h1>
          <button 
            onClick={() => navigate('/admin')} 
            style={styles.backLink}
          >
            ← Zurück zum Dashboard
          </button>
        </div>
        
        {currentView === 'overview' && (
          <div style={styles.headerActions}>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              style={styles.hiddenInput}
              id="import-input"
            />
            <button
              style={styles.secondaryButton}
              onClick={() => document.getElementById('import-input')?.click()}
            >
              Importieren
            </button>
            <button style={styles.secondaryButton} onClick={handleExport}>
              Exportieren
            </button>
            <button style={styles.secondaryButton} onClick={handleRefresh}>
              Aktualisieren
            </button>
            <button style={styles.button} onClick={handleCreateNew}>
              Neuer Beitrag
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div style={styles.errorContainer}>
          {error}
        </div>
      )}
      
      {successMessage && (
        <div style={styles.successContainer}>
          {successMessage}
        </div>
      )}

      {/* Content */}
      {(currentView === 'create' || currentView === 'edit') ? (
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          {renderContent()}
        </div>
      ) : (
        <div style={styles.tabContainer}>
          {/* Tab Navigation */}
          <div style={styles.tabBar}>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                style={currentView === tab.key ? styles.activeTab : styles.tab}
                onClick={() => setCurrentView(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={styles.content}>
            {renderContent()}
          </div>
        </div>
      )}

      {/* Modals */}
      {showDeleteModal && deleteTarget && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          posts={deleteTarget}
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setDeleteTarget(null);
          }}
        />
      )}

      {showImageModal && (
        <ImageUploadModal
          isOpen={showImageModal}
          onInsert={(imageUrl, altText) => {
            console.log('Image uploaded:', imageUrl, altText);
            setShowImageModal(false);
          }}
          onClose={() => setShowImageModal(false)}
        />
      )}
    </div>
  );
};

export default BlogManagement;