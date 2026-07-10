// Base URL for backend API calls.
// Empty by default: works out of the box for monolith deploys (Render serving
// both API and built frontend from the same origin).
// Set VITE_API_URL in your deployment platform (e.g. Vercel) when the
// frontend is hosted separately from the backend. See client/.env.example.
export const API_URL = import.meta.env.VITE_API_URL ?? "";

// fetch() wrapper that always sends the session cookie. Required so login
// persists when the frontend and backend are on different origins (e.g.
// Vercel + Render) — without it the browser drops the cookie cross-site.
export function apiFetch(input: string, init: RequestInit = {}) {
  return fetch(input, { ...init, credentials: 'include' })
}
