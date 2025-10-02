import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { 
  ComingSoon, 
  Layout, 
  AdminLogin, 
  ProtectedRoute, 
  AdminDashboard, 
  BlogManagement 
} from './components';
import { 
  Startseite, 
  UeberMich, 
  Kurse, 
  Coaching, 
  FAQ, 
  Impressum, 
  Blog, 
  BlogPost 
} from './pages';
import { AuthProvider } from './services/auth';
import { TinaAuthProvider } from './services/tinaAuth';
import { preloadTina, preloadTinaEditor } from './utils/lazyTina';

// Lazy load Tina components with enhanced code splitting
const TinaAdmin = React.lazy(() => 
  import(
    /* webpackChunkName: "tina-admin" */
    /* webpackPreload: true */
    './components/TinaAdmin'
  ).then(module => ({
    default: module.default
  }))
);

const TinaEdit = React.lazy(() => 
  import(
    /* webpackChunkName: "tina-edit" */
    /* webpackPreload: true */
    './pages/TinaEdit'
  ).then(module => ({
    default: module.default
  }))
);

// Route prefetcher component
const RoutePreloader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  
  useEffect(() => {
    // Preload Tina when on admin pages
    if (location.pathname.startsWith('/admin')) {
      preloadTina();
      
      // Preload editor if near edit routes
      if (location.pathname.includes('/blog') || location.pathname.includes('/tina')) {
        preloadTinaEditor();
      }
    }
  }, [location.pathname]);
  
  return <>{children}</>;
};

// Landing page component with coming soon
const LandingPage: React.FC = () => {
  const styles: Record<string, React.CSSProperties> = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
    },
  };

  return (
    <div style={styles.container}>
      <ComingSoon />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <TinaAuthProvider>
        <Router>
        <RoutePreloader>
        <Routes>
          {/* Landing page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Preview routes with Layout */}
          <Route path="/preview" element={<Layout />}>
            <Route index element={<Startseite />} />
            <Route path="ueber-mich" element={<UeberMich />} />
            <Route path="kurse" element={<Kurse />} />
            <Route path="coaching" element={<Coaching />} />
            <Route path="faq" element={<FAQ />} />
            <Route path="impressum" element={<Impressum />} />
            
            {/* Blog routes under preview */}
            <Route path="blog" element={<Blog />} />
            <Route path="blog/:slug" element={<BlogPost />} />
          </Route>

          {/* Public blog routes (direct access) */}
          <Route path="/blog" element={<Layout />}>
            <Route index element={<Blog />} />
            <Route path=":slug" element={<BlogPost />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/blog"
            element={
              <ProtectedRoute>
                <BlogManagement />
              </ProtectedRoute>
            }
          />
          {/* Redirect /admin to dashboard */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Tina CMS routes */}
          <Route
            path="/admin/tina"
            element={
              <ProtectedRoute>
                <Suspense fallback={
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    backgroundColor: '#f8f9fa',
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '2rem',
                      backgroundColor: 'white',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    }}>
                      <div style={{
                        width: '2rem',
                        height: '2rem',
                        border: '3px solid #e2e8f0',
                        borderTopColor: '#0097B2',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                      }} />
                      <span style={{ color: '#4a5568', fontSize: '0.875rem' }}>
                        Lade Tina CMS...
                      </span>
                    </div>
                  </div>
                }>
                  <TinaAdmin />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tina/edit/:slug"
            element={
              <ProtectedRoute>
                <Suspense fallback={
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    backgroundColor: '#f8f9fa',
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '2rem',
                      backgroundColor: 'white',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    }}>
                      <div style={{
                        width: '2rem',
                        height: '2rem',
                        border: '3px solid #e2e8f0',
                        borderTopColor: '#0097B2',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                      }} />
                      <span style={{ color: '#4a5568', fontSize: '0.875rem' }}>
                        Lade Editor...
                      </span>
                    </div>
                  </div>
                }>
                  <TinaEdit />
                </Suspense>
              </ProtectedRoute>
            }
          />
        </Routes>
        </RoutePreloader>
      </Router>
      </TinaAuthProvider>
    </AuthProvider>
  );
}

export default App;