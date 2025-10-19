import React from 'react';
import { CryptoOperation } from '../types';
import './Output.scss';

interface OutputProps {
  operation: CryptoOperation;
}

export const Output: React.FC<OutputProps> = ({ operation }) => {
  if (!operation.type) {
    return (
      <section className="output">
        <h2><span className="material-symbols-outlined">assignment</span> Resultado da Operação</h2>
        <div className="output-content output-content--empty">
          <p>Nenhuma operação realizada ainda.</p>
          <p>Use os controles acima para criptografar, descriptografar ou gerar chaves.</p>
        </div>
      </section>
    );
  }

  const getOperationIcon = () => {
    switch (operation.type) {
      case 'encrypt':
        return 'lock';
      case 'decrypt':
        return 'lock_open';
      case 'generate-keys':
        return 'vpn_key';
      default:
        return 'assignment';
    }
  };

  const getOperationTitle = () => {
    switch (operation.type) {
      case 'encrypt':
        return 'Texto Criptografado';
      case 'decrypt':
        return 'Texto Descriptografado';
      case 'generate-keys':
        return 'Chaves Geradas';
      default:
        return 'Resultado';
    }
  };

  const getOperationDescription = () => {
    switch (operation.type) {
      case 'encrypt':
        return 'Texto convertido para números usando a chave pública (E, N)';
      case 'decrypt':
        return 'Números convertidos de volta para texto usando a chave privada (D, N)';
      case 'generate-keys':
        return 'Chaves RSA geradas a partir dos números primos P e Q';
      default:
        return '';
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(operation.result);
    } catch (err) {
      console.log(err)
    }
  };

  const isLongText = operation.result.length > 100;

  return (
    <section className="output">
      <div className="output-header">
        <h2>
          <span className="material-symbols-outlined">{getOperationIcon()}</span> {getOperationTitle()}
        </h2>
        <div className="output-meta">
          <span className="timestamp">
            {formatTimestamp(operation.timestamp)}
          </span>
        </div>
      </div>

      <p className="operation-description">
        {getOperationDescription()}
      </p>

      <div className="output-content">
        <div className="output-text">
          <pre className={`result-text ${isLongText ? 'result-text--long' : ''}`}>
            {operation.result}
          </pre>
        </div>
        
        <div className="output-actions">
          <button 
            onClick={copyToClipboard}
            className="btn btn--small btn--secondary"
            title="Copiar para área de transferência"
          >
            <span className="material-symbols-outlined">content_copy</span>
            Copiar
          </button>
        </div>
      </div>

      <div className="output-stats">
        <div className="stat">
          <span className="stat-label">Caracteres:</span>
          <span className="stat-value">{operation.result.length}</span>
        </div>
        {operation.type === 'encrypt' && (
          <div className="stat">
            <span className="stat-label">Blocos:</span>
            <span className="stat-value">
              {operation.result.length / 3} {/* Assumindo blocos de 3 dígitos */}
            </span>
          </div>
        )}
      </div>

      {operation.type === 'encrypt' && (
        <div className="info-box">
          <h4><span className="material-symbols-outlined">enhanced_encryption</span> Sobre a criptografia:</h4>
          <p>
            Cada caractere foi convertido para seu código ASCII e depois criptografado 
            usando a fórmula: <code>C = M^E mod N</code>
          </p>
        </div>
      )}

      {operation.type === 'decrypt' && (
        <div className="info-box">
          <h4><span className="material-symbols-outlined">lock_open</span> Sobre a descriptografia:</h4>
          <p>
            Cada bloco numérico foi descriptografado usando a fórmula: <code>M = C^D mod N</code> 
            e depois convertido de volta para caractere ASCII.
          </p>
        </div>
      )}

      {operation.type === 'generate-keys' && (
        <div className="info-box">
          <h4><span className="material-symbols-outlined">vpn_key</span> Sobre a geração de chaves:</h4>
          <p>
            As chaves foram geradas usando os algoritmos padrão RSA: 
            N = P × Q, φ(N) = (P-1) × (Q-1), e E × D ≡ 1 (mod φ(N))
          </p>
        </div>
      )}
    </section>
  );
};
