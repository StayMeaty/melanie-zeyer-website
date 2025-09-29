import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ComingSoon, Layout } from './components';
import { Startseite, UeberMich, Kurse, Coaching, FAQ, Impressum } from './pages';

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
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/preview" element={<Layout />}>
          <Route index element={<Startseite />} />
          <Route path="ueber-mich" element={<UeberMich />} />
          <Route path="kurse" element={<Kurse />} />
          <Route path="coaching" element={<Coaching />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="impressum" element={<Impressum />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;