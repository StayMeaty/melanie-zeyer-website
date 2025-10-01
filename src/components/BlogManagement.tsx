import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/auth';
import { BlogPost } from '../types/blog';
import { loadAllPosts } from '../services/blogContent';
import BlogManagementDashboard from './BlogManagementDashboard';
import BlogEditor from './BlogEditor';
import BlogStatistics from './BlogStatistics';
import CategoryTagManager from './CategoryTagManager';
import DraftManager from './DraftManager';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import ImageUploadModal from './ImageUploadModal';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface BlogManagementProps {}

type ViewType = 'overview' | 'statistics' | 'categories' | 'drafts' | 'create' | 'edit';

interface TabConfig {
  key: ViewType;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>;
}

const BlogManagement: React.FC<BlogManagementProps> = () => {
  const { } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // Load posts from both markdown files and localStorage drafts
  const loadPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load published posts from markdown files
      const publishedPosts = await loadAllPosts();
      
      // Load drafts from localStorage
      const draftsJson = localStorage.getItem('blog_drafts');
      const drafts: BlogPost[] = draftsJson ? JSON.parse(draftsJson) : [];
      
      // Merge posts, giving priority to localStorage versions
      const allPosts = [...publishedPosts];
      drafts.forEach(draft => {
        const existingIndex = allPosts.findIndex(p => p.slug === draft.slug);
        if (existingIndex >= 0) {
          allPosts[existingIndex] = draft; // Override with draft version
        } else {
          allPosts.push(draft); // Add new draft
        }
      });
      
      setPosts(allPosts);
    } catch (err) {
      console.error('Error loading posts:', err);
      setError('Fehler beim Laden der Blog-Beiträge');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load posts on mount
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

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
      
      // Refresh posts list
      await loadPosts();
      
      // Return to overview
      setCurrentView('overview');
      setEditingPost(null);
      setSuccessMessage(post.status === 'published' ? 'Beitrag erfolgreich veröffentlicht!' : 'Entwurf gespeichert!');
    } catch (err) {
      console.error('Error saving post:', err);
      setError('Fehler beim Speichern des Beitrags');
    }
  }, [loadPosts]);

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
      
      // Refresh posts list
      await loadPosts();
      
      setShowDeleteModal(false);
      setDeleteTarget(null);
      setSuccessMessage('Beitrag erfolgreich gelöscht!');
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('Fehler beim Löschen des Beitrags');
    }
  }, [deleteTarget, loadPosts]);

  const handleCancel = useCallback(() => {
    setCurrentView('overview');
    setEditingPost(null);
  }, []);

  const handleRefresh = useCallback(() => {
    loadPosts();
  }, [loadPosts]);

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
          await loadPosts();
          setSuccessMessage('Blog-Daten erfolgreich importiert!');
        } else {
          setError('Ungültiges Dateiformat');
        }
      } catch (err) {
        console.error('Error importing data:', err);
        setError('Fehler beim Importieren der Daten');
      }
    };
    reader.readAsText(file);
  }, [loadPosts]);

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
          onView={(post: BlogPost) => console.log('View post:', post)}
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
          post={deleteTarget}
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setDeleteTarget(null);
          }}
        />
      )}

      {showImageModal && (
        <ImageUploadModal
          onUpload={(imageUrl) => {
            console.log('Image uploaded:', imageUrl);
            setShowImageModal(false);
          }}
          onCancel={() => setShowImageModal(false)}
        />
      )}
    </div>
  );
};

export default BlogManagement;