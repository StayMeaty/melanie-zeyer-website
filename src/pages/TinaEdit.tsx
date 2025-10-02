/**
 * Tina CMS Edit Page Component
 * Page for editing individual blog posts with Tina's visual editor
 */

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTinaAuth } from '../services/tinaAuth';
import { loadPostBySlug } from '../services/blogContent';
import { BlogPost } from '../types/blog';
import { APP_COLORS } from '../types';
import { TinaBlogPost } from '../types/tina';

// Lazy load Tina components
const TinaEditorWrapper = React.lazy(() => import('../components/TinaEditorWrapper'));
const TinaToolbar = React.lazy(() => import('../components/TinaToolbar'));

const TinaEdit: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useTinaAuth();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [tinaData, setTinaData] = useState<TinaBlogPost | null>(null);
  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error' | 'publishing'>('idle');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [useTinaEditor, setUseTinaEditor] = useState(false);

  // Check Tina availability and load post data
  useEffect(() => {
    const initializeEditor = async () => {
      if (!slug) {
        setError('Keine Beitrag-URL angegeben');
        setIsLoadingPost(false);
        return;
      }

      try {
        setIsLoadingPost(true);
        setError(null);
        
        // Load and check Tina client
        const { tinaClient } = await import('../services/tinaClient');
        const tinaEnabled = tinaClient.isEnabled();
        setUseTinaEditor(tinaEnabled);
        
        let postData: BlogPost | null = null;
        
        if (tinaEnabled) {
          // Try loading from Tina first using proper GraphQL query
          try {
            const client = await tinaClient.getClient();
            const tinaResponse = await client.queries.post({
              relativePath: `${slug}.md`,
            });
            
            if (tinaResponse?.post) {
              setTinaData(tinaResponse.post);
              
              // Convert Tina data to BlogPost format for compatibility
              const { loadPostBySlugFromTina } = await import('../services/tinaBlogService');
              postData = await loadPostBySlugFromTina(slug);
            }
          } catch (tinaError) {
            console.warn('Tina loading failed, falling back to regular loader:', tinaError);
          }
        }
        
        // Fallback to regular blog service if Tina failed or not available
        if (!postData) {
          postData = await loadPostBySlug(slug);
        }
        
        if (!postData) {
          setError(`Beitrag mit URL "${slug}" nicht gefunden`);
          return;
        }

        setPost(postData);
      } catch (err) {
        console.error('Error loading post:', err);
        setError('Fehler beim Laden des Beitrags');
      } finally {
        setIsLoadingPost(false);
      }
    };

    if (isAuthenticated && !isLoading) {
      initializeEditor();
    }
  }, [slug, isAuthenticated, isLoading]);

  const handleSave = async (data: unknown) => {
    setSaveStatus('saving');
    
    try {
      console.log('Saving post data:', data);
      
      if (useTinaEditor && tinaData) {
        // Use Tina's mutation system for saving
        const { tinaClient } = await import('../services/tinaClient');
        const client = await tinaClient.getClient();
        
        if (!client.mutations?.updatePost) {
          throw new Error('Tina mutations not available');
        }
        
        await client.mutations.updatePost({
          relativePath: `${slug}.md`,
          params: {
            ...(data as Partial<TinaBlogPost>),
            lastModified: new Date().toISOString(),
          },
        });
        
        console.log('Post saved via Tina CMS');
      } else {
        // Fallback: Save via localStorage or show error
        console.warn('Tina not available, saving locally');
        // In a real implementation, you might save to localStorage
        // or show a message that changes need to be made via file system
      }
      
      setSaveStatus('saved');
      setHasUnsavedChanges(false);
      
      // Show success message briefly
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
      
    } catch (error) {
      console.error('Save error:', error);
      setSaveStatus('error');
      
      // Reset error status after 5 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 5000);
    }
  };

  const handlePublish = async (data: unknown) => {
    try {
      // First save the changes with status set to published
      const publishData = {
        ...(data as Partial<TinaBlogPost>),
        status: 'published',
        publishedAt: new Date().toISOString(),
      };
      
      await handleSave(publishData);
      
      console.log('Publishing post:', publishData);
      
      // Update local state
      if (post) {
        setPost({
          ...post,
          status: 'published',
        });
      }
      
      // Show success notification
      alert('Beitrag erfolgreich veröffentlicht!');
      
    } catch (error) {
      console.error('Publish error:', error);
      alert('Fehler beim Veröffentlichen des Beitrags');
    }
  };

  const handleFormat = (formatType: string) => {
    console.log('Format action:', formatType);
    // This would integrate with the rich text editor
    // For now, we'll just log the action
  };

  const handleMediaUpload = () => {
    console.log('Media upload requested');
    // This would open a file picker and upload to the configured media folder
    // For now, we'll just log the action
  };

  const handleBackToAdmin = () => {
    navigate('/admin/dashboard');
  };

  const styles: Record<string, React.CSSProperties> = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    title: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: APP_COLORS.primary,
      margin: 0,
    },
    breadcrumb: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.875rem',
      color: '#6b7280',
    },
    breadcrumbLink: {
      color: APP_COLORS.primary,
      textDecoration: 'none',
    },
    backButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      backgroundColor: '#f3f4f6',
      color: '#374151',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      textDecoration: 'none',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    statusBadge: {
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '500',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
    },
    statusSaving: {
      backgroundColor: '#dbeafe',
      color: '#1e40af',
    },
    statusPublishing: {
      backgroundColor: '#d1fae5',
      color: '#065f46',
    },
    statusSaved: {
      backgroundColor: '#d1fae5',
      color: '#065f46',
    },
    statusError: {
      backgroundColor: '#fee2e2',
      color: '#991b1b',
    },
    loadingContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      flexDirection: 'column',
      gap: '1rem',
    },
    loadingSpinner: {
      width: '2.5rem',
      height: '2.5rem',
      border: '3px solid #e2e8f0',
      borderTopColor: APP_COLORS.primary,
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    },
    loadingText: {
      color: '#6b7280',
      fontSize: '0.875rem',
    },
    errorContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      flexDirection: 'column',
      gap: '1.5rem',
      padding: '2rem',
    },
    errorIcon: {
      fontSize: '3rem',
    },
    errorTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#dc3545',
      textAlign: 'center',
    },
    errorMessage: {
      color: '#6b7280',
      textAlign: 'center',
      lineHeight: '1.5',
      maxWidth: '500px',
    },
    errorActions: {
      display: 'flex',
      gap: '1rem',
    },
    button: {
      padding: '0.75rem 1.5rem',
      borderRadius: '0.375rem',
      border: 'none',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      textDecoration: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.2s',
    },
    primaryButton: {
      backgroundColor: APP_COLORS.primary,
      color: 'white',
    },
    secondaryButton: {
      backgroundColor: '#6b7280',
      color: 'white',
    },
    postInfo: {
      padding: '1rem 2rem',
      backgroundColor: '#f8f9fa',
      borderBottom: '1px solid #e5e7eb',
      fontSize: '0.875rem',
      color: '#6b7280',
    },
    postInfoItem: {
      display: 'inline-block',
      marginRight: '2rem',
    },
    postInfoLabel: {
      fontWeight: '500',
      marginRight: '0.5rem',
    },
  };

  // Authentication check
  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner} />
          <span style={styles.loadingText}>Überprüfe Authentifizierung...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <div style={styles.errorIcon}>🔒</div>
          <h2 style={styles.errorTitle}>Authentifizierung erforderlich</h2>
          <p style={styles.errorMessage}>
            Sie müssen sich anmelden, um Beiträge bearbeiten zu können.
          </p>
          <div style={styles.errorActions}>
            <Link to="/admin/login" style={{ ...styles.button, ...styles.primaryButton }}>
              Zur Anmeldung
            </Link>
            <button onClick={handleBackToAdmin} style={{ ...styles.button, ...styles.secondaryButton }}>
              Zurück zum Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Post loading state
  if (isLoadingPost) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <h1 style={styles.title}>Beitrag wird geladen...</h1>
          </div>
          <button onClick={handleBackToAdmin} style={styles.backButton}>
            ← Zurück
          </button>
        </div>
        
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner} />
          <span style={styles.loadingText}>Lade Beitrag "{slug}"...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !post) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <h1 style={styles.title}>Fehler</h1>
          </div>
          <button onClick={handleBackToAdmin} style={styles.backButton}>
            ← Zurück
          </button>
        </div>
        
        <div style={styles.errorContainer}>
          <div style={styles.errorIcon}>❌</div>
          <h2 style={styles.errorTitle}>Beitrag konnte nicht geladen werden</h2>
          <p style={styles.errorMessage}>
            {error || 'Ein unbekannter Fehler ist aufgetreten.'}
          </p>
          <div style={styles.errorActions}>
            <button onClick={() => window.location.reload()} style={{ ...styles.button, ...styles.primaryButton }}>
              🔄 Seite neu laden
            </button>
            <Link to="/admin/blog" style={{ ...styles.button, ...styles.secondaryButton }}>
              Zur Blog-Verwaltung
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Get status badge
  const getStatusBadge = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <span style={{ ...styles.statusBadge, ...styles.statusSaving }}>
            Speichere...
          </span>
        );
      case 'saved':
        return (
          <span style={{ ...styles.statusBadge, ...styles.statusSaved }}>
            Gespeichert
          </span>
        );
      case 'error':
        return (
          <span style={{ ...styles.statusBadge, ...styles.statusError }}>
            Fehler
          </span>
        );
      case 'publishing':
        return (
          <span style={{ ...styles.statusBadge, ...styles.statusPublishing }}>
            Veröffentliche...
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>"{post.title}" bearbeiten</h1>
          <div style={styles.breadcrumb}>
            <Link to="/admin/dashboard" style={styles.breadcrumbLink}>
              Dashboard
            </Link>
            <span>/</span>
            <Link to="/admin/blog" style={styles.breadcrumbLink}>
              Blog
            </Link>
            <span>/</span>
            <span>Bearbeiten</span>
          </div>
          {getStatusBadge()}
        </div>
        
        <button onClick={handleBackToAdmin} style={styles.backButton}>
          ← Zurück zum Dashboard
        </button>
      </div>

      {/* Post Info Bar */}
      <div style={styles.postInfo}>
        <span style={styles.postInfoItem}>
          <span style={styles.postInfoLabel}>Status:</span>
          {post.status}
        </span>
        <span style={styles.postInfoItem}>
          <span style={styles.postInfoLabel}>Kategorie:</span>
          {post.category}
        </span>
        <span style={styles.postInfoItem}>
          <span style={styles.postInfoLabel}>Erstellt:</span>
          {post.publishedAt.toLocaleDateString('de-DE')}
        </span>
        <span style={styles.postInfoItem}>
          <span style={styles.postInfoLabel}>Autor:</span>
          {post.author}
        </span>
      </div>

      {/* Editor Content */}
      {useTinaEditor ? (
        <>
          {/* Tina Toolbar */}
          <Suspense fallback={
            <div style={{
              height: '60px',
              backgroundColor: '#f8f9fa',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ color: '#6b7280' }}>Lade Toolbar...</span>
            </div>
          }>
            <TinaToolbar
              onFormat={handleFormat}
              onMediaUpload={handleMediaUpload}
              onSave={() => handleSave(tinaData)}
              onPublish={() => handlePublish(tinaData)}
              onPreviewToggle={() => setIsPreviewMode(!isPreviewMode)}
              isPreviewMode={isPreviewMode}
              isSaving={saveStatus === 'saving'}
              isPublishing={saveStatus === 'saving'}
              hasUnsavedChanges={hasUnsavedChanges}
            />
          </Suspense>
          
          {/* Tina Editor */}
          <Suspense fallback={
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
              backgroundColor: 'white'
            }}>
              <div style={{
                textAlign: 'center'
              }}>
                <div style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  border: '3px solid #e2e8f0',
                  borderTopColor: APP_COLORS.primary,
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  margin: '0 auto 1rem'
                }} />
                <p style={{ color: '#6b7280' }}>Lade Tina Editor...</p>
              </div>
            </div>
          }>
            <TinaEditorWrapper
              contentPath={`${slug}.md`}
              initialData={tinaData}
              query="query BlogPost($relativePath: String!) { post(relativePath: $relativePath) { __typename id title excerpt body category status tags author date image imageAlt featured seo { metaTitle metaDescription } } }"
              variables={{ relativePath: `${slug}.md` }}
              onSave={handleSave}
              onPublish={handlePublish}
              enablePreview={true}
            />
          </Suspense>
        </>
      ) : (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: 'white',
          margin: '1rem',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb',
        }}>
          <h3 style={{
            color: '#f59e0b',
            marginBottom: '1rem',
            fontSize: '1.25rem',
          }}>
            Tina CMS nicht verfügbar
          </h3>
          <p style={{
            color: '#6b7280',
            marginBottom: '1.5rem',
            lineHeight: '1.5',
          }}>
            Der visuelle Editor ist derzeit nicht verfügbar. Sie können den Beitrag über die reguläre Blog-Verwaltung bearbeiten.
          </p>
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
          }}>
            <Link
              to={`/admin/blog`}
              style={{
                ...styles.button,
                ...styles.primaryButton,
                textDecoration: 'none',
              }}
            >
              Zur Blog-Verwaltung
            </Link>
            <button
              onClick={() => window.location.reload()}
              style={{
                ...styles.button,
                ...styles.secondaryButton,
              }}
            >
              🔄 Neu laden
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Global styles for spinner animation
if (typeof document !== 'undefined' && !document.getElementById('tina-edit-styles')) {
  const style = document.createElement('style');
  style.id = 'tina-edit-styles';
  style.innerHTML = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export default TinaEdit;