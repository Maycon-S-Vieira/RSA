import React from 'react';
import { useForm } from '../utils/useForm';
import { useDecryption } from '../hooks/useDecryption';
import './DecryptPage.scss';
import { RSAKeys } from '../types';

interface DecryptFormData {
  d: string;
  n: string;
  encryptedText: string;
}

export const DecryptPage: React.FC = () => {
  const {
    keys,
    encryptedText,
    decryptedText,
    isLoading,
    lastOperation,
    setEncryptedText,
    updateKeys,
    decryptText,
    loadExampleKeys,
    loadExampleCipherText,
    clearAll,
    copyToClipboard
  } = useDecryption();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    clearErrors,
    watch
  } = useForm<DecryptFormData>({
    defaultValues: {
      d: keys.privateKey.d,
      n: keys.privateKey.n,
      encryptedText: encryptedText
    }
  });

  const watchedValues = watch();

  const handleKeysChange = async (data: DecryptFormData) => {
    clearErrors();
    
    if (!data.d || !data.n) {
      setError('root', { message: 'Informe a chave privada (D) e o módulo (N)' });
      return;
    }

    const result = updateKeys({
      publicKey: { e: '', n: data.n },
      privateKey: { d: data.d, n: data.n }
    });

    if (!result.success) {
      setError('root', { message: result.error || 'Erro ao validar chaves' });
    }
  };

  const handleDecrypt = async () => {
    clearErrors();
    
    if (!watchedValues.encryptedText?.trim()) {
      setError('root', { message: 'Cole o texto criptografado para descriptografar' });
      return;
    }

    const keyResult = updateKeys({
      publicKey: { e: '', n: watchedValues.n },
      privateKey: { d: watchedValues.d, n: watchedValues.n }
    });

    if (!keyResult.success) {
      setError('root', { message: keyResult.error || 'Chaves inválidas' });
      return;
    }

    const result = await decryptText(watchedValues.encryptedText);
    
    if (!result.success) {
      setError('root', { message: result.error || 'Erro ao descriptografar' });
    }
  };

    const handleLoadExampleKeys = () => {
    loadExampleKeys();
    loadExampleCipherText();
    setValue('d', '7');
    setValue('n', '187');
    setValue('encryptedText', '072149037072079');
    clearErrors();
  };

  const handleClearAll = () => {
    clearAll();
    setValue('d', '');
    setValue('n', '');
    setValue('encryptedText', '');
    clearErrors();
  };

  const handleCopyResult = async () => {
    if (decryptedText) {
      const success = await copyToClipboard(decryptedText);
      if (success) {
        alert('Texto descriptografado copiado!');
      }
    }
  };

  return (
    <div className="decrypt-page">
   

      {errors.root && (
        <div className="error-banner">
          <span className="material-symbols-outlined">error</span> {errors.root.message}
        </div>
      )}

      <div className="page-content">
        {/* Seção 1: Configuração de Chaves */}
        <section className="keys-input-section">
          <div className="section-header">
            <h2><span className="material-symbols-outlined">vpn_key</span> Chaves para Descriptografia</h2>
            <button 
              type="button" 
              onClick={handleLoadExampleKeys}
              className="btn btn--secondary btn--small"
            >
              <span className="material-symbols-outlined">description</span>
              Carregar Exemplo
            </button>
          </div>

          <form onSubmit={handleSubmit(handleKeysChange)} className="keys-form">
            <div className="keys-grid">
              <div className="key-group private-key">
                <h3><span className="material-symbols-outlined">lock</span> Chave Privada</h3>
                <p className="key-description">
                  Estas são as chaves necessárias para descriptografar. 
                  <strong>Nunca compartilhe sua chave privada!</strong>
                </p>
                
                <div className="key-fields">
                  <div className="form-field">
                    <label htmlFor="d">Expoente Privado (D)</label>
                    <input
                      id="d"
                      type="text"
                      placeholder="Ex: 7"
                      {...register('d')}
                    />
                    <small>Chave secreta para descriptografia</small>
                  </div>
                  
                  <div className="form-field">
                    <label htmlFor="n">Módulo (N)</label>
                    <input
                      id="n"
                      type="text"
                      placeholder="Ex: 187"
                      {...register('n')}
                    />
                    <small>Deve ser o mesmo N usado na criptografia</small>
                  </div>
                </div>


              </div>

              {/* Informações das chaves atuais */}
              {keys.privateKey.d && (
                <div className="key-group current-keys">
                  <h3><span className="material-symbols-outlined">assignment</span> Chaves Atuais</h3>
                  <div className="key-display">
                    <div className="key-item">
                      <span className="key-label">D:</span>
                      <span className="key-value">{keys.privateKey.d}</span>
                    </div>
                    <div className="key-item">
                      <span className="key-label">N:</span>
                      <span className="key-value">{keys.privateKey.n}</span>
                    </div>
                  </div>
                  <div className="key-status">
                    ✅ Chaves carregadas e prontas para uso
                  </div>
                </div>
              )}
            </div>
          </form>
        </section>

        {/* Seção 2: Descriptografia */}
        <section className="decryption-section">
          <h2><span className="material-symbols-outlined">lock_open</span> Descriptografar Mensagem</h2>
          
          <div className="decryption-form">
            <div className="form-field">
              <label htmlFor="encryptedText">Texto Criptografado</label>
              <textarea
                id="encryptedText"
                rows={6}
                placeholder="Cole aqui o texto criptografado (números)..."
                {...register('encryptedText')}
                onChange={(e) => {
                  register('encryptedText').onChange(e);
                  setEncryptedText(e.target.value);
                }}
              />
              <small>
                Texto criptografado deve conter apenas números concatenados
              </small>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                onClick={handleDecrypt}
                className="btn btn--primary"
                disabled={isLoading || !keys.privateKey.d}
              >
                <span className="material-symbols-outlined">
                  {isLoading ? 'hourglass_empty' : 'lock_open'}
                </span>
                {isLoading ? 'Descriptografando...' : 'Descriptografar'}
              </button>
              
              <button 
                type="button" 
                onClick={handleClearAll}
                className="btn btn--secondary"
              >
                <span className="material-symbols-outlined">clear_all</span>
                Limpar Tudo
              </button>
            </div>
          </div>

          {/* Resultado da Descriptografia */}
          {decryptedText && (
            <div className="result-section">
              <div className="result-header">
                <h3><span className="material-symbols-outlined">edit</span> Mensagem Descriptografada</h3>
                <button 
                  type="button" 
                  onClick={handleCopyResult}
                  className="btn btn--secondary btn--small"
                >
                  <span className="material-symbols-outlined">content_copy</span>
                  Copiar
                </button>
              </div>
              
              <div className="result-content">
                <div className="decrypted-text">
                  "{decryptedText}"
                </div>
              </div>
              
              <div className="result-info">
                <p>
                  ✅ Mensagem descriptografada com sucesso! A comunicação foi 
                  restaurada e a mensagem original foi recuperada.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Status da Última Operação */}
        {lastOperation && (
          <section className="status-section">
            <h3>📊 Última Operação</h3>
            <div className="status-content">
              {lastOperation}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
