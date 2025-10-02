/**
 * Tina CMS Visual Editing Toolbar Component
 * Provides format buttons, media upload, save/publish controls, and preview toggle
 */

import React, { useState, useCallback } from 'react';
import { APP_COLORS } from '../types';

interface TinaToolbarProps {
  onFormat?: (type: string) => void;
  onMediaUpload?: () => void;
  onSave?: () => void;
  onPublish?: () => void;
  onPreviewToggle?: () => void;
  isPreviewMode?: boolean;
  isSaving?: boolean;
  isPublishing?: boolean;
  hasUnsavedChanges?: boolean;
  className?: string;
}

interface FormatButton {
  id: string;
  label: string;
  icon: string;
  action: string;
  shortcut?: string;
}

const TinaToolbar: React.FC<TinaToolbarProps> = ({
  onFormat,
  onMediaUpload,
  onSave,
  onPublish,
  onPreviewToggle,
  isPreviewMode = false,
  isSaving = false,
  isPublishing = false,
  hasUnsavedChanges = false,
  className = '',
}) => {
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

  // Format buttons configuration
  const formatButtons: FormatButton[] = [
    { id: 'bold', label: 'Fett', icon: '𝐁', action: 'bold', shortcut: 'Strg+B' },
    { id: 'italic', label: 'Kursiv', icon: '𝐼', action: 'italic', shortcut: 'Strg+I' },
    { id: 'underline', label: 'Unterstrichen', icon: '𝐔', action: 'underline', shortcut: 'Strg+U' },
    { id: 'strikethrough', label: 'Durchgestrichen', icon: '𝐒̶', action: 'strikethrough' },
    { id: 'code', label: 'Code', icon: '</>', action: 'code', shortcut: 'Strg+`' },
  ];

  const headingButtons: FormatButton[] = [
    { id: 'h1', label: 'Überschrift 1', icon: 'H₁', action: 'heading1' },
    { id: 'h2', label: 'Überschrift 2', icon: 'H₂', action: 'heading2' },
    { id: 'h3', label: 'Überschrift 3', icon: 'H₃', action: 'heading3' },
  ];

  const listButtons: FormatButton[] = [
    { id: 'bulletList', label: 'Aufzählung', icon: '•', action: 'bulletList' },
    { id: 'orderedList', label: 'Nummerierte Liste', icon: '1.', action: 'orderedList' },
    { id: 'blockquote', label: 'Zitat', icon: '"', action: 'blockquote' },
  ];

  const handleFormatClick = useCallback((action: string) => {
    if (onFormat) {
      onFormat(action);
    }
    
    // Toggle active state for formatting buttons
    setActiveFormats(prev => {
      const newSet = new Set(prev);
      if (newSet.has(action)) {
        newSet.delete(action);
      } else {
        newSet.add(action);
      }
      return newSet;
    });
  }, [onFormat]);

  const styles: Record<string, React.CSSProperties> = {
    toolbar: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1rem',
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb',
      borderTop: '1px solid #e5e7eb',
      flexWrap: 'wrap',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    },
    buttonGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      borderRight: '1px solid #e5e7eb',
      paddingRight: '0.75rem',
      marginRight: '0.25rem',
    },
    button: {
      padding: '0.5rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      backgroundColor: 'white',
      color: '#374151',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '32px',
      height: '32px',
    },
    buttonActive: {
      backgroundColor: APP_COLORS.primary,
      color: 'white',
      borderColor: APP_COLORS.primary,
    },
    buttonHover: {
      backgroundColor: '#f3f4f6',
      borderColor: '#9ca3af',
    },
    iconButton: {
      fontFamily: 'monospace',
      fontSize: '0.875rem',
      fontWeight: 'bold',
    },
    actionButton: {
      padding: '0.5rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      backgroundColor: 'white',
      color: '#374151',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    primaryButton: {
      backgroundColor: APP_COLORS.primary,
      color: 'white',
      borderColor: APP_COLORS.primary,
    },
    successButton: {
      backgroundColor: '#10b981',
      color: 'white',
      borderColor: '#10b981',
    },
    disabledButton: {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
    spinner: {
      width: '14px',
      height: '14px',
      border: '2px solid transparent',
      borderTopColor: 'currentColor',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    },
    separator: {
      width: '1px',
      height: '24px',
      backgroundColor: '#e5e7eb',
      margin: '0 0.5rem',
    },
  };

  const renderButton = (button: FormatButton, isActive = false) => (
    <button
      key={button.id}
      onClick={() => handleFormatClick(button.action)}
      title={`${button.label}${button.shortcut ? ` (${button.shortcut})` : ''}`}
      style={{
        ...styles.button,
        ...styles.iconButton,
        ...(isActive ? styles.buttonActive : {}),
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          Object.assign(e.currentTarget.style, styles.buttonHover);
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'white';
          e.currentTarget.style.borderColor = '#d1d5db';
        }
      }}
    >
      {button.icon}
    </button>
  );

  return (
    <div className={className} style={styles.toolbar}>
      {/* Text Formatting */}
      <div style={styles.buttonGroup}>
        {formatButtons.map(button => 
          renderButton(button, activeFormats.has(button.action))
        )}
      </div>

      {/* Headings */}
      <div style={styles.buttonGroup}>
        {headingButtons.map(button => 
          renderButton(button, activeFormats.has(button.action))
        )}
      </div>

      {/* Lists and Quotes */}
      <div style={styles.buttonGroup}>
        {listButtons.map(button => 
          renderButton(button, activeFormats.has(button.action))
        )}
      </div>

      {/* Media Upload */}
      <div style={styles.buttonGroup}>
        <button
          onClick={onMediaUpload}
          title="Bild oder Datei hochladen"
          style={styles.actionButton}
          onMouseEnter={(e) => {
            Object.assign(e.currentTarget.style, styles.buttonHover);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.borderColor = '#d1d5db';
          }}
        >
          📷 Medien
        </button>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Save Status Indicator */}
      {hasUnsavedChanges && (
        <div style={{
          fontSize: '0.75rem',
          color: '#f59e0b',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
        }}>
          <div style={{
            width: '6px',
            height: '6px',
            backgroundColor: '#f59e0b',
            borderRadius: '50%',
          }} />
          Ungespeicherte Änderungen
        </div>
      )}

      {/* Preview Toggle */}
      <button
        onClick={onPreviewToggle}
        title={isPreviewMode ? 'Vorschau ausblenden' : 'Vorschau anzeigen'}
        style={{
          ...styles.actionButton,
          ...(isPreviewMode ? styles.primaryButton : {}),
        }}
        onMouseEnter={(e) => {
          if (!isPreviewMode) {
            Object.assign(e.currentTarget.style, styles.buttonHover);
          }
        }}
        onMouseLeave={(e) => {
          if (!isPreviewMode) {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.borderColor = '#d1d5db';
          }
        }}
      >
        {isPreviewMode ? '📝' : '👁️'} 
        {isPreviewMode ? 'Editor' : 'Vorschau'}
      </button>

      {/* Save Button */}
      <button
        onClick={onSave}
        disabled={isSaving || !hasUnsavedChanges}
        title="Änderungen speichern (Strg+S)"
        style={{
          ...styles.actionButton,
          ...(isSaving || !hasUnsavedChanges ? styles.disabledButton : {}),
        }}
        onMouseEnter={(e) => {
          if (!isSaving && hasUnsavedChanges) {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSaving && hasUnsavedChanges) {
            e.currentTarget.style.backgroundColor = 'white';
          }
        }}
      >
        {isSaving ? (
          <>
            <div style={styles.spinner} />
            Speichere...
          </>
        ) : (
          <>💾 Speichern</>
        )}
      </button>

      {/* Publish Button */}
      <button
        onClick={onPublish}
        disabled={isPublishing || hasUnsavedChanges}
        title="Beitrag veröffentlichen"
        style={{
          ...styles.actionButton,
          ...styles.successButton,
          ...(isPublishing || hasUnsavedChanges ? styles.disabledButton : {}),
        }}
        onMouseEnter={(e) => {
          if (!isPublishing && !hasUnsavedChanges) {
            e.currentTarget.style.backgroundColor = '#059669';
          }
        }}
        onMouseLeave={(e) => {
          if (!isPublishing && !hasUnsavedChanges) {
            e.currentTarget.style.backgroundColor = '#10b981';
          }
        }}
      >
        {isPublishing ? (
          <>
            <div style={styles.spinner} />
            Veröffentliche...
          </>
        ) : (
          <>🚀 Veröffentlichen</>
        )}
      </button>
    </div>
  );
};

// Global styles for spinner animation
if (typeof document !== 'undefined' && !document.getElementById('tina-toolbar-styles')) {
  const style = document.createElement('style');
  style.id = 'tina-toolbar-styles';
  style.innerHTML = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export default TinaToolbar;