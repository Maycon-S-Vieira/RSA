import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.scss';

export const Header: React.FC = () => {
  const location = useLocation();
  const isEncryptPage = location.pathname === '/' || location.pathname === '/encrypt';
  const isDecryptPage = location.pathname === '/decrypt';

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-brand">
          <h1>Criptografia RSA</h1>
          <span className="subtitle">Criptografia Assimétrica</span>
        </div>

        <nav className="header-nav">
          <Link 
            to="/encrypt" 
            className={`nav-link ${isEncryptPage ? 'active' : ''}`}
          >
            <span className="material-symbols-outlined nav-icon">lock</span>
            <span className="nav-text">Criptografar</span>
            <span className="nav-description">Gerar chaves e criptografar mensagens</span>
          </Link>
          
          <Link 
            to="/decrypt" 
            className={`nav-link ${isDecryptPage ? 'active' : ''}`}
          >
            <span className="material-symbols-outlined nav-icon">lock_open</span>
            <span className="nav-text">Descriptografar</span>
            <span className="nav-description">Inserir chaves e descriptografar mensagens</span>
          </Link>
        </nav>

        <div className="header-info">
          <div className="current-page">
            {isEncryptPage && (
              <div className="page-indicator encrypt">
                <span className="indicator-dot"></span>
                <span>Modo Criptografia</span>
              </div>
            )}
            {isDecryptPage && (
              <div className="page-indicator decrypt">
                <span className="indicator-dot"></span>
                <span>Modo Descriptografia</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
