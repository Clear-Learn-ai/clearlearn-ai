export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'PROVIDER_UNAVAILABLE'
  | 'INTERNAL_ERROR'

export interface ApiErrorPayload {
  code: ApiErrorCode
  message: string
  details?: Record<string, unknown>
}

export function jsonError(code: ApiErrorCode, message: string, status: number, details?: Record<string, unknown>) {
  return Response.json({ success: false, error: message, code, details }, { status })
}

export function toApiError(err: unknown, fallbackMessage = 'Internal error'): ApiErrorPayload {
  if (err instanceof Error) {
    return { code: 'INTERNAL_ERROR', message: err.message }
  }
  return { code: 'INTERNAL_ERROR', message: fallbackMessage }
}

