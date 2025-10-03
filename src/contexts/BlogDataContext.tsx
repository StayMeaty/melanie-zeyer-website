import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { BlogPost } from '../types/blog';
import { loadAllPosts, clearPostCaches } from '../services/blogContent';

interface BlogDataState {
  posts: BlogPost[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

interface BlogDataContextType extends BlogDataState {
  refreshPosts: () => Promise<void>;
  clearCache: () => void;
  updatePost: (post: BlogPost) => void;
  removePost: (postId: string) => void;
}

const BlogDataContext = createContext<BlogDataContextType | undefined>(undefined);

interface BlogDataProviderProps {
  children: ReactNode;
}

export const BlogDataProvider: React.FC<BlogDataProviderProps> = ({ children }) => {
  const [state, setState] = useState<BlogDataState>({
    posts: [],
    isLoading: false,
    error: null,
    lastUpdated: null,
  });

  const loadPosts = useCallback(async () => {
    try {
      setState(prev => {
        // Prevent multiple simultaneous loads
        if (prev.isLoading) {
          console.log('⏸️ Skipping load - already loading');
          return prev;
        }
        return { ...prev, isLoading: true, error: null };
      });
      
      // Load published posts from markdown files
      const publishedPosts = await loadAllPosts();
      
      // Load drafts from localStorage
      const draftsJson = localStorage.getItem('blog_drafts');
      const drafts: BlogPost[] = draftsJson ? JSON.parse(draftsJson) : [];
      
      // Merge posts, giving priority to localStorage versions
      const allPosts = [...publishedPosts];
      drafts.forEach(draft => {
        const existingIndex = allPosts.findIndex(p => p.slug === draft.slug);
        if (existingIndex >= 0) {
          allPosts[existingIndex] = draft; // Override with draft version
        } else {
          allPosts.push(draft); // Add new draft
        }
      });
      
      setState(prev => ({ 
        ...prev, 
        posts: allPosts, 
        isLoading: false, 
        lastUpdated: Date.now() 
      }));
      
      console.log('✅ Blog posts loaded successfully from context:', allPosts.length, 'posts');
      
    } catch (err) {
      console.error('Error loading posts:', err);
      setState(prev => ({ 
        ...prev, 
        error: 'Fehler beim Laden der Blog-Beiträge', 
        isLoading: false 
      }));
    }
  }, []); // Empty dependency array - stable function

  const refreshPosts = useCallback(async () => {
    await loadPosts();
  }, [loadPosts]);

  const clearCache = useCallback(() => {
    clearPostCaches();
    setState(prev => ({ ...prev, lastUpdated: null }));
  }, []);

  const updatePost = useCallback((post: BlogPost) => {
    setState(prev => ({
      ...prev,
      posts: prev.posts.map(p => p.id === post.id ? post : p),
      lastUpdated: Date.now()
    }));
  }, []);

  const removePost = useCallback((postId: string) => {
    setState(prev => ({
      ...prev,
      posts: prev.posts.filter(p => p.id !== postId),
      lastUpdated: Date.now()
    }));
  }, []);

  // Load posts on mount - only once
  useEffect(() => {
    if (state.posts.length === 0 && !state.isLoading && !state.lastUpdated) {
      loadPosts();
    }
  }, []); // Empty dependency array - only run on mount

  const contextValue = useMemo<BlogDataContextType>(() => ({
    ...state,
    refreshPosts,
    clearCache,
    updatePost,
    removePost,
  }), [state, refreshPosts, clearCache, updatePost, removePost]);

  return (
    <BlogDataContext.Provider value={contextValue}>
      {children}
    </BlogDataContext.Provider>
  );
};

export const useBlogData = (): BlogDataContextType => {
  const context = useContext(BlogDataContext);
  if (context === undefined) {
    throw new Error('useBlogData must be used within a BlogDataProvider');
  }
  return context;
};