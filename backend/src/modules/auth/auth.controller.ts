import type { RequestHandler } from 'express';
import { AppError } from '../../common/errors/AppError.js';
import {
  createWalletNonce,
  getCurrentUser,
  login,
  logout,
  register,
  verifyAndLinkWallet,
} from './auth.service.js';
import {
  loginSchema,
  registerSchema,
  walletNonceSchema,
  walletVerifySchema,
} from './auth.validation.js';

function bearerToken(authorization: string | undefined): string {
  const match = authorization?.match(/^Bearer ([\da-f]{64})$/i);
  if (!match) throw new AppError('Authentication required', 401);
  return match[1]!;
}

export const registerController: RequestHandler = async (request, response) => {
  const parsed = registerSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
    return;
  }
  response.status(201).json(await register(parsed.data));
};

export const loginController: RequestHandler = async (request, response) => {
  const parsed = loginSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
    return;
  }
  response.status(200).json(await login(parsed.data));
};

export const logoutController: RequestHandler = async (request, response) => {
  await logout(bearerToken(request.header('authorization')));
  response.status(204).send();
};

export const meController: RequestHandler = async (_request, response) => {
  response.json({ user: await getCurrentUser(response.locals.userId as string) });
};

export const walletNonceController: RequestHandler = async (request, response) => {
  const parsed = walletNonceSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
    return;
  }
  response.status(200).json(await createWalletNonce(
    response.locals.userId as string,
    parsed.data.address,
    parsed.data.chainId,
  ));
};

export const walletVerifyController: RequestHandler = async (request, response) => {
  const parsed = walletVerifySchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
    return;
  }
  response.status(200).json(await verifyAndLinkWallet(
    response.locals.userId as string,
    parsed.data.nonce,
    parsed.data.signature,
  ));
};
