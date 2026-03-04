import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { sql } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '8h';

export interface UserPayload { id: string; username: string; role: string; assigned_mender?: string; }

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: UserPayload): string {
  const options: jwt.SignOptions = { expiresIn: JWT_EXPIRY as jwt.SignOptions['expiresIn'] };
  return jwt.sign(user, JWT_SECRET, options);
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & UserPayload;
    const result = await sql`SELECT id, username, role, assigned_mender, is_active FROM users WHERE id = ${decoded.id} AND is_active = TRUE`;
    if (result.length === 0) return null;
    return { id: decoded.id, username: decoded.username, role: decoded.role, assigned_mender: decoded.assigned_mender };
  } catch { return null; }
}

export async function checkLoginAttempts(username: string): Promise<{ allowed: boolean; lockedUntil?: Date }> {
  const result = await sql`SELECT failed_login_attempts, locked_until FROM users WHERE username = ${username}`;
  if (result.length === 0) return { allowed: true };
  const user = result[0];
  if (user.locked_until && new Date(user.locked_until) > new Date()) return { allowed: false, lockedUntil: new Date(user.locked_until) };
  if (user.failed_login_attempts >= 5) {
    const lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
    await sql`UPDATE users SET locked_until = ${lockedUntil} WHERE username = ${username}`;
    return { allowed: false, lockedUntil };
  }
  return { allowed: true };
}

export async function recordLoginAttempt(username: string, success: boolean): Promise<void> {
  if (success) await sql`UPDATE users SET failed_login_attempts = 0, locked_until = NULL, last_login = CURRENT_TIMESTAMP WHERE username = ${username}`;
  else await sql`UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE username = ${username}`;
}
