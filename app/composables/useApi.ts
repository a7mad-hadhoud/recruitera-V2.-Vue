/**
 * Central fetch wrapper for all API calls.
 *
 * - `credentials: 'include'` → sends the HttpOnly auth cookie (once we ship
 *   real auth) with every request. Never store tokens in localStorage.
 * - `X-Requested-With: XMLHttpRequest` → basic CSRF signal that lets the API
 *   reject cross-origin form submissions before they reach handlers.
 *
 * Do not `fetch` directly for mutations — go through here.
 */

type ApiInit = Omit<RequestInit, 'headers'> & { headers?: Record<string, string> }

async function request<T>(url: string, init: ApiInit = {}): Promise<T> {
  const config = useRuntimeConfig()
  // Same-origin paths (like `/api/candidates`) are intercepted by MSW in dev
  // and hit the same-origin Nuxt server in prod — no rewrite needed.
  // Only prepend the external API base when the caller explicitly asks for it
  // (e.g. `useApi().get('external://...')` — a pattern we don't use yet).
  const target = url.startsWith('http') || url.startsWith('/')
    ? url
    : `${config.public.apiBase}/${url}`

  const res = await fetch(target, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(init.headers ?? {}),
    },
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new ApiError(res.status, body || res.statusText)
  }
  // 204 / empty body
  if (res.status === 204) return undefined as unknown as T
  return res.json() as Promise<T>
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

export function useApi() {
  return {
    get:    <T>(url: string, init?: ApiInit) => request<T>(url, { ...init, method: 'GET' }),
    post:   <T>(url: string, body?: unknown, init?: ApiInit) =>
      request<T>(url, { ...init, method: 'POST',   body: body === undefined ? undefined : JSON.stringify(body) }),
    put:    <T>(url: string, body?: unknown, init?: ApiInit) =>
      request<T>(url, { ...init, method: 'PUT',    body: body === undefined ? undefined : JSON.stringify(body) }),
    patch:  <T>(url: string, body?: unknown, init?: ApiInit) =>
      request<T>(url, { ...init, method: 'PATCH',  body: body === undefined ? undefined : JSON.stringify(body) }),
    delete: <T>(url: string, init?: ApiInit) => request<T>(url, { ...init, method: 'DELETE' }),
  }
}
