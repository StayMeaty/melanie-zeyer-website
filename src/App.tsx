import React from 'react';
import { ComingSoon, FontComparison } from './components';

const App: React.FC = () => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh' 
    }}>
      <ComingSoon />
      <FontComparison />
    </div>
  );
};

export default App;