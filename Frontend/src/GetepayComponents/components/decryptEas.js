function base64ToBytes(base64) {
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

function bytesToBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

const decryptEas = async (cipherContent, iv, ivKey) => {
  const combined = ivKey + iv;
  const combinedBytes = new TextEncoder().encode(combined);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', combinedBytes);
  const mKey = bytesToBase64(new Uint8Array(hashBuffer));

  const combined_data = base64ToBytes(cipherContent);
  const salt = combined_data.slice(0, 16);
  const iv_bytes = combined_data.slice(16, 28);
  const ciphertext = combined_data.slice(28, -16);
  const tag = combined_data.slice(-16);

  const passwordBytes = new TextEncoder().encode(mKey);

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
    ['decrypt']
  );

  const combined_ciphertext = new Uint8Array(ciphertext.length + tag.length);
  combined_ciphertext.set(ciphertext, 0);
  combined_ciphertext.set(tag, ciphertext.length);

  const plaintext = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv_bytes },
    derivedKey,
    combined_ciphertext
  );

  return new TextDecoder().decode(plaintext);
};

export default decryptEas;
