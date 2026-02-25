import crypto from 'crypto';

const decryptEas = async (cipherContent, iv, ivKey) => {
  try {
    const combined = ivKey + iv;
    const mKey = crypto.createHash('sha256').update(combined).digest('base64');

    const combined_data = Buffer.from(cipherContent, 'base64');
    const salt = combined_data.slice(0, 16);
    const iv_bytes = combined_data.slice(16, 28);
    const ciphertext = combined_data.slice(28, -16);
    const tag = combined_data.slice(-16);

    const passwordBytes = Buffer.from(mKey, 'utf-8');
    const derivedKey = crypto.pbkdf2Sync(passwordBytes, salt, 65535, 32, 'sha512');

    const decipher = crypto.createDecipheriv('aes-256-gcm', derivedKey, iv_bytes);
    decipher.setAuthTag(tag);

    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return plaintext.toString('utf-8');
  } catch (error) {
    console.error('Decryption error:', error);
    throw error;
  }
};

export default decryptEas;
