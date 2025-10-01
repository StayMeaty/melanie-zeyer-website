import React, { useState, useRef, useEffect, useCallback } from 'react';
import { APP_COLORS, APP_CONFIG } from '../types';
import { BLOG_CONFIG } from '../types/blog';
import GitHubImageService from '../services/githubImageService';

interface ImageUploadModalProps {
  isOpen: boolean;
  onInsert: (imageUrl: string, altText: string) => void;
  onClose: () => void;
  currentImage?: string;
}

interface UploadedImage {
  id: string;
  name: string;
  url: string;
  altText: string;
  size: number;
  width: number;
  height: number;
  type: string;
  uploadedAt: string;
  storageType?: 'localStorage' | 'github';
  sha?: string; // GitHub SHA for updates/deletions
  filename?: string; // GitHub filename
}

interface ProcessedImage {
  url: string;
  name: string;
  size: number;
  width: number;
  height: number;
  type: string;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onInsert,
  onClose,
  currentImage
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [altText, setAltText] = useState('');
  const [selectedImage, setSelectedImage] = useState<ProcessedImage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const [storageMethod, setStorageMethod] = useState<'localStorage' | 'github'>('localStorage');
  const [githubConnected, setGithubConnected] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isCheckingGitHub, setIsCheckingGitHub] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  // Load uploaded images from localStorage on mount and check GitHub connection
  useEffect(() => {
    const stored = localStorage.getItem('blog-uploaded-images');
    if (stored) {
      try {
        const localImages = JSON.parse(stored).map((img: UploadedImage) => ({
          ...img,
          storageType: img.storageType || 'localStorage'
        }));
        setUploadedImages(localImages);
      } catch (error) {
        console.error('Error loading uploaded images:', error);
      }
    }

    // Check GitHub connection when modal opens
    if (isOpen) {
      checkGitHubConnection();
    }
  }, [isOpen]);

  // Check GitHub connection availability
  const checkGitHubConnection = async () => {
    setIsCheckingGitHub(true);
    try {
      const isConnected = await GitHubImageService.checkConnection();
      setGithubConnected(isConnected);
      
      // Auto-select GitHub if available, localStorage if not
      if (isConnected && storageMethod === 'localStorage') {
        setStorageMethod('github');
      } else if (!isConnected && storageMethod === 'github') {
        setStorageMethod('localStorage');
      }
    } catch (error) {
      console.error('GitHub connection check failed:', error);
      setGithubConnected(false);
      setStorageMethod('localStorage');
    } finally {
      setIsCheckingGitHub(false);
    }
  };

  // Save images to localStorage whenever uploadedImages changes
  useEffect(() => {
    localStorage.setItem('blog-uploaded-images', JSON.stringify(uploadedImages));
  }, [uploadedImages]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setUrlInput(currentImage || '');
      setAltText('');
      setSelectedImage(null);
      setError(null);
      setSearchQuery('');
      setUploadMethod('file');
      setUploadProgress(0);
    }
  }, [isOpen, currentImage]);

  // Handle file upload with GitHub integration
  const handleFiles = useCallback(async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    setError(null);
    setIsProcessing(true);
    setUploadProgress(0);

    try {
      // Validate file type
      if (!BLOG_CONFIG.imageSettings.allowedTypes.includes(file.type)) {
        throw new Error(`Dateityp nicht unterstützt. Erlaubt: ${BLOG_CONFIG.imageSettings.allowedTypes.join(', ')}`);
      }

      // Validate file size
      if (file.size > BLOG_CONFIG.imageSettings.maxSize) {
        throw new Error(`Datei zu groß. Maximum: ${(BLOG_CONFIG.imageSettings.maxSize / (1024 * 1024)).toFixed(1)}MB`);
      }

      const processed = await processImage(file);
      setSelectedImage(processed);
      
      // If GitHub storage is selected and available, upload immediately
      if (storageMethod === 'github' && githubConnected && altText.trim()) {
        await handleGitHubUpload(processed);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Fehler beim Verarbeiten der Datei');
    } finally {
      setIsProcessing(false);
    }
  }, [storageMethod, githubConnected, altText]);

  // Handle GitHub upload with progress tracking
  const handleGitHubUpload = async (image: ProcessedImage) => {
    if (!altText.trim()) {
      setError('Alt-Text ist für GitHub-Upload erforderlich');
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);

    try {
      const result = await GitHubImageService.uploadImage(
        image,
        altText,
        (progress) => setUploadProgress(progress)
      );

      if (result.success && result.url && result.filename) {
        // Create GitHub image entry
        const githubImage: UploadedImage = {
          id: Date.now().toString(),
          name: result.filename,
          url: result.url,
          altText: altText,
          size: image.size,
          width: image.width,
          height: image.height,
          type: image.type,
          uploadedAt: new Date().toISOString(),
          storageType: 'github',
          sha: result.sha,
          filename: result.filename
        };

        // Add to uploaded images list
        setUploadedImages(prev => [githubImage, ...prev]);
        
        // Update selected image to use GitHub URL
        setSelectedImage({
          ...image,
          url: result.url
        });

        setError(null);
        return githubImage;
      } else {
        // Fallback to localStorage with notification
        const fallbackMessage = `Upload fehlgeschlagen: ${result.error}. Bild wird lokal gespeichert.`;
        setError(fallbackMessage);
        setStorageMethod('localStorage');
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'GitHub Upload fehlgeschlagen';
      setError(`${errorMessage}. Bild wird lokal gespeichert.`);
      setStorageMethod('localStorage');
      return null;
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  // Process image: convert to base64 and resize if needed
  const processImage = async (file: File): Promise<ProcessedImage> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const img = new Image();

      reader.onload = (e) => {
        if (!e.target?.result) {
          reject(new Error('Fehler beim Lesen der Datei'));
          return;
        }

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Canvas nicht verfügbar'));
            return;
          }

          // Calculate new dimensions (max width 1200px)
          const maxWidth = 1200;
          let { width, height } = img;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with quality compression for JPEG
          const quality = file.type === 'image/jpeg' ? 0.85 : undefined;
          const dataUrl = canvas.toDataURL(file.type, quality);

          resolve({
            url: dataUrl,
            name: file.name,
            size: Math.round(dataUrl.length * 0.75), // Approximate base64 size
            width,
            height,
            type: file.type
          });
        };

        img.onerror = () => reject(new Error('Ungültiges Bildformat'));
        img.src = e.target.result as string;
      };

      reader.onerror = () => reject(new Error('Fehler beim Lesen der Datei'));
      reader.readAsDataURL(file);
    });
  };

  // Handle URL input
  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return;

    setError(null);
    setIsProcessing(true);

    try {
      // Create image element to validate URL and get dimensions
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Bild konnte nicht geladen werden'));
        img.src = urlInput;
      });

      setSelectedImage({
        url: urlInput,
        name: urlInput.split('/').pop() || 'external-image',
        size: 0, // Unknown for external URLs
        width: img.width,
        height: img.height,
        type: 'external'
      });
    } catch {
      setError('Bild-URL konnte nicht geladen werden');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle paste from clipboard
  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          const dt = new DataTransfer();
          dt.items.add(file);
          await handleFiles(dt.files);
        }
        break;
      }
    }
  }, [handleFiles]);

  // Add paste event listener
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('paste', handlePaste);
      return () => document.removeEventListener('paste', handlePaste);
    }
  }, [isOpen, handlePaste]);

  // Save uploaded image with storage type
  const saveUploadedImage = (image: ProcessedImage, storageType: 'localStorage' | 'github' = 'localStorage') => {
    const newImage: UploadedImage = {
      id: Date.now().toString(),
      name: image.name,
      url: image.url,
      altText: altText || image.name,
      size: image.size,
      width: image.width,
      height: image.height,
      type: image.type,
      uploadedAt: new Date().toISOString(),
      storageType
    };

    setUploadedImages(prev => [newImage, ...prev]);
    return newImage;
  };

  // Handle insert with GitHub upload if needed
  const handleInsert = async () => {
    if (!selectedImage || !altText.trim()) {
      setError('Bitte geben Sie einen Alt-Text ein');
      return;
    }

    try {
      let finalImage = selectedImage;
      const finalAltText = altText;

      // If GitHub storage is selected and we haven't uploaded yet
      if (storageMethod === 'github' && githubConnected && selectedImage.type !== 'external') {
        const existingGitHubImage = uploadedImages.find(
          img => img.url === selectedImage.url && img.storageType === 'github'
        );
        
        if (!existingGitHubImage) {
          const uploadedImage = await handleGitHubUpload(selectedImage);
          if (uploadedImage) {
            finalImage = { ...selectedImage, url: uploadedImage.url };
          }
        }
      }

      // Save to gallery if it's a new upload
      if (finalImage.type !== 'external' && !uploadedImages.find(img => img.url === finalImage.url)) {
        saveUploadedImage(finalImage, storageMethod);
      }

      onInsert(finalImage.url, finalAltText);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Fehler beim Einfügen des Bildes');
    }
  };

  // Delete image from gallery with GitHub integration
  const deleteImage = async (id: string) => {
    const imageToDelete = uploadedImages.find(img => img.id === id);
    if (!imageToDelete) return;

    try {
      // If it's a GitHub image, try to delete from repository
      if (imageToDelete.storageType === 'github' && imageToDelete.filename && githubConnected) {
        try {
          await GitHubImageService.deleteImage(imageToDelete.filename, imageToDelete.sha);
        } catch (error) {
          console.warn('Failed to delete from GitHub:', error);
          // Continue with local deletion even if GitHub deletion fails
        }
      }

      // Remove from local state
      setUploadedImages(prev => prev.filter(img => img.id !== id));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Fehler beim Löschen des Bildes');
    }
  };

  // Select image from gallery
  const selectImageFromGallery = (image: UploadedImage) => {
    setSelectedImage({
      url: image.url,
      name: image.name,
      size: image.size,
      width: image.width,
      height: image.height,
      type: image.type
    });
    setAltText(image.altText);
  };

  // Filter images based on search across both storage types
  const filteredImages = uploadedImages.filter(image =>
    image.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    image.altText.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Separate images by storage type for gallery display
  const localImages = filteredImages.filter(img => img.storageType !== 'github');
  const repoImages = filteredImages.filter(img => img.storageType === 'github');

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return 'Unbekannt';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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
    },
    modal: {
      backgroundColor: APP_CONFIG.colors.background,
      borderRadius: '1rem',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      width: '90%',
      maxWidth: '900px',
      maxHeight: '90vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      animation: 'fadeInScale 0.2s ease-out',
    },
    header: {
      padding: '1.5rem 2rem',
      borderBottom: `1px solid ${APP_COLORS.secondary}20`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: APP_COLORS.primary,
      margin: 0,
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '1.5rem',
      color: APP_COLORS.secondary,
      cursor: 'pointer',
      width: '2rem',
      height: '2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '0.5rem',
      transition: 'color 0.2s ease, background-color 0.2s ease',
    },
    content: {
      display: 'flex',
      flex: 1,
      overflow: 'hidden',
    },
    leftPanel: {
      width: '50%',
      padding: '1.5rem',
      borderRight: `1px solid ${APP_COLORS.secondary}20`,
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    rightPanel: {
      width: '50%',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
    },
    methodSelector: {
      display: 'flex',
      borderRadius: '0.5rem',
      backgroundColor: `${APP_COLORS.secondary}10`,
      padding: '0.25rem',
    },
    methodButton: {
      flex: 1,
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      backgroundColor: 'transparent',
      color: APP_COLORS.secondary,
    },
    methodButtonActive: {
      backgroundColor: APP_COLORS.primary,
      color: 'white',
    },
    dropZone: {
      border: `2px dashed ${dragActive ? APP_COLORS.primary : APP_COLORS.secondary}40`,
      borderRadius: '0.5rem',
      padding: '2rem',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      backgroundColor: dragActive ? `${APP_COLORS.primary}05` : 'transparent',
    },
    dropZoneText: {
      color: APP_COLORS.secondary,
      fontSize: '1rem',
      margin: '0.5rem 0',
    },
    dropZoneIcon: {
      fontSize: '3rem',
      color: APP_COLORS.accent,
      marginBottom: '1rem',
    },
    input: {
      padding: '0.75rem',
      fontSize: '0.875rem',
      border: `1px solid ${APP_COLORS.secondary}40`,
      borderRadius: '0.375rem',
      outline: 'none',
      transition: 'border-color 0.2s ease',
      fontFamily: 'inherit',
    },
    inputFocus: {
      borderColor: APP_COLORS.primary,
    },
    button: {
      padding: '0.75rem 1.5rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      fontFamily: 'inherit',
      borderRadius: '0.375rem',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    primaryButton: {
      backgroundColor: APP_COLORS.primary,
      color: 'white',
    },
    secondaryButton: {
      backgroundColor: `${APP_COLORS.secondary}20`,
      color: APP_COLORS.secondary,
    },
    preview: {
      border: `1px solid ${APP_COLORS.secondary}20`,
      borderRadius: '0.5rem',
      padding: '1rem',
      backgroundColor: `${APP_COLORS.secondary}05`,
    },
    previewImage: {
      width: '100%',
      maxHeight: '200px',
      objectFit: 'contain',
      borderRadius: '0.375rem',
      marginBottom: '0.75rem',
    },
    previewInfo: {
      fontSize: '0.75rem',
      color: APP_COLORS.secondary,
      marginBottom: '0.5rem',
    },
    gallery: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
    },
    galleryHeader: {
      display: 'flex',
      gap: '0.75rem',
      marginBottom: '1rem',
    },
    searchInput: {
      flex: 1,
    },
    galleryGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
      gap: '0.75rem',
      flex: 1,
      overflowY: 'auto',
      maxHeight: '300px',
    },
    storageSelector: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
      marginBottom: '1rem',
      padding: '0.75rem',
      backgroundColor: `${APP_COLORS.secondary}05`,
      borderRadius: '0.5rem',
      border: `1px solid ${APP_COLORS.secondary}20`,
    },
    radioGroup: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
    },
    radioOption: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      cursor: 'pointer',
      padding: '0.25rem 0.5rem',
      borderRadius: '0.25rem',
      transition: 'background-color 0.2s ease',
    },
    radioInput: {
      marginRight: '0.25rem',
    },
    connectionStatus: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      fontSize: '0.75rem',
      padding: '0.25rem 0.5rem',
      borderRadius: '0.25rem',
      backgroundColor: 'transparent',
    },
    progressBar: {
      width: '100%',
      height: '0.5rem',
      backgroundColor: `${APP_COLORS.secondary}20`,
      borderRadius: '0.25rem',
      overflow: 'hidden',
      marginTop: '0.5rem',
    },
    progressFill: {
      height: '100%',
      backgroundColor: APP_COLORS.primary,
      borderRadius: '0.25rem',
      transition: 'width 0.3s ease',
    },
    gallerySection: {
      marginBottom: '1rem',
    },
    gallerySectionTitle: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: APP_COLORS.primary,
      marginBottom: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    sectionIcon: {
      fontSize: '1rem',
    },
    imageStorageBadge: {
      position: 'absolute',
      bottom: '0.25rem',
      left: '0.25rem',
      fontSize: '0.5rem',
      padding: '0.125rem 0.25rem',
      borderRadius: '0.125rem',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      fontWeight: '600',
    },
    galleryItem: {
      position: 'relative',
      aspectRatio: '1',
      borderRadius: '0.375rem',
      overflow: 'hidden',
      cursor: 'pointer',
      border: `2px solid transparent`,
      transition: 'border-color 0.2s ease',
    },
    galleryItemSelected: {
      borderColor: APP_COLORS.primary,
    },
    galleryImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    galleryItemDelete: {
      position: 'absolute',
      top: '0.25rem',
      right: '0.25rem',
      width: '1.5rem',
      height: '1.5rem',
      borderRadius: '50%',
      backgroundColor: 'rgba(220, 53, 69, 0.8)',
      color: 'white',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0,
      transition: 'opacity 0.2s ease',
    },
    footer: {
      padding: '1.5rem 2rem',
      borderTop: `1px solid ${APP_COLORS.secondary}20`,
      display: 'flex',
      justifyContent: 'space-between',
      gap: '1rem',
    },
    error: {
      color: '#e74c3c',
      fontSize: '0.875rem',
      padding: '0.75rem',
      backgroundColor: '#fee',
      borderRadius: '0.375rem',
      border: '1px solid #fcc',
    },
    loading: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      color: APP_COLORS.secondary,
    },
    spinner: {
      display: 'inline-block',
      width: '1rem',
      height: '1rem',
      border: '2px solid transparent',
      borderTopColor: APP_COLORS.primary,
      borderRadius: '50%',
      animation: 'spin 0.6s linear infinite',
      marginRight: '0.5rem',
    },
  };

  return (
    <div 
      style={styles.backdrop}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-upload-title"
    >
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 id="image-upload-title" style={styles.title}>
            Bild hochladen
          </h2>
          <button
            style={styles.closeButton}
            onClick={onClose}
            aria-label="Dialog schließen"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${APP_COLORS.secondary}20`;
              e.currentTarget.style.color = APP_COLORS.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = APP_COLORS.secondary;
            }}
          >
            ✕
          </button>
        </div>

        <div style={styles.content}>
          <div style={styles.leftPanel}>
            {/* Storage Method Selector */}
            <div style={styles.storageSelector}>
              <strong style={{ color: APP_COLORS.primary, fontSize: '0.875rem' }}>Speicherort:</strong>
              <div style={styles.radioGroup}>
                <label style={styles.radioOption}>
                  <input
                    type="radio"
                    name="storageMethod"
                    value="localStorage"
                    checked={storageMethod === 'localStorage'}
                    onChange={(e) => setStorageMethod(e.target.value as 'localStorage' | 'github')}
                    style={styles.radioInput}
                  />
                  📁 Lokal speichern
                </label>
                <label style={{
                  ...styles.radioOption,
                  opacity: githubConnected ? 1 : 0.6,
                  cursor: githubConnected ? 'pointer' : 'not-allowed'
                }}>
                  <input
                    type="radio"
                    name="storageMethod"
                    value="github"
                    checked={storageMethod === 'github'}
                    onChange={(e) => githubConnected && setStorageMethod(e.target.value as 'localStorage' | 'github')}
                    disabled={!githubConnected}
                    style={styles.radioInput}
                  />
                  🔗 In Repository speichern
                </label>
              </div>
              
              {/* GitHub Connection Status */}
              <div style={{
                ...styles.connectionStatus,
                color: isCheckingGitHub ? APP_COLORS.secondary : (githubConnected ? '#28a745' : '#dc3545'),
                backgroundColor: isCheckingGitHub ? `${APP_COLORS.secondary}10` : (githubConnected ? '#28a74510' : '#dc354510')
              }}>
                {isCheckingGitHub ? (
                  <>
                    <span style={styles.spinner} />
                    Überprüfe Verbindung...
                  </>
                ) : githubConnected ? (
                  <>
                    ✅ Verbunden
                  </>
                ) : (
                  <>
                    ❌ Nicht verfügbar
                  </>
                )}
              </div>
            </div>
            <div style={styles.methodSelector}>
              <button
                style={{
                  ...styles.methodButton,
                  ...(uploadMethod === 'file' ? styles.methodButtonActive : {})
                }}
                onClick={() => setUploadMethod('file')}
              >
                📁 Datei hochladen
              </button>
              <button
                style={{
                  ...styles.methodButton,
                  ...(uploadMethod === 'url' ? styles.methodButtonActive : {})
                }}
                onClick={() => setUploadMethod('url')}
              >
                🔗 Von URL
              </button>
            </div>

            {uploadMethod === 'file' ? (
              <div
                style={styles.dropZone}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  if (e.dataTransfer.files) {
                    handleFiles(e.dataTransfer.files);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <div style={styles.dropZoneIcon}>📷</div>
                <div style={styles.dropZoneText}>
                  <strong>Klicken oder Datei hierher ziehen</strong>
                </div>
                <div style={styles.dropZoneText}>
                  JPG, PNG, WebP (max. {(BLOG_CONFIG.imageSettings.maxSize / (1024 * 1024)).toFixed(1)}MB)
                </div>
                <div style={styles.dropZoneText}>
                  <em>Oder Strg+V zum Einfügen aus Zwischenablage</em>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  ref={urlInputRef}
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  style={styles.input}
                  onFocus={(e) => {
                    e.target.style.borderColor = APP_COLORS.primary;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = `${APP_COLORS.secondary}40`;
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleUrlSubmit();
                    }
                  }}
                />
                <button
                  style={{ ...styles.button, ...styles.primaryButton }}
                  onClick={handleUrlSubmit}
                  disabled={!urlInput.trim() || isProcessing}
                >
                  Laden
                </button>
              </div>
            )}

            {error && (
              <div style={styles.error} role="alert">
                {error}
              </div>
            )}

            {isProcessing && (
              <div style={styles.loading}>
                <span style={styles.spinner} />
                {storageMethod === 'github' && uploadProgress > 0 
                  ? `Lade in Repository hoch... ${uploadProgress}%`
                  : 'Bild wird verarbeitet...'
                }
              </div>
            )}

            {/* Upload Progress Bar for GitHub */}
            {storageMethod === 'github' && uploadProgress > 0 && uploadProgress < 100 && (
              <div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: APP_COLORS.secondary, 
                  marginBottom: '0.25rem' 
                }}>
                  Upload-Fortschritt: {uploadProgress}%
                </div>
                <div style={styles.progressBar}>
                  <div 
                    style={{
                      ...styles.progressFill,
                      width: `${uploadProgress}%`
                    }}
                  />
                </div>
              </div>
            )}

            {selectedImage && (
              <div style={styles.preview}>
                <img
                  src={selectedImage.url}
                  alt="Vorschau"
                  style={styles.previewImage}
                />
                <div style={styles.previewInfo}>
                  <div><strong>{selectedImage.name}</strong></div>
                  <div>{selectedImage.width} × {selectedImage.height}px</div>
                  <div>{formatFileSize(selectedImage.size)}</div>
                </div>
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Alt-Text (erforderlich)"
                  style={styles.input}
                  onFocus={(e) => {
                    e.target.style.borderColor = APP_COLORS.primary;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = `${APP_COLORS.secondary}40`;
                  }}
                />
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept={BLOG_CONFIG.imageSettings.allowedTypes.join(',')}
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              style={{ display: 'none' }}
            />
          </div>

          <div style={styles.rightPanel}>
            <div style={styles.gallery}>
              <div style={styles.galleryHeader}>
                <input
                  style={{ ...styles.input, ...styles.searchInput }}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Alle Bilder durchsuchen..."
                  onFocus={(e) => {
                    e.target.style.borderColor = APP_COLORS.primary;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = `${APP_COLORS.secondary}40`;
                  }}
                />
              </div>

              {uploadedImages.length === 0 ? (
                <div style={{ textAlign: 'center', color: APP_COLORS.secondary, padding: '2rem' }}>
                  Noch keine Bilder hochgeladen
                </div>
              ) : (
                <div style={{ overflowY: 'auto', flex: 1 }}>
                  {/* Repository Images Section */}
                  {repoImages.length > 0 && (
                    <div style={styles.gallerySection}>
                      <div style={styles.gallerySectionTitle}>
                        <span style={styles.sectionIcon}>🔗</span>
                        Repository-Bilder ({repoImages.length})
                      </div>
                      <div style={styles.galleryGrid}>
                        {repoImages.map((image) => (
                          <div
                            key={image.id}
                            style={{
                              ...styles.galleryItem,
                              ...(selectedImage?.url === image.url ? styles.galleryItemSelected : {})
                            }}
                            onClick={() => selectImageFromGallery(image)}
                            onMouseEnter={(e) => {
                              const deleteBtn = e.currentTarget.querySelector('.delete-btn') as HTMLElement;
                              if (deleteBtn) deleteBtn.style.opacity = '1';
                            }}
                            onMouseLeave={(e) => {
                              const deleteBtn = e.currentTarget.querySelector('.delete-btn') as HTMLElement;
                              if (deleteBtn) deleteBtn.style.opacity = '0';
                            }}
                            title={image.altText}
                          >
                            <img
                              src={image.url}
                              alt={image.altText}
                              style={styles.galleryImage}
                            />
                            <div style={{
                              ...styles.imageStorageBadge,
                              backgroundColor: APP_COLORS.primary
                            }}>
                              REPO
                            </div>
                            <button
                              className="delete-btn"
                              style={styles.galleryItemDelete}
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteImage(image.id);
                              }}
                              aria-label="Bild löschen"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Local Images Section */}
                  {localImages.length > 0 && (
                    <div style={styles.gallerySection}>
                      <div style={styles.gallerySectionTitle}>
                        <span style={styles.sectionIcon}>📁</span>
                        Lokale Bilder ({localImages.length})
                      </div>
                      <div style={styles.galleryGrid}>
                        {localImages.map((image) => (
                          <div
                            key={image.id}
                            style={{
                              ...styles.galleryItem,
                              ...(selectedImage?.url === image.url ? styles.galleryItemSelected : {})
                            }}
                            onClick={() => selectImageFromGallery(image)}
                            onMouseEnter={(e) => {
                              const deleteBtn = e.currentTarget.querySelector('.delete-btn') as HTMLElement;
                              if (deleteBtn) deleteBtn.style.opacity = '1';
                            }}
                            onMouseLeave={(e) => {
                              const deleteBtn = e.currentTarget.querySelector('.delete-btn') as HTMLElement;
                              if (deleteBtn) deleteBtn.style.opacity = '0';
                            }}
                            title={image.altText}
                          >
                            <img
                              src={image.url}
                              alt={image.altText}
                              style={styles.galleryImage}
                            />
                            <div style={{
                              ...styles.imageStorageBadge,
                              backgroundColor: APP_COLORS.secondary
                            }}>
                              LOKAL
                            </div>
                            <button
                              className="delete-btn"
                              style={styles.galleryItemDelete}
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteImage(image.id);
                              }}
                              aria-label="Bild löschen"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={styles.footer}>
          <button
            style={{ ...styles.button, ...styles.secondaryButton }}
            onClick={onClose}
          >
            Abbrechen
          </button>
          <button
            style={{ 
              ...styles.button, 
              ...styles.primaryButton,
              opacity: (!selectedImage || !altText.trim() || isProcessing) ? 0.6 : 1
            }}
            onClick={handleInsert}
            disabled={!selectedImage || !altText.trim() || isProcessing}
          >
            {isProcessing ? (
              <>
                <span style={{ ...styles.spinner, marginRight: '0.5rem' }} />
                {storageMethod === 'github' ? 'Uploading...' : 'Verarbeite...'}
              </>
            ) : (
              'Einfügen'
            )}
          </button>
        </div>
      </div>

      <style>{`
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
      `}</style>
    </div>
  );
};

export default ImageUploadModal;