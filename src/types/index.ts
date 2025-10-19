export interface RSAKeys {
  publicKey: {
    e: string;
    n: string;
  };
  privateKey: {
    d: string;
    n: string;
  };
}

export interface PrimeNumbers {
  p: string;
  q: string;
}

export interface KeyGenerationFormData {
  p: string;
  q: string;
}

export interface KeyInputFormData {
  e: string;
  n: string;
  d: string;
}

export interface TextCryptoFormData {
  plainText: string;
  cipherText: string;
}

export interface CryptoOperation {
  type: 'encrypt' | 'decrypt' | 'generate-keys' | null;
  result: string;
  timestamp: Date;
}

export interface RSAFormData extends KeyGenerationFormData, KeyInputFormData, TextCryptoFormData {
}

export type CryptoResult = {
  success: boolean;
  data?: string;
  error?: string;
  operation: 'encrypt' | 'decrypt';
};
