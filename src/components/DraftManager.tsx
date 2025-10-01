import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BlogPost } from '../types/blog';

/**
 * Draft metadata interface for storage management
 */
export interface DraftMetadata {
  id: string;
  postId?: string;
  title: string;
  savedAt: Date;
  wordCount: number;
  author: string;
  version: number;
}

/**
 * Draft version interface for version history
 */
interface DraftVersion {
  version: number;
  savedAt: Date;
  content: string;
  metadata: Omit<DraftMetadata, 'version'>;
  changesSummary?: string;
}

/**
 * Stored draft data structure
 */
interface StoredDraft {
  metadata: DraftMetadata;
  content: string;
  post: Partial<BlogPost>;
}

/**
 * Component props interface
 */
export interface DraftManagerProps {
  currentPost?: BlogPost;
  onRestore: (post: BlogPost) => void;
  onDelete: (draftId: string) => void;
  autoSaveEnabled?: boolean;
}

/**
 * Storage configuration constants
 */
const STORAGE_CONFIG = {
  maxTotalSize: 10 * 1024 * 1024, // 10MB total storage limit
  maxContentSize: 1024 * 1024, // 1MB per content before compression
  maxVersions: 10, // Maximum versions per draft
  autoSaveInterval: 30000, // 30 seconds
  keyPrefix: 'draft_',
  metadataKey: 'draft_metadata',
  cleanupAfterDays: 30,
} as const;

/**
 * DraftManager component for auto-saving and managing draft blog posts
 */
