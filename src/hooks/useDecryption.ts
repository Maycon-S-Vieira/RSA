import { useState, useCallback } from 'react';
import { decryptNumbersToText } from '../utils/rsa';
import { RSAKeys } from '../types';

interface DecryptionResult {
  success: boolean;
  decryptedText?: string;
  error?: string;
}

interface KeyValidationResult {
  success: boolean;
  error?: string;
}

export const useDecryption = () => {
  const [keys, setKeys] = useState<RSAKeys>({
    publicKey: { e: '', n: '' },
    privateKey: { d: '', n: '' }
  });
  
  const [encryptedText, setEncryptedText] = useState<string>('');
  const [decryptedText, setDecryptedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastOperation, setLastOperation] = useState<string>('');

  const validateKeys = useCallback((keysToValidate: RSAKeys): KeyValidationResult => {
    try {
      const { d, n } = keysToValidate.privateKey;
      
      if (!d || !n) {
        return {
          success: false,
          error: 'Informe a chave privada (D) e o módulo (N)'
        };
      }

      const dBig = BigInt(d);
      const nBig = BigInt(n);
      
      if (dBig <= 0n || nBig <= 0n) {
        return {
          success: false,
          error: 'D e N devem ser números positivos'
        };
      }

      if (dBig >= nBig) {
        return {
          success: false,
          error: 'D deve ser menor que N'
        };
      }

      return { success: true };
      
    } catch (error) {
      return {
        success: false,
        error: 'D e N devem ser números válidos'
      };
    }
  }, []);

  const updateKeys = useCallback((newKeys: RSAKeys) => {
    const validation = validateKeys(newKeys);
    
    if (validation.success) {
      setKeys(newKeys);
      setLastOperation('Chaves atualizadas e validadas');
    } else {
      setLastOperation(`Erro na validação: ${validation.error}`);
    }
    
    return validation;
  }, [validateKeys]);

  const decryptText = useCallback(async (encryptedData: string): Promise<DecryptionResult> => {
    if (!encryptedData.trim()) {
      return {
        success: false,
        error: 'Digite o texto criptografado para descriptografar'
      };
    }

    if (!/^\d+$/.test(encryptedData.trim())) {
      return {
        success: false,
        error: 'Texto criptografado deve conter apenas números'
      };
    }

    const keyValidation = validateKeys(keys);
    if (!keyValidation.success) {
      return {
        success: false,
        error: keyValidation.error
      };
    }

    setIsLoading(true);

    try {
      const decrypted = decryptNumbersToText(
        encryptedData, 
        keys.privateKey.d, 
        keys.privateKey.n
      );
      
      setDecryptedText(decrypted);
      setLastOperation(`Texto descriptografado com sucesso: "${decrypted}"`);
      
      return {
        success: true,
        decryptedText: decrypted
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setLastOperation(`Erro na descriptografia: ${errorMessage}`);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [keys, validateKeys]);

  const loadExampleKeys = useCallback(() => {
    const exampleKeys: RSAKeys = {
      publicKey: { e: '23', n: '187' },
      privateKey: { d: '7', n: '187' }
    };
    
    setKeys(exampleKeys);
    setLastOperation('Chaves de exemplo carregadas (compatíveis com criptografia P=17, Q=11)');
  }, []);

  const loadExampleCipherText = useCallback(() => {
    const exampleCipher = '072149037072079';
    setEncryptedText(exampleCipher);
    setLastOperation('Texto criptografado de exemplo carregado ("HELLO")');
  }, []);

  const clearAll = useCallback(() => {
    setEncryptedText('');
    setDecryptedText('');
    setLastOperation('Dados limpos');
  }, []);

  const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      setLastOperation('Texto copiado para a área de transferência');
      return true;
    } catch (error) {
      setLastOperation('Erro ao copiar para a área de transferência');
      return false;
    }
  }, []);

  return {
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
    copyToClipboard,
    validateKeys
  };
};
