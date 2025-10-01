import React, { useEffect } from 'react';
import { APP_COLORS } from '../types';
import { BlogPost } from '../types/blog';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  posts: BlogPost | BlogPost[]; // Single or multiple
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isDeleting?: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  posts,
  onConfirm,
  onCancel,
  isDeleting = false,
}) => {
  const postsArray = Array.isArray(posts) ? posts : [posts];
  const isMultiple = postsArray.length > 1;

  // Handle escape key and enter key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onCancel();
      } else if (e.key === 'Enter' && !isDeleting) {
        // Safety check: only allow Enter confirmation if not currently deleting
        e.preventDefault();
        onConfirm();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onCancel, onConfirm, isDeleting]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isDeleting) {
      onCancel();
    }
  };

  const handleConfirm = async () => {
    if (isDeleting) return;
    await onConfirm();
  };

  if (!isOpen) return null;

  const styles: Record<string, React.CSSProperties> = {
    backdrop: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)',
      animation: 'fadeIn 0.2s ease-out',
    },
    modal: {
      backgroundColor: APP_COLORS.background,
      borderRadius: '1rem',
      padding: '2rem',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      width: '90%',
      maxWidth: '500px',
      position: 'relative',
      animation: 'fadeInScale 0.2s ease-out',
    },
    closeButton: {
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      background: 'none',
      border: 'none',
      fontSize: '1.5rem',
      color: APP_COLORS.secondary,
      cursor: isDeleting ? 'not-allowed' : 'pointer',
      width: '2rem',
      height: '2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '0.5rem',
      transition: 'color 0.2s ease, background-color 0.2s ease',
      opacity: isDeleting ? 0.5 : 1,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '1.5rem',
      paddingRight: '2rem',
    },
    warningIcon: {
      width: '3rem',
      height: '3rem',
      backgroundColor: '#fee2e2',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '1rem',
      flexShrink: 0,
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#dc2626',
      margin: 0,
    },
    content: {
      marginBottom: '2rem',
    },
    message: {
      fontSize: '1rem',
      color: '#374151',
      marginBottom: '1rem',
      lineHeight: '1.5',
    },
    postList: {
      backgroundColor: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      padding: '1rem',
      marginBottom: '1rem',
      maxHeight: '200px',
      overflowY: 'auto',
    },
    postItem: {
      fontSize: '0.9rem',
      color: '#6b7280',
      marginBottom: '0.5rem',
      paddingLeft: '1rem',
      position: 'relative',
    },
    postItemBullet: {
      position: 'absolute',
      left: '0',
      color: '#dc2626',
      fontWeight: 'bold',
    },
    warningText: {
      fontSize: '0.9rem',
      color: '#dc2626',
      fontWeight: '500',
      backgroundColor: '#fef2f2',
      padding: '0.75rem',
      borderRadius: '0.5rem',
      border: '1px solid #fecaca',
    },
    actions: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'flex-end',
    },
    cancelButton: {
      padding: '0.75rem 1.5rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      fontFamily: 'Arimo, sans-serif',
      backgroundColor: '#f3f4f6',
      color: '#374151',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      cursor: isDeleting ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      opacity: isDeleting ? 0.5 : 1,
    },
    cancelButtonHover: {
      backgroundColor: '#e5e7eb',
      borderColor: '#9ca3af',
    },
    deleteButton: {
      padding: '0.75rem 1.5rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      fontFamily: 'Arimo, sans-serif',
      backgroundColor: '#dc2626',
      color: '#ffffff',
      border: 'none',
      borderRadius: '0.375rem',
      cursor: isDeleting ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      opacity: isDeleting ? 0.7 : 1,
    },
    deleteButtonHover: {
      backgroundColor: '#b91c1c',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
    },
    loadingSpinner: {
      display: 'inline-block',
      width: '1rem',
      height: '1rem',
      border: '2px solid transparent',
      borderTopColor: '#ffffff',
      borderRadius: '50%',
      animation: 'spin 0.6s linear infinite',
    },
  };

  return (
    <div 
      style={styles.backdrop} 
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      aria-describedby="delete-modal-description"
    >
      <div style={styles.modal}>
        <button
          style={styles.closeButton}
          onClick={onCancel}
          disabled={isDeleting}
          aria-label="Dialog schließen"
          onMouseEnter={(e) => {
            if (!isDeleting) {
              e.currentTarget.style.backgroundColor = `${APP_COLORS.secondary}20`;
              e.currentTarget.style.color = APP_COLORS.primary;
            }
          }}
          onMouseLeave={(e) => {
            if (!isDeleting) {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = APP_COLORS.secondary;
            }
          }}
        >
          ✕
        </button>

        <div style={styles.header}>
          <div style={styles.warningIcon}>
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#dc2626" 
              strokeWidth="2"
            >
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
              <path d="M8.5 2.5L3 21h18L15.5 2.5z" />
            </svg>
          </div>
          <h2 id="delete-modal-title" style={styles.title}>
            {isMultiple ? 'Beiträge löschen?' : 'Beitrag löschen?'}
          </h2>
        </div>

        <div style={styles.content}>
          <div id="delete-modal-description" style={styles.message}>
            {isMultiple 
              ? `Sie sind dabei, ${postsArray.length} Beiträge zu löschen:`
              : 'Sie sind dabei, den folgenden Beitrag zu löschen:'
            }
          </div>

          <div style={styles.postList}>
            {postsArray.map((post) => (
              <div key={post.id} style={styles.postItem}>
                <span style={styles.postItemBullet}>•</span>
                {post.title}
              </div>
            ))}
          </div>

          <div style={styles.warningText}>
            <strong>Achtung:</strong> Diese Aktion kann nicht rückgängig gemacht werden. 
            {isMultiple ? ' Alle ausgewählten Beiträge' : ' Der Beitrag'} 
            {isMultiple ? ' werden' : ' wird'} dauerhaft gelöscht.
          </div>
        </div>

        <div style={styles.actions}>
          <button
            style={styles.cancelButton}
            onClick={onCancel}
            disabled={isDeleting}
            onMouseEnter={(e) => {
              if (!isDeleting) {
                Object.assign(e.currentTarget.style, styles.cancelButtonHover);
              }
            }}
            onMouseLeave={(e) => {
              if (!isDeleting) {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.borderColor = '#d1d5db';
              }
            }}
          >
            Abbrechen
          </button>
          
          <button
            style={styles.deleteButton}
            onClick={handleConfirm}
            disabled={isDeleting}
            onMouseEnter={(e) => {
              if (!isDeleting) {
                Object.assign(e.currentTarget.style, styles.deleteButtonHover);
              }
            }}
            onMouseLeave={(e) => {
              if (!isDeleting) {
                e.currentTarget.style.backgroundColor = '#dc2626';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {isDeleting ? (
              <>
                <span style={styles.loadingSpinner} />
                Wird gelöscht...
              </>
            ) : (
              `${isMultiple ? 'Beiträge' : 'Beitrag'} löschen`
            )}
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes fadeInScale {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default DeleteConfirmationModal;