// Motor de Cifrado a Nivel de Campo (Field-Level Encryption - Ley 81 Panamá)
// Protege PII y datos financieros (Yappy, Cuentas Bancarias, Transacciones, Cédula, PIN)
// para que se almacenen cifrados ("ENCv1:...") en Firestore y solo se descifren en memoria autorizada.

const VAULT_PREFIX = 'ENCv1:';
const MASTER_SECRET = 'MANTECH_PRO_VAULT_LEY81_PA_2026_MASTER_KEY_V4_9981';

function deriveKeyByte(salt: string, index: number): number {
  const combined = `${MASTER_SECRET}:${salt}:${index}`;
  let hash = 2166136261;
  for (let i = 0; i < combined.length; i++) {
    hash ^= combined.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) & 0xff;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function isEncrypted(val: any): boolean {
  return typeof val === 'string' && val.startsWith(VAULT_PREFIX);
}

export function encryptField(plainValue: any): string {
  if (plainValue === null || plainValue === undefined) return '';
  const str = String(plainValue);
  if (str.trim() === '') return str;
  if (str.startsWith(VAULT_PREFIX)) return str;

  // Generar sal aleatoria de 8 caracteres hex
  const rand = Math.floor(Math.random() * 0xffffffff)
    .toString(16)
    .padStart(8, '0');

  const encoder = new TextEncoder();
  const inputBytes = encoder.encode(str);
  const cipherBytes = new Uint8Array(inputBytes.length);

  for (let i = 0; i < inputBytes.length; i++) {
    cipherBytes[i] = inputBytes[i] ^ deriveKeyByte(rand, i);
  }

  return `${VAULT_PREFIX}${rand}:${bytesToBase64(cipherBytes)}`;
}

export function decryptField(cipherValue: any): string {
  if (cipherValue === null || cipherValue === undefined) return '';
  const str = String(cipherValue);
  if (!str.startsWith(VAULT_PREFIX)) return str;

  try {
    const payload = str.slice(VAULT_PREFIX.length);
    const sepIdx = payload.indexOf(':');
    if (sepIdx === -1) return str;

    const salt = payload.slice(0, sepIdx);
    const b64 = payload.slice(sepIdx + 1);
    const cipherBytes = base64ToBytes(b64);
    const plainBytes = new Uint8Array(cipherBytes.length);

    for (let i = 0; i < cipherBytes.length; i++) {
      plainBytes[i] = cipherBytes[i] ^ deriveKeyByte(salt, i);
    }

    const decoder = new TextDecoder();
    return decoder.decode(plainBytes);
  } catch {
    return str;
  }
}

export function encryptTransaction(tx: any): any {
  if (!tx || typeof tx !== 'object') return tx;
  return {
    ...tx,
    id: encryptField(tx.id ?? ''),
    amount: encryptField(String(tx.amount ?? 0)),
    description: encryptField(tx.description ?? ''),
    status: encryptField(tx.status ?? 'completed'),
    type: encryptField(tx.type ?? 'credit'),
    timestamp: encryptField(tx.timestamp ?? new Date().toISOString()),
  };
}

export function decryptTransaction(tx: any): any {
  if (!tx || typeof tx !== 'object') return tx;
  const rawAmount = isEncrypted(tx.amount) ? decryptField(tx.amount) : tx.amount;
  const parsedAmount = Number(rawAmount);
  return {
    ...tx,
    id: decryptField(tx.id ?? ''),
    amount: isNaN(parsedAmount) ? 0 : parsedAmount,
    description: decryptField(tx.description ?? ''),
    status: decryptField(tx.status ?? 'completed'),
    type: decryptField(tx.type ?? 'credit'),
    timestamp: decryptField(tx.timestamp ?? ''),
  };
}

export function isTransactionNeedsEncryption(tx: any): boolean {
  if (!tx || typeof tx !== 'object') return false;
  return (
    (tx.id && !isEncrypted(tx.id)) ||
    (tx.description && !isEncrypted(tx.description)) ||
    (tx.status && !isEncrypted(tx.status)) ||
    (tx.type && !isEncrypted(tx.type)) ||
    (tx.timestamp && !isEncrypted(tx.timestamp)) ||
    (tx.amount !== undefined && !isEncrypted(tx.amount))
  );
}

export function encryptWallet(wallet: any): any {
  if (!wallet || typeof wallet !== 'object') return wallet;
  const next: any = { ...wallet };
  if (next.yappyNumber) next.yappyNumber = encryptField(next.yappyNumber);
  if (next.accountNumber) next.accountNumber = encryptField(next.accountNumber);
  if (next.bankName) next.bankName = encryptField(next.bankName);
  if (next.ownerName) next.ownerName = encryptField(next.ownerName);
  if (next.accountType) next.accountType = encryptField(next.accountType);
  if (Array.isArray(next.transactions)) {
    next.transactions = next.transactions.map(encryptTransaction);
  }
  return next;
}

export function decryptWallet(wallet: any): any {
  if (!wallet || typeof wallet !== 'object') return wallet;
  const next: any = { ...wallet };
  if (next.yappyNumber) next.yappyNumber = decryptField(next.yappyNumber);
  if (next.accountNumber) next.accountNumber = decryptField(next.accountNumber);
  if (next.bankName) next.bankName = decryptField(next.bankName);
  if (next.ownerName) next.ownerName = decryptField(next.ownerName);
  if (next.accountType) next.accountType = decryptField(next.accountType);
  if (Array.isArray(next.transactions)) {
    next.transactions = next.transactions.map(decryptTransaction);
  }
  return next;
}

export function getTechEncryptionPatch(rawTech: any): Record<string, any> | null {
  if (!rawTech || typeof rawTech !== 'object') return null;
  const patch: Record<string, any> = {};
  let changed = false;

  if (rawTech.phone && !isEncrypted(rawTech.phone)) {
    patch.phone = encryptField(rawTech.phone);
    changed = true;
  }
  if (rawTech.cedula && !isEncrypted(rawTech.cedula)) {
    patch.cedula = encryptField(rawTech.cedula);
    changed = true;
  }
  if (rawTech.yappyNumber && !isEncrypted(rawTech.yappyNumber)) {
    patch.yappyNumber = encryptField(rawTech.yappyNumber);
    changed = true;
  }

  if (rawTech.wallet && typeof rawTech.wallet === 'object') {
    const w = rawTech.wallet;
    const walletNeedsEnc =
      (w.yappyNumber && !isEncrypted(w.yappyNumber)) ||
      (w.accountNumber && !isEncrypted(w.accountNumber)) ||
      (w.bankName && !isEncrypted(w.bankName)) ||
      (w.ownerName && !isEncrypted(w.ownerName)) ||
      (w.accountType && !isEncrypted(w.accountType)) ||
      (Array.isArray(w.transactions) && w.transactions.some(isTransactionNeedsEncryption));

    if (walletNeedsEnc) {
      patch.wallet = encryptWallet(w);
      changed = true;
    }
  }

  if (Array.isArray(rawTech.transactions) && rawTech.transactions.some(isTransactionNeedsEncryption)) {
    patch.transactions = rawTech.transactions.map(encryptTransaction);
    changed = true;
  }

  return changed ? patch : null;
}

export function decryptTechProfile(rawTech: any): any {
  if (!rawTech || typeof rawTech !== 'object') return rawTech;
  const next = { ...rawTech };
  if (next.phone) next.phone = decryptField(next.phone);
  if (next.cedula) next.cedula = decryptField(next.cedula);
  if (next.yappyNumber) next.yappyNumber = decryptField(next.yappyNumber);
  if (next.wallet) next.wallet = decryptWallet(next.wallet);
  if (Array.isArray(next.transactions)) {
    next.transactions = next.transactions.map(decryptTransaction);
  }
  return next;
}

export function getUserEncryptionPatch(rawUser: any): Record<string, any> | null {
  if (!rawUser || typeof rawUser !== 'object') return null;
  const patch: Record<string, any> = {};
  let changed = false;

  if (rawUser.cedula && !isEncrypted(rawUser.cedula)) {
    patch.cedula = encryptField(rawUser.cedula);
    changed = true;
  }
  if (rawUser.phone && !isEncrypted(rawUser.phone)) {
    patch.phone = encryptField(rawUser.phone);
    changed = true;
  }
  if (rawUser.securityPin && !isEncrypted(rawUser.securityPin)) {
    patch.securityPin = encryptField(rawUser.securityPin);
    changed = true;
  }
  if (rawUser.yappyNumber && !isEncrypted(rawUser.yappyNumber)) {
    patch.yappyNumber = encryptField(rawUser.yappyNumber);
    changed = true;
  }
  if (rawUser.wallet && typeof rawUser.wallet === 'object') {
    const w = rawUser.wallet;
    const walletNeedsEnc =
      (w.yappyNumber && !isEncrypted(w.yappyNumber)) ||
      (w.accountNumber && !isEncrypted(w.accountNumber)) ||
      (w.bankName && !isEncrypted(w.bankName)) ||
      (w.ownerName && !isEncrypted(w.ownerName)) ||
      (Array.isArray(w.transactions) && w.transactions.some(isTransactionNeedsEncryption));
    if (walletNeedsEnc) {
      patch.wallet = encryptWallet(w);
      changed = true;
    }
  }
  if (Array.isArray(rawUser.transactions) && rawUser.transactions.some(isTransactionNeedsEncryption)) {
    patch.transactions = rawUser.transactions.map(encryptTransaction);
    changed = true;
  }

  return changed ? patch : null;
}

export function decryptUserProfile(rawUser: any): any {
  if (!rawUser || typeof rawUser !== 'object') return rawUser;
  const next = { ...rawUser };
  if (next.cedula) next.cedula = decryptField(next.cedula);
  if (next.phone) next.phone = decryptField(next.phone);
  if (next.securityPin) next.securityPin = decryptField(next.securityPin);
  if (next.yappyNumber) next.yappyNumber = decryptField(next.yappyNumber);
  if (next.wallet) next.wallet = decryptWallet(next.wallet);
  if (Array.isArray(next.transactions)) {
    next.transactions = next.transactions.map(decryptTransaction);
  }
  return next;
}
