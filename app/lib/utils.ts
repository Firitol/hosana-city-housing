import crypto from 'crypto';

// Get encryption key from environment (must be 32 characters for AES-256)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-32-char-encryption-key!!';
const IV_LENGTH = 16;

/**
 * Encrypt sensitive text (e.g., phone numbers)
 */
export function encrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    return text; // Fallback: return unencrypted (not ideal, but prevents crash)
  }
}

/**
 * Decrypt previously encrypted text
 */
export function decrypt(text: string): string {
  try {
    const parts = text.split(':');
    if (parts.length !== 2) return text;
    
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return text; // Fallback: return as-is
  }
}

/**
 * Format date for display
 */
export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate Ethiopian phone format
 */
export function validatePhone(phone: string): boolean {
  // Matches: +251-XXX-XXX-XXX or 09XX-XXX-XXX
  return /^(\+251|0)[1-9]\d{8}$/.test(phone.replace(/[\s\-\.\(\)]/g, ''));
}

/**
 * Generate unique ID for house numbers
 */
export function generateHouseId(mender: string, kebele: string): string {
  const timestamp = Date.now().toString(36).slice(-4);
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `H-${mender.slice(-1)}-${kebele.slice(-2)}-${timestamp}${random}`;
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .trim();
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}
