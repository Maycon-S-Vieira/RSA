import React from 'react';
import { useForm } from '../utils/useForm';
import { KeyGenerationFormData, RSAKeys } from '../types';
import { generateRSAKeys, isPrime } from '../utils/rsa';
import './KeyGeneration.scss';

interface KeyGenerationProps {
  onKeysGenerated: (keys: RSAKeys) => void;
  onLoadExample: () => void;
}

export const KeyGeneration: React.FC<KeyGenerationProps> = ({ onKeysGenerated, onLoadExample }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    setValue
  } = useForm<KeyGenerationFormData>({
    defaultValues: {
      p: '',
      q: ''
    }
  });

  const validatePrime = (value: string, fieldName: 'p' | 'q') => {
    if (!value) {
      return `${fieldName.toUpperCase()} é obrigatório`;
    }
    
    try {
      const num = BigInt(value);
      if (num <= 1n) {
        return `${fieldName.toUpperCase()} deve ser maior que 1`;
      }
      
      if (!isPrime(num)) {
        return `${fieldName.toUpperCase()} deve ser um número primo`;
      }
      
      return true;
    } catch {
      return `${fieldName.toUpperCase()} deve ser um número válido`;
    }
  };

  const onSubmit = (data: KeyGenerationFormData) => {
    clearErrors();
    
    const pValidation = validatePrime(data.p, 'p');
    const qValidation = validatePrime(data.q, 'q');
    
    if (pValidation !== true) {
      setError('p', { message: pValidation });
      return;
    }
    
    if (qValidation !== true) {
      setError('q', { message: qValidation });
      return;
    }

    const keys = generateRSAKeys(data.p, data.q);
    
    if (!keys) {
      setError('root', { 
        message: 'Erro ao gerar chaves. Verifique se P e Q são números primos válidos.' 
      });
      return;
    }

    const rsaKeys: RSAKeys = {
      publicKey: {
        e: keys.e,
        n: keys.n
      },
      privateKey: {
        d: keys.d,
        n: keys.n
      }
    };

    onKeysGenerated(rsaKeys);
    
    alert(`Chaves geradas com sucesso!
    N = ${keys.n}
    E = ${keys.e} (chave pública)
    D = ${keys.d} (chave privada)
    φ(N) = ${keys.phi}`);
  };

  const handleLoadExample = () => {
    setValue('p', '17');
    setValue('q', '11');
    onLoadExample();
  };

  return (
    <section className="key-generation">
      <h2>Gerar Chaves RSA</h2>
      <p className="description">
        Insira dois números primos P e Q para gerar as chaves pública e privada.
      </p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="key-generation-form">
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="p">Número Primo P</label>
            <input
              id="p"
              type="text"
              placeholder="Ex: 17"
              {...register('p')}
              className={errors.p ? 'error' : ''}
            />
            {errors.p && <span className="error-message">{errors.p.message}</span>}
          </div>
          
          <div className="form-field">
            <label htmlFor="q">Número Primo Q</label>
            <input
              id="q"
              type="text"
              placeholder="Ex: 11"
              {...register('q')}
              className={errors.q ? 'error' : ''}
            />
            {errors.q && <span className="error-message">{errors.q.message}</span>}
          </div>
        </div>

        {errors.root && (
          <div className="error-message error-message--root">
            {errors.root.message}
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn btn--primary">
            <span className="material-symbols-outlined">vpn_key</span>
            Gerar Chaves RSA
          </button>
          <button 
            type="button" 
            onClick={handleLoadExample}
            className="btn btn--secondary"
          >
            <span className="material-symbols-outlined">description</span>
            Carregar Exemplo (P=17, Q=11)
          </button>
        </div>
      </form>
      
      <div className="info-box">
        <h4><span className="material-symbols-outlined">lightbulb</span> Dica:</h4>
        <p>
          Para testar, use P=17 e Q=11. Isso gerará N=187, E=23, D=7.
          Números primos pequenos são mais fáceis de calcular, mas em aplicações reais 
          use números primos muito grandes (centenas de dígitos).
        </p>
      </div>
    </section>
  );
};
