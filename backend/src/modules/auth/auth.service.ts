import { promisify } from 'node:util';
import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
  createHash,
} from 'node:crypto';
import { AppError } from '../../common/errors/AppError.js';
import { User } from '../users/user.model.js';
import { Session } from './session.model.js';
import type { LoginInput, RegisterInput } from './auth.validation.js';

const scrypt = promisify(scryptCallback);
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const SCRYPT_KEY_LENGTH = 64;

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derivedKey = (await scrypt(password, salt, SCRYPT_KEY_LENGTH, {
    N: 16_384,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024,
  })) as Buffer;

  return `scrypt$16384$8$1$${salt.toString('hex')}$${derivedKey.toString('hex')}`;
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [algorithm, cost, blockSize, parallelization, saltHex, keyHex] = storedHash.split('$');
  if (algorithm !== 'scrypt' || !cost || !blockSize || !parallelization || !saltHex || !keyHex) {
    return false;
  }

  const salt = Buffer.from(saltHex, 'hex');
  const expectedKey = Buffer.from(keyHex, 'hex');
  if (salt.length !== 16 || expectedKey.length !== SCRYPT_KEY_LENGTH) return false;

  const actualKey = (await scrypt(password, salt, expectedKey.length, {
    N: Number(cost),
    r: Number(blockSize),
    p: Number(parallelization),
    maxmem: 64 * 1024 * 1024,
  })) as Buffer;

  return timingSafeEqual(expectedKey, actualKey);
}

function publicUser(user: { id: string; email: string; displayName: string; createdAt: Date }) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    createdAt: user.createdAt,
  };
}

async function createSession(userId: string) {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  await Session.create({
    userId,
    tokenHash: createHash('sha256').update(token).digest('hex'),
    expiresAt,
  });
  return { token, expiresAt };
}

export async function register(input: RegisterInput) {
  const email = input.email.trim().toLowerCase();
  const existingUser = await User.exists({ email });
  if (existingUser) throw new AppError('An account with this email already exists', 409);

  let user;
  try {
    user = await User.create({
      email,
      displayName: input.displayName,
      passwordHash: await hashPassword(input.password),
    });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
      throw new AppError('An account with this email already exists', 409);
    }
    throw error;
  }

  const session = await createSession(user.id);
  return { user: publicUser(user), ...session };
}

export async function login(input: LoginInput) {
  const user = await User.findOne({ email: input.email.trim().toLowerCase() }).select('+passwordHash');
  const validPassword = user
    ? await verifyPassword(input.password, user.passwordHash)
    : false;

  if (!user || !validPassword || user.status !== 'active') {
    throw new AppError('Invalid email or password', 401);
  }

  const session = await createSession(user.id);
  return { user: publicUser(user), ...session };
}

export async function logout(token: string): Promise<void> {
  const tokenHash = createHash('sha256').update(token).digest('hex');
  await Session.deleteOne({ tokenHash });
}

export async function getCurrentUser(userId: string) {
  const user = await User.findById(userId);
  if (!user || user.status !== 'active') throw new AppError('Account unavailable', 401);
  return publicUser(user);
}
