import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { EncryptPage } from './pages/EncryptPage';
import { DecryptPage } from './pages/DecryptPage';
import './styles/globals.scss';

export default function App(): React.JSX.Element {
  return (
    <Router>
      <div className="app">
        <Header />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/encrypt" replace />} />
            <Route path="/encrypt" element={<EncryptPage />} />
            <Route path="/decrypt" element={<DecryptPage />} />
            <Route path="*" element={<Navigate to="/encrypt" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
