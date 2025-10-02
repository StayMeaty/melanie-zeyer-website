/**
 * Lazy loading utilities for Tina CMS components
 * Optimizes bundle size by loading Tina only when needed
 */

import { ComponentType, lazy } from 'react';

// Cache for loaded modules
const moduleCache = new Map<string, unknown>();

/**
 * Load Tina Editor component with code splitting
 */
export const loadTinaEditor = () => {
  const cacheKey = 'tina-editor';
  
  if (moduleCache.has(cacheKey)) {
    return Promise.resolve(moduleCache.get(cacheKey));
  }
  
  return import(
    /* webpackChunkName: "tina-editor" */
    /* webpackPrefetch: true */
    '../components/TinaEditorWrapper'
  ).then(module => {
    moduleCache.set(cacheKey, module);
    return module;
  });
};

/**
 * Load Tina Admin interface with code splitting
 */
export const loadTinaAdmin = () => {
  const cacheKey = 'tina-admin';
  
  if (moduleCache.has(cacheKey)) {
    return Promise.resolve(moduleCache.get(cacheKey));
  }
  
  return import(
    /* webpackChunkName: "tina-admin" */
    /* webpackPrefetch: true */
    '../components/TinaAdmin'
  ).then(module => {
    moduleCache.set(cacheKey, module);
    return module;
  });
};

/**
 * Load Tina CMS core library
 */
export const loadTinaCMS = () => {
  const cacheKey = 'tinacms-core';
  
  if (moduleCache.has(cacheKey)) {
    return Promise.resolve(moduleCache.get(cacheKey));
  }
  
  return import(
    /* webpackChunkName: "tina-core" */
    'tinacms'
  ).then(module => {
    moduleCache.set(cacheKey, module);
    return module;
  });
};

/**
 * Load Tina Rich Text editor
 */
export const loadTinaRichText = () => {
  const cacheKey = 'tina-rich-text';
  
  if (moduleCache.has(cacheKey)) {
    return Promise.resolve(moduleCache.get(cacheKey));
  }
  
  return import(
    /* webpackChunkName: "tina-rich-text" */
    'tinacms/dist/rich-text'
  ).then(module => {
    moduleCache.set(cacheKey, module);
    return module;
  });
};

/**
 * Load Tina React hooks
 */
export const loadTinaReact = () => {
  const cacheKey = 'tina-react';
  
  if (moduleCache.has(cacheKey)) {
    return Promise.resolve(moduleCache.get(cacheKey));
  }
  
  return import(
    /* webpackChunkName: "tina-react" */
    'tinacms/dist/react'
  ).then(module => {
    moduleCache.set(cacheKey, module);
    return module;
  });
};

/**
 * Preload Tina CMS modules for better UX
 * Call this when user is likely to navigate to Tina pages
 */
export const preloadTina = () => {
  // Don't preload if not enabled
  if (import.meta.env.VITE_USE_TINA_CMS !== 'true') {
    return;
  }
  
  // Use requestIdleCallback for non-blocking preload
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      // Preload core modules
      loadTinaCMS().catch(() => {
        // Silent fail for preload
      });
    }, { timeout: 2000 });
  }
};

/**
 * Preload Tina editor when hovering over edit links
 */
export const preloadTinaEditor = () => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      loadTinaRichText().catch(() => {
        // Silent fail for preload
      });
    }, { timeout: 1000 });
  }
};

/**
 * Check if Tina CMS is enabled
 */
export const isTinaEnabled = () => {
  return import.meta.env.VITE_USE_TINA_CMS === 'true';
};

/**
 * Create a lazy-loaded Tina component
 */
export function createLazyTinaComponent<T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return lazy(importFn);
}

/**
 * Load Tina GraphQL client
 */
export const loadTinaClient = () => {
  const cacheKey = 'tina-client';
  
  if (moduleCache.has(cacheKey)) {
    return Promise.resolve(moduleCache.get(cacheKey));
  }
  
  return import(
    /* webpackChunkName: "tina-client" */
    '../services/tinaClient'
  ).then(module => {
    moduleCache.set(cacheKey, module);
    return module;
  });
};

/**
 * Load Tina blog service
 */
export const loadTinaBlogService = () => {
  const cacheKey = 'tina-blog-service';
  
  if (moduleCache.has(cacheKey)) {
    return Promise.resolve(moduleCache.get(cacheKey));
  }
  
  return import(
    /* webpackChunkName: "tina-blog-service" */
    '../services/tinaBlogService'
  ).then(module => {
    moduleCache.set(cacheKey, module);
    return module;
  });
};

/**
 * Clear the module cache
 * Useful for development or when switching contexts
 */
export const clearTinaCache = () => {
  moduleCache.clear();
};

/**
 * Get cache status for debugging
 */
export const getTinaCacheStatus = () => {
  return {
    cachedModules: Array.from(moduleCache.keys()),
    cacheSize: moduleCache.size
  };
};