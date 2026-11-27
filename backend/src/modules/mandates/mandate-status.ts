export const mandateStatuses = [
  'DRAFT',
  'PENDING_SIGNATURE',
  'AUTHORIZED',
  'SUBMITTED',
  'SETTLED',
  'VERIFIED',
  'REJECTED',
  'EXPIRED',
  'REVOKED',
  'FAILED',
  'VERIFICATION_FAILED',
] as const;

export type MandateStatus = (typeof mandateStatuses)[number];

export type MandateTransitionActor = 'payer' | 'agent' | 'system' | 'hsp' | 'receipt_verifier';

const transitions: Record<MandateStatus, Partial<Record<MandateTransitionActor, MandateStatus[]>>> = {
  DRAFT: {
    payer: ['PENDING_SIGNATURE', 'REJECTED'],
    agent: ['REJECTED'],
    system: ['EXPIRED'],
  },
  PENDING_SIGNATURE: {
    payer: ['AUTHORIZED', 'REJECTED', 'REVOKED'],
    agent: ['REJECTED'],
    system: ['EXPIRED'],
  },
  AUTHORIZED: {
    hsp: ['SUBMITTED', 'FAILED'],
    payer: ['REVOKED'],
  },
  SUBMITTED: {
    hsp: ['SETTLED', 'FAILED'],
  },
  SETTLED: {
    receipt_verifier: ['VERIFIED', 'VERIFICATION_FAILED'],
  },
  VERIFIED: {},
  REJECTED: {},
  EXPIRED: {},
  REVOKED: {},
  FAILED: {},
  VERIFICATION_FAILED: {},
};

export function isMandateTransitionAllowed(
  from: MandateStatus,
  to: MandateStatus,
  actor: MandateTransitionActor,
): boolean {
  return transitions[from][actor]?.includes(to) ?? false;
}
