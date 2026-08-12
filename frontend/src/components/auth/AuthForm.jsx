import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Navbar from '../ui/Navbar'
import Field from '../ui/Field'
import Button from '../ui/Button'
import { authService } from '../../services/authService'

const switchHref = {
  farmer: { login: '#farmer-signup', signup: '#farmer-login' },
  customer: { login: '#customer-signup', signup: '#customer-login' },
}

const dashboardHash = { farmer: '#farmer-dashboard', customer: '#customer-dashboard' }

export default function AuthForm({ role, mode, onNavigate, onSuccess }) {
  const { t } = useTranslation()
  const isSignup = mode === 'signup'
  const base = `auth.${role}.${mode}`

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const googleButtonRef = useRef(null)

  const handleGoogleLogin = async (response) => {
    try {
      const result = await authService.googleLogin(response.credential, role)
      if (result.user) {
        onSuccess ? onSuccess(result.user.role) : onNavigate?.(dashboardHash[role].slice(1))
      } else {
        setError(result.message || t('auth.errors.google'))
      }
    } catch {
      setError(t('auth.errors.google'))
    }
  }

  useEffect(() => {
    if (mode !== 'login' || role !== 'farmer') return
    /* global google */
    if (window.google) {
      google.accounts.id.initialize({
        client_id: '952084918159-7rumtd7e8ublui9pphgum4rtp4uo87o8.apps.googleusercontent.com',
        callback: handleGoogleLogin,
      })
      google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        width: 320,
        text: 'continue_with',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, role])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (isSignup) {
      if (!name || !email || !password || !confirmPassword) {
        setError(t('auth.errors.fillFields'))
        return
      }
      if (password !== confirmPassword) {
        setError(t('auth.errors.passwordMismatch'))
        return
      }
      if (!agreed) {
        setError(t('auth.errors.agreeTerms'))
        return
      }
    } else if (!email || !password) {
      setError(t('auth.errors.fillEmailPassword'))
      return
    }

    setLoading(true)
    try {
      let result
      if (isSignup) {
        result = role === 'farmer'
          ? await authService.farmerSignup(name, email, password)
          : await authService.customerSignup(name, email, password)
      } else {
        result = role === 'farmer'
          ? await authService.farmerLogin(email, password)
          : await authService.customerLogin(email, password)
      }

      if (result.user) {
        if (isSignup) {
          setSuccess(t('auth.success.created'))
          setTimeout(() => onSuccess?.(result.user.role), 900)
        } else {
          onSuccess?.(result.user.role)
        }
      } else {
        setError(result.message || t('auth.errors.generic'))
      }
    } catch (err) {
      setError(err.message || t('auth.errors.network'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ledger-scope min-h-screen bg-paper">
      <Navbar
        onNavigate={onNavigate}
        right={
          <a
            href="#home"
            onClick={() => onNavigate?.('home')}
            className="font-body text-sm text-paper/85 hover:text-paper"
          >
            {t('auth.back')}
          </a>
        }
      />

      <main className="mx-auto flex max-w-6xl justify-center px-5 py-14 sm:px-8 sm:py-20">
        <div className="ledger-rule w-full max-w-md sm:pl-16">
          <p className="font-ledger text-xs uppercase tracking-[0.2em] text-rule">{t(`${base}.eyebrow`)}</p>
          <h1 className="mt-3 font-display text-3xl font-semibold">{t(`${base}.title`)}</h1>
          <p className="mt-2 text-ink/70">{t(`${base}.sub`)}</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
            {isSignup && (
              <Field
                label={t('auth.fields.fullName')}
                id="name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('auth.fields.fullNamePlaceholder')}
              />
            )}
            <Field
              label={t('auth.fields.email')}
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.fields.emailPlaceholder')}
            />
            <Field
              label={t('auth.fields.password')}
              id="password"
              type="password"
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            {isSignup && (
              <Field
                label={t('auth.fields.confirmPassword')}
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            )}

            {isSignup && (
              <label className="flex items-start gap-2 text-sm text-ink/70">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 h-4 w-4 border-ink/30"
                />
                <span>{t('auth.fields.terms')}</span>
              </label>
            )}

            {error && (
              <p role="alert" className="border-l-2 border-rule pl-3 text-sm text-rule">
                {error}
              </p>
            )}
            {success && (
              <p role="status" className="border-l-2 border-brass pl-3 text-sm text-ink/80">
                {success}
              </p>
            )}

            <Button type="submit" variant="primary" disabled={loading} className="w-full">
              {loading ? t(`${base}.ctaLoading`) : t(`${base}.cta`)}
            </Button>

            {mode === 'login' && role === 'farmer' && (
              <div>
                <div className="my-2 flex items-center gap-3 text-xs text-ink/40">
                  <span className="h-px flex-1 bg-ink/15" />
                  {t('auth.fields.or')}
                  <span className="h-px flex-1 bg-ink/15" />
                </div>
                <div ref={googleButtonRef} className="flex justify-center" />
              </div>
            )}
          </form>

          <p className="mt-8 text-sm text-ink/70">
            {t(`${base}.switchPrompt`)}{' '}
            <a href={switchHref[role][mode]} className="font-semibold text-maroon hover:underline">
              {t(`${base}.switchLabel`)}
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}
