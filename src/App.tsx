// src/App.tsx
import React from 'react';
import Sidebar from './components/Sidebar';
import Body from './components/Body';
import './index.css';

const App: React.FC = () => {
  return (
    <div className="app">
      <Sidebar />
      <Body />
    </div>
  );
};

export default App;
