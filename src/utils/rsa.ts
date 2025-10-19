/**
 * Exponenciação modular usando o algoritmo de exponenciação rápida
 */
export function modPow(base: bigint | string | number, exp: bigint | string | number, mod: bigint | string | number): bigint {
  const baseBig = BigInt(base);
  const expBig = BigInt(exp);
  const modBig = BigInt(mod);

  if (modBig === 1n) return 0n;
  
  let result = 1n;
  let baseResult = baseBig % modBig;
  let expResult = expBig;
  
  while (expResult > 0n) {
    if (expResult & 1n) {
      result = (result * baseResult) % modBig;
    }
    expResult >>= 1n;
    baseResult = (baseResult * baseResult) % modBig;
  }
  
  return result;
}

/**
 * Converte texto em números criptografados concatenados
 */
export function encryptTextToNumbers(plainText: string, e: string | bigint, n: string | bigint): string {
  const eBig = BigInt(e);
  const nBig = BigInt(n);

  const blockSize = nBig.toString().length;
  let output = '';

  for (let i = 0; i < plainText.length; i++) {
    const charCode = BigInt(plainText.charCodeAt(i));
    const encryptedChar = modPow(charCode, eBig, nBig);
    const numStr = encryptedChar.toString().padStart(blockSize, '0');
    output += numStr;
  }
  
  return output;
}

/**
 * Converte números criptografados concatenados de volta para texto
 */
export function decryptNumbersToText(cipherText: string, d: string | bigint, n: string | bigint): string {
  const dBig = BigInt(d);
  const nBig = BigInt(n);

  const blockSize = nBig.toString().length;
  let result = '';

  for (let i = 0; i < cipherText.length; i += blockSize) {
    const block = cipherText.slice(i, i + blockSize);
    if (!block) continue;
    
    const cipherNum = BigInt(block);
    const decryptedChar = modPow(cipherNum, dBig, nBig);
    result += String.fromCharCode(Number(decryptedChar));
  }
  
  return result;
}

/**
 * Algoritmo estendido de Euclides
 */
function extendedGcd(a: bigint, b: bigint): [bigint, bigint, bigint] {
  if (b === 0n) return [a, 1n, 0n];
  
  const [gcd, x1, y1] = extendedGcd(b, a % b);
  const x = y1;
  const y = x1 - (a / b) * y1;
  
  return [gcd, x, y];
}

/**
 * Calcula o inverso modular
 */
export function modInverse(a: string | bigint, m: string | bigint): bigint | null {
  const aBig = BigInt(a);
  const mBig = BigInt(m);
  
  const [gcd, x] = extendedGcd(aBig, mBig);
  
  if (gcd !== 1n) return null;
  
  return (x % mBig + mBig) % mBig;
}

/**
 * Calcula o máximo divisor comum
 */
export function gcd(a: string | bigint, b: string | bigint): bigint {
  let aBig = BigInt(a);
  let bBig = BigInt(b);
  
  while (bBig !== 0n) {
    const temp = bBig;
    bBig = aBig % bBig;
    aBig = temp;
  }
  
  return aBig;
}

/**
 * Verifica se um número é primo (teste simples)
 */
export function isPrime(num: string | bigint): boolean {
  const n = BigInt(num);
  
  if (n <= 1n) return false;
  if (n <= 3n) return true;
  if (n % 2n === 0n || n % 3n === 0n) return false;
  
  let i = 5n;
  while (i * i <= n) {
    if (n % i === 0n || n % (i + 2n) === 0n) return false;
    i += 6n;
  }
  
  return true;
}

/**
 * Gera chaves RSA a partir de dois números primos P e Q
 */
export function generateRSAKeys(p: string, q: string): { n: string; d: string; e: string; phi: string } | null {
  try {
    const pBig = BigInt(p);
    const qBig = BigInt(q);
    
    if (!isPrime(pBig) || !isPrime(qBig)) {
      throw new Error('P e Q devem ser números primos');
    }
    
    if (pBig <= 1n || qBig <= 1n) {
      throw new Error('P e Q devem ser maiores que 1');
    }
    
    const n = pBig * qBig;
    const phi = (pBig - 1n) * (qBig - 1n);
    

    let d = 2n;
    while (d < phi) {
      if (gcd(d, phi) === 1n) break;
      d++;
    }
    
    const e = modInverse(d, phi);
    if (!e) {
      throw new Error('Não foi possível calcular o inverso modular');
    }
    
    return {
      n: n.toString(),
      d: d.toString(),
      e: e.toString(),
      phi: phi.toString()
    };
  } catch (error) {
    console.error('Erro ao gerar chaves RSA:', error);
    return null;
  }
}
