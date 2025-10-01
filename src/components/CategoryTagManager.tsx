import React, { useState, useMemo, useCallback } from 'react';
import { BlogPost, BLOG_CATEGORIES } from '../types/blog';
import { APP_COLORS } from '../types';

interface CategoryTagManagerProps {
  posts: BlogPost[];
  onUpdatePost: (post: BlogPost) => Promise<void>;
  onBulkUpdate: (posts: BlogPost[]) => Promise<void>;
}


interface EditingTag {
  originalTag: string;
  newName: string;
}

interface MergeOperation {
  sourceTag: string;
  targetTag: string;
}

const CategoryTagManager: React.FC<CategoryTagManagerProps> = ({
  posts,
  onBulkUpdate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [editingTag, setEditingTag] = useState<EditingTag | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mergeOperation, setMergeOperation] = useState<MergeOperation | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Calculate category statistics
  const categoryStats = useMemo(() => {
    return BLOG_CATEGORIES.map(categoryInfo => ({
      ...categoryInfo,
      postCount: posts.filter(post => post.category === categoryInfo.category).length,
    }));
  }, [posts]);

  // Calculate tag statistics
  const tagStats = useMemo(() => {
    const tagMap = new Map<string, BlogPost[]>();
    
    posts.forEach(post => {
      post.tags.forEach(tag => {
        if (!tagMap.has(tag)) {
          tagMap.set(tag, []);
        }
        tagMap.get(tag)!.push(post);
      });
    });

    return Array.from(tagMap.entries())
      .map(([tag, tagPosts]) => ({
        tag,
        count: tagPosts.length,
        posts: tagPosts,
      }))
      .sort((a, b) => b.count - a.count);
  }, [posts]);

  // Filter tags based on search term
  const filteredTags = useMemo(() => {
    if (!searchTerm) return tagStats;
    return tagStats.filter(stat => 
      stat.tag.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tagStats, searchTerm]);

  // Calculate overall statistics
  const overallStats = useMemo(() => {
    const totalTags = tagStats.length;
    const totalPosts = posts.length;
    const averageTagsPerPost = totalPosts > 0 ? 
      posts.reduce((sum, post) => sum + post.tags.length, 0) / totalPosts : 0;
    const topTags = tagStats.slice(0, 10);
    const unusedTags = tagStats.filter(stat => stat.count === 0);

    return {
      totalTags,
      averageTagsPerPost: Math.round(averageTagsPerPost * 10) / 10,
      topTags,
      unusedTags,
    };
  }, [tagStats, posts]);

  // Handle tag rename
  const handleRenameTag = useCallback(async (originalTag: string, newName: string) => {
    if (!newName.trim() || originalTag === newName.trim()) return;

    setIsLoading(true);
    try {
      const postsToUpdate = posts.filter(post => post.tags.includes(originalTag));
      const updatedPosts = postsToUpdate.map(post => ({
        ...post,
        tags: post.tags.map(tag => tag === originalTag ? newName.trim() : tag),
      }));

      await onBulkUpdate(updatedPosts);
      setEditingTag(null);
    } catch (error) {
      console.error('Error renaming tag:', error);
    } finally {
      setIsLoading(false);
    }
  }, [posts, onBulkUpdate]);

  // Handle tag deletion
  const handleDeleteTag = useCallback(async (tagToDelete: string) => {
    setIsLoading(true);
    try {
      const postsToUpdate = posts.filter(post => post.tags.includes(tagToDelete));
      const updatedPosts = postsToUpdate.map(post => ({
        ...post,
        tags: post.tags.filter(tag => tag !== tagToDelete),
      }));

      await onBulkUpdate(updatedPosts);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting tag:', error);
    } finally {
      setIsLoading(false);
    }
  }, [posts, onBulkUpdate]);

  // Handle tag merge
  const handleMergeTag = useCallback(async (sourceTag: string, targetTag: string) => {
    if (sourceTag === targetTag) return;

    setIsLoading(true);
    try {
      const postsToUpdate = posts.filter(post => post.tags.includes(sourceTag));
      const updatedPosts = postsToUpdate.map(post => ({
        ...post,
        tags: post.tags
          .map(tag => tag === sourceTag ? targetTag : tag)
          .filter((tag, index, arr) => arr.indexOf(tag) === index), // Remove duplicates
      }));

      await onBulkUpdate(updatedPosts);
      setMergeOperation(null);
    } catch (error) {
      console.error('Error merging tags:', error);
    } finally {
      setIsLoading(false);
    }
  }, [posts, onBulkUpdate]);

  // Handle bulk tag deletion
  const handleBulkDeleteTags = useCallback(async () => {
    if (selectedTags.size === 0) return;

    setIsLoading(true);
    try {
      const tagsToDelete = Array.from(selectedTags);
      const postsToUpdate = posts.filter(post => 
        post.tags.some(tag => tagsToDelete.includes(tag))
      );
      const updatedPosts = postsToUpdate.map(post => ({
        ...post,
        tags: post.tags.filter(tag => !tagsToDelete.includes(tag)),
      }));

      await onBulkUpdate(updatedPosts);
      setSelectedTags(new Set());
    } catch (error) {
      console.error('Error bulk deleting tags:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTags, posts, onBulkUpdate]);

  // Handle tag selection toggle
  const toggleTagSelection = useCallback((tag: string) => {
    setSelectedTags(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tag)) {
        newSet.delete(tag);
      } else {
        newSet.add(tag);
      }
      return newSet;
    });
  }, []);

  const styles: Record<string, React.CSSProperties> = {
    container: {
      padding: '2rem',
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
    },
    header: {
      marginBottom: '2rem',
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: APP_COLORS.primary,
      marginBottom: '0.5rem',
    },
    subtitle: {
      color: '#666',
      fontSize: '0.9rem',
    },
    mainGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '2rem',
      marginBottom: '2rem',
    },
    section: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      overflow: 'hidden',
    },
    sectionHeader: {
      padding: '1.5rem',
      borderBottom: '1px solid #e2e8f0',
      backgroundColor: '#f8f9fa',
    },
    sectionTitle: {
      fontSize: '1.2rem',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '0.5rem',
    },
    sectionDescription: {
      color: '#666',
      fontSize: '0.9rem',
    },
    content: {
      padding: '1.5rem',
    },
    categoryList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    categoryItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '1rem',
      borderRadius: '6px',
      backgroundColor: '#f8f9fa',
      border: '1px solid #e2e8f0',
    },
    categoryIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '1rem',
      color: 'white',
      fontWeight: 'bold',
    },
    categoryInfo: {
      flex: 1,
    },
    categoryName: {
      fontWeight: 'bold',
      marginBottom: '0.25rem',
    },
    categoryDescription: {
      fontSize: '0.85rem',
      color: '#666',
      marginBottom: '0.25rem',
    },
    categoryCount: {
      fontSize: '0.8rem',
      color: '#888',
    },
    searchBox: {
      width: '100%',
      padding: '0.75rem',
      fontSize: '0.9rem',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      marginBottom: '1rem',
      outline: 'none',
    },
    tagActions: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '1rem',
      flexWrap: 'wrap',
    },
    actionButton: {
      padding: '0.5rem 1rem',
      fontSize: '0.85rem',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'all 0.2s',
    },
    primaryButton: {
      backgroundColor: APP_COLORS.primary,
      color: 'white',
    },
    dangerButton: {
      backgroundColor: '#dc3545',
      color: 'white',
    },
    secondaryButton: {
      backgroundColor: '#6c757d',
      color: 'white',
    },
    disabledButton: {
      backgroundColor: '#e9ecef',
      color: '#6c757d',
      cursor: 'not-allowed',
    },
    tagList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      maxHeight: '400px',
      overflowY: 'auto',
    },
    tagItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '0.75rem',
      borderRadius: '6px',
      border: '1px solid #e2e8f0',
      backgroundColor: 'white',
      transition: 'all 0.2s',
    },
    tagItemSelected: {
      backgroundColor: '#e3f2fd',
      borderColor: APP_COLORS.primary,
    },
    tagCheckbox: {
      marginRight: '0.75rem',
      accentColor: APP_COLORS.primary,
    },
    tagInfo: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    tagName: {
      fontWeight: '500',
      color: '#333',
    },
    tagCount: {
      fontSize: '0.8rem',
      color: '#666',
      backgroundColor: '#f1f3f4',
      padding: '0.25rem 0.5rem',
      borderRadius: '12px',
    },
    tagItemActions: {
      display: 'flex',
      gap: '0.25rem',
      marginLeft: '0.75rem',
    },
    iconButton: {
      width: '28px',
      height: '28px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.8rem',
      transition: 'all 0.2s',
    },
    editButton: {
      backgroundColor: '#ffc107',
      color: 'white',
    },
    deleteButton: {
      backgroundColor: '#dc3545',
      color: 'white',
    },
    mergeButton: {
      backgroundColor: APP_COLORS.secondary,
      color: 'white',
    },
    editInput: {
      flex: 1,
      padding: '0.5rem',
      fontSize: '0.9rem',
      border: '1px solid #e2e8f0',
      borderRadius: '4px',
      marginRight: '0.5rem',
      outline: 'none',
    },
    saveButton: {
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none',
      padding: '0.5rem 0.75rem',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.8rem',
      marginRight: '0.25rem',
    },
    cancelButton: {
      backgroundColor: '#6c757d',
      color: 'white',
      border: 'none',
      padding: '0.5rem 0.75rem',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.8rem',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem',
    },
    statCard: {
      backgroundColor: 'white',
      padding: '1rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      textAlign: 'center',
    },
    statValue: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: APP_COLORS.primary,
      marginBottom: '0.25rem',
    },
    statLabel: {
      fontSize: '0.9rem',
      color: '#666',
    },
    confirmDialog: {
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
    confirmCard: {
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      maxWidth: '400px',
      width: '90%',
    },
    confirmTitle: {
      fontSize: '1.1rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
      color: '#333',
    },
    confirmText: {
      color: '#666',
      marginBottom: '1.5rem',
      lineHeight: 1.5,
    },
    confirmActions: {
      display: 'flex',
      gap: '0.5rem',
      justifyContent: 'flex-end',
    },
    loadingOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255,255,255,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1001,
    },
    loadingSpinner: {
      width: '40px',
      height: '40px',
      border: '4px solid #f3f3f3',
      borderTop: '4px solid ' + APP_COLORS.primary,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Kategorien & Tags Verwaltung</h1>
        <p style={styles.subtitle}>
          Verwalten Sie Kategorien und Tags für Ihre Blog-Beiträge
        </p>
      </div>

      {/* Statistics */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{overallStats.totalTags}</div>
          <div style={styles.statLabel}>Eindeutige Tags</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{overallStats.averageTagsPerPost}</div>
          <div style={styles.statLabel}>Ø Tags pro Beitrag</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{posts.length}</div>
          <div style={styles.statLabel}>Gesamte Beiträge</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{overallStats.unusedTags.length}</div>
          <div style={styles.statLabel}>Ungenutzte Tags</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={styles.mainGrid}>
        {/* Categories Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Kategorien</h2>
            <p style={styles.sectionDescription}>
              Vordefinierte Kategorien für die Blogorganisation
            </p>
          </div>
          <div style={styles.content}>
            <div style={styles.categoryList}>
              {categoryStats.map((category) => (
                <div key={category.category} style={styles.categoryItem}>
                  <div
                    style={{
                      ...styles.categoryIcon,
                      backgroundColor: category.color,
                    }}
                  >
                    {category.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div style={styles.categoryInfo}>
                    <div style={styles.categoryName}>{category.displayName}</div>
                    <div style={styles.categoryDescription}>
                      {category.description}
                    </div>
                    <div style={styles.categoryCount}>
                      {category.postCount} Beiträge
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tags Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Tags</h2>
            <p style={styles.sectionDescription}>
              Verwalten Sie Tags für detaillierte Inhaltsorganisation
            </p>
          </div>
          <div style={styles.content}>
            {/* Search and Actions */}
            <input
              type="text"
              placeholder="Tags durchsuchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchBox}
            />

            <div style={styles.tagActions}>
              <button
                style={{
                  ...styles.actionButton,
                  ...(selectedTags.size > 0 ? styles.dangerButton : styles.disabledButton),
                }}
                onClick={handleBulkDeleteTags}
                disabled={selectedTags.size === 0 || isLoading}
              >
                Ausgewählte Löschen ({selectedTags.size})
              </button>
              <button
                style={{
                  ...styles.actionButton,
                  ...(selectedTags.size === 2 ? styles.secondaryButton : styles.disabledButton),
                }}
                disabled={selectedTags.size !== 2 || isLoading}
                onClick={() => {
                  const [source, target] = Array.from(selectedTags);
                  setMergeOperation({ sourceTag: source, targetTag: target });
                }}
              >
                Zusammenführen
              </button>
              <button
                style={{
                  ...styles.actionButton,
                  ...styles.primaryButton,
                }}
                onClick={() => setSelectedTags(new Set())}
                disabled={selectedTags.size === 0}
              >
                Auswahl Aufheben
              </button>
            </div>

            {/* Tag List */}
            <div style={styles.tagList}>
              {filteredTags.map((tagStat) => (
                <div
                  key={tagStat.tag}
                  style={{
                    ...styles.tagItem,
                    ...(selectedTags.has(tagStat.tag) ? styles.tagItemSelected : {}),
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedTags.has(tagStat.tag)}
                    onChange={() => toggleTagSelection(tagStat.tag)}
                    style={styles.tagCheckbox}
                  />

                  {editingTag?.originalTag === tagStat.tag ? (
                    <div style={styles.tagInfo}>
                      <input
                        type="text"
                        value={editingTag.newName}
                        onChange={(e) =>
                          setEditingTag(prev => prev ? { ...prev, newName: e.target.value } : null)
                        }
                        style={styles.editInput}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleRenameTag(editingTag.originalTag, editingTag.newName);
                          } else if (e.key === 'Escape') {
                            setEditingTag(null);
                          }
                        }}
                        autoFocus
                      />
                      <button
                        style={styles.saveButton}
                        onClick={() => handleRenameTag(editingTag.originalTag, editingTag.newName)}
                        disabled={isLoading}
                      >
                        ✓
                      </button>
                      <button
                        style={styles.cancelButton}
                        onClick={() => setEditingTag(null)}
                        disabled={isLoading}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={styles.tagInfo}>
                        <span style={styles.tagName}>{tagStat.tag}</span>
                        <span style={styles.tagCount}>{tagStat.count}</span>
                      </div>
                      <div style={styles.tagItemActions}>
                        <button
                          style={{ ...styles.iconButton, ...styles.editButton }}
                          onClick={() =>
                            setEditingTag({
                              originalTag: tagStat.tag,
                              newName: tagStat.tag,
                            })
                          }
                          title="Tag umbenennen"
                        >
                          ✏️
                        </button>
                        <button
                          style={{ ...styles.iconButton, ...styles.deleteButton }}
                          onClick={() => setShowDeleteConfirm(tagStat.tag)}
                          title="Tag löschen"
                        >
                          🗑️
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div style={styles.confirmDialog}>
          <div style={styles.confirmCard}>
            <h3 style={styles.confirmTitle}>Tag löschen bestätigen</h3>
            <p style={styles.confirmText}>
              Sind Sie sicher, dass Sie den Tag "{showDeleteConfirm}" löschen möchten? 
              Dieser wird von allen Beiträgen entfernt. Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div style={styles.confirmActions}>
              <button
                style={styles.cancelButton}
                onClick={() => setShowDeleteConfirm(null)}
              >
                Abbrechen
              </button>
              <button
                style={{ ...styles.actionButton, ...styles.dangerButton }}
                onClick={() => handleDeleteTag(showDeleteConfirm)}
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Merge Confirmation Dialog */}
      {mergeOperation && (
        <div style={styles.confirmDialog}>
          <div style={styles.confirmCard}>
            <h3 style={styles.confirmTitle}>Tags zusammenführen bestätigen</h3>
            <p style={styles.confirmText}>
              Möchten Sie "{mergeOperation.sourceTag}" mit "{mergeOperation.targetTag}" zusammenführen?
              Alle Beiträge mit "{mergeOperation.sourceTag}" werden zu "{mergeOperation.targetTag}" geändert.
            </p>
            <div style={styles.confirmActions}>
              <button
                style={styles.cancelButton}
                onClick={() => setMergeOperation(null)}
              >
                Abbrechen
              </button>
              <button
                style={{ ...styles.actionButton, ...styles.primaryButton }}
                onClick={() => handleMergeTag(mergeOperation.sourceTag, mergeOperation.targetTag)}
              >
                Zusammenführen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingSpinner} />
        </div>
      )}

      {/* CSS Animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default CategoryTagManager;