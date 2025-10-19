import React from 'react';
import { useForm } from '../utils/useForm';
import { TextCryptoFormData, RSAKeys, CryptoResult } from '../types';
import { encryptTextToNumbers, decryptNumbersToText } from '../utils/rsa';
import './TextCrypto.scss';

interface TextCryptoProps {
  keys: RSAKeys;
  onCryptoResult: (result: CryptoResult) => void;
}

export const TextCrypto: React.FC<TextCryptoProps> = ({ keys, onCryptoResult }) => {
  const {
    register,
    formState: { errors },
    setValue,
    setError,
    clearErrors,
    watch
  } = useForm<TextCryptoFormData>({
    defaultValues: {
      plainText: 'Olá RSA!',
      cipherText: ''
    }
  });

  const watchedValues = watch();

  const validateKeys = (operation: 'encrypt' | 'decrypt'): boolean => {
    if (operation === 'encrypt') {
      if (!keys.publicKey.e || !keys.publicKey.n) {
        setError('root', { 
          message: 'Chave pública incompleta. Informe E e N para criptografar.' 
        });
        return false;
      }
    } else {
      if (!keys.privateKey.d || !keys.privateKey.n) {
        setError('root', { 
          message: 'Chave privada incompleta. Informe D e N para descriptografar.' 
        });
        return false;
      }
    }
    return true;
  };

  const handleEncrypt = () => {
    clearErrors();
    
    if (!validateKeys('encrypt')) return;
    
    if (!watchedValues.plainText?.trim()) {
      setError('plainText', { message: 'Digite um texto para criptografar' });
      return;
    }

    try {
      const encrypted = encryptTextToNumbers(
        watchedValues.plainText, 
        keys.publicKey.e, 
        keys.publicKey.n
      );
      
      setValue('cipherText', encrypted);
      
      onCryptoResult({
        success: true,
        data: encrypted,
        operation: 'encrypt'
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError('root', { 
        message: `Erro ao criptografar: ${errorMessage}` 
      });
      
      onCryptoResult({
        success: false,
        error: errorMessage,
        operation: 'encrypt'
      });
    }
  };

  const handleDecrypt = () => {
    clearErrors();
    
    if (!validateKeys('decrypt')) return;
    
    if (!watchedValues.cipherText?.trim()) {
      setError('cipherText', { message: 'Digite um texto criptografado para descriptografar' });
      return;
    }

    try {
      const decrypted = decryptNumbersToText(
        watchedValues.cipherText, 
        keys.privateKey.d, 
        keys.privateKey.n
      );
      
      setValue('plainText', decrypted);
      
      onCryptoResult({
        success: true,
        data: decrypted,
        operation: 'decrypt'
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError('root', { 
        message: `Erro ao descriptografar: ${errorMessage}` 
      });
      
      onCryptoResult({
        success: false,
        error: errorMessage,
        operation: 'decrypt'
      });
    }
  };

  const handleClear = () => {
    setValue('plainText', '');
    setValue('cipherText', '');
    clearErrors();
  };

  const handleLoadExample = () => {
    setValue('plainText', 'HELLO RSA');
    setValue('cipherText', '');
    clearErrors();
  };

  return (
    <section className="text-crypto">
      <h2>Criptografia de Texto</h2>
      <p className="description">
        Use as chaves RSA para criptografar e descriptografar mensagens.
      </p>

      {errors.root && (
        <div className="error-message error-message--root">
          {errors.root.message}
        </div>
      )}

      <div className="crypto-sections">
        <div className="plain-text-section">
          <div className="section-header">
            <h3><span className="material-symbols-outlined">edit</span> Texto Original</h3>
            <div className="section-actions">
              <button 
                type="button" 
                onClick={handleLoadExample}
                className="btn btn--small btn--secondary"
              >
                <span className="material-symbols-outlined">description</span>
                Exemplo
              </button>
            </div>
          </div>
          
          <div className="form-field">
            <label htmlFor="plainText">Digite o texto a ser criptografado:</label>
            <textarea
              id="plainText"
              placeholder="Digite sua mensagem aqui..."
              rows={4}
              {...register('plainText')}
              className={errors.plainText ? 'error' : ''}
            />
            {errors.plainText && (
              <span className="error-message">{errors.plainText.message}</span>
            )}
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={handleEncrypt}
              className="btn btn--primary"
              disabled={!keys.publicKey.e || !keys.publicKey.n}
            >
              <span className="material-symbols-outlined">lock</span>
              Criptografar →
            </button>
          </div>
        </div>

        <div className="cipher-text-section">
          <div className="section-header">
            <h3><span className="material-symbols-outlined">enhanced_encryption</span> Texto Criptografado</h3>
            <small className="format-note">Formato: números concatenados</small>
          </div>
          
          <div className="form-field">
            <label htmlFor="cipherText">Resultado da criptografia:</label>
            <textarea
              id="cipherText"
              placeholder="O texto criptografado aparecerá aqui..."
              rows={4}
              {...register('cipherText')}
              className={errors.cipherText ? 'error' : ''}
            />
            {errors.cipherText && (
              <span className="error-message">{errors.cipherText.message}</span>
            )}
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={handleDecrypt}
              className="btn btn--primary"
              disabled={!keys.privateKey.d || !keys.privateKey.n}
            >
              <span className="material-symbols-outlined">lock_open</span>
              ← Descriptografar
            </button>
          </div>
        </div>
      </div>

      <div className="bottom-actions">
        <button 
          type="button" 
          onClick={handleClear}
          className="btn btn--secondary"
        >
          <span className="material-symbols-outlined">clear_all</span>
          Limpar Tudo
        </button>
      </div>

      <div className="info-box">
        <h4><span className="material-symbols-outlined">info</span> Como funciona:</h4>
        <ul>
          <li><strong>Criptografia:</strong> Cada caractere é convertido para código ASCII, então elevado à potência E módulo N</li>
          <li><strong>Descriptografia:</strong> Cada bloco numérico é elevado à potência D módulo N, então convertido de volta para caractere</li>
          <li><strong>Tamanho do bloco:</strong> Determinado pelo número de dígitos em N</li>
        </ul>
      </div>
    </section>
  );
};
