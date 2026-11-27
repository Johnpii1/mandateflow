import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
  createHash,
  type ScryptOptions,
} from 'node:crypto';
import { getAddress, recoverMessageAddress, type Hex } from 'viem';
import { AppError } from '../../common/errors/AppError.js';
import { env } from '../../config/env.js';
import { User } from '../users/user.model.js';
import { Session } from './session.model.js';
import { WalletNonce } from './wallet-nonce.model.js';
import type { LoginInput, RegisterInput } from './auth.validation.js';

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const SCRYPT_KEY_LENGTH = 64;
const WALLET_NONCE_DURATION_MS = 5 * 60 * 1000;

function deriveKey(password: string, salt: Buffer, keyLength: number, options: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, keyLength, options, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derivedKey = await deriveKey(password, salt, SCRYPT_KEY_LENGTH, {
    N: 16_384,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024,
  });

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

  const actualKey = await deriveKey(password, salt, expectedKey.length, {
    N: Number(cost),
    r: Number(blockSize),
    p: Number(parallelization),
    maxmem: 64 * 1024 * 1024,
  });

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
  return { ...publicUser(user), wallets: user.wallets };
}

export async function createWalletNonce(userId: string, addressInput: string, chainId: number) {
  let address: string;
  try {
    address = getAddress(addressInput);
  } catch {
    throw new AppError('Invalid EVM address', 400);
  }

  const nonce = randomBytes(16).toString('hex');
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + WALLET_NONCE_DURATION_MS);
  const origin = new URL(env.CLIENT_ORIGIN);
  const message = [
    `${origin.host} wants you to sign in with your Ethereum account:`,
    address,
    '',
    'Link this wallet to your MandateFlow account.',
    '',
    `URI: ${origin.origin}`,
    'Version: 1',
    `Chain ID: ${chainId}`,
    `Nonce: ${nonce}`,
    `Issued At: ${issuedAt.toISOString()}`,
    `Expiration Time: ${expiresAt.toISOString()}`,
  ].join('\n');

  await WalletNonce.create({
    userId,
    address: address.toLowerCase(),
    chainId,
    nonce,
    message,
    expiresAt,
  });

  return { nonce, message, expiresAt };
}

export async function verifyAndLinkWallet(userId: string, nonce: string, signature: string) {
  const challenge = await WalletNonce.findOne({
    userId,
    nonce,
    expiresAt: { $gt: new Date() },
  });
  if (!challenge) throw new AppError('Wallet challenge is invalid or expired', 400);

  let recoveredAddress: string;
  try {
    recoveredAddress = await recoverMessageAddress({
      message: challenge.message,
      signature: signature as Hex,
    });
  } catch {
    throw new AppError('Wallet signature could not be verified', 400);
  }

  if (recoveredAddress.toLowerCase() !== challenge.address) {
    throw new AppError('Signature does not match the challenged wallet', 401);
  }

  const consumed = await WalletNonce.findOneAndDelete({
    _id: challenge._id,
    userId,
    expiresAt: { $gt: new Date() },
  });
  if (!consumed) throw new AppError('Wallet challenge has already been used or expired', 400);

  const alreadyLinked = await User.exists({ _id: userId, 'wallets.address': challenge.address });
  if (!alreadyLinked) {
    const user = await User.findById(userId).select('wallets');
    if (!user) throw new AppError('Account unavailable', 401);

    try {
      await User.updateOne(
        { _id: userId },
        {
          $push: {
            wallets: {
              address: challenge.address,
              chainId: challenge.chainId,
              isPrimary: user.wallets.length === 0,
              verifiedAt: new Date(),
            },
          },
        },
      );
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
        throw new AppError('This wallet is already linked to another account', 409);
      }
      throw error;
    }
  }

  const user = await User.findById(userId).select('wallets');
  return { wallets: user?.wallets ?? [] };
}
