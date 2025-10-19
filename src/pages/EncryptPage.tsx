import React from 'react';
import { useForm } from '../utils/useForm';
import { useEncryption } from '../hooks/useEncryption';
import { KeyGenerationFormData, RSAKeys } from '../types';
import './EncryptPage.scss';

interface EncryptFormData {
  p: string;
  q: string;
  e: string;
  n: string;
  d: string;
  plainText: string;
}

export const EncryptPage: React.FC = () => {
  const {
    keys,
    plainText,
    encryptedText,
    isLoading,
    lastOperation,
    setPlainText,
    generateKeys,
    loadExample,
    encryptText,
    clearAll,
    updateKeys
  } = useEncryption();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    clearErrors,
    watch
  } = useForm<EncryptFormData>({
    defaultValues: {
      p: '',
      q: '',
      e: keys.publicKey.e,
      n: keys.publicKey.n,
      d: keys.privateKey.d,
      plainText: plainText
    }
  });

  const watchedValues = watch();

    const handleKeysGenerated = async (keys: RSAKeys) => {
    clearErrors();
    
    if (!watchedValues.p || !watchedValues.q) {
      setError('root', { message: 'Informe os números primos P e Q' });
      return;
    }

    const result = await generateKeys({ p: watchedValues.p, q: watchedValues.q });
    
    if (result.success && result.keys) {
      setValue('e', result.keys.publicKey.e);
      setValue('n', result.keys.publicKey.n);
      setValue('d', result.keys.privateKey.d);
    } else {
      setError('root', { message: result.error || 'Erro ao gerar chaves' });
    }
  };

  const handleLoadExample = () => {
    loadExample();
    setValue('p', '17');
    setValue('q', '11');
    setValue('e', '23');
    setValue('n', '187');
    setValue('d', '7');
    setValue('plainText', 'HELLO RSA');
  };

  const handleEncrypt = async () => {
    clearErrors();
    
    if (!watchedValues.plainText?.trim()) {
      setError('root', { message: 'Digite um texto para criptografar' });
      return;
    }

    updateKeys({
      publicKey: { e: watchedValues.e, n: watchedValues.n },
      privateKey: { d: watchedValues.d, n: watchedValues.n }
    });

    const result = await encryptText(watchedValues.plainText);
    
    if (!result.success) {
      setError('root', { message: result.error || 'Erro ao criptografar' });
    }
  };

  const handleClearAll = () => {
    clearAll();
    setValue('p', '');
    setValue('q', '');
    setValue('e', '');
    setValue('n', '');
    setValue('d', '');
    setValue('plainText', '');
    clearErrors();
  };

  const copyKeys = async () => {
    const keysText = `Chave Pública: E=${keys.publicKey.e}, N=${keys.publicKey.n}
    Chave Privada: D=${keys.privateKey.d}, N=${keys.privateKey.n}`;
    
    try {
      await navigator.clipboard.writeText(keysText);
      alert('Chaves copiadas para a área de transferência!');
    } catch (error) {
      alert('Erro ao copiar chaves');
    }
  };

    const copyEncryptedText = async () => {
    if (!encryptedText) return;
    
    try {
      await navigator.clipboard.writeText(encryptedText);
      alert('Texto criptografado copiado!');
    } catch (error) {
      alert('Erro ao copiar texto');
    }
  };

  return (
    <div className="encrypt-page">
   

      {errors.root && (
        <div className="error-message--root">
          <span className="material-symbols-outlined">error</span> {errors.root.message}
        </div>
      )}

      <div className="page-content">
        {/* Seção 1: Geração de Chaves */}
        <section className="key-generation-section">
          <div className="section-header">
            <h2><span className="material-symbols-outlined">vpn_key</span> Geração de Chaves</h2>
            <button 
              type="button" 
              onClick={handleLoadExample}
              className="btn btn--secondary btn--small"
            >
              <span className="material-symbols-outlined">description</span>
              Carregar Exemplo
            </button>
          </div>

          <form onSubmit={handleSubmit(generateKeys)} className="key-form">
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="p">Número Primo P</label>
                <input
                  id="p"
                  type="text"
                  placeholder="Ex: 17"
                  {...register('p')}
                />
              </div>
              
              <div className="form-field">
                <label htmlFor="q">Número Primo Q</label>
                <input
                  id="q"
                  type="text"
                  placeholder="Ex: 11"
                  {...register('q')}
                />
              </div>
              
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn--primary"
                  disabled={isLoading}
                >
                  <span className="material-symbols-outlined">
                    {isLoading ? 'hourglass_empty' : 'vpn_key'}
                  </span>
                  {isLoading ? 'Gerando...' : 'Gerar Chaves'}
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* Seção 2: Visualização e Edição de Chaves */}
        <section className="keys-display-section">
          <div className="section-header">
            <h2><span className="material-symbols-outlined">enhanced_encryption</span> Chaves RSA</h2>
            {keys.publicKey.e && (
              <button 
                type="button" 
                onClick={copyKeys}
                className="btn btn--secondary btn--small"
              >
                <span className="material-symbols-outlined">content_copy</span>
                Copiar Chaves
              </button>
            )}
          </div>

          <div className="keys-grid">
            <div className="key-group public-key">
              <h3><span className="material-symbols-outlined">lock_open</span> Chave Pública</h3>
              <div className="key-fields">
                <div className="form-field">
                  <label htmlFor="e">Expoente (E)</label>
                  <input
                    id="e"
                    type="text"
                    {...register('e')}
                    readOnly={isLoading}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="n">Módulo (N)</label>
                  <input
                    id="n"
                    type="text"
                    {...register('n')}
                    readOnly={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className="key-group private-key">
              <h3><span className="material-symbols-outlined">lock</span> Chave Privada</h3>
              <div className="key-fields">
                <div className="form-field">
                  <label htmlFor="d">Expoente (D)</label>
                  <input
                    id="d"
                    type="text"
                    {...register('d')}
                    readOnly={isLoading}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Seção 3: Criptografia */}
        <section className="encryption-section">
          <h2><span className="material-symbols-outlined">edit</span> Criptografar Mensagem</h2>
          
          <div className="encryption-form">
            <div className="form-field">
              <label htmlFor="plainText">Texto a ser criptografado</label>
              <textarea
                id="plainText"
                rows={4}
                placeholder="Digite sua mensagem aqui..."
                {...register('plainText')}
                onChange={(e) => {
                  register('plainText').onChange(e);
                  setPlainText(e.target.value);
                }}
              />
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                onClick={handleEncrypt}
                className="btn btn--primary"
                disabled={isLoading || !keys.publicKey.e}
              >
                <span className="material-symbols-outlined">
                  {isLoading ? 'hourglass_empty' : 'lock'}
                </span>
                {isLoading ? 'Criptografando...' : 'Criptografar'}
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

          {/* Resultado da Criptografia */}
          {encryptedText && (
            <div className="result-section">
              <div className="result-header">
                <h3><span className="material-symbols-outlined">enhanced_encryption</span> Texto Criptografado</h3>
                <button 
                  type="button" 
                  onClick={copyEncryptedText}
                  className="btn btn--secondary btn--small"
                >
                  <span className="material-symbols-outlined">content_copy</span>
                  Copiar
                </button>
              </div>
              
              <div className="result-content">
                <pre className="cipher-text">{encryptedText}</pre>
              </div>
              
              <div className="result-info">
                <p>
                  <span className="material-symbols-outlined">check_circle</span>
                  Texto criptografado com sucesso! Este texto pode ser enviado de forma segura 
                  e descriptografado apenas com a chave privada correspondente.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Status da Última Operação */}
        {lastOperation && (
          <section className="status-section">
            <h3><span className="material-symbols-outlined">analytics</span> Última Operação</h3>
            <div className="status-content">
              {lastOperation}
            </div>
          </section>
        )}
      </div>

   
    </div>
  );
};
