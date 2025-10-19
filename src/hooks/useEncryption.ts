import { useState, useCallback } from 'react';
import { generateRSAKeys, encryptTextToNumbers, isPrime } from '../utils/rsa';
import { RSAKeys, PrimeNumbers } from '../types';

interface EncryptionResult {
  success: boolean;
  encryptedText?: string;
  error?: string;
}

interface KeyGenerationResult {
  success: boolean;
  keys?: RSAKeys;
  error?: string;
}

export const useEncryption = () => {
  const [keys, setKeys] = useState<RSAKeys>({
    publicKey: { e: '', n: '' },
    privateKey: { d: '', n: '' }
  });
  
  const [plainText, setPlainText] = useState<string>('');
  const [encryptedText, setEncryptedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastOperation, setLastOperation] = useState<string>('');

  const generateKeys = useCallback(async (primes: PrimeNumbers): Promise<KeyGenerationResult> => {
    setIsLoading(true);
    
    try {
      const pBig = BigInt(primes.p);
      const qBig = BigInt(primes.q);
      
      if (!isPrime(pBig)) {
        throw new Error(`P (${primes.p}) não é um número primo`);
      }
      
      if (!isPrime(qBig)) {
        throw new Error(`Q (${primes.q}) não é um número primo`);
      }
      
      if (pBig === qBig) {
        throw new Error('P e Q devem ser números primos diferentes');
      }

      const generatedKeys = generateRSAKeys(primes.p, primes.q);
      
      if (!generatedKeys) {
        throw new Error('Falha ao gerar as chaves RSA');
      }

      const rsaKeys: RSAKeys = {
        publicKey: {
          e: generatedKeys.e,
          n: generatedKeys.n
        },
        privateKey: {
          d: generatedKeys.d,
          n: generatedKeys.n
        }
      };

      setKeys(rsaKeys);
      setLastOperation(`Chaves geradas com P=${primes.p}, Q=${primes.q}`);
      
      return {
        success: true,
        keys: rsaKeys
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setLastOperation(`Erro na geração: ${errorMessage}`);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadExample = useCallback(() => {
    const exampleKeys: RSAKeys = {
      publicKey: { e: '23', n: '187' },
      privateKey: { d: '7', n: '187' }
    };
    
    setKeys(exampleKeys);
    setPlainText('HELLO RSA');
    setEncryptedText('');
    setLastOperation('Exemplo carregado (P=17, Q=11)');
  }, []);

  const encryptText = useCallback(async (text: string): Promise<EncryptionResult> => {
    if (!text.trim()) {
      return {
        success: false,
        error: 'Digite um texto para criptografar'
      };
    }

    if (!keys.publicKey.e || !keys.publicKey.n) {
      return {
        success: false,
        error: 'Gere ou configure as chaves antes de criptografar'
      };
    }

    setIsLoading(true);

    try {
      const encrypted = encryptTextToNumbers(text, keys.publicKey.e, keys.publicKey.n);
      setEncryptedText(encrypted);
      setLastOperation(`Texto "${text}" criptografado com sucesso`);
      
      return {
        success: true,
        encryptedText: encrypted
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setLastOperation(`Erro na criptografia: ${errorMessage}`);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [keys.publicKey.e, keys.publicKey.n]);

  const clearAll = useCallback(() => {
    setPlainText('');
    setEncryptedText('');
    setLastOperation('Dados limpos');
  }, []);

  const updateKeys = useCallback((newKeys: RSAKeys) => {
    setKeys(newKeys);
    setLastOperation('Chaves atualizadas manualmente');
  }, []);

  return {
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
  };
};
