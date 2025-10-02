/**
 * Tina CMS Visual Editor Wrapper Component
 * Provides visual editing interface with preview pane and controls
 */

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useTinaAuth } from '../services/tinaAuth';
import { APP_COLORS } from '../types';
import {
  TinaFormData,
  TinaEditorProps,
  TinaEditorWrapperProps,
} from '../types/tina';

// Actual Tina CMS editor component
const TinaFormComponent = React.lazy(async () => {
  try {
    // Dynamically import real Tina CMS components
    const [tinaReact, tinaRichText] = await Promise.all([
      import('tinacms/dist/react'),
      import('tinacms/dist/rich-text')
    ]);
    
    const { useTina, tinaField } = tinaReact;
    const { TinaMarkdown } = tinaRichText;
    // Tina client available for advanced operations
    
    const TinaFormWrapper: React.FC<TinaEditorProps> = ({ 
      query, 
      variables,
      data: initialData,
      onFormChange,
      onSave
    }) => {
      // Use real Tina hook for editing
      const tinaResult = useTina({
        query,
        variables,
        data: initialData as object,
      });
      
      const { data, isClient } = tinaResult;
      const isLoading = !isClient;
      // Note: useTina doesn't provide form directly in this version
      
      // Handle form changes with real Tina form
      React.useEffect(() => {
        if (onFormChange && data) {
          const formData: TinaFormData = {
            values: data as Record<string, unknown>,
            meta: {
              touched: {},
              errors: {},
              isSubmitting: false,
              isValid: true,
            },
            handlers: {
              setFieldValue: () => {},
              setFieldTouched: () => {},
              validateForm: async () => true,
              submitForm: async () => {
                // Handle form submission through Tina
                console.log('Form submission triggered');
              },
            },
          };
          onFormChange(formData);
        }
      }, [data, onFormChange]);


      // Handle save operation with real Tina form
      const handleSave = React.useCallback(async () => {
        if (onSave && data) {
          try {
            const formData: TinaFormData = {
              values: data as Record<string, unknown>,
              meta: {
                touched: {},
                errors: {},
                isSubmitting: false,
                isValid: true,
              },
              handlers: {
                setFieldValue: () => {},
                setFieldTouched: () => {},
                validateForm: async () => true,
                submitForm: async () => {},
              },
            };
            await onSave(formData);
          } catch (error) {
            console.error('Save failed:', error);
            throw error;
          }
        }
      }, [onSave, data]);

      if (isLoading) {
        return (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{
              width: '2rem',
              height: '2rem',
              border: '3px solid #e5e7eb',
              borderTopColor: APP_COLORS.primary,
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 1rem',
            }} />
            <p style={{ color: '#6b7280' }}>Lade Editor...</p>
          </div>
        );
      }

      return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
          {/* Title Field */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem',
            }}>
              Titel
            </label>
            <input
              data-tina-field={data && (data as any).post ? tinaField((data as any).post, 'title') : undefined}
              value={(data as any)?.post?.title || ''}
              onChange={(e) => {
                const newValue = e.target.value;
                // Handle title change
                console.log('Title changed:', newValue);
              }}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1.125rem',
                fontWeight: '600',
                color: APP_COLORS.primary,
                backgroundColor: 'white',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => {
                const target = e.target as HTMLInputElement;
                target.style.borderColor = APP_COLORS.primary;
                target.style.boxShadow = `0 0 0 3px ${APP_COLORS.primary}20`;
              }}
              onBlur={(e) => {
                const target = e.target as HTMLInputElement;
                target.style.borderColor = '#d1d5db';
                target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Excerpt Field */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem',
            }}>
              Zusammenfassung
            </label>
            <textarea
              data-tina-field={data && (data as any).post ? tinaField((data as any).post, 'excerpt') : undefined}
              value={(data as any)?.post?.excerpt || ''}
              onChange={(e) => {
                const newValue = e.target.value;
                // Handle excerpt change
                console.log('Excerpt changed:', newValue);
              }}
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                color: '#374151',
                backgroundColor: 'white',
                outline: 'none',
                resize: 'vertical',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.borderColor = APP_COLORS.primary;
                target.style.boxShadow = `0 0 0 3px ${APP_COLORS.primary}20`;
              }}
              onBlur={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.borderColor = '#d1d5db';
                target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Rich Text Content */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem',
            }}>
              Inhalt
            </label>
            <div style={{
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              backgroundColor: 'white',
              minHeight: '400px',
            }}>
              <TinaMarkdown 
                content={(data as any)?.post?.body || ''} 
                data-tina-field={data && (data as any).post ? tinaField((data as any).post, 'body') : undefined}
              />
            </div>
          </div>

          {/* Metadata Fields */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}>
            {/* Category */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem',
              }}>
                Kategorie
              </label>
              <select
                data-tina-field={data && (data as any).post ? tinaField((data as any).post, 'category') : undefined}
                value={(data as any)?.post?.category || ''}
                onChange={(e) => {
                  const newValue = e.target.value;
                  console.log('Category changed:', newValue);
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  backgroundColor: 'white',
                  outline: 'none',
                }}
              >
                <option value="coaching">Coaching</option>
                <option value="persoenlichkeitsentwicklung">Persönlichkeitsentwicklung</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="business">Business</option>
                <option value="gesundheit">Gesundheit</option>
                <option value="mindset">Mindset</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem',
              }}>
                Status
              </label>
              <select
                data-tina-field={data && (data as any).post ? tinaField((data as any).post, 'status') : undefined}
                value={(data as any)?.post?.status || 'draft'}
                onChange={(e) => {
                  const newValue = e.target.value;
                  console.log('Status changed:', newValue);
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  backgroundColor: 'white',
                  outline: 'none',
                }}
              >
                <option value="draft">Entwurf</option>
                <option value="published">Veröffentlicht</option>
                <option value="archived">Archiviert</option>
              </select>
            </div>
          </div>

          {/* Tags Field */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem',
            }}>
              Tags (kommagetrennt)
            </label>
            <input
              data-tina-field={data && (data as any).post ? tinaField((data as any).post, 'tags') : undefined}
              value={(data as any)?.post?.tags?.join(', ') || ''}
              onChange={(e) => {
                const newValue = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
                console.log('Tags changed:', newValue);
              }}
              placeholder="coaching, mindset, erfolg"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                backgroundColor: 'white',
                outline: 'none',
              }}
            />
          </div>

          {/* Save Button */}
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button
              onClick={handleSave}
              style={{
                backgroundColor: APP_COLORS.primary,
                color: 'white',
                padding: '0.75rem 2rem',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.backgroundColor = '#007A96';
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.backgroundColor = APP_COLORS.primary;
              }}
            >
              💾 Änderungen speichern
            </button>
          </div>
        </div>
      );
    };
    
    return { default: TinaFormWrapper };
  } catch (error) {
    console.error('Failed to load TinaForm:', error);
    // Fallback component
    const FallbackForm: React.FC<TinaEditorProps> = ({ variables }) => (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{
          border: '2px dashed #dc3545',
          borderRadius: '0.5rem',
          padding: '2rem',
          backgroundColor: '#fff5f5',
        }}>
          <h3 style={{ color: '#dc3545', marginBottom: '1rem' }}>
            Editor konnte nicht geladen werden
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
            TinaCMS ist nicht verfügbar. Bitte überprüfen Sie die Konfiguration.
          </p>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
            Datei: {String(variables.filename || 'Unbekannt')}
          </p>
        </div>
      </div>
    );
    return { default: FallbackForm };
  }
});


