const normalizeUrl = (url = '') => url.replace(/\/+$/, '')

/**
 * API origin.
 *
 * In production this MUST come from VITE_API_ORIGIN (set it on the
 * Render static site, see render.yaml). There is deliberately no
 * hardcoded production fallback — the previous one pointed at a host
 * nothing in this repo provisions, so a misconfigured deploy silently
 * shipped a frontend talking to a backend that didn't exist. Failing
 * loudly at startup is better than failing quietly for every user.
 */
const envOrigin = import.meta.env.VITE_API_ORIGIN

if (import.meta.env.PROD && !envOrigin) {
  throw new Error(
    'VITE_API_ORIGIN is not set. Set it to your API URL (e.g. https://kisansetu-api.onrender.com) before building for production.'
  )
}

const apiOrigin = normalizeUrl(envOrigin || 'http://localhost:5000')

export const API_BASE = `${apiOrigin}/api`
export const SOCKET_URL = normalizeUrl(import.meta.env.VITE_SOCKET_URL || apiOrigin)
