import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: 'sunburst'
    })
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // Strategic code splitting for Tina CMS
        manualChunks: {
          // React core (always loaded)
          'react-vendor': ['react', 'react-dom'],
          // Router (loaded for navigation)
          'router': ['react-router-dom'],
          // Markdown processing (loaded when blog is accessed)
          'markdown': ['gray-matter', 'markdown-to-jsx'],
        },
        // Asset file naming
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || 'asset';
          const info = name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        // Chunk file naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        // Entry file naming
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
      // Tree shaking optimizations
      treeshake: {
        preset: 'recommended',
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false
      }
    }
  },
  // Optimize dependencies pre-bundling
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'gray-matter',
      'markdown-to-jsx'
    ],
    exclude: [
      'tinacms',
      '@tinacms/cli',
      'tinacms/dist/rich-text',
      'tinacms/dist/react',
      'async-lock'
    ]
  },
  server: {
    port: 3000
  },
  preview: {
    port: 4173
  }
})