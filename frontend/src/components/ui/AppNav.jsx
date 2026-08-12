import { useRef } from 'react'
import { LogOut } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { languages } from '../../i18n/config'
import { authService } from '../../services/authService'

const TAP_COUNT = 5
const TAP_WINDOW_MS = 3000

/**
 * The ledger's spine header for signed-in pages: wordmark, section
 * links, language switch, logout. Same maroon band as the public
 * Navbar, extended with the in-app links every dashboard page needs
 * instead of each page hand-rolling its own header.
 */
export default function AppNav({ links = [], active, onLogout }) {
  const { i18n } = useTranslation()
  const tapCount = useRef(0)
  const tapTimer = useRef(null)

  const handleLogoClick = (e) => {
    if (!import.meta.env.DEV) return
    e.preventDefault()
    tapCount.current += 1
    clearTimeout(tapTimer.current)

    if (tapCount.current >= TAP_COUNT) {
      tapCount.current = 0
      authService.devLogin()
        .then((result) => {
          if (result.user) window.location.reload()
        })
        .catch(() => {})
      return
    }
    tapTimer.current = setTimeout(() => { tapCount.current = 0 }, TAP_WINDOW_MS)
  }

  return (
    <header className="ledger-scope sticky top-0 z-40 bg-maroon text-paper">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3 sm:px-8">
        <a
          href="#home"
          onClick={handleLogoClick}
          className="font-display text-lg font-semibold tracking-tight text-paper"
        >
          KisanSetu
        </a>

        <nav className="flex flex-1 flex-wrap items-center gap-1">
          {links.map((link) => (
            <a
              key={link.id}
              href={`#${link.href}`}
              onClick={link.onClick}
              aria-current={active === link.id ? 'page' : undefined}
              className={`rounded-sm px-3 py-1.5 text-sm font-medium transition-colors ${
                active === link.id
                  ? 'bg-paper/15 text-paper'
                  : 'text-paper/75 hover:bg-paper/10 hover:text-paper'
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
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
          <button
            type="button"
            onClick={onLogout}
            title="Log out"
            aria-label="Log out"
            className="flex h-8 w-8 items-center justify-center rounded-sm text-paper/75 transition-colors hover:bg-paper/10 hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass-light"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
