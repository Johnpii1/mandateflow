import { randomUUID } from 'node:crypto';
import { AppError } from '../../common/errors/AppError.js';
import { Agent } from '../agents/agent.model.js';
import { User } from '../users/user.model.js';
import { Mandate, type MandateRecord } from './mandate.model.js';
import {
  isMandateTransitionAllowed,
  type MandateStatus,
  type MandateTransitionActor,
} from './mandate-status.js';
import type { CreateMandateInput } from './mandate.validation.js';

function toPartyView(mandate: MandateRecord) {
  return {
    mandateId: mandate.mandateId,
    payerWallet: mandate.payerWallet,
    agentId: mandate.agentId,
    recipientWallet: mandate.recipientWallet,
    taskId: mandate.taskId,
    chainId: mandate.chainId,
    tokenAddress: mandate.tokenAddress,
    tokenSymbol: mandate.tokenSymbol,
    amount: mandate.amount,
    amountBaseUnits: mandate.amountBaseUnits,
    deadline: mandate.deadline,
    status: mandate.status,
    signatureStatus: mandate.signatureStatus,
    executionStatus: mandate.executionStatus,
    verificationStatus: mandate.verificationStatus,
    failureCode: mandate.failureCode,
    hspReceiptReference: mandate.hspReceiptReference,
    paymentReady: Boolean(mandate.recipientWallet && mandate.tokenAddress && mandate.amountBaseUnits),
    createdAt: mandate.createdAt,
    updatedAt: mandate.updatedAt,
  };
}

export async function createMandateDraft(payerUserId: string, input: CreateMandateInput) {
  const [payer, agent] = await Promise.all([
    User.findById(payerUserId).select('wallets'),
    Agent.findOne({ agentId: input.agentId, status: 'active', isDiscoverable: true }),
  ]);

  if (!payer || payer.wallets.length === 0) {
    throw new AppError('A verified wallet is required to create a payment draft', 409);
  }
  if (!agent) throw new AppError('Agent is not available for payment requests', 404);

  const payerWallet = input.payerWallet.toLowerCase();
  const verifiedWallet = payer.wallets.find(
    (wallet) => wallet.address.toLowerCase() === payerWallet && wallet.chainId === agent.pricing.chainId,
  );
  if (!verifiedWallet) {
    throw new AppError('Payer wallet must be verified on the agent pricing chain', 403);
  }

  const mandate = await Mandate.create({
    mandateId: randomUUID(),
    payerUserId,
    payerWallet,
    agentId: agent.agentId,
    agentOwnerId: agent.ownerId,
    taskId: input.taskId,
    chainId: agent.pricing.chainId,
    tokenSymbol: agent.pricing.token,
    amount: agent.pricing.amount,
    status: 'DRAFT',
    signatureStatus: 'not_requested',
    executionStatus: 'not_started',
    verificationStatus: 'unverified',
  });

  return toPartyView(mandate);
}

async function assertPartyAccess(mandate: MandateRecord, userId: string): Promise<void> {
  const ownerId = mandate.agentOwnerId.toString();
  if (mandate.payerUserId.toString() !== userId && ownerId !== userId) {
    throw new AppError('Mandate not found', 404);
  }
}

export async function getMandate(mandateId: string, userId: string) {
  const mandate = await Mandate.findOne({ mandateId });
  if (!mandate) throw new AppError('Mandate not found', 404);
  await assertPartyAccess(mandate, userId);
  return toPartyView(mandate);
}

export async function listMandates(userId: string, page: number, limit: number) {
  const [total, mandates] = await Promise.all([
    Mandate.countDocuments({
      $or: [{ payerUserId: userId }, { agentOwnerId: userId }],
    }),
    Mandate.find({
      $or: [{ payerUserId: userId }, { agentOwnerId: userId }],
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
  ]);

  return {
    mandates: mandates.map(toPartyView),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export async function transitionMandate(
  mandateId: string,
  nextStatus: MandateStatus,
  actor: MandateTransitionActor,
  evidence?: {
    hspReceiptReference?: string;
    signatureReference?: string;
    failureCode?: string;
  },
) {
  const mandate = await Mandate.findOne({ mandateId });
  if (!mandate) throw new AppError('Mandate not found', 404);
  if (!isMandateTransitionAllowed(mandate.status, nextStatus, actor)) {
    throw new AppError(`Mandate cannot transition from ${mandate.status} to ${nextStatus}`, 409);
  }
  if (nextStatus === 'VERIFIED' && !evidence?.hspReceiptReference) {
    throw new AppError('Receipt evidence is required to verify settlement', 400);
  }
  if (nextStatus === 'AUTHORIZED' && !evidence?.signatureReference) {
    throw new AppError('Verified authorization evidence is required', 400);
  }

  const update: Record<string, unknown> = { status: nextStatus };
  if (nextStatus === 'AUTHORIZED') update.signatureStatus = 'authorized';
  if (nextStatus === 'AUTHORIZED') update.signatureReference = evidence!.signatureReference;
  if (nextStatus === 'REJECTED') update.signatureStatus = 'rejected';
  if (nextStatus === 'SUBMITTED') update.executionStatus = 'submitted';
  if (nextStatus === 'SETTLED') update.executionStatus = 'settled';
  if (nextStatus === 'FAILED') update.executionStatus = 'failed';
  if (nextStatus === 'VERIFIED') {
    update.verificationStatus = 'verified';
    update.hspReceiptReference = evidence!.hspReceiptReference;
  }
  if (nextStatus === 'VERIFICATION_FAILED') update.verificationStatus = 'failed';
  if (evidence?.failureCode) update.failureCode = evidence.failureCode;

  const updated = await Mandate.findOneAndUpdate(
    { mandateId, status: mandate.status },
    { $set: update },
    { new: true, runValidators: true },
  );
  if (!updated) throw new AppError('Mandate state changed concurrently; reload and retry', 409);
  return toPartyView(updated);
}
