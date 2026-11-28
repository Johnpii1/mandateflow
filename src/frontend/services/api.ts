const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '')

export class ApiError extends Error {
  readonly status: number
  readonly details?: unknown

  constructor(
    message: string,
    status: number,
    details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  token?: string | null
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { body, token, headers: suppliedHeaders, ...requestOptions } = options
  const headers = new Headers(suppliedHeaders)
  headers.set('Accept', 'application/json')
  if (body !== undefined) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...requestOptions,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError('Could not reach the MandateFlow server.', 0)
  }

  const payload: unknown = await response.json().catch(() => undefined)
  if (!response.ok) {
    const errorBody = typeof payload === 'object' && payload !== null
      ? payload as { error?: unknown; details?: unknown }
      : undefined
    const message = typeof errorBody?.error === 'string'
      ? errorBody.error
      : `Request failed (${response.status}).`
    throw new ApiError(message, response.status, errorBody?.details)
  }

  return payload as T
}
