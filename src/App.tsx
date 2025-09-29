import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { ComingSoon, FontComparison, PreviewButton, WebsitePreview } from './components';

// Landing page component with coming soon and font comparison
const LandingPage: React.FC = () => {
  const navigate = useNavigate();

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
      <FontComparison />
      <PreviewButton onClick={() => navigate('/preview')} />
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/preview" element={<WebsitePreview />} />
      </Routes>
    </Router>
  );
}

export default App;