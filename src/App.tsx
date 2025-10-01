import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
      <Router>
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
            path="/admin"
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
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;