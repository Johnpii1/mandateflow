import { env } from '../../config/env.js';
import type {
  HspObservePaymentResponse,
  HspPaymentResponse,
  HspRegisterPaymentInput,
  HspRegisterPaymentResponse,
} from './hsp.types.js';

interface HspErrorBody {
  errorCode?: unknown;
}

export class HspClientError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly errorCode?: string,
  ) {
    super(message);
    this.name = 'HspClientError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export class HspClient {
  private readonly coordinatorUrl: string;

  constructor() {
    if (!env.HSP_COORDINATOR_URL || !env.HSP_API_KEY) {
      throw new HspClientError('HSP Coordinator is not configured', 503);
    }
    this.coordinatorUrl = env.HSP_COORDINATOR_URL.replace(/\/+$/, '');
  }

  private async request<T>(
    path: string,
    options: { method?: 'GET' | 'POST'; body?: unknown; authenticated?: boolean } = {},
  ): Promise<{ data: T; status: number }> {
    const headers: Record<string, string> = { accept: 'application/json' };
    if (options.body !== undefined) headers['content-type'] = 'application/json';
    if (options.authenticated) headers.authorization = `Bearer ${env.HSP_API_KEY}`;

    let response: Response;
    try {
      response = await fetch(`${this.coordinatorUrl}${path}`, {
        method: options.method ?? 'GET',
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: AbortSignal.timeout(15_000),
      });
    } catch {
      throw new HspClientError('Could not reach the HSP Coordinator', 502);
    }

    const payload: unknown = await response.json().catch(() => undefined);
    if (!response.ok) {
      const errorBody = isRecord(payload) ? (payload as HspErrorBody) : undefined;
      throw new HspClientError(
        `HSP Coordinator returned HTTP ${response.status}`,
        502,
        typeof errorBody?.errorCode === 'string' ? errorBody.errorCode : undefined,
      );
    }
    if (payload === undefined) {
      throw new HspClientError('HSP Coordinator returned an invalid response', 502);
    }

    return { data: payload as T, status: response.status };
  }

  async registerPayment(input: HspRegisterPaymentInput): Promise<HspRegisterPaymentResponse> {
    const { data } = await this.request<HspRegisterPaymentResponse>('/payments', {
      method: 'POST',
      authenticated: true,
      body: input,
    });
    return data;
  }

  async getPayment(paymentId: string): Promise<HspPaymentResponse> {
    const { data } = await this.request<HspPaymentResponse>(`/payments/${encodeURIComponent(paymentId)}`);
    return data;
  }

  async observePayment(paymentId: string, txHash: `0x${string}`): Promise<HspObservePaymentResponse> {
    const { data, status } = await this.request<HspPaymentResponse>(
      `/payments/${encodeURIComponent(paymentId)}/observe`,
      { method: 'POST', authenticated: true, body: { txHash } },
    );
    if (status !== 200 && status !== 202) {
      throw new HspClientError('HSP Coordinator returned an unexpected observation status', 502);
    }
    return { httpStatus: status, body: data };
  }

  async getChains(): Promise<unknown> {
    const { data } = await this.request<unknown>('/chains');
    return data;
  }
}
