/**
 * Simplified Tina CMS Admin Interface
 * Clean, user-friendly content management dashboard
 */

import React, { useState, useEffect, useRef } from 'react';
import { useTinaAuth } from '../services/tinaAuth';
import { APP_COLORS } from '../types';
import { loadAllPosts, clearPostCaches, generateSlug } from '../services/blogContent';
import { BlogPost, BlogStatus, BlogCategory, BLOG_CATEGORIES, BLOG_CONFIG } from '../types/blog';

interface ContentDashboardProps {
  onNavigate: (section: string) => void;
}

const ContentDashboard: React.FC<ContentDashboardProps> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const allPosts = await loadAllPosts();
        setPosts(allPosts);
      } catch (err) {
        setError('Fehler beim Laden der Blog-Beiträge');
        console.error('Error loading posts:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadPosts();
  }, []);
  
  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const stats = {
    total: posts.length,
    published: posts.filter(p => p.status === 'published').length,
    drafts: posts.filter(p => p.status === 'draft').length
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
          {isLoading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.loadingSpinner} />
              <span style={styles.loadingText}>Blog-Beiträge werden geladen...</span>
            </div>
          ) : error ? (
            <div style={styles.errorContainer}>
              <div style={styles.errorIcon}>⚠️</div>
              <h4 style={styles.errorTitle}>{error}</h4>
              <p style={styles.errorText}>Überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.</p>
              <button 
                style={styles.retryButton}
                onClick={() => window.location.reload()}
              >
                Erneut versuchen
              </button>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div style={styles.emptyContainer}>
              <div style={styles.emptyIcon}>📝</div>
              <h4 style={styles.emptyTitle}>
                {searchTerm ? 'Keine Beiträge gefunden' : 'Noch keine Blog-Beiträge'}
              </h4>
              <p style={styles.emptyText}>
                {searchTerm 
                  ? `Keine Beiträge entsprechen Ihrer Suche nach "${searchTerm}".`
                  : 'Erstellen Sie Ihren ersten Blog-Beitrag, um loszulegen.'
                }
              </p>
              {!searchTerm && (
                <button 
                  style={styles.createButton}
                  onClick={() => onNavigate('new-post')}
                >
                  Ersten Beitrag erstellen
                </button>
              )}
            </div>
          ) : (
            filteredPosts.map(post => (
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
                  <span style={styles.postDate}>{post.publishedAt.toLocaleDateString('de-DE')}</span>
                  <div style={styles.postActions}>
                    <button className="action-btn" style={styles.actionBtn}>Bearbeiten</button>
                    <button className="action-btn" style={styles.actionBtn}>Vorschau</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Posts Management Component
const PostsManagement: React.FC<ContentDashboardProps> = ({ onNavigate }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BlogStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | BlogCategory>('all');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [posts, searchTerm, statusFilter, categoryFilter, sortBy, sortOrder]);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const allPosts = await loadAllPosts();
      setPosts(allPosts);
    } catch (err) {
      setError('Fehler beim Laden der Blog-Beiträge');
      console.error('Error loading posts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...posts];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(term) ||
        post.excerpt.toLowerCase().includes(term) ||
        post.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(post => post.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(post => post.category === categoryFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = a.publishedAt.getTime() - b.publishedAt.getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredPosts(filtered);
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Beitrag löschen möchten?')) {
      return;
    }

    try {
      // In a real implementation, this would delete from the backend
      // For now, we'll remove from localStorage if it exists there
      const drafts = JSON.parse(localStorage.getItem('blog_drafts') || '[]');
      const updatedDrafts = drafts.filter((post: BlogPost) => post.id !== postId);
      localStorage.setItem('blog_drafts', JSON.stringify(updatedDrafts));
      
      clearPostCaches();
      await loadPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Fehler beim Löschen des Beitrags');
    }
  };

  const getStatusColor = (status: BlogStatus) => {
    switch (status) {
      case 'published': return { bg: '#dcfce7', color: '#166534' };
      case 'draft': return { bg: '#fef3c7', color: '#92400e' };
      case 'archived': return { bg: '#f3f4f6', color: '#374151' };
      default: return { bg: '#f3f4f6', color: '#374151' };
    }
  };

  const getStatusLabel = (status: BlogStatus) => {
    switch (status) {
      case 'published': return 'Veröffentlicht';
      case 'draft': return 'Entwurf';
      case 'archived': return 'Archiviert';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner} />
        <span style={styles.loadingText}>Blog-Beiträge werden geladen...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>⚠️</div>
        <h4 style={styles.errorTitle}>{error}</h4>
        <button style={styles.retryButton} onClick={loadPosts}>
          Erneut versuchen
        </button>
      </div>
    );
  }

  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>Blog-Beiträge ({filteredPosts.length})</h2>
        <button
          style={styles.createButton}
          onClick={() => onNavigate('new-post')}
        >
          Neuer Beitrag
        </button>
      </div>

      {/* Filters */}
      <div style={styles.filtersContainer}>
        <div style={styles.searchBox}>
          <input
            type="text"
            placeholder="Beiträge suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | BlogStatus)}
          style={styles.filterSelect}
        >
          <option value="all">Alle Status</option>
          <option value="published">Veröffentlicht</option>
          <option value="draft">Entwurf</option>
          <option value="archived">Archiviert</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as 'all' | BlogCategory)}
          style={styles.filterSelect}
        >
          <option value="all">Alle Kategorien</option>
          {BLOG_CATEGORIES.map(cat => (
            <option key={cat.category} value={cat.category}>
              {cat.displayName}
            </option>
          ))}
        </select>

        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [sort, order] = e.target.value.split('-');
            setSortBy(sort as 'date' | 'title' | 'status');
            setSortOrder(order as 'asc' | 'desc');
          }}
          style={styles.filterSelect}
        >
          <option value="date-desc">Neueste zuerst</option>
          <option value="date-asc">Älteste zuerst</option>
          <option value="title-asc">Titel A-Z</option>
          <option value="title-desc">Titel Z-A</option>
          <option value="status-asc">Status A-Z</option>
        </select>
      </div>

      {/* Posts List */}
      <div style={styles.postsList}>
        {filteredPosts.length === 0 ? (
          <div style={styles.emptyContainer}>
            <div style={styles.emptyIcon}>📝</div>
            <h4 style={styles.emptyTitle}>
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'Keine Beiträge gefunden'
                : 'Noch keine Blog-Beiträge'
              }
            </h4>
            <p style={styles.emptyText}>
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'Versuchen Sie andere Suchkriterien.'
                : 'Erstellen Sie Ihren ersten Blog-Beitrag.'
              }
            </p>
            <button
              style={styles.createButton}
              onClick={() => onNavigate('new-post')}
            >
              Neuer Beitrag
            </button>
          </div>
        ) : (
          filteredPosts.map(post => {
            const statusColors = getStatusColor(post.status);
            return (
              <div key={post.id} style={styles.postCard}>
                <div style={styles.postHeader}>
                  <h4 style={styles.postTitle}>{post.title}</h4>
                  <span style={{
                    ...styles.statusBadge,
                    backgroundColor: statusColors.bg,
                    color: statusColors.color,
                  }}>
                    {getStatusLabel(post.status)}
                  </span>
                </div>
                <p style={styles.postExcerpt}>{post.excerpt}</p>
                <div style={styles.postMeta}>
                  <span style={styles.postCategory}>
                    {BLOG_CATEGORIES.find(c => c.category === post.category)?.displayName}
                  </span>
                  <span style={styles.postDate}>
                    {post.publishedAt.toLocaleDateString('de-DE')}
                  </span>
                  <span style={styles.postReadingTime}>
                    {post.readingTime} Min. Lesezeit
                  </span>
                </div>
                <div style={styles.postFooter}>
                  <div style={styles.postTags}>
                    {post.tags.slice(0, 3).map(tag => (
                      <span key={tag} style={styles.tag}>
                        {tag}
                      </span>
                    ))}
                    {post.tags.length > 3 && (
                      <span style={styles.tagMore}>
                        +{post.tags.length - 3} weitere
                      </span>
                    )}
                  </div>
                  <div style={styles.postActions}>
                    <button style={styles.actionBtn}>Bearbeiten</button>
                    <button style={styles.actionBtn}>Vorschau</button>
                    <button
                      style={{...styles.actionBtn, color: '#dc2626', borderColor: '#dc2626'}}
                      onClick={() => handleDeletePost(post.id)}
                    >
                      Löschen
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// New Post Creation Component
const NewPostCreation: React.FC<ContentDashboardProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'coaching' as BlogCategory,
    tags: '',
    status: 'draft' as BlogStatus,
    image: '',
    imageAlt: '',
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: '',
    }
  });
  const [isAutoSlug, setIsAutoSlug] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isAutoSlug && formData.title) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(prev.title)
      }));
    }
  }, [formData.title, isAutoSlug]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Titel ist erforderlich';
    }
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug ist erforderlich';
    }
    if (!formData.excerpt.trim()) {
      newErrors.excerpt = 'Kurzbeschreibung ist erforderlich';
    }
    if (!formData.content.trim()) {
      newErrors.content = 'Inhalt ist erforderlich';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (status: BlogStatus) => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      const newPost: BlogPost = {
        id: formData.slug,
        title: formData.title,
        slug: formData.slug,
        date: new Date().toISOString(),
        excerpt: formData.excerpt,
        content: formData.content,
        author: 'melanie',
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        status,
        image: formData.image || undefined,
        imageAlt: formData.imageAlt || undefined,
        publishedAt: new Date(),
        updatedAt: new Date(),
        readingTime: Math.ceil(formData.content.split(' ').length / 200),
        seo: {
          metaTitle: formData.seo.metaTitle || formData.title,
          metaDescription: formData.seo.metaDescription || formData.excerpt,
          keywords: formData.seo.keywords.split(',').map(k => k.trim()).filter(Boolean),
        }
      };

      // Save to localStorage (in a real app, this would be an API call)
      const existingDrafts = JSON.parse(localStorage.getItem('blog_drafts') || '[]');
      const updatedDrafts = [...existingDrafts.filter((p: BlogPost) => p.id !== newPost.id), newPost];
      localStorage.setItem('blog_drafts', JSON.stringify(updatedDrafts));

      clearPostCaches();
      
      if (status === 'published') {
        alert('Beitrag wurde veröffentlicht!');
      } else {
        alert('Entwurf wurde gespeichert!');
      }
      
      onNavigate('posts');
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Fehler beim Speichern des Beitrags');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSEOChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        [field]: value
      }
    }));
  };

  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>Neuer Blog-Beitrag</h2>
        <button
          style={styles.actionBtn}
          onClick={() => onNavigate('posts')}
        >
          Zurück zur Übersicht
        </button>
      </div>

      <div style={styles.formContainer}>
        {/* Basic Information */}
        <div style={styles.formSection}>
          <h3 style={styles.formSectionTitle}>Grundinformationen</h3>
          
          <div style={styles.formField}>
            <label style={styles.formLabel}>Titel *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              style={{
                ...styles.formInput,
                borderColor: errors.title ? '#dc2626' : '#d1d5db'
              }}
              placeholder="Titel des Blog-Beitrags"
            />
            {errors.title && <span style={styles.formError}>{errors.title}</span>}
          </div>

          <div style={styles.formField}>
            <label style={styles.formLabel}>
              URL-Slug *
              <label style={styles.autoSlugLabel}>
                <input
                  type="checkbox"
                  checked={isAutoSlug}
                  onChange={(e) => setIsAutoSlug(e.target.checked)}
                />
                Automatisch generieren
              </label>
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => {
                setIsAutoSlug(false);
                handleInputChange('slug', e.target.value);
              }}
              style={{
                ...styles.formInput,
                borderColor: errors.slug ? '#dc2626' : '#d1d5db'
              }}
              placeholder="url-freundlicher-slug"
              disabled={isAutoSlug}
            />
            {errors.slug && <span style={styles.formError}>{errors.slug}</span>}
          </div>

          <div style={styles.formField}>
            <label style={styles.formLabel}>Kurzbeschreibung *</label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => handleInputChange('excerpt', e.target.value)}
              style={{
                ...styles.formTextarea,
                borderColor: errors.excerpt ? '#dc2626' : '#d1d5db'
              }}
              placeholder="Kurze Beschreibung des Beitrags"
              rows={3}
            />
            {errors.excerpt && <span style={styles.formError}>{errors.excerpt}</span>}
          </div>

          <div style={styles.formRow}>
            <div style={styles.formField}>
              <label style={styles.formLabel}>Kategorie</label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                style={styles.formSelect}
              >
                {BLOG_CATEGORIES.map(cat => (
                  <option key={cat.category} value={cat.category}>
                    {cat.displayName}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formField}>
              <label style={styles.formLabel}>Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                style={styles.formSelect}
              >
                <option value="draft">Entwurf</option>
                <option value="published">Veröffentlicht</option>
                <option value="archived">Archiviert</option>
              </select>
            </div>
          </div>

          <div style={styles.formField}>
            <label style={styles.formLabel}>Tags (kommagetrennt)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              style={styles.formInput}
              placeholder="tag1, tag2, tag3"
            />
          </div>
        </div>

        {/* Content */}
        <div style={styles.formSection}>
          <h3 style={styles.formSectionTitle}>Inhalt</h3>
          
          <div style={styles.formField}>
            <label style={styles.formLabel}>Hauptinhalt *</label>
            <textarea
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              style={{
                ...styles.formTextarea,
                minHeight: '300px',
                borderColor: errors.content ? '#dc2626' : '#d1d5db'
              }}
              placeholder="Schreiben Sie hier Ihren Blog-Beitrag (Markdown unterstützt)"
            />
            {errors.content && <span style={styles.formError}>{errors.content}</span>}
          </div>
        </div>

        {/* Featured Image */}
        <div style={styles.formSection}>
          <h3 style={styles.formSectionTitle}>Titelbild</h3>
          
          <div style={styles.formField}>
            <label style={styles.formLabel}>Bild-URL</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => handleInputChange('image', e.target.value)}
              style={styles.formInput}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div style={styles.formField}>
            <label style={styles.formLabel}>Bildbeschreibung (Alt-Text)</label>
            <input
              type="text"
              value={formData.imageAlt}
              onChange={(e) => handleInputChange('imageAlt', e.target.value)}
              style={styles.formInput}
              placeholder="Beschreibung des Bildes für Screenreader"
            />
          </div>
        </div>

        {/* SEO Settings */}
        <div style={styles.formSection}>
          <h3 style={styles.formSectionTitle}>SEO-Einstellungen</h3>
          
          <div style={styles.formField}>
            <label style={styles.formLabel}>Meta-Titel</label>
            <input
              type="text"
              value={formData.seo.metaTitle}
              onChange={(e) => handleSEOChange('metaTitle', e.target.value)}
              style={styles.formInput}
              placeholder="SEO-optimierter Titel"
            />
          </div>

          <div style={styles.formField}>
            <label style={styles.formLabel}>Meta-Beschreibung</label>
            <textarea
              value={formData.seo.metaDescription}
              onChange={(e) => handleSEOChange('metaDescription', e.target.value)}
              style={styles.formTextarea}
              placeholder="SEO-optimierte Beschreibung"
              rows={2}
            />
          </div>

          <div style={styles.formField}>
            <label style={styles.formLabel}>Keywords (kommagetrennt)</label>
            <input
              type="text"
              value={formData.seo.keywords}
              onChange={(e) => handleSEOChange('keywords', e.target.value)}
              style={styles.formInput}
              placeholder="keyword1, keyword2, keyword3"
            />
          </div>
        </div>

        {/* Actions */}
        <div style={styles.formActions}>
          <button
            style={styles.saveButton}
            onClick={() => handleSave('draft')}
            disabled={isSaving}
          >
            {isSaving ? 'Speichert...' : 'Als Entwurf speichern'}
          </button>
          <button
            style={styles.publishButton}
            onClick={() => handleSave('published')}
            disabled={isSaving}
          >
            {isSaving ? 'Veröffentlicht...' : 'Veröffentlichen'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Media Management Component
const MediaManagement: React.FC<ContentDashboardProps> = ({ onNavigate: _ }) => {
  const [images, setImages] = useState<string[]>([]);
  // const [isLoading, setIsLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = () => {
    // Load images from localStorage
    const keys = Object.keys(localStorage).filter(key => key.startsWith('blog_image_'));
    const imageUrls = keys.map(key => localStorage.getItem(key)!).filter(Boolean);
    setImages(imageUrls);
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        uploadImage(file);
      }
    });
  };

  const uploadImage = async (file: File) => {
    const fileName = file.name;
    setUploadProgress(prev => ({ ...prev, [fileName]: 0 }));

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(prev => ({ ...prev, [fileName]: i }));
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Convert to base64 and store in localStorage
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const key = `blog_image_${Date.now()}_${fileName}`;
        localStorage.setItem(key, result);
        
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[fileName];
          return newProgress;
        });
        
        loadImages();
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Fehler beim Upload von ${fileName}`);
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[fileName];
        return newProgress;
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const deleteImage = (imageUrl: string) => {
    if (!confirm('Sind Sie sicher, dass Sie dieses Bild löschen möchten?')) {
      return;
    }

    // Find and remove from localStorage
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (localStorage.getItem(key) === imageUrl) {
        localStorage.removeItem(key);
        break;
      }
    }
    
    loadImages();
  };

  const copyImageUrl = (imageUrl: string) => {
    navigator.clipboard.writeText(imageUrl);
    alert('Bild-URL kopiert!');
  };

  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>Medien-Verwaltung</h2>
        <button
          style={styles.createButton}
          onClick={() => fileInputRef.current?.click()}
        >
          Bilder hochladen
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      {/* Upload Area */}
      <div
        style={{
          ...styles.uploadArea,
          borderColor: dragOver ? APP_COLORS.primary : '#d1d5db',
          backgroundColor: dragOver ? '#f0f9ff' : '#f9fafb'
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <div style={styles.uploadIcon}>📁</div>
        <h3 style={styles.uploadTitle}>Bilder hier ablegen oder klicken zum Auswählen</h3>
        <p style={styles.uploadText}>
          Unterstützte Formate: JPG, PNG, WebP (max. 5MB)
        </p>
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div style={styles.uploadProgress}>
          <h4>Upload läuft...</h4>
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} style={styles.progressItem}>
              <span>{fileName}</span>
              <div style={styles.progressBar}>
                <div 
                  style={{
                    ...styles.progressFill,
                    width: `${progress}%`
                  }} 
                />
              </div>
              <span>{progress}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Images Grid */}
      <div style={styles.imagesGrid}>
        {images.length === 0 ? (
          <div style={styles.emptyContainer}>
            <div style={styles.emptyIcon}>🖼️</div>
            <h4 style={styles.emptyTitle}>Noch keine Bilder</h4>
            <p style={styles.emptyText}>
              Laden Sie Ihre ersten Bilder hoch, um sie hier zu verwalten.
            </p>
          </div>
        ) : (
          images.map((imageUrl, index) => (
            <div key={index} style={styles.imageCard}>
              <img
                src={imageUrl}
                alt={`Bild ${index + 1}`}
                style={styles.imagePreview}
              />
              <div style={styles.imageActions}>
                <button
                  style={styles.imageActionButton}
                  onClick={() => copyImageUrl(imageUrl)}
                  title="URL kopieren"
                >
                  📋
                </button>
                <button
                  style={{...styles.imageActionButton, color: '#dc2626'}}
                  onClick={() => deleteImage(imageUrl)}
                  title="Löschen"
                >
                  🗑️
                </button>
              </div>
              <div style={styles.imageInfo}>
                <span style={styles.imageSize}>
                  {Math.round(imageUrl.length * 0.75 / 1024)} KB
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Settings Management Component
const SettingsManagement: React.FC<ContentDashboardProps> = ({ onNavigate: _ }) => {
  const [settings, setSettings] = useState({
    site: {
      title: 'melaniezeyer.de',
      description: 'Hier entsteht gerade etwas großartiges!',
      url: 'https://melaniezeyer.de'
    },
    blog: {
      postsPerPage: BLOG_CONFIG.postsPerPage,
      defaultAuthor: BLOG_CONFIG.defaultAuthor,
      enableComments: BLOG_CONFIG.enableComments,
      moderateComments: BLOG_CONFIG.moderateComments,
      enableSearch: BLOG_CONFIG.enableSearch
    },
    seo: {
      defaultMetaTitle: 'melaniezeyer.de',
      defaultMetaDescription: 'Hier entsteht gerade etwas großartiges!',
      googleAnalyticsId: '',
      facebookPixelId: ''
    },
    preferences: {
      autoSave: true,
      showDrafts: true,
      enableNotifications: true
    }
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSettingChange = (section: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage (in a real app, this would be an API call)
      localStorage.setItem('admin_settings', JSON.stringify(settings));
      setSaveMessage('Einstellungen erfolgreich gespeichert!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage('Fehler beim Speichern der Einstellungen');
    } finally {
      setIsSaving(false);
    }
  };

  const resetSettings = () => {
    if (!confirm('Sind Sie sicher, dass Sie alle Einstellungen zurücksetzen möchten?')) {
      return;
    }
    
    localStorage.removeItem('admin_settings');
    setSettings({
      site: {
        title: 'melaniezeyer.de',
        description: 'Hier entsteht gerade etwas großartiges!',
        url: 'https://melaniezeyer.de'
      },
      blog: {
        postsPerPage: BLOG_CONFIG.postsPerPage,
        defaultAuthor: BLOG_CONFIG.defaultAuthor,
        enableComments: BLOG_CONFIG.enableComments,
        moderateComments: BLOG_CONFIG.moderateComments,
        enableSearch: BLOG_CONFIG.enableSearch
      },
      seo: {
        defaultMetaTitle: 'melaniezeyer.de',
        defaultMetaDescription: 'Hier entsteht gerade etwas großartiges!',
        googleAnalyticsId: '',
        facebookPixelId: ''
      },
      preferences: {
        autoSave: true,
        showDrafts: true,
        enableNotifications: true
      }
    });
  };

  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>Einstellungen</h2>
        <div style={styles.settingsActions}>
          {saveMessage && (
            <span style={{
              ...styles.saveMessage,
              color: saveMessage.includes('Fehler') ? '#dc2626' : '#059669'
            }}>
              {saveMessage}
            </span>
          )}
          <button
            style={styles.actionBtn}
            onClick={resetSettings}
          >
            Zurücksetzen
          </button>
          <button
            style={styles.saveButton}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Speichert...' : 'Speichern'}
          </button>
        </div>
      </div>

      <div style={styles.settingsContainer}>
        {/* Website Settings */}
        <div style={styles.settingsSection}>
          <h3 style={styles.settingsSectionTitle}>Website-Einstellungen</h3>
          
          <div style={styles.formField}>
            <label style={styles.formLabel}>Website-Titel</label>
            <input
              type="text"
              value={settings.site.title}
              onChange={(e) => handleSettingChange('site', 'title', e.target.value)}
              style={styles.formInput}
            />
          </div>

          <div style={styles.formField}>
            <label style={styles.formLabel}>Website-Beschreibung</label>
            <textarea
              value={settings.site.description}
              onChange={(e) => handleSettingChange('site', 'description', e.target.value)}
              style={styles.formTextarea}
              rows={2}
            />
          </div>

          <div style={styles.formField}>
            <label style={styles.formLabel}>Website-URL</label>
            <input
              type="url"
              value={settings.site.url}
              onChange={(e) => handleSettingChange('site', 'url', e.target.value)}
              style={styles.formInput}
            />
          </div>
        </div>

        {/* Blog Settings */}
        <div style={styles.settingsSection}>
          <h3 style={styles.settingsSectionTitle}>Blog-Einstellungen</h3>
          
          <div style={styles.formRow}>
            <div style={styles.formField}>
              <label style={styles.formLabel}>Beiträge pro Seite</label>
              <input
                type="number"
                min="1"
                max="50"
                value={settings.blog.postsPerPage}
                onChange={(e) => handleSettingChange('blog', 'postsPerPage', parseInt(e.target.value))}
                style={styles.formInput}
              />
            </div>

            <div style={styles.formField}>
              <label style={styles.formLabel}>Standard-Autor</label>
              <input
                type="text"
                value={settings.blog.defaultAuthor}
                onChange={(e) => handleSettingChange('blog', 'defaultAuthor', e.target.value)}
                style={styles.formInput}
              />
            </div>
          </div>

          <div style={styles.checkboxGroup}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={settings.blog.enableComments}
                onChange={(e) => handleSettingChange('blog', 'enableComments', e.target.checked)}
              />
              Kommentare aktivieren
            </label>

            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={settings.blog.moderateComments}
                onChange={(e) => handleSettingChange('blog', 'moderateComments', e.target.checked)}
                disabled={!settings.blog.enableComments}
              />
              Kommentare moderieren
            </label>

            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={settings.blog.enableSearch}
                onChange={(e) => handleSettingChange('blog', 'enableSearch', e.target.checked)}
              />
              Suchfunktion aktivieren
            </label>
          </div>
        </div>

        {/* SEO Settings */}
        <div style={styles.settingsSection}>
          <h3 style={styles.settingsSectionTitle}>SEO-Einstellungen</h3>
          
          <div style={styles.formField}>
            <label style={styles.formLabel}>Standard Meta-Titel</label>
            <input
              type="text"
              value={settings.seo.defaultMetaTitle}
              onChange={(e) => handleSettingChange('seo', 'defaultMetaTitle', e.target.value)}
              style={styles.formInput}
            />
          </div>

          <div style={styles.formField}>
            <label style={styles.formLabel}>Standard Meta-Beschreibung</label>
            <textarea
              value={settings.seo.defaultMetaDescription}
              onChange={(e) => handleSettingChange('seo', 'defaultMetaDescription', e.target.value)}
              style={styles.formTextarea}
              rows={2}
            />
          </div>

          <div style={styles.formRow}>
            <div style={styles.formField}>
              <label style={styles.formLabel}>Google Analytics ID</label>
              <input
                type="text"
                value={settings.seo.googleAnalyticsId}
                onChange={(e) => handleSettingChange('seo', 'googleAnalyticsId', e.target.value)}
                style={styles.formInput}
                placeholder="G-XXXXXXXXXX"
              />
            </div>

            <div style={styles.formField}>
              <label style={styles.formLabel}>Facebook Pixel ID</label>
              <input
                type="text"
                value={settings.seo.facebookPixelId}
                onChange={(e) => handleSettingChange('seo', 'facebookPixelId', e.target.value)}
                style={styles.formInput}
                placeholder="123456789012345"
              />
            </div>
          </div>
        </div>

        {/* User Preferences */}
        <div style={styles.settingsSection}>
          <h3 style={styles.settingsSectionTitle}>Benutzer-Einstellungen</h3>
          
          <div style={styles.checkboxGroup}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={settings.preferences.autoSave}
                onChange={(e) => handleSettingChange('preferences', 'autoSave', e.target.checked)}
              />
              Automatisches Speichern aktivieren
            </label>

            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={settings.preferences.showDrafts}
                onChange={(e) => handleSettingChange('preferences', 'showDrafts', e.target.checked)}
              />
              Entwürfe in der Übersicht anzeigen
            </label>

            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={settings.preferences.enableNotifications}
                onChange={(e) => handleSettingChange('preferences', 'enableNotifications', e.target.checked)}
              />
              Browser-Benachrichtigungen aktivieren
            </label>
          </div>
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
        return <PostsManagement onNavigate={handleNavigate} />;
      case 'new-post':
        return <NewPostCreation onNavigate={handleNavigate} />;
      case 'media':
        return <MediaManagement onNavigate={handleNavigate} />;
      case 'settings':
        return <SettingsManagement onNavigate={handleNavigate} />;
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
  
  // Error states
  errorContainer: {
    textAlign: 'center' as const,
    padding: '3rem 2rem',
    backgroundColor: '#fef2f2',
    borderRadius: '0.75rem',
    border: '1px solid #fecaca',
  },
  errorIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  errorTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: '0.5rem',
    margin: 0,
  },
  errorText: {
    color: '#991b1b',
    fontSize: '0.875rem',
    marginBottom: '1.5rem',
  },
  retryButton: {
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  
  // Empty states
  emptyContainer: {
    textAlign: 'center' as const,
    padding: '4rem 2rem',
    backgroundColor: '#f8fafc',
    borderRadius: '0.75rem',
    border: '1px solid #e2e8f0',
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
  emptyTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#475569',
    marginBottom: '0.5rem',
    margin: 0,
  },
  emptyText: {
    color: '#64748b',
    fontSize: '1rem',
    marginBottom: '2rem',
    lineHeight: '1.5',
  },
  createButton: {
    backgroundColor: APP_COLORS.primary,
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },

  // Filters and sorting
  filtersContainer: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap' as const,
    alignItems: 'center',
  },
  filterSelect: {
    padding: '0.5rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    backgroundColor: 'white',
    cursor: 'pointer',
    outline: 'none',
  },

  // Post metadata
  postMeta: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem',
    flexWrap: 'wrap' as const,
    fontSize: '0.75rem',
    color: '#64748b',
  },
  postCategory: {
    backgroundColor: '#f1f5f9',
    color: APP_COLORS.primary,
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem',
    fontWeight: '500',
  },
  postReadingTime: {
    color: '#94a3b8',
  },

  // Tags
  postTags: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap' as const,
    alignItems: 'center',
  },
  tag: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    fontWeight: '500',
  },
  tagMore: {
    color: '#9ca3af',
    fontSize: '0.75rem',
    fontStyle: 'italic' as const,
  },

  // Form styles
  formContainer: {
    maxWidth: '800px',
  },
  formSection: {
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  formSectionTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '1rem',
    margin: 0,
  },
  formField: {
    marginBottom: '1rem',
  },
  formLabel: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '0.5rem',
  },
  formInput: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  formTextarea: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    resize: 'vertical' as const,
    fontFamily: 'inherit',
  },
  formSelect: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    backgroundColor: 'white',
    cursor: 'pointer',
    outline: 'none',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  formError: {
    display: 'block',
    color: '#dc2626',
    fontSize: '0.75rem',
    marginTop: '0.25rem',
  },
  autoSlugLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginLeft: '1rem',
    fontSize: '0.75rem',
    fontWeight: '400',
    color: '#64748b',
    cursor: 'pointer',
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
    paddingTop: '1rem',
    justifyContent: 'flex-end',
  },
  saveButton: {
    backgroundColor: '#64748b',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  publishButton: {
    backgroundColor: APP_COLORS.primary,
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },

  // Media management
  uploadArea: {
    border: '2px dashed #d1d5db',
    borderRadius: '0.75rem',
    padding: '3rem 2rem',
    textAlign: 'center' as const,
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginBottom: '2rem',
  },
  uploadIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  uploadTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.5rem',
    margin: 0,
  },
  uploadText: {
    color: '#64748b',
    fontSize: '0.875rem',
  },
  uploadProgress: {
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    marginBottom: '2rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  progressItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '0.5rem',
  },
  progressBar: {
    flex: 1,
    height: '0.5rem',
    backgroundColor: '#f3f4f6',
    borderRadius: '0.25rem',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: APP_COLORS.primary,
    transition: 'width 0.3s',
  },
  imagesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
  },
  imageCard: {
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    position: 'relative' as const,
  },
  imagePreview: {
    width: '100%',
    height: '150px',
    objectFit: 'cover' as const,
  },
  imageActions: {
    position: 'absolute' as const,
    top: '0.5rem',
    right: '0.5rem',
    display: 'flex',
    gap: '0.25rem',
  },
  imageActionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    border: 'none',
    borderRadius: '0.25rem',
    padding: '0.25rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    transition: 'background-color 0.2s',
  },
  imageInfo: {
    padding: '0.75rem',
    borderTop: '1px solid #f3f4f6',
  },
  imageSize: {
    fontSize: '0.75rem',
    color: '#64748b',
  },

  // Settings
  settingsContainer: {
    maxWidth: '800px',
  },
  settingsSection: {
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  settingsSectionTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '1rem',
    margin: 0,
  },
  settingsActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  saveMessage: {
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  checkboxGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    color: '#374151',
    cursor: 'pointer',
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