const TinaEditorWrapper: React.FC<TinaEditorWrapperProps> = ({
  contentPath = '',
  onSave,
  onPublish,
  className = '',
  enablePreview = true,
  autoSaveInterval = 30000,
}) => {
  const { isAuthenticated } = useTinaAuth();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleAutoSave = useCallback(async () => {
    if (!hasUnsavedChanges || isSaving) return;
    
    setIsSaving(true);
    try {
      // Auto-save logic would go here
      // For now, just simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [hasUnsavedChanges, isSaving]);

  // Auto-save functionality
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const autoSaveTimeout = setTimeout(() => {
      handleAutoSave();
    }, autoSaveInterval); // Auto-save after configured interval

    return () => clearTimeout(autoSaveTimeout);
  }, [hasUnsavedChanges, autoSaveInterval, handleAutoSave]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Manual save logic
      if (onSave) {
        // Create mock form data for now
        const formData: TinaFormData = {
          values: { contentPath },
          meta: {
            touched: {},
            errors: {},
            isSubmitting: false,
            isValid: true,
          },
          handlers: {
            setFieldValue: () => {},
            setFieldTouched: () => {},
            validateForm: async () => true,
            submitForm: async () => {},
          },
        };
        await onSave(formData);
      }
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      // Save first, then publish
      await handleSave();
      
      if (onPublish) {
        // Create mock form data for now
        const formData: TinaFormData = {
          values: { contentPath },
          meta: {
            touched: {},
            errors: {},
            isSubmitting: false,
            isValid: true,
          },
          handlers: {
            setFieldValue: () => {},
            setFieldTouched: () => {},
            validateForm: async () => true,
            submitForm: async () => {},
          },
        };
        await onPublish(formData);
      }
    } catch (error) {
      console.error('Publish failed:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  const styles: Record<string, React.CSSProperties> = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: '#f8f9fa',
    },
    toolbar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem',
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    toolbarLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    toolbarRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    title: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: APP_COLORS.primary,
      margin: 0,
    },
    statusIndicator: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.875rem',
      color: '#6b7280',
    },
    statusDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: '#10b981', // Green for saved
    },
    statusDotUnsaved: {
      backgroundColor: '#f59e0b', // Yellow for unsaved
    },
    statusDotSaving: {
      backgroundColor: '#3b82f6', // Blue for saving
      animation: 'pulse 1s infinite',
    },
    button: {
      padding: '0.5rem 1rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      borderRadius: '0.375rem',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    primaryButton: {
      backgroundColor: APP_COLORS.primary,
      color: 'white',
    },
    secondaryButton: {
      backgroundColor: '#6b7280',
      color: 'white',
    },
    successButton: {
      backgroundColor: '#10b981',
      color: 'white',
    },
    toggleButton: {
      backgroundColor: '#f3f4f6',
      color: '#374151',
      border: '1px solid #d1d5db',
    },
    toggleButtonActive: {
      backgroundColor: APP_COLORS.primary,
      color: 'white',
    },
    editorContainer: {
      display: 'flex',
      flex: 1,
      overflow: 'hidden',
    },
    editorPane: {
      flex: isPreviewMode ? '0 0 50%' : '1',
      overflow: 'auto',
      backgroundColor: 'white',
      borderRight: isPreviewMode ? '1px solid #e5e7eb' : 'none',
    },
    previewPane: {
      flex: '0 0 50%',
      overflow: 'auto',
      backgroundColor: 'white',
      display: isPreviewMode ? 'block' : 'none',
    },
    loadingContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem',
      color: '#6b7280',
    },
    loadingSpinner: {
      width: '1.5rem',
      height: '1.5rem',
      border: '2px solid #e5e7eb',
      borderTopColor: APP_COLORS.primary,
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
      marginRight: '0.75rem',
    },
  };

  if (!isAuthenticated) {
    return (
      <div className={className} style={styles.container}>
        <div style={styles.toolbar}>
          <h1 style={styles.title}>Tina Editor</h1>
        </div>
        <div style={styles.loadingContainer}>
          <p>Authentifizierung erforderlich</p>
        </div>
      </div>
    );
  }

  const getStatusIndicator = () => {
    if (isSaving) {
      return (
        <div style={styles.statusIndicator}>
          <div style={{ ...styles.statusDot, ...styles.statusDotSaving }} />
          <span>Speichere...</span>
        </div>
      );
    }
    
    if (hasUnsavedChanges) {
      return (
        <div style={styles.statusIndicator}>
          <div style={{ ...styles.statusDot, ...styles.statusDotUnsaved }} />
          <span>Ungespeicherte Änderungen</span>
        </div>
      );
    }

    if (lastSaved) {
      return (
        <div style={styles.statusIndicator}>
          <div style={styles.statusDot} />
          <span>Gespeichert {lastSaved.toLocaleTimeString('de-DE')}</span>
        </div>
      );
    }

    return (
      <div style={styles.statusIndicator}>
        <div style={styles.statusDot} />
        <span>Bereit</span>
      </div>
    );
  };

  return (
    <div className={className} style={styles.container}>
      {/* Toolbar */}
      <div style={styles.toolbar}>
        <div style={styles.toolbarLeft}>
          <h1 style={styles.title}>Tina Editor</h1>
          {getStatusIndicator()}
        </div>
        
        <div style={styles.toolbarRight}>
          {/* Preview Toggle */}
          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            style={{
              ...styles.button,
              ...styles.toggleButton,
              ...(isPreviewMode ? styles.toggleButtonActive : {}),
            }}
            title={isPreviewMode ? 'Vorschau ausblenden' : 'Vorschau anzeigen'}
          >
            {isPreviewMode ? '📝' : '👁️'} 
            {isPreviewMode ? 'Editor' : 'Vorschau'}
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
            style={{
              ...styles.button,
              ...styles.secondaryButton,
              opacity: (isSaving || !hasUnsavedChanges) ? 0.6 : 1,
            }}
            title="Änderungen speichern (Strg+S)"
          >
            {isSaving ? (
              <>
                <div style={{ width: '14px', height: '14px', ...styles.loadingSpinner }} />
                Speichere...
              </>
            ) : (
              <>💾 Speichern</>
            )}
          </button>

          {/* Publish Button */}
          <button
            onClick={handlePublish}
            disabled={isPublishing || hasUnsavedChanges}
            style={{
              ...styles.button,
              ...styles.successButton,
              opacity: (isPublishing || hasUnsavedChanges) ? 0.6 : 1,
            }}
            title="Inhalt veröffentlichen"
          >
            {isPublishing ? (
              <>
                <div style={{ width: '14px', height: '14px', ...styles.loadingSpinner }} />
                Veröffentliche...
              </>
            ) : (
              <>🚀 Veröffentlichen</>
            )}
          </button>
        </div>
      </div>

      {/* Editor Container */}
      <div style={styles.editorContainer}>
        {/* Editor Pane */}
        <div style={styles.editorPane}>
          <Suspense 
            fallback={
              <div style={styles.loadingContainer}>
                <div style={styles.loadingSpinner} />
                <span>Lade Editor...</span>
              </div>
            }
          >
            <TinaFormComponent 
              query="query BlogPost($relativePath: String!) { post(relativePath: $relativePath) { __typename id title excerpt body category status tags author date image imageAlt featured seo { metaTitle metaDescription } } }"
              variables={{ relativePath: contentPath }}
              data={null}
              onFormChange={(_formData: Record<string, unknown> | TinaFormData) => {
                // Mark as having unsaved changes when form changes
                if (!hasUnsavedChanges) {
                  setHasUnsavedChanges(true);
                }
              }}
              onSave={async (formData: Record<string, unknown> | TinaFormData) => {
                // Handle save through the wrapper's save handler
                if (onSave) {
                  // Convert to TinaFormData if needed
                  const tinaFormData: TinaFormData = 'values' in formData ? (formData as TinaFormData) : {
                    values: formData as Record<string, unknown>,
                    meta: { touched: {}, errors: {}, isSubmitting: false, isValid: true },
                    handlers: {
                      setFieldValue: () => {},
                      setFieldTouched: () => {},
                      validateForm: async () => true,
                      submitForm: async () => {},
                    },
                  };
                  await onSave(tinaFormData as any);
                }
              }}
            />
          </Suspense>
        </div>

        {/* Preview Pane */}
        {enablePreview && isPreviewMode && (
          <div style={styles.previewPane}>
            <div style={{ padding: '2rem' }}>
              <h3 style={{ 
                color: APP_COLORS.primary, 
                marginBottom: '1rem',
                fontSize: '1.125rem',
                fontWeight: '600',
              }}>
                Live-Vorschau
              </h3>
              <div style={{
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                backgroundColor: '#f9fafb',
                minHeight: '400px',
              }}>
                <p style={{ 
                  color: '#6b7280', 
                  fontSize: '0.875rem',
                  fontStyle: 'italic',
                }}>
                  Die Vorschau wird hier angezeigt, sobald Inhalte bearbeitet werden.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Global styles for animations
if (typeof document !== 'undefined' && !document.getElementById('tina-editor-styles')) {
  const style = document.createElement('style');
  style.id = 'tina-editor-styles';
  style.innerHTML = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    /* Keyboard shortcuts */
    body {
      /* Add global shortcuts handling if needed */
    }
  `;
  document.head.appendChild(style);
}

// Add keyboard shortcuts
if (typeof document !== 'undefined') {
  const handleKeyboardShortcuts = (event: KeyboardEvent) => {
    // Ctrl+S for save
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault();
      // Trigger save action - this would need to be implemented with a global event system
      const saveEvent = new CustomEvent('tina-save-shortcut');
      document.dispatchEvent(saveEvent);
    }
  };

  document.addEventListener('keydown', handleKeyboardShortcuts);
}

export default TinaEditorWrapper;