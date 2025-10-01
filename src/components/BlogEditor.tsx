import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BlogPost, BlogCategory, BlogStatus, BLOG_CATEGORIES, BLOG_CONFIG } from '../types/blog';
import { APP_COLORS } from '../types';
import { generateSlug, getAllTags } from '../services/blogContent';

interface BlogEditorProps {
  post?: BlogPost; // For edit mode
  onSave: (post: BlogPost) => Promise<void>;
  onCancel: () => void;
}

interface FormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: BlogCategory;
  tags: string[];
  image: string;
  imageAlt: string;
  status: BlogStatus;
  featured: boolean;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  keywords: string[];
}

interface ValidationErrors {
  [key: string]: string;
}

const BlogEditor: React.FC<BlogEditorProps> = ({ post, onSave, onCancel }) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'coaching',
    tags: [],
    image: '',
    imageAlt: '',
    status: 'draft',
    featured: false,
    metaTitle: '',
    metaDescription: '',
    canonicalUrl: '',
    keywords: [],
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [showSeoSection, setShowSeoSection] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveRef = useRef<number>();

  // Initialize form data when editing existing post
  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        category: post.category,
        tags: [...post.tags],
        image: post.image || '',
        imageAlt: post.imageAlt || '',
        status: post.status,
        featured: post.featured || false,
        metaTitle: post.seo?.metaTitle || '',
        metaDescription: post.seo?.metaDescription || '',
        canonicalUrl: post.seo?.canonicalUrl || '',
        keywords: post.seo?.keywords || [],
      });
    }
  }, [post]);

  // Load available tags
  useEffect(() => {
    const loadTags = async () => {
      try {
        const tags = await getAllTags();
        setAvailableTags(tags.map(t => t.tag));
      } catch (error) {
        console.error('Fehler beim Laden der Tags:', error);
      }
    };
    loadTags();
  }, []);

  // Auto-save to localStorage every 30 seconds
  useEffect(() => {
    const autoSave = () => {
      if (formData.title || formData.content) {
        localStorage.setItem('blog-editor-draft', JSON.stringify(formData));
      }
    };

    autoSaveRef.current = window.setInterval(autoSave, 30000);
    return () => {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
    };
  }, [formData]);

  // Load draft from localStorage on mount
  useEffect(() => {
    if (!post) {
      const draft = localStorage.getItem('blog-editor-draft');
      if (draft) {
        try {
          const draftData = JSON.parse(draft);
          setFormData(draftData);
        } catch (error) {
          console.error('Fehler beim Laden des Entwurfs:', error);
        }
      }
    }
  }, [post]);

  const validateForm = useCallback((): ValidationErrors => {
    const newErrors: ValidationErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Titel ist erforderlich';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug ist erforderlich';
    }

    if (!formData.excerpt.trim()) {
      newErrors.excerpt = 'Zusammenfassung ist erforderlich';
    } else if (formData.excerpt.length > 200) {
      newErrors.excerpt = 'Zusammenfassung darf maximal 200 Zeichen haben';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Inhalt ist erforderlich';
    }

    if (!formData.category) {
      newErrors.category = 'Kategorie ist erforderlich';
    }

    if (formData.image && !formData.imageAlt.trim()) {
      newErrors.imageAlt = 'Alt-Text für Bild ist erforderlich';
    }

    if (formData.metaDescription && formData.metaDescription.length > 160) {
      newErrors.metaDescription = 'Meta-Beschreibung darf maximal 160 Zeichen haben';
    }

    return newErrors;
  }, [formData]);

  const handleTitleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      title: value,
      slug: prev.slug === generateSlug(prev.title) ? generateSlug(value) : prev.slug,
      metaTitle: prev.metaTitle === prev.title ? value : prev.metaTitle,
    }));
    if (errors.title) {
      setErrors(prev => ({ ...prev, title: '' }));
    }
  };

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleAddKeyword = (keyword: string) => {
    const trimmedKeyword = keyword.trim().toLowerCase();
    if (trimmedKeyword && !formData.keywords.includes(trimmedKeyword)) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, trimmedKeyword],
      }));
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(keyword => keyword !== keywordToRemove),
    }));
  };

  const insertMarkdown = (before: string, after: string = '') => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
    setFormData(prev => ({ ...prev, content: newText }));

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const calculateReadingTime = (content: string): number => {
    const wordsPerMinute = BLOG_CONFIG.readingSpeed;
    const wordCount = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setNotification({
        type: 'error',
        message: 'Bitte korrigieren Sie die Fehler im Formular',
      });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const blogPost: BlogPost = {
        id: formData.slug,
        title: formData.title,
        slug: formData.slug,
        date: post?.date || new Date().toISOString(),
        excerpt: formData.excerpt,
        author: post?.author || 'melanie',
        category: formData.category,
        tags: formData.tags,
        image: formData.image || undefined,
        imageAlt: formData.imageAlt || undefined,
        status: formData.status,
        featured: formData.featured,
        content: formData.content,
        publishedAt: post?.publishedAt || new Date(),
        updatedAt: new Date(),
        readingTime: calculateReadingTime(formData.content),
        seo: {
          metaTitle: formData.metaTitle || formData.title,
          metaDescription: formData.metaDescription || formData.excerpt,
          canonicalUrl: formData.canonicalUrl || undefined,
          keywords: formData.keywords.length > 0 ? formData.keywords : undefined,
        },
      };

      await onSave(blogPost);
      
      // Clear draft from localStorage on successful save
      localStorage.removeItem('blog-editor-draft');
      
      setNotification({
        type: 'success',
        message: 'Blog-Post erfolgreich gespeichert',
      });
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      setNotification({
        type: 'error',
        message: 'Fehler beim Speichern des Blog-Posts',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const styles: Record<string, React.CSSProperties> = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f7fafc',
      padding: '1rem',
    },
    header: {
      backgroundColor: 'white',
      padding: '1rem 2rem',
      borderRadius: '0.5rem',
      marginBottom: '1rem',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#2d3748',
      margin: 0,
    },
    buttonGroup: {
      display: 'flex',
      gap: '0.5rem',
    },
    button: {
      padding: '0.5rem 1rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      borderRadius: '0.375rem',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    primaryButton: {
      backgroundColor: APP_COLORS.primary,
      color: 'white',
    },
    secondaryButton: {
      backgroundColor: '#e2e8f0',
      color: '#4a5568',
    },
    disabledButton: {
      backgroundColor: '#cbd5e0',
      cursor: 'not-allowed',
    },
    mainContent: {
      display: 'grid',
      gridTemplateColumns: showPreview ? '1fr 1fr' : '1fr',
      gap: '1rem',
      height: 'calc(100vh - 200px)',
    },
    editorPanel: {
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    },
    toolbar: {
      padding: '0.75rem',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      backgroundColor: '#f7fafc',
    },
    toolbarButton: {
      padding: '0.25rem 0.5rem',
      fontSize: '0.875rem',
      backgroundColor: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: '0.25rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    formSection: {
      padding: '1rem',
      flex: 1,
      overflow: 'auto',
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
      marginBottom: '1rem',
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    fullWidth: {
      gridColumn: '1 / -1',
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#4a5568',
    },
    requiredLabel: {
      color: '#e53e3e',
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      fontSize: '0.875rem',
      border: '1px solid #e2e8f0',
      borderRadius: '0.375rem',
      outline: 'none',
      transition: 'all 0.2s',
      backgroundColor: 'white',
    },
    inputFocus: {
      borderColor: APP_COLORS.primary,
      boxShadow: `0 0 0 3px ${APP_COLORS.primary}20`,
    },
    inputError: {
      borderColor: '#fc8181',
    },
    textarea: {
      minHeight: '300px',
      resize: 'vertical',
      fontFamily: 'monospace',
    },
    select: {
      width: '100%',
      padding: '0.75rem',
      fontSize: '0.875rem',
      border: '1px solid #e2e8f0',
      borderRadius: '0.375rem',
      outline: 'none',
      backgroundColor: 'white',
      cursor: 'pointer',
    },
    checkbox: {
      width: '1rem',
      height: '1rem',
      accentColor: APP_COLORS.primary,
      cursor: 'pointer',
    },
    checkboxLabel: {
      fontSize: '0.875rem',
      color: '#4a5568',
      cursor: 'pointer',
      userSelect: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    tagContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      marginTop: '0.5rem',
    },
    tag: {
      backgroundColor: APP_COLORS.primary + '20',
      color: APP_COLORS.primary,
      padding: '0.25rem 0.5rem',
      borderRadius: '0.25rem',
      fontSize: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
    },
    tagRemove: {
      cursor: 'pointer',
      fontWeight: 'bold',
    },
    error: {
      fontSize: '0.75rem',
      color: '#e53e3e',
      marginTop: '0.25rem',
    },
    characterCount: {
      fontSize: '0.75rem',
      color: '#718096',
      textAlign: 'right',
      marginTop: '0.25rem',
    },
    characterCountOver: {
      color: '#e53e3e',
    },
    seoSection: {
      backgroundColor: '#f7fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '0.375rem',
      marginTop: '1rem',
    },
    seoHeader: {
      padding: '0.75rem 1rem',
      borderBottom: '1px solid #e2e8f0',
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: 'white',
      borderTopLeftRadius: '0.375rem',
      borderTopRightRadius: '0.375rem',
    },
    seoContent: {
      padding: '1rem',
      display: showSeoSection ? 'block' : 'none',
    },
    previewPanel: {
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      padding: '2rem',
      overflow: 'auto',
      display: showPreview ? 'block' : 'none',
    },
    previewTitle: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#2d3748',
      marginBottom: '0.5rem',
      lineHeight: '1.2',
    },
    previewMeta: {
      fontSize: '0.875rem',
      color: '#718096',
      marginBottom: '1rem',
      display: 'flex',
      gap: '1rem',
    },
    previewExcerpt: {
      fontSize: '1.125rem',
      color: '#4a5568',
      marginBottom: '2rem',
      fontStyle: 'italic',
      lineHeight: '1.6',
    },
    previewContent: {
      fontSize: '1rem',
      lineHeight: '1.8',
      color: '#2d3748',
      whiteSpace: 'pre-wrap',
    },
    notification: {
      position: 'fixed',
      top: '1rem',
      right: '1rem',
      padding: '1rem',
      borderRadius: '0.375rem',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: 1000,
      minWidth: '300px',
      fontSize: '0.875rem',
      fontWeight: '500',
    },
    successNotification: {
      backgroundColor: '#c6f6d5',
      color: '#22543d',
      border: '1px solid #9ae6b4',
    },
    errorNotification: {
      backgroundColor: '#fed7d7',
      color: '#c53030',
      border: '1px solid #fc8181',
    },
    loadingSpinner: {
      display: 'inline-block',
      width: '1rem',
      height: '1rem',
      border: '2px solid transparent',
      borderTopColor: 'white',
      borderRadius: '50%',
      animation: 'spin 0.6s linear infinite',
      marginRight: '0.5rem',
    },
    imagePreview: {
      maxWidth: '200px',
      maxHeight: '150px',
      objectFit: 'cover',
      borderRadius: '0.375rem',
      marginTop: '0.5rem',
    },
    readingTime: {
      fontSize: '0.75rem',
      color: '#718096',
      fontStyle: 'italic',
    },
  };

  return (
    <div style={styles.container}>
      {notification && (
        <div
          style={{
            ...styles.notification,
            ...(notification.type === 'success' ? styles.successNotification : styles.errorNotification),
          }}
        >
          {notification.message}
        </div>
      )}

      <div style={styles.header}>
        <h1 style={styles.title}>
          {post ? 'Blog-Post bearbeiten' : 'Neuen Blog-Post erstellen'}
        </h1>
        <div style={styles.buttonGroup}>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            style={{ ...styles.button, ...styles.secondaryButton }}
          >
            {showPreview ? 'Vorschau ausblenden' : 'Vorschau anzeigen'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{ ...styles.button, ...styles.secondaryButton }}
          >
            Abbrechen
          </button>
        </div>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.editorPanel}>
          <div style={styles.toolbar}>
            <button
              type="button"
              onClick={() => insertMarkdown('**', '**')}
              style={styles.toolbarButton}
              title="Fett"
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('*', '*')}
              style={styles.toolbarButton}
              title="Kursiv"
            >
              <em>I</em>
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('[', '](url)')}
              style={styles.toolbarButton}
              title="Link"
            >
              Link
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('## ')}
              style={styles.toolbarButton}
              title="Überschrift"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('- ')}
              style={styles.toolbarButton}
              title="Liste"
            >
              Liste
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('> ')}
              style={styles.toolbarButton}
              title="Zitat"
            >
              Zitat
            </button>
          </div>

          <form onSubmit={handleSubmit} style={styles.formSection}>
            <div style={styles.formGrid}>
              <div style={{ ...styles.inputGroup, ...styles.fullWidth }}>
                <label style={styles.label}>
                  Titel <span style={styles.requiredLabel}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  style={{
                    ...styles.input,
                    ...(errors.title ? styles.inputError : {}),
                  }}
                  placeholder="Titel des Blog-Posts"
                  disabled={isSubmitting}
                  onFocus={(e) => {
                    e.target.style.borderColor = APP_COLORS.primary;
                    e.target.style.boxShadow = `0 0 0 3px ${APP_COLORS.primary}20`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {errors.title && <div style={styles.error}>{errors.title}</div>}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Slug <span style={styles.requiredLabel}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  style={{
                    ...styles.input,
                    ...(errors.slug ? styles.inputError : {}),
                  }}
                  placeholder="url-freundlicher-slug"
                  disabled={isSubmitting}
                  onFocus={(e) => {
                    e.target.style.borderColor = APP_COLORS.primary;
                    e.target.style.boxShadow = `0 0 0 3px ${APP_COLORS.primary}20`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {errors.slug && <div style={styles.error}>{errors.slug}</div>}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Kategorie <span style={styles.requiredLabel}>*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as BlogCategory }))}
                  style={{
                    ...styles.select,
                    ...(errors.category ? styles.inputError : {}),
                  }}
                  disabled={isSubmitting}
                >
                  {BLOG_CATEGORIES.map(cat => (
                    <option key={cat.category} value={cat.category}>
                      {cat.displayName}
                    </option>
                  ))}
                </select>
                {errors.category && <div style={styles.error}>{errors.category}</div>}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as BlogStatus }))}
                  style={styles.select}
                  disabled={isSubmitting}
                >
                  <option value="draft">Entwurf</option>
                  <option value="published">Veröffentlicht</option>
                  <option value="archived">Archiviert</option>
                </select>
              </div>

              <div style={{ ...styles.inputGroup, ...styles.fullWidth }}>
                <label style={styles.label}>
                  Zusammenfassung <span style={styles.requiredLabel}>*</span>
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  style={{
                    ...styles.input,
                    ...styles.textarea,
                    minHeight: '80px',
                    ...(errors.excerpt ? styles.inputError : {}),
                  }}
                  placeholder="Kurze Zusammenfassung des Blog-Posts"
                  disabled={isSubmitting}
                  maxLength={200}
                  onFocus={(e) => {
                    e.target.style.borderColor = APP_COLORS.primary;
                    e.target.style.boxShadow = `0 0 0 3px ${APP_COLORS.primary}20`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <div style={{
                  ...styles.characterCount,
                  ...(formData.excerpt.length > 200 ? styles.characterCountOver : {}),
                }}>
                  {formData.excerpt.length}/200 Zeichen
                </div>
                {errors.excerpt && <div style={styles.error}>{errors.excerpt}</div>}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Bild-URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  style={styles.input}
                  placeholder="https://example.com/image.jpg"
                  disabled={isSubmitting}
                  onFocus={(e) => {
                    e.target.style.borderColor = APP_COLORS.primary;
                    e.target.style.boxShadow = `0 0 0 3px ${APP_COLORS.primary}20`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {formData.image && (
                  <img
                    src={formData.image}
                    alt="Vorschau"
                    style={styles.imagePreview}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Bild Alt-Text {formData.image && <span style={styles.requiredLabel}>*</span>}
                </label>
                <input
                  type="text"
                  value={formData.imageAlt}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageAlt: e.target.value }))}
                  style={{
                    ...styles.input,
                    ...(errors.imageAlt ? styles.inputError : {}),
                  }}
                  placeholder="Beschreibung des Bildes"
                  disabled={isSubmitting || !formData.image}
                  onFocus={(e) => {
                    e.target.style.borderColor = APP_COLORS.primary;
                    e.target.style.boxShadow = `0 0 0 3px ${APP_COLORS.primary}20`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {errors.imageAlt && <div style={styles.error}>{errors.imageAlt}</div>}
              </div>

              <div style={{ ...styles.inputGroup, ...styles.fullWidth }}>
                <label style={styles.label}>Tags</label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag(tagInput);
                    }
                  }}
                  style={styles.input}
                  placeholder="Tag eingeben und Enter drücken"
                  disabled={isSubmitting}
                  list="available-tags"
                  onFocus={(e) => {
                    e.target.style.borderColor = APP_COLORS.primary;
                    e.target.style.boxShadow = `0 0 0 3px ${APP_COLORS.primary}20`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <datalist id="available-tags">
                  {availableTags.map(tag => (
                    <option key={tag} value={tag} />
                  ))}
                </datalist>
                <div style={styles.tagContainer}>
                  {formData.tags.map(tag => (
                    <span key={tag} style={styles.tag}>
                      {tag}
                      <span
                        style={styles.tagRemove}
                        onClick={() => handleRemoveTag(tag)}
                        title="Tag entfernen"
                      >
                        ×
                      </span>
                    </span>
                  ))}
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                    style={styles.checkbox}
                    disabled={isSubmitting}
                  />
                  Featured Post
                </label>
              </div>

              <div style={{ ...styles.inputGroup, ...styles.fullWidth }}>
                <label style={styles.label}>
                  Inhalt <span style={styles.requiredLabel}>*</span>
                </label>
                <textarea
                  ref={textareaRef}
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  style={{
                    ...styles.input,
                    ...styles.textarea,
                    ...(errors.content ? styles.inputError : {}),
                  }}
                  placeholder="Markdown-Inhalt des Blog-Posts"
                  disabled={isSubmitting}
                  onFocus={(e) => {
                    e.target.style.borderColor = APP_COLORS.primary;
                    e.target.style.boxShadow = `0 0 0 3px ${APP_COLORS.primary}20`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <div style={styles.readingTime}>
                  Geschätzte Lesezeit: {calculateReadingTime(formData.content)} Min.
                </div>
                {errors.content && <div style={styles.error}>{errors.content}</div>}
              </div>
            </div>

            <div style={styles.seoSection}>
              <div
                style={styles.seoHeader}
                onClick={() => setShowSeoSection(!showSeoSection)}
              >
                <span style={styles.label}>SEO-Einstellungen</span>
                <span style={{ transform: showSeoSection ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                  ▼
                </span>
              </div>
              <div style={styles.seoContent}>
                <div style={styles.formGrid}>
                  <div style={{ ...styles.inputGroup, ...styles.fullWidth }}>
                    <label style={styles.label}>Meta-Titel</label>
                    <input
                      type="text"
                      value={formData.metaTitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                      style={styles.input}
                      placeholder={formData.title || "SEO-Titel (Standard: Post-Titel)"}
                      disabled={isSubmitting}
                      maxLength={60}
                      onFocus={(e) => {
                        e.target.style.borderColor = APP_COLORS.primary;
                        e.target.style.boxShadow = `0 0 0 3px ${APP_COLORS.primary}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    <div style={styles.characterCount}>
                      {formData.metaTitle.length}/60 Zeichen
                    </div>
                  </div>

                  <div style={{ ...styles.inputGroup, ...styles.fullWidth }}>
                    <label style={styles.label}>Meta-Beschreibung</label>
                    <textarea
                      value={formData.metaDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                      style={{
                        ...styles.input,
                        minHeight: '60px',
                        ...(errors.metaDescription ? styles.inputError : {}),
                      }}
                      placeholder={formData.excerpt || "SEO-Beschreibung (Standard: Zusammenfassung)"}
                      disabled={isSubmitting}
                      maxLength={160}
                      onFocus={(e) => {
                        e.target.style.borderColor = APP_COLORS.primary;
                        e.target.style.boxShadow = `0 0 0 3px ${APP_COLORS.primary}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    <div style={{
                      ...styles.characterCount,
                      ...(formData.metaDescription.length > 160 ? styles.characterCountOver : {}),
                    }}>
                      {formData.metaDescription.length}/160 Zeichen
                    </div>
                    {errors.metaDescription && <div style={styles.error}>{errors.metaDescription}</div>}
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Canonical URL</label>
                    <input
                      type="url"
                      value={formData.canonicalUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, canonicalUrl: e.target.value }))}
                      style={styles.input}
                      placeholder="https://melaniezeyer.de/blog/slug"
                      disabled={isSubmitting}
                      onFocus={(e) => {
                        e.target.style.borderColor = APP_COLORS.primary;
                        e.target.style.boxShadow = `0 0 0 3px ${APP_COLORS.primary}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>SEO-Keywords</label>
                    <input
                      type="text"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddKeyword(keywordInput);
                        }
                      }}
                      style={styles.input}
                      placeholder="Keyword eingeben und Enter drücken"
                      disabled={isSubmitting}
                      onFocus={(e) => {
                        e.target.style.borderColor = APP_COLORS.primary;
                        e.target.style.boxShadow = `0 0 0 3px ${APP_COLORS.primary}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    <div style={styles.tagContainer}>
                      {formData.keywords.map(keyword => (
                        <span key={keyword} style={styles.tag}>
                          {keyword}
                          <span
                            style={styles.tagRemove}
                            onClick={() => handleRemoveKeyword(keyword)}
                            title="Keyword entfernen"
                          >
                            ×
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={onCancel}
                style={{ ...styles.button, ...styles.secondaryButton }}
                disabled={isSubmitting}
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={isSubmitting || Object.keys(validateForm()).length > 0}
                style={{
                  ...styles.button,
                  ...styles.primaryButton,
                  ...(isSubmitting || Object.keys(validateForm()).length > 0 ? styles.disabledButton : {}),
                }}
              >
                {isSubmitting ? (
                  <>
                    <span style={styles.loadingSpinner} />
                    Speichern...
                  </>
                ) : (
                  'Speichern'
                )}
              </button>
            </div>
          </form>
        </div>

        {showPreview && (
          <div style={styles.previewPanel}>
            <h1 style={styles.previewTitle}>{formData.title || 'Titel-Vorschau'}</h1>
            <div style={styles.previewMeta}>
              <span>Kategorie: {BLOG_CATEGORIES.find(c => c.category === formData.category)?.displayName}</span>
              <span>Lesezeit: {calculateReadingTime(formData.content)} Min.</span>
              <span>Status: {formData.status === 'draft' ? 'Entwurf' : formData.status === 'published' ? 'Veröffentlicht' : 'Archiviert'}</span>
            </div>
            {formData.image && (
              <img
                src={formData.image}
                alt={formData.imageAlt}
                style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '0.5rem', marginBottom: '1rem' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <div style={styles.previewExcerpt}>
              {formData.excerpt || 'Zusammenfassung wird hier angezeigt...'}
            </div>
            <div style={styles.previewContent}>
              {formData.content || 'Inhalt wird hier in der Vorschau angezeigt...'}
            </div>
            {formData.tags.length > 0 && (
              <div style={{ marginTop: '2rem' }}>
                <strong>Tags: </strong>
                {formData.tags.join(', ')}
              </div>
            )}
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default BlogEditor;