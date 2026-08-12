import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { languages } from '../../i18n/config'
import { authService } from '../../services/authService'

const TAP_COUNT = 5
const TAP_WINDOW_MS = 3000

/**
 * The ledger's spine header: title left, a language switch and page
 * actions right. Sits on the maroon cover color everywhere.
 *
 * Dev-only: clicking the wordmark 5 times within 3s logs in as a fixed
 * local farmer account (creating it on first use). Gated behind
 * import.meta.env.DEV so it's stripped from production builds — it
 * still goes through the real signup/login endpoints, never fakes an
 * authenticated session client-side.
 */
export default function Navbar({ onNavigate, right }) {
  const { i18n } = useTranslation()
  const tapCount = useRef(0)
  const tapTimer = useRef(null)

  const handleLogoClick = (e) => {
    if (!import.meta.env.DEV) {
      onNavigate?.('home')
      return
    }

    e.preventDefault()
    tapCount.current += 1
    clearTimeout(tapTimer.current)

    if (tapCount.current >= TAP_COUNT) {
      tapCount.current = 0
      authService.devLogin()
        .then((result) => {
          if (result.user) {
            window.location.hash = 'farmer-dashboard'
            window.location.reload()
          } else {
            console.warn('[dev login] failed:', result.message)
          }
        })
        .catch((err) => console.warn('[dev login] failed:', err))
      return
    }

    tapTimer.current = setTimeout(() => {
      tapCount.current = 0
    }, TAP_WINDOW_MS)
  }

  return (
    <header className="ledger-scope sticky top-0 z-40 bg-maroon text-paper">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <a
          href="#home"
          onClick={handleLogoClick}
          className="font-display text-xl font-semibold tracking-tight text-paper"
        >
          KisanSetu
        </a>
        <div className="flex items-center gap-4">
          <select
            aria-label="Language"
            value={i18n.language}
            onChange={(e) => {
              i18n.changeLanguage(e.target.value)
              localStorage.setItem('language', e.target.value)
            }}
            className="rounded-sm border border-paper/25 bg-transparent px-2 py-1 font-ledger text-xs uppercase tracking-wide text-paper/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brass-light [&>option]:text-ink"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
          {right}
        </div>
      </div>
    </header>
  )
}
