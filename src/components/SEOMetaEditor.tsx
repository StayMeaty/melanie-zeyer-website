import React, { useState, useEffect, useMemo } from 'react';
import { BlogSEO } from '../types/blog';
import { APP_COLORS } from '../types';

interface SEOMetaEditorProps {
  seo: BlogSEO;
  onChange: (seo: BlogSEO) => void;
  postTitle?: string;
  postExcerpt?: string;
  postUrl?: string;
}

interface SEOSection {
  id: string;
  title: string;
  isOpen: boolean;
}

const SEOMetaEditor: React.FC<SEOMetaEditorProps> = ({
  seo,
  onChange,
  postTitle = '',
  postExcerpt = '',
  postUrl = '',
}) => {
  const [sections, setSections] = useState<SEOSection[]>([
    { id: 'basic', title: 'Grundlegende Meta-Daten', isOpen: true },
    { id: 'opengraph', title: 'OpenGraph (Social Media)', isOpen: false },
    { id: 'twitter', title: 'Twitter Card', isOpen: false },
    { id: 'advanced', title: 'Erweiterte Einstellungen', isOpen: false },
  ]);

  const [keywords, setKeywords] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [twitterCardType, setTwitterCardType] = useState<'summary' | 'summary_large_image'>('summary_large_image');

  // Initialize keywords from seo prop
  useEffect(() => {
    if (seo.keywords?.length) {
      setKeywords(seo.keywords.join(', '));
    }
  }, [seo.keywords]);

  // Calculate character counts and limits
  const titleCount = seo.metaTitle?.length || 0;
  const descriptionCount = seo.metaDescription?.length || 0;

  // Character limit constants
  const TITLE_RECOMMENDED = 60;
  const TITLE_MAX = 70;
  const DESCRIPTION_RECOMMENDED = 155;
  const DESCRIPTION_MAX = 160;

  // Fallback values
  const displayTitle = seo.metaTitle || postTitle;
  const displayDescription = seo.metaDescription || postExcerpt;
  const displayUrl = seo.canonicalUrl || postUrl;

  // SEO Score calculation
  const seoScore = useMemo(() => {
    let score = 0;
    const maxScore = 100;
    
    // Title (25 points)
    if (seo.metaTitle) {
      if (seo.metaTitle.length >= 30 && seo.metaTitle.length <= TITLE_RECOMMENDED) {
        score += 25;
      } else if (seo.metaTitle.length <= TITLE_MAX) {
        score += 15;
      } else {
        score += 5;
      }
    }

    // Description (25 points)
    if (seo.metaDescription) {
      if (seo.metaDescription.length >= 120 && seo.metaDescription.length <= DESCRIPTION_RECOMMENDED) {
        score += 25;
      } else if (seo.metaDescription.length <= DESCRIPTION_MAX) {
        score += 15;
      } else {
        score += 5;
      }
    }

    // Keywords (15 points)
    if (seo.keywords?.length) {
      if (seo.keywords.length >= 3 && seo.keywords.length <= 10) {
        score += 15;
      } else if (seo.keywords.length > 0) {
        score += 8;
      }
    }

    // Canonical URL (10 points)
    if (seo.canonicalUrl) score += 10;

    // OpenGraph (15 points)
    if (seo.ogTitle && seo.ogDescription) {
      score += 15;
    } else if (seo.ogTitle || seo.ogDescription) {
      score += 8;
    }

    // Image (10 points)
    if (seo.ogImage) score += 10;

    return Math.min(score, maxScore);
  }, [seo]);

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e'; // Green
    if (score >= 60) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  };

  // Get character count color
  const getCharCountColor = (count: number, recommended: number, max: number) => {
    if (count <= recommended) return '#22c55e'; // Green
    if (count <= max) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  };

  // Handle input changes
  const handleInputChange = (field: keyof BlogSEO, value: string) => {
    onChange({
      ...seo,
      [field]: value || undefined,
    });
  };

  // Handle keywords
  const handleKeywordsChange = (value: string) => {
    setKeywords(value);
    const keywordArray = value
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);
    
    onChange({
      ...seo,
      keywords: keywordArray.length > 0 ? keywordArray : undefined,
    });
  };

  // Add keyword
  const addKeyword = () => {
    if (keywordInput.trim()) {
      const currentKeywords = keywords ? keywords + ', ' + keywordInput.trim() : keywordInput.trim();
      handleKeywordsChange(currentKeywords);
      setKeywordInput('');
    }
  };

  // Toggle section
  const toggleSection = (sectionId: string) => {
    setSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, isOpen: !section.isOpen }
          : section
      )
    );
  };

  // Styles
  const styles: Record<string, React.CSSProperties> = {
    container: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      overflow: 'hidden',
    },
    header: {
      padding: '1rem 1.5rem',
      backgroundColor: '#f8f9fa',
      borderBottom: '1px solid #e9ecef',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#2d3748',
      margin: 0,
    },
    scoreContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    scoreCircle: {
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '0.875rem',
      backgroundColor: getScoreColor(seoScore),
    },
    scoreLabel: {
      fontSize: '0.75rem',
      color: '#6b7280',
    },
    content: {
      padding: '1.5rem',
    },
    section: {
      marginBottom: '1.5rem',
    },
    sectionHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem 0',
      cursor: 'pointer',
      borderBottom: '1px solid #e5e7eb',
    },
    sectionTitle: {
      fontSize: '1rem',
      fontWeight: '500',
      color: '#374151',
    },
    sectionIcon: {
      width: '20px',
      height: '20px',
      color: '#6b7280',
      transition: 'transform 0.2s',
    },
    sectionContent: {
      padding: '1rem 0',
    },
    inputGroup: {
      marginBottom: '1rem',
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '0.5rem',
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      fontSize: '0.875rem',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      outline: 'none',
      transition: 'border-color 0.2s',
      boxSizing: 'border-box',
    },
    textarea: {
      width: '100%',
      padding: '0.75rem',
      fontSize: '0.875rem',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      outline: 'none',
      transition: 'border-color 0.2s',
      resize: 'vertical',
      minHeight: '80px',
      boxSizing: 'border-box',
    },
    charCounter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '0.25rem',
      fontSize: '0.75rem',
    },
    charCount: {
      fontWeight: '500',
    },
    charBar: {
      flex: 1,
      height: '4px',
      backgroundColor: '#e5e7eb',
      borderRadius: '2px',
      margin: '0 0.5rem',
      overflow: 'hidden',
    },
    charProgress: {
      height: '100%',
      borderRadius: '2px',
      transition: 'all 0.3s ease',
    },
    keywordContainer: {
      display: 'flex',
      gap: '0.5rem',
      alignItems: 'flex-start',
    },
    keywordInput: {
      flex: 1,
      padding: '0.5rem',
      fontSize: '0.875rem',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      outline: 'none',
    },
    addKeywordBtn: {
      padding: '0.5rem 1rem',
      backgroundColor: APP_COLORS.primary,
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '0.875rem',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
    },
    keywordTags: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      marginTop: '0.5rem',
    },
    keywordTag: {
      padding: '0.25rem 0.5rem',
      backgroundColor: '#f3f4f6',
      color: '#374151',
      fontSize: '0.75rem',
      borderRadius: '4px',
      border: '1px solid #d1d5db',
    },
    previewContainer: {
      marginTop: '1.5rem',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      overflow: 'hidden',
    },
    previewHeader: {
      padding: '0.75rem 1rem',
      backgroundColor: '#f9fafb',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    previewTitle: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
    },
    previewToggle: {
      display: 'flex',
      backgroundColor: '#e5e7eb',
      borderRadius: '6px',
      overflow: 'hidden',
    },
    previewToggleBtn: {
      padding: '0.25rem 0.75rem',
      fontSize: '0.75rem',
      border: 'none',
      cursor: 'pointer',
      backgroundColor: 'transparent',
      color: '#6b7280',
    },
    previewToggleBtnActive: {
      backgroundColor: APP_COLORS.primary,
      color: 'white',
    },
    previewContent: {
      padding: '1rem',
    },
    googlePreview: {
      fontFamily: 'arial, sans-serif',
    },
    googleUrl: {
      fontSize: '14px',
      color: '#006621',
      lineHeight: '20px',
      marginBottom: '3px',
    },
    googleTitle: {
      fontSize: '20px',
      color: '#1a0dab',
      lineHeight: '26px',
      marginBottom: '3px',
      cursor: 'pointer',
      textDecoration: 'none',
      display: 'block',
    },
    googleDescription: {
      fontSize: '14px',
      color: '#4d5156',
      lineHeight: '22px',
    },
    select: {
      width: '100%',
      padding: '0.75rem',
      fontSize: '0.875rem',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      outline: 'none',
      backgroundColor: 'white',
      cursor: 'pointer',
    },
    suggestions: {
      marginTop: '1rem',
      padding: '0.75rem',
      backgroundColor: '#fef3c7',
      borderRadius: '6px',
      border: '1px solid #fbbf24',
    },
    suggestionsList: {
      listStyle: 'disc',
      paddingLeft: '1.25rem',
      margin: 0,
    },
    suggestionItem: {
      fontSize: '0.875rem',
      color: '#92400e',
      marginBottom: '0.25rem',
    },
    row: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
    },
  };

  // Generate suggestions
  const getSuggestions = () => {
    const suggestions: string[] = [];
    
    if (!seo.metaTitle) {
      suggestions.push('Fügen Sie einen Meta-Titel hinzu');
    } else if (titleCount > TITLE_MAX) {
      suggestions.push(`Meta-Titel ist zu lang (${titleCount}/${TITLE_MAX} Zeichen)`);
    } else if (titleCount < 30) {
      suggestions.push('Meta-Titel könnte länger sein (mindestens 30 Zeichen)');
    }

    if (!seo.metaDescription) {
      suggestions.push('Fügen Sie eine Meta-Beschreibung hinzu');
    } else if (descriptionCount > DESCRIPTION_MAX) {
      suggestions.push(`Meta-Beschreibung ist zu lang (${descriptionCount}/${DESCRIPTION_MAX} Zeichen)`);
    } else if (descriptionCount < 120) {
      suggestions.push('Meta-Beschreibung könnte länger sein (mindestens 120 Zeichen)');
    }

    if (!seo.keywords?.length) {
      suggestions.push('Fügen Sie relevante Keywords hinzu');
    } else if (seo.keywords.length > 10) {
      suggestions.push('Reduzieren Sie die Anzahl der Keywords (maximal 10)');
    }

    if (!seo.canonicalUrl) {
      suggestions.push('Legen Sie eine kanonische URL fest');
    }

    if (!seo.ogImage) {
      suggestions.push('Fügen Sie ein OpenGraph-Bild hinzu');
    }

    return suggestions;
  };

  const suggestions = getSuggestions();

  // Character progress calculation
  const getCharProgress = (count: number, _recommended: number, max: number) => {
    const percentage = Math.min((count / max) * 100, 100);
    return percentage;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>SEO-Optimierung</h3>
        <div style={styles.scoreContainer}>
          <div style={styles.scoreCircle}>
            {seoScore}
          </div>
          <div style={styles.scoreLabel}>
            SEO Score
          </div>
        </div>
      </div>

      <div style={styles.content}>
        {/* Basic Meta Data Section */}
        {sections.map(section => (
          <div key={section.id} style={styles.section}>
            <div 
              style={styles.sectionHeader}
              onClick={() => toggleSection(section.id)}
            >
              <h4 style={styles.sectionTitle}>{section.title}</h4>
              <svg 
                style={{
                  ...styles.sectionIcon,
                  transform: section.isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {section.isOpen && (
              <div style={styles.sectionContent}>
                {section.id === 'basic' && (
                  <>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>
                        Meta-Titel *
                      </label>
                      <input
                        type="text"
                        style={styles.input}
                        value={seo.metaTitle || ''}
                        onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                        placeholder={postTitle || 'Titel für Suchmaschinen eingeben...'}
                        onFocus={(e) => e.target.style.borderColor = APP_COLORS.primary}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                      />
                      <div style={styles.charCounter}>
                        <span 
                          style={{
                            ...styles.charCount,
                            color: getCharCountColor(titleCount, TITLE_RECOMMENDED, TITLE_MAX),
                          }}
                        >
                          {titleCount}/{TITLE_MAX}
                        </span>
                        <div style={styles.charBar}>
                          <div 
                            style={{
                              ...styles.charProgress,
                              width: `${getCharProgress(titleCount, TITLE_RECOMMENDED, TITLE_MAX)}%`,
                              backgroundColor: getCharCountColor(titleCount, TITLE_RECOMMENDED, TITLE_MAX),
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          Empfohlen: {TITLE_RECOMMENDED}
                        </span>
                      </div>
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>
                        Meta-Beschreibung *
                      </label>
                      <textarea
                        style={styles.textarea}
                        value={seo.metaDescription || ''}
                        onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                        placeholder={postExcerpt || 'Beschreibung für Suchmaschinen eingeben...'}
                        onFocus={(e) => e.target.style.borderColor = APP_COLORS.primary}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                      />
                      <div style={styles.charCounter}>
                        <span 
                          style={{
                            ...styles.charCount,
                            color: getCharCountColor(descriptionCount, DESCRIPTION_RECOMMENDED, DESCRIPTION_MAX),
                          }}
                        >
                          {descriptionCount}/{DESCRIPTION_MAX}
                        </span>
                        <div style={styles.charBar}>
                          <div 
                            style={{
                              ...styles.charProgress,
                              width: `${getCharProgress(descriptionCount, DESCRIPTION_RECOMMENDED, DESCRIPTION_MAX)}%`,
                              backgroundColor: getCharCountColor(descriptionCount, DESCRIPTION_RECOMMENDED, DESCRIPTION_MAX),
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          Empfohlen: {DESCRIPTION_RECOMMENDED}
                        </span>
                      </div>
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>
                        Kanonische URL
                      </label>
                      <input
                        type="url"
                        style={styles.input}
                        value={seo.canonicalUrl || ''}
                        onChange={(e) => handleInputChange('canonicalUrl', e.target.value)}
                        placeholder={postUrl || 'https://melaniezeyer.de/blog/...'}
                        onFocus={(e) => e.target.style.borderColor = APP_COLORS.primary}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                      />
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>
                        Keywords
                      </label>
                      <div style={styles.keywordContainer}>
                        <input
                          type="text"
                          style={styles.keywordInput}
                          value={keywordInput}
                          onChange={(e) => setKeywordInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                          placeholder="Keyword eingeben und Enter drücken..."
                        />
                        <button
                          type="button"
                          style={styles.addKeywordBtn}
                          onClick={addKeyword}
                          disabled={!keywordInput.trim()}
                        >
                          Hinzufügen
                        </button>
                      </div>
                      <input
                        type="text"
                        style={{ ...styles.input, marginTop: '0.5rem' }}
                        value={keywords}
                        onChange={(e) => handleKeywordsChange(e.target.value)}
                        placeholder="Keywords (durch Komma getrennt)"
                        onFocus={(e) => e.target.style.borderColor = APP_COLORS.primary}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                      />
                      {seo.keywords?.length && (
                        <div style={styles.keywordTags}>
                          {seo.keywords.map((keyword, index) => (
                            <span key={index} style={styles.keywordTag}>
                              {keyword}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {section.id === 'opengraph' && (
                  <>
                    <div style={styles.row}>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>
                          OpenGraph Titel
                        </label>
                        <input
                          type="text"
                          style={styles.input}
                          value={seo.ogTitle || ''}
                          onChange={(e) => handleInputChange('ogTitle', e.target.value)}
                          placeholder={seo.metaTitle || postTitle || 'OG Titel...'}
                          onFocus={(e) => e.target.style.borderColor = APP_COLORS.primary}
                          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>
                          OpenGraph Bild URL
                        </label>
                        <input
                          type="url"
                          style={styles.input}
                          value={seo.ogImage || ''}
                          onChange={(e) => handleInputChange('ogImage', e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          onFocus={(e) => e.target.style.borderColor = APP_COLORS.primary}
                          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                      </div>
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>
                        OpenGraph Beschreibung
                      </label>
                      <textarea
                        style={styles.textarea}
                        value={seo.ogDescription || ''}
                        onChange={(e) => handleInputChange('ogDescription', e.target.value)}
                        placeholder={seo.metaDescription || postExcerpt || 'OG Beschreibung...'}
                        onFocus={(e) => e.target.style.borderColor = APP_COLORS.primary}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                      />
                    </div>
                  </>
                )}

                {section.id === 'twitter' && (
                  <>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>
                        Twitter Card Typ
                      </label>
                      <select
                        style={styles.select}
                        value={twitterCardType}
                        onChange={(e) => setTwitterCardType(e.target.value as 'summary' | 'summary_large_image')}
                      >
                        <option value="summary_large_image">Großes Bild</option>
                        <option value="summary">Zusammenfassung</option>
                      </select>
                    </div>

                    <div style={styles.row}>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>
                          Twitter Titel
                        </label>
                        <input
                          type="text"
                          style={styles.input}
                          value={seo.twitterTitle || ''}
                          onChange={(e) => handleInputChange('twitterTitle', e.target.value)}
                          placeholder={seo.ogTitle || seo.metaTitle || postTitle || 'Twitter Titel...'}
                          onFocus={(e) => e.target.style.borderColor = APP_COLORS.primary}
                          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>
                          Twitter Bild URL
                        </label>
                        <input
                          type="url"
                          style={styles.input}
                          value={seo.twitterImage || ''}
                          onChange={(e) => handleInputChange('twitterImage', e.target.value)}
                          placeholder={seo.ogImage || 'https://example.com/image.jpg'}
                          onFocus={(e) => e.target.style.borderColor = APP_COLORS.primary}
                          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                      </div>
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>
                        Twitter Beschreibung
                      </label>
                      <textarea
                        style={styles.textarea}
                        value={seo.twitterDescription || ''}
                        onChange={(e) => handleInputChange('twitterDescription', e.target.value)}
                        placeholder={seo.ogDescription || seo.metaDescription || postExcerpt || 'Twitter Beschreibung...'}
                        onFocus={(e) => e.target.style.borderColor = APP_COLORS.primary}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                      />
                    </div>
                  </>
                )}

                {section.id === 'advanced' && (
                  <>
                    <div style={styles.row}>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>
                          Robots Meta Tag
                        </label>
                        <select
                          style={styles.select}
                          value={seo.robots || 'index,follow'}
                          onChange={(e) => handleInputChange('robots', e.target.value)}
                        >
                          <option value="index,follow">Index, Follow</option>
                          <option value="noindex,follow">NoIndex, Follow</option>
                          <option value="index,nofollow">Index, NoFollow</option>
                          <option value="noindex,nofollow">NoIndex, NoFollow</option>
                        </select>
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>
                          Focus Keyphrase
                        </label>
                        <input
                          type="text"
                          style={styles.input}
                          value={seo.focusKeyphrase || ''}
                          onChange={(e) => handleInputChange('focusKeyphrase', e.target.value)}
                          placeholder="Haupt-Keyword für diesen Beitrag..."
                          onFocus={(e) => e.target.style.borderColor = APP_COLORS.primary}
                          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Google Search Preview */}
        <div style={styles.previewContainer}>
          <div style={styles.previewHeader}>
            <h4 style={styles.previewTitle}>Google Suchergebnis Vorschau</h4>
            <div style={styles.previewToggle}>
              <button
                style={{
                  ...styles.previewToggleBtn,
                  ...(previewMode === 'desktop' ? styles.previewToggleBtnActive : {}),
                }}
                onClick={() => setPreviewMode('desktop')}
              >
                Desktop
              </button>
              <button
                style={{
                  ...styles.previewToggleBtn,
                  ...(previewMode === 'mobile' ? styles.previewToggleBtnActive : {}),
                }}
                onClick={() => setPreviewMode('mobile')}
              >
                Mobil
              </button>
            </div>
          </div>
          
          <div style={styles.previewContent}>
            <div style={styles.googlePreview}>
              <div style={styles.googleUrl}>
                {displayUrl || 'melaniezeyer.de › blog › ihr-beitrag'}
              </div>
              <div style={styles.googleTitle}>
                {displayTitle || 'Ihr Beitragstitel'}
              </div>
              <div style={styles.googleDescription}>
                {displayDescription || 'Ihre Beitragsbeschreibung wird hier angezeigt...'}
              </div>
            </div>
          </div>
        </div>

        {/* SEO Suggestions */}
        {suggestions.length > 0 && (
          <div style={styles.suggestions}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#92400e' }}>
              Verbesserungsvorschläge:
            </h4>
            <ul style={styles.suggestionsList}>
              {suggestions.map((suggestion, index) => (
                <li key={index} style={styles.suggestionItem}>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SEOMetaEditor;