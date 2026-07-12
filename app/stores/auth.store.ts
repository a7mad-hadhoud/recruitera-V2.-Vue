import { defineStore } from 'pinia'
import type { Company, User } from '~/types'

/**
 * ⚠️ MOCK AUTH — replace when the real API ships.
 *
 * When the API is connected:
 *   - Remove sessionStorage usage. The auth token becomes an HttpOnly cookie
 *     set by the server on login — the frontend never reads it.
 *   - `restore()` calls `GET /api/me` instead of reading storage.
 *   - `login()` calls the API and lets it set the cookie via Set-Cookie header.
 *
 * localStorage is unsafe for tokens — any XSS on the page can read it.
 * sessionStorage is only marginally safer and only used here as a dev stand-in.
 */

const TOKEN_KEY = 'recruitera:mock_token'

export const useAuthStore = defineStore('auth', () => {
  const user    = ref<User | null>(null)
  const company = ref<Company | null>(null)

  const isAuthenticated = computed(() => !!user.value)

  function restore() {
    if (import.meta.server) return
    const raw = window.sessionStorage.getItem(TOKEN_KEY)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw) as { user: User; company: Company }
      user.value    = parsed.user
      company.value = parsed.company
    }
    catch {
      window.sessionStorage.removeItem(TOKEN_KEY)
    }
  }

  function login(u: User, c: Company) {
    user.value    = u
    company.value = c
    if (import.meta.client) {
      window.sessionStorage.setItem(TOKEN_KEY, JSON.stringify({ user: u, company: c }))
    }
  }

  function logout() {
    user.value    = null
    company.value = null
    if (import.meta.client) window.sessionStorage.removeItem(TOKEN_KEY)
  }

  return { user, company, isAuthenticated, restore, login, logout }
})
