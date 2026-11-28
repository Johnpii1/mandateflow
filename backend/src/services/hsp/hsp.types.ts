export type Hex = `0x${string}`;
export type Bytes32 = `0x${string}`;

export interface HspMandateBodyV1 {
  nonce: Bytes32;
  signer: {
    profileId: Bytes32;
    payload: Hex;
  };
  grantRef: Bytes32;
  requirementRef: Bytes32;
  recipient: {
    kind: number;
    payload: Hex;
  };
  token: `0x${string}`;
  amount: string;
  chainId: string;
  deadline: string;
  settlementBinding: Bytes32;
  requiredCapabilitiesHash: Bytes32;
}

export interface HspSignedMandate {
  body: HspMandateBodyV1;
  signature: Hex;
}

export type HspPaymentStatus =
  | 'PROPOSED'
  | 'ATTEMPTED'
  | 'SETTLED'
  | 'DISPUTED'
  | 'FAILED'
  | 'EXPIRED'
  | (string & {});

export interface HspDecision {
  ok: boolean;
  outcomeClass?: 'ACCEPT' | 'RETRYABLE' | 'POLICY' | 'PERMANENT' | string;
  errorCode?: string;
  errorDetail?: string;
}

export interface HspPaymentResponse {
  paymentId: string;
  status: HspPaymentStatus;
  mandate?: HspSignedMandate;
  receipts?: unknown[];
  attestations?: unknown[];
  lastDecision?: HspDecision;
}

export interface HspRegisterPaymentInput {
  chain: string;
  mandate: HspSignedMandate;
  attestations?: unknown[];
}

export interface HspRegisterPaymentResponse {
  paymentId: string;
  status: HspPaymentStatus;
}

export interface HspObservePaymentResponse {
  httpStatus: 200 | 202;
  body: HspPaymentResponse;
}
