import CryptoJS from 'crypto-js';

// Use a fixed 32-byte key and 16-byte IV for the MVP to bypass crypto-js random requirements
const AES_KEY = CryptoJS.enc.Utf8.parse('PLAYNEST_SECURE_VAULT_KEY_2026_X'); // 32 characters
const AES_IV = CryptoJS.enc.Utf8.parse('PLAYNEST_IV_2026'); // 16 characters

export class AESService {
  /**
   * Encrypts a base64 string using AES-256 with explicit IV and Key.
   */
  static encryptBase64(base64Data: string): string {
    const encrypted = CryptoJS.AES.encrypt(base64Data, AES_KEY, {
      iv: AES_IV,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
  }

  /**
   * Decrypts an AES-256 string back to a base64 string.
   */
  static decryptBase64(encryptedData: string): string {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, AES_KEY, {
      iv: AES_IV,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  }
}
