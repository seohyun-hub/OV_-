import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface UserRecord {
  userId: string;       // Permanent ID e.g. usr_9a8f7e6d
  username: string;     // Unique login ID e.g. seohyun
  name: string;         // Real name e.g. 박서현
  team: string;         // Team name e.g. Revenue
  passwordHash: string; // PBKDF2 salted hash
  salt: string;         // Salt string
  isAdmin: boolean;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  allowedMenus?: string[];
}

export interface SessionRecord {
  token: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function loadUsers(): UserRecord[] {
  ensureDataDir();
  if (!fs.existsSync(USERS_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(raw) as UserRecord[];
  } catch (e) {
    console.error('Failed to read users.json:', e);
    return [];
  }
}

export function saveUsers(users: UserRecord[]): void {
  ensureDataDir();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

export function loadSessions(): SessionRecord[] {
  ensureDataDir();
  if (!fs.existsSync(SESSIONS_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(SESSIONS_FILE, 'utf-8');
    const sessions = JSON.parse(raw) as SessionRecord[];
    const now = Date.now();
    return sessions.filter((s) => s.expiresAt > now);
  } catch (e) {
    return [];
  }
}

export function saveSessions(sessions: SessionRecord[]): void {
  ensureDataDir();
  const now = Date.now();
  const validSessions = sessions.filter((s) => s.expiresAt > now);
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(validSessions, null, 2), 'utf-8');
}

export function hashPassword(password: string, customSalt?: string): { hash: string; salt: string } {
  const salt = customSalt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  if (!password || !hash || !salt) return false;
  const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verifyHash, 'hex'));
  } catch (err) {
    return false;
  }
}

export function validatePasswordStrength(password: string): { isValid: boolean; warning?: string } {
  if (!password || password.trim().length === 0) {
    return { isValid: false, warning: '비밀번호를 입력해주세요.' };
  }
  const trimmed = password.trim();
  if (trimmed.length < 4) {
    return { isValid: false, warning: '비밀번호는 최소 4자리 이상이어야 합니다.' };
  }

  // Weak PINs and common simple patterns
  const weakPins = [
    '0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999',
    '1234', '4321', '0123', '3210', '1122', '2211', '1212', '2121', '1357', '2468',
    '123456', '654321', '000000', '111111', '12345', '54321'
  ];
  if (weakPins.includes(trimmed)) {
    return { isValid: false, warning: '보안에 취약한 단순 PIN번호(예: 1234, 0000)는 사용할 수 없습니다.' };
  }

  // Identical repeating characters
  if (/^(.)\1+$/.test(trimmed)) {
    return { isValid: false, warning: '동일한 문자가 반복되는 단순 비밀번호는 제한됩니다.' };
  }

  return { isValid: true };
}

// Failed login attempts tracker for rate-limiting / account lockout
const failedAttempts = new Map<string, { count: number; lockedUntil: number }>();

export function checkLockout(username: string): boolean {
  const key = username.toLowerCase().trim();
  const entry = failedAttempts.get(key);
  if (!entry) return false;
  if (entry.lockedUntil > Date.now()) {
    return true;
  }
  if (entry.lockedUntil > 0 && entry.lockedUntil <= Date.now()) {
    failedAttempts.delete(key);
  }
  return false;
}

export function recordFailedAttempt(username: string) {
  const key = username.toLowerCase().trim();
  const current = failedAttempts.get(key) || { count: 0, lockedUntil: 0 };
  const count = current.count + 1;
  let lockedUntil = 0;
  if (count >= 5) {
    lockedUntil = Date.now() + 5 * 60 * 1000; // 5 minute lock
  }
  failedAttempts.set(key, { count, lockedUntil });
}

export function clearFailedAttempt(username: string) {
  failedAttempts.delete(username.toLowerCase().trim());
}

export function generateUserId(): string {
  return 'usr_' + crypto.randomBytes(8).toString('hex');
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function sanitizeUser(user: UserRecord) {
  return {
    userId: user.userId,
    username: user.username,
    name: user.name,
    team: user.team,
    isAdmin: user.isAdmin,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    allowedMenus: user.allowedMenus,
  };
}