const DraftManager: React.FC<DraftManagerProps> = ({
  currentPost,
  onRestore,
  onDelete,
  autoSaveEnabled = true,
}) => {
  const [drafts, setDrafts] = useState<DraftMetadata[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<string | null>(null);
  const [draftVersions, setDraftVersions] = useState<DraftVersion[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [storageUsage, setStorageUsage] = useState(0);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false);
  const [conflictData, setConflictData] = useState<{
    current: BlogPost;
    saved: StoredDraft;
  } | null>(null);

  const autoSaveTimeoutRef = useRef<number>();
  const lastContentRef = useRef<string>('');

  /**
   * Generate unique draft ID
   */
  const generateDraftId = (): string => {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  /**
   * Calculate word count from content
   */
  const calculateWordCount = (content: string): number => {
    return content.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  /**
   * Compress content if it exceeds size limit
   */
  const compressContent = (content: string): string => {
    if (content.length > STORAGE_CONFIG.maxContentSize) {
      // Simple compression: remove extra whitespace and newlines
      return content
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n')
        .trim();
    }
    return content;
  };

  /**
   * Calculate total storage usage
   */
  const calculateStorageUsage = useCallback((): number => {
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_CONFIG.keyPrefix) || key === STORAGE_CONFIG.metadataKey) {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += new Blob([value]).size;
        }
      }
    }
    return totalSize;
  }, []);

  /**
   * Load all draft metadata from localStorage
   */
  const loadDraftMetadata = useCallback((): DraftMetadata[] => {
    try {
      const metadataStr = localStorage.getItem(STORAGE_CONFIG.metadataKey);
      if (!metadataStr) return [];

      const metadata: DraftMetadata[] = JSON.parse(metadataStr);
      
      // Convert savedAt strings back to Date objects
      return metadata.map(draft => ({
        ...draft,
        savedAt: new Date(draft.savedAt),
      }));
    } catch (error) {
      console.error('Error loading draft metadata:', error);
      return [];
    }
  }, []);

  /**
   * Save draft metadata to localStorage
   */
  const saveDraftMetadata = useCallback((metadata: DraftMetadata[]): void => {
    try {
      localStorage.setItem(STORAGE_CONFIG.metadataKey, JSON.stringify(metadata));
    } catch (error) {
      console.error('Error saving draft metadata:', error);
    }
  }, []);

  /**
   * Load a specific draft from localStorage
   */
  const loadDraft = useCallback((draftId: string): StoredDraft | null => {
    try {
      const draftStr = localStorage.getItem(`${STORAGE_CONFIG.keyPrefix}${draftId}`);
      if (!draftStr) return null;

      const draft: StoredDraft = JSON.parse(draftStr);
      
      // Convert dates back to Date objects
      draft.metadata.savedAt = new Date(draft.metadata.savedAt);
      if (draft.post.publishedAt) {
        draft.post.publishedAt = new Date(draft.post.publishedAt);
      }
      if (draft.post.updatedAt) {
        draft.post.updatedAt = new Date(draft.post.updatedAt);
      }

      return draft;
    } catch (error) {
      console.error('Error loading draft:', error);
      return null;
    }
  }, []);

  /**
   * Save a draft to localStorage
   */
  const saveDraft = useCallback((post: Partial<BlogPost>, isAutoSave = false): void => {
    if (!post.title && !post.content) return;

    setIsAutoSaving(isAutoSave);

    try {
      const content = post.content || '';
      const compressedContent = compressContent(content);
      const wordCount = calculateWordCount(content);
      
      const draftId = post.id || generateDraftId();
      const currentMetadata = loadDraftMetadata();
      
      // Find existing draft or create new one
      const existingDraft = currentMetadata.find(d => d.id === draftId);
      const version = existingDraft ? existingDraft.version + 1 : 1;

      const metadata: DraftMetadata = {
        id: draftId,
        postId: post.id,
        title: post.title || 'Unbenannter Entwurf',
        savedAt: new Date(),
        wordCount,
        author: post.author || 'admin',
        version,
      };

      const storedDraft: StoredDraft = {
        metadata,
        content: compressedContent,
        post: {
          ...post,
          id: draftId,
        },
      };

      // Save the draft
      localStorage.setItem(
        `${STORAGE_CONFIG.keyPrefix}${draftId}`,
        JSON.stringify(storedDraft)
      );

      // Update metadata
      if (existingDraft) {
        existingDraft.version = version;
        existingDraft.savedAt = metadata.savedAt;
        existingDraft.wordCount = wordCount;
        existingDraft.title = metadata.title;
      } else {
        currentMetadata.push(metadata);
      }

      // Save all versions (limit to maxVersions)
      const versionKey = `${STORAGE_CONFIG.keyPrefix}${draftId}_v${version}`;
      localStorage.setItem(versionKey, JSON.stringify(storedDraft));

      // Clean up old versions
      const existingVersions = Object.keys(localStorage)
        .filter(key => key.startsWith(`${STORAGE_CONFIG.keyPrefix}${draftId}_v`))
        .sort();
      
      if (existingVersions.length > STORAGE_CONFIG.maxVersions) {
        const toRemove = existingVersions.slice(0, existingVersions.length - STORAGE_CONFIG.maxVersions);
        toRemove.forEach(key => localStorage.removeItem(key));
      }

      saveDraftMetadata(currentMetadata);
      setDrafts(loadDraftMetadata());
      setLastSavedAt(new Date());
      
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setIsAutoSaving(false);
    }
  }, [loadDraftMetadata, saveDraftMetadata]);

  /**
   * Delete a draft
   */
  const deleteDraft = useCallback((draftId: string): void => {
    try {
      // Remove main draft
      localStorage.removeItem(`${STORAGE_CONFIG.keyPrefix}${draftId}`);
      
      // Remove all versions
      Object.keys(localStorage)
        .filter(key => key.startsWith(`${STORAGE_CONFIG.keyPrefix}${draftId}_v`))
        .forEach(key => localStorage.removeItem(key));

      // Update metadata
      const currentMetadata = loadDraftMetadata();
      const updatedMetadata = currentMetadata.filter(d => d.id !== draftId);
      saveDraftMetadata(updatedMetadata);
      
      setDrafts(updatedMetadata);
      onDelete(draftId);
      
      if (selectedDraft === draftId) {
        setSelectedDraft(null);
        setDraftVersions([]);
      }
    } catch (error) {
      console.error('Error deleting draft:', error);
    }
  }, [loadDraftMetadata, saveDraftMetadata, onDelete, selectedDraft]);

  /**
   * Load versions for a specific draft
   */
  const loadDraftVersions = useCallback((draftId: string): void => {
    try {
      const versionKeys = Object.keys(localStorage)
        .filter(key => key.startsWith(`${STORAGE_CONFIG.keyPrefix}${draftId}_v`))
        .sort();

      const versions: DraftVersion[] = versionKeys.map(key => {
        const versionStr = localStorage.getItem(key);
        if (!versionStr) return null;
        
        const stored: StoredDraft = JSON.parse(versionStr);
        return {
          version: stored.metadata.version,
          savedAt: new Date(stored.metadata.savedAt),
          content: stored.content,
          metadata: {
            id: stored.metadata.id,
            postId: stored.metadata.postId,
            title: stored.metadata.title,
            savedAt: new Date(stored.metadata.savedAt),
            wordCount: stored.metadata.wordCount,
            author: stored.metadata.author,
          },
          changesSummary: `Version ${stored.metadata.version}`,
        };
      }).filter(Boolean) as DraftVersion[];

      setDraftVersions(versions.reverse()); // Most recent first
    } catch (error) {
      console.error('Error loading draft versions:', error);
      setDraftVersions([]);
    }
  }, []);

  /**
   * Check for conflicts with saved drafts
   */
  const checkForConflicts = useCallback((post: BlogPost): void => {
    if (!post.id) return;

    const savedDraft = loadDraft(post.id);
    if (!savedDraft) return;

    const currentLastModified = post.updatedAt?.getTime() || 0;
    const savedLastModified = savedDraft.metadata.savedAt.getTime();

    if (savedLastModified > currentLastModified) {
      setConflictData({
        current: post,
        saved: savedDraft,
      });
      setConflictDialogOpen(true);
    }
  }, [loadDraft]);

  /**
   * Clean up old drafts
   */
  const cleanupOldDrafts = useCallback((): void => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - STORAGE_CONFIG.cleanupAfterDays);

    const currentMetadata = loadDraftMetadata();
    const toKeep = currentMetadata.filter(draft => 
      draft.savedAt > cutoffDate
    );

    const toRemove = currentMetadata.filter(draft => 
      draft.savedAt <= cutoffDate
    );

    // Remove old drafts
    toRemove.forEach(draft => {
      localStorage.removeItem(`${STORAGE_CONFIG.keyPrefix}${draft.id}`);
      
      // Remove versions
      Object.keys(localStorage)
        .filter(key => key.startsWith(`${STORAGE_CONFIG.keyPrefix}${draft.id}_v`))
        .forEach(key => localStorage.removeItem(key));
    });

    if (toRemove.length > 0) {
      saveDraftMetadata(toKeep);
      setDrafts(toKeep);
    }
  }, [loadDraftMetadata, saveDraftMetadata]);

  /**
   * Auto-save functionality
   */
  const scheduleAutoSave = useCallback((post: Partial<BlogPost>): void => {
    if (!autoSaveEnabled || !post.content) return;

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = undefined;
    }

    // Check if content has changed
    const currentContent = post.content || '';
    if (currentContent === lastContentRef.current) return;

    lastContentRef.current = currentContent;

    autoSaveTimeoutRef.current = window.setTimeout(() => {
      saveDraft(post, true);
    }, STORAGE_CONFIG.autoSaveInterval);
  }, [autoSaveEnabled, saveDraft]);

  /**
   * Filter drafts based on search query
   */
  const filteredDrafts = drafts.filter(draft =>
    draft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    draft.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /**
   * Export drafts as JSON
   */
  const exportDrafts = useCallback((): void => {
    try {
      const allDrafts = drafts.map(metadata => {
        const draft = loadDraft(metadata.id);
        return draft;
      }).filter(Boolean);

      const exportData = {
        exportedAt: new Date(),
        drafts: allDrafts,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `drafts_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting drafts:', error);
    }
  }, [drafts, loadDraft]);

  /**
   * Restore a draft version
   */
  const restoreVersion = useCallback((version: DraftVersion): void => {
    try {
      const post: BlogPost = {
        id: version.metadata.id,
        title: version.metadata.title,
        content: version.content,
        author: version.metadata.author,
        slug: '',
        date: new Date().toISOString(),
        excerpt: '',
        category: 'coaching',
        tags: [],
        status: 'draft',
        publishedAt: new Date(),
        updatedAt: version.savedAt,
      };

      onRestore(post);
    } catch (error) {
      console.error('Error restoring version:', error);
    }
  }, [onRestore]);

  /**
   * Initialize component
   */
  useEffect(() => {
    setDrafts(loadDraftMetadata());
    setStorageUsage(calculateStorageUsage());
    cleanupOldDrafts();
  }, [loadDraftMetadata, calculateStorageUsage, cleanupOldDrafts]);

  /**
   * Set up auto-save for current post
   */
  useEffect(() => {
    if (currentPost) {
      scheduleAutoSave(currentPost);
      checkForConflicts(currentPost);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
        autoSaveTimeoutRef.current = undefined;
      }
    };
  }, [currentPost, scheduleAutoSave, checkForConflicts]);

  /**
   * Update storage usage when drafts change
   */
  useEffect(() => {
    setStorageUsage(calculateStorageUsage());
  }, [drafts, calculateStorageUsage]);

  /**
   * Styles object following AdminDashboard pattern
   */
  const styles: Record<string, React.CSSProperties> = {
    container: {
      padding: '2rem',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
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
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#0097B2',
      margin: 0,
    },
    subtitle: {
      color: '#666',
      margin: 0,
      fontSize: '0.9rem',
    },
    autoSaveStatus: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: isAutoSaving ? '#0097B2' : '#666',
      fontSize: '0.9rem',
    },
    searchContainer: {
      marginBottom: '1rem',
    },
    searchInput: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '1rem',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem',
    },
    card: {
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    cardTitle: {
      fontSize: '1.2rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
      color: '#333',
    },
    cardContent: {
      color: '#666',
      lineHeight: 1.5,
    },
    draftItem: {
      padding: '1rem',
      border: '1px solid #ddd',
      borderRadius: '4px',
      marginBottom: '0.5rem',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    draftItemHover: {
      backgroundColor: '#f8f9fa',
    },
    draftTitle: {
      fontWeight: 'bold',
      marginBottom: '0.25rem',
    },
    draftMeta: {
      fontSize: '0.8rem',
      color: '#666',
      display: 'flex',
      justifyContent: 'space-between',
    },
    button: {
      backgroundColor: '#0097B2',
      color: 'white',
      border: 'none',
      padding: '0.5rem 1rem',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.9rem',
      marginRight: '0.5rem',
    },
    dangerButton: {
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      padding: '0.5rem 1rem',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.9rem',
    },
    storageBar: {
      width: '100%',
      height: '8px',
      backgroundColor: '#e9ecef',
      borderRadius: '4px',
      overflow: 'hidden',
      marginTop: '0.5rem',
    },
    storageProgress: {
      height: '100%',
      backgroundColor: storageUsage > STORAGE_CONFIG.maxTotalSize * 0.8 ? '#dc3545' : '#0097B2',
      transition: 'width 0.3s ease',
    },
    versionList: {
      maxHeight: '300px',
      overflowY: 'auto',
    },
    versionItem: {
      padding: '0.75rem',
      border: '1px solid #ddd',
      borderRadius: '4px',
      marginBottom: '0.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    conflictDialog: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    conflictContent: {
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '8px',
      maxWidth: '600px',
      width: '90%',
      maxHeight: '80vh',
      overflow: 'auto',
    },
    buttonGroup: {
      display: 'flex',
      gap: '0.5rem',
      marginTop: '1rem',
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Entwürfe verwalten</h1>
          <p style={styles.subtitle}>
            {drafts.length} Entwürfe • {(storageUsage / 1024 / 1024).toFixed(1)} MB von {(STORAGE_CONFIG.maxTotalSize / 1024 / 1024).toFixed(0)} MB verwendet
          </p>
        </div>
        <div style={styles.autoSaveStatus}>
          {isAutoSaving && (
            <>
              <span>💾</span>
              <span>Speichere automatisch...</span>
            </>
          )}
          {lastSavedAt && !isAutoSaving && (
            <span>
              Zuletzt gespeichert: {lastSavedAt.toLocaleTimeString('de-DE')}
            </span>
          )}
        </div>
      </div>

      {/* Search */}
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Entwürfe durchsuchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      <div style={styles.grid}>
        {/* Draft List */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Alle Entwürfe ({filteredDrafts.length})</h2>
          <div style={styles.cardContent}>
            {filteredDrafts.length === 0 ? (
              <p>Keine Entwürfe gefunden.</p>
            ) : (
              filteredDrafts
                .sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime())
                .map(draft => (
                  <div
                    key={draft.id}
                    style={{
                      ...styles.draftItem,
                      ...(selectedDraft === draft.id ? styles.draftItemHover : {}),
                    }}
                    onClick={() => {
                      setSelectedDraft(draft.id);
                      loadDraftVersions(draft.id);
                    }}
                  >
                    <div style={styles.draftTitle}>{draft.title}</div>
                    <div style={styles.draftMeta}>
                      <span>{draft.wordCount} Wörter • {draft.author}</span>
                      <span>{draft.savedAt.toLocaleString('de-DE')}</span>
                    </div>
                    <div style={styles.buttonGroup}>
                      <button
                        style={styles.button}
                        onClick={(e) => {
                          e.stopPropagation();
                          const storedDraft = loadDraft(draft.id);
                          if (storedDraft) {
                            const post: BlogPost = {
                              ...storedDraft.post as BlogPost,
                              publishedAt: new Date(),
                              updatedAt: new Date(),
                            };
                            onRestore(post);
                          }
                        }}
                      >
                        Wiederherstellen
                      </button>
                      <button
                        style={styles.dangerButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Entwurf "${draft.title}" wirklich löschen?`)) {
                            deleteDraft(draft.id);
                          }
                        }}
                      >
                        Löschen
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Version History */}
        {selectedDraft && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Versionshistorie</h2>
            <div style={styles.cardContent}>
              <div style={styles.versionList}>
                {draftVersions.map(version => (
                  <div key={version.version} style={styles.versionItem}>
                    <div>
                      <div style={styles.draftTitle}>
                        Version {version.version}
                      </div>
                      <div style={styles.draftMeta}>
                        <span>{version.metadata.wordCount} Wörter</span>
                        <span>{version.savedAt.toLocaleString('de-DE')}</span>
                      </div>
                    </div>
                    <button
                      style={styles.button}
                      onClick={() => restoreVersion(version)}
                    >
                      Wiederherstellen
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Storage Management */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Speicher-Verwaltung</h2>
          <div style={styles.cardContent}>
            <p>
              Speicherverbrauch: {(storageUsage / 1024 / 1024).toFixed(1)} MB von {(STORAGE_CONFIG.maxTotalSize / 1024 / 1024).toFixed(0)} MB
            </p>
            <div style={styles.storageBar}>
              <div
                style={{
                  ...styles.storageProgress,
                  width: `${Math.min((storageUsage / STORAGE_CONFIG.maxTotalSize) * 100, 100)}%`,
                }}
              />
            </div>
            <div style={styles.buttonGroup}>
              <button style={styles.button} onClick={exportDrafts}>
                Entwürfe exportieren
              </button>
              <button
                style={styles.dangerButton}
                onClick={() => {
                  if (confirm('Alle alten Entwürfe (älter als 30 Tage) löschen?')) {
                    cleanupOldDrafts();
                  }
                }}
              >
                Aufräumen
              </button>
            </div>
          </div>
        </div>

        {/* Auto-Save Settings */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Auto-Speichern</h2>
          <div style={styles.cardContent}>
            <p>
              Status: {autoSaveEnabled ? 'Aktiviert' : 'Deaktiviert'}
            </p>
            <p>
              Intervall: {STORAGE_CONFIG.autoSaveInterval / 1000} Sekunden
            </p>
            <p>
              Max. Versionen pro Entwurf: {STORAGE_CONFIG.maxVersions}
            </p>
            {lastSavedAt && (
              <p>
                Zuletzt gespeichert: {lastSavedAt.toLocaleString('de-DE')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Conflict Resolution Dialog */}
      {conflictDialogOpen && conflictData && (
        <div style={styles.conflictDialog}>
          <div style={styles.conflictContent}>
            <h2 style={styles.cardTitle}>Konflikt erkannt</h2>
            <p>
              Es wurde eine neuere Version dieses Entwurfs gefunden. 
              Möchten Sie die gespeicherte Version verwenden oder die aktuelle beibehalten?
            </p>
            
            <div style={{ marginTop: '1rem' }}>
              <h3>Aktuelle Version:</h3>
              <p>Zuletzt bearbeitet: {conflictData.current.updatedAt?.toLocaleString('de-DE')}</p>
              <p>Wörter: {calculateWordCount(conflictData.current.content || '')}</p>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <h3>Gespeicherte Version:</h3>
              <p>Zuletzt bearbeitet: {conflictData.saved.metadata.savedAt.toLocaleString('de-DE')}</p>
              <p>Wörter: {conflictData.saved.metadata.wordCount}</p>
            </div>

            <div style={styles.buttonGroup}>
              <button
                style={styles.button}
                onClick={() => {
                  const post: BlogPost = {
                    ...conflictData.saved.post as BlogPost,
                    publishedAt: new Date(),
                    updatedAt: new Date(),
                  };
                  onRestore(post);
                  setConflictDialogOpen(false);
                  setConflictData(null);
                }}
              >
                Gespeicherte Version verwenden
              </button>
              <button
                style={styles.button}
                onClick={() => {
                  setConflictDialogOpen(false);
                  setConflictData(null);
                }}
              >
                Aktuelle Version beibehalten
              </button>
              <button
                style={styles.dangerButton}
                onClick={() => {
                  // Create backup of current version
                  saveDraft(conflictData.current);
                  setConflictDialogOpen(false);
                  setConflictData(null);
                }}
              >
                Backup erstellen und fortfahren
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DraftManager;