function base64ToBytes(base64) {
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

function bytesToBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

class GcmPgEncryption {
  constructor(iv, ivKey) {
    this.iv = iv;
    this.ivKey = ivKey;
    this.mKey = null;
  }

  async init() {
    const combined = this.ivKey + this.iv;
    const combinedBytes = new TextEncoder().encode(combined);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', combinedBytes);
    this.mKey = bytesToBase64(new Uint8Array(hashBuffer));
  }

  async encryptWithMKeys(plainMessage) {
    if (!this.mKey) await this.init();

    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const passwordBytes = new TextEncoder().encode(this.mKey);

    const baseKey = await window.crypto.subtle.importKey(
      'raw',
      passwordBytes,
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    const derivedKey = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 65535,
        hash: 'SHA-512',
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt']
    );

    const plaintextBytes = new TextEncoder().encode(plainMessage);

    const ciphertext = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      derivedKey,
      plaintextBytes
    );

    const ciphertextBytes = new Uint8Array(ciphertext);
    const tag = ciphertextBytes.slice(-16);
    const encrypted = ciphertextBytes.slice(0, -16);

    const combined_data = new Uint8Array(salt.length + iv.length + encrypted.length + tag.length);
    combined_data.set(salt, 0);
    combined_data.set(iv, salt.length);
    combined_data.set(encrypted, salt.length + iv.length);
    combined_data.set(tag, salt.length + iv.length + encrypted.length);

    return bytesToBase64(combined_data);
  }
}

export default GcmPgEncryption;
