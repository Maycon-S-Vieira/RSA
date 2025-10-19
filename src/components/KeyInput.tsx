import React, { useEffect } from 'react';
import { useForm } from '../utils/useForm';
import { KeyInputFormData, RSAKeys } from '../types';
import './KeyInput.scss';

interface KeyInputProps {
  keys: RSAKeys;
  onKeysChange: (keys: RSAKeys) => void;
}

export const KeyInput: React.FC<KeyInputProps> = ({ keys, onKeysChange }) => {
  const {
    register,
    formState: { errors },
    setValue,
    watch
  } = useForm<KeyInputFormData>({
    defaultValues: {
      e: keys.publicKey.e,
      n: keys.publicKey.n,
      d: keys.privateKey.d
    }
  });

  const watchedValues = watch();

  useEffect(() => {
    setValue('e', keys.publicKey.e);
    setValue('n', keys.publicKey.n);
    setValue('d', keys.privateKey.d);
  }, [keys, setValue]);

  useEffect(() => {
    if (watchedValues.e && watchedValues.n && watchedValues.d) {
      const newKeys: RSAKeys = {
        publicKey: {
          e: watchedValues.e,
          n: watchedValues.n
        },
        privateKey: {
          d: watchedValues.d,
          n: watchedValues.n
        }
      };
      onKeysChange(newKeys);
    }
  }, [watchedValues, onKeysChange]);


  return (
    <section className="key-input">
      <h2>Chaves RSA</h2>
      <p className="description">
        Configure ou visualize as chaves públicas e privadas para criptografia.
      </p>
      
      <div className="key-sections">
        <div className="public-key-section">
          <h3><span className="material-symbols-outlined">lock_open</span> Chave Pública</h3>
          <p className="section-description">
            Usada para <strong>criptografar</strong> mensagens. Pode ser compartilhada publicamente.
          </p>
          
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="e">Expoente Público (E)</label>
              <input
                id="e"
                type="text"
                placeholder="Ex: 23"
                {...register('e')}
                className={errors.e ? 'error' : ''}
              />
              {errors.e && <span className="error-message">{errors.e.message}</span>}
            </div>
            
            <div className="form-field">
              <label htmlFor="n-public">Módulo (N)</label>
              <input
                id="n-public"
                type="text"
                placeholder="Ex: 187"
                {...register('n')}
                className={errors.n ? 'error' : ''}
              />
              {errors.n && <span className="error-message">{errors.n.message}</span>}
            </div>
          </div>
        </div>

        <div className="private-key-section">
          <h3><span className="material-symbols-outlined">lock</span> Chave Privada</h3>
          <p className="section-description">
            Usada para <strong>descriptografar</strong> mensagens. Deve ser mantida em segredo.
          </p>
          
          <div className="form-field">
            <label htmlFor="d">Expoente Privado (D)</label>
            <input
              id="d"
              type="text"
              placeholder="Ex: 7"
              {...register('d')}
              className={errors.d ? 'error' : ''}
            />
            {errors.d && <span className="error-message">{errors.d.message}</span>}
            <small className="field-note">
              O módulo N é o mesmo para ambas as chaves
            </small>
          </div>
        </div>
      </div>

      <div className="info-box">
        <h4><span className="material-symbols-outlined">vpn_key</span> Como funcionam as chaves RSA:</h4>
        <ul>
          <li><strong>N (Módulo):</strong> Produto de dois números primos grandes (P × Q)</li>
          <li><strong>E (Expoente Público):</strong> Número que não compartilha fatores com φ(N)</li>
          <li><strong>D (Expoente Privado):</strong> Inverso modular de E em relação a φ(N)</li>
        </ul>
      </div>
    </section>
  );
};
