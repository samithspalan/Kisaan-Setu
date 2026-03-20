const normalizeUrl = (url = '') => url.replace(/\/+$/, '')

const defaultOrigin = import.meta.env.PROD ? window.location.origin : 'http://localhost:8000'
const apiOrigin = normalizeUrl(import.meta.env.VITE_API_ORIGIN || defaultOrigin)

export const API_BASE = `${apiOrigin}/api`
export const SOCKET_URL = normalizeUrl(import.meta.env.VITE_SOCKET_URL || defaultOrigin)
