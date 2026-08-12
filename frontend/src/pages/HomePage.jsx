import { useEffect, useState } from 'react'
import { ArrowRight, Sprout } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import Navbar from '../components/ui/Navbar'
import Footer from '../components/ui/Footer'
import Button from '../components/ui/Button'
import StampBadge from '../components/ui/StampBadge'
import LedgerTable from '../components/ui/LedgerTable'
import { API_BASE } from '../config/api'

export default function HomePage() {
  const { t } = useTranslation()
  const [liveBoard, setLiveBoard] = useState(null)
  const [liveBoardFailed, setLiveBoardFailed] = useState(false)
  const [platformStats, setPlatformStats] = useState(null)

  useEffect(() => {
    let cancelled = false
    axios.get(`${API_BASE}/market-prices?limit=8`)
      .then((response) => {
        if (cancelled || !response.data.success) return
        setLiveBoard(response.data.records)
      })
      .catch(() => {
        if (!cancelled) setLiveBoardFailed(true)
      })

    // Real counts. Failure leaves platformStats null and the whole
    // tallies section is skipped — never fall back to invented numbers.
    axios.get(`${API_BASE}/platform-stats`)
      .then((response) => {
        if (cancelled || !response.data.success) return
        setPlatformStats(response.data)
      })
      .catch(() => {})

    return () => { cancelled = true }
  }, [])

  const boardRows = liveBoard ?? []
  const isLive = Boolean(liveBoard)

  const priceColumns = [
    { key: 'commodity', label: t('home.colCrop'), mono: false },
    { key: 'market', label: t('home.colMarket'), mono: false, render: (row) => `${row.market}, ${row.state}` },
    {
      key: 'price',
      label: t('home.colPrice'),
      align: 'right',
      render: (row) => `₹${Number(row.modal_price).toLocaleString('en-IN')} / quintal`,
    },
  ]

  // Only tiles backed by a real non-zero count are shown. An empty
  // platform shows no tallies rather than a fabricated floor.
  const tallies = platformStats
    ? [
        { label: t('home.tallyFarmers'), value: platformStats.farmers },
        { label: t('home.tallyListings'), value: platformStats.listings, accent: true },
        { label: t('home.tallyMandis'), value: platformStats.mandis },
      ].filter((item) => item.value > 0)
    : []

  return (
    <div className="ledger-scope min-h-screen bg-paper">
      <Navbar
        right={
          <a href="#about" className="font-body text-sm text-paper/85 hover:text-paper">
            {t('home.aboutLink')}
          </a>
        }
      />

      {/* Hero: the ledger's opening page */}
      <section className="ledger-rule bg-maroon text-paper">
        <div className="mx-auto max-w-6xl px-8 pb-16 pt-14 sm:pt-20 sm:pl-16">
          <p className="font-ledger text-xs uppercase tracking-[0.2em] text-brass-light">
            {t('home.eyebrow')}
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold leading-[1.05] sm:text-6xl">
            {t('home.heroLine1')}
            <br />
            {t('home.heroLine2')}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-paper/80">
            {t('home.heroSubtitle')}
          </p>
        </div>
      </section>

      {/* The fork: sell or buy, set like two columns of a ledger */}
      <section className="ledger-rule bg-paper">
        <div className="mx-auto grid max-w-6xl gap-px overflow-hidden border-y border-ink/15 bg-ink/15 sm:grid-cols-2 sm:pl-16">
          <a
            href="#farmer-login"
            className="group flex flex-col justify-between gap-6 bg-paper px-8 py-10 transition-colors hover:bg-paper-dim focus-visible:outline focus-visible:outline-2 focus-visible:outline-maroon focus-visible:-outline-offset-2 sm:px-10"
          >
            <div>
              <p className="flex items-center gap-1.5 font-ledger text-xs uppercase tracking-[0.2em] text-leaf">
                <Sprout className="h-3.5 w-3.5" /> {t('home.sellEyebrow')}
              </p>
              <h2 className="mt-3 font-display text-2xl font-semibold sm:text-3xl">
                {t('home.sellTitle')}
              </h2>
              <p className="mt-3 max-w-sm text-ink/70">
                {t('home.sellDesc')}
              </p>
            </div>
            <span className="inline-flex items-center gap-2 font-semibold text-leaf-dark">
              {t('home.sellCta')}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </a>

          <a
            href="#customer-login"
            className="group flex flex-col justify-between gap-6 bg-paper px-8 py-10 transition-colors hover:bg-paper-dim focus-visible:outline focus-visible:outline-2 focus-visible:outline-maroon focus-visible:-outline-offset-2 sm:px-10"
          >
            <div>
              <p className="font-ledger text-xs uppercase tracking-[0.2em] text-rule">{t('home.buyEyebrow')}</p>
              <h2 className="mt-3 font-display text-2xl font-semibold sm:text-3xl">
                {t('home.buyTitle')}
              </h2>
              <p className="mt-3 max-w-sm text-ink/70">
                {t('home.buyDesc')}
              </p>
            </div>
            <span className="inline-flex items-center gap-2 font-semibold text-maroon">
              {t('home.buyCta')}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </a>
        </div>
      </section>

      {/* Today's Mandi Board */}
      <section className="ledger-rule bg-paper">
        <div className="mx-auto max-w-6xl px-8 py-14 sm:pl-16">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="font-ledger text-xs uppercase tracking-[0.2em] text-ink/50">
                {t('home.mandiUpdated')}
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold">
                {t('home.mandiTitle')}
              </h2>
            </div>
            <StampBadge label={t('home.stampLabel')} sublabel={t('home.stampSublabel')} />
          </div>

          {isLive ? (
            <>
              <div className="mt-8 rounded-sm border border-ink/15 bg-paper/60 p-1 sm:p-4">
                <LedgerTable columns={priceColumns} rows={boardRows} />
              </div>
              <p className="mt-3 flex items-center gap-2 text-xs text-ink/70">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-leaf opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-leaf" />
                </span>
                {t('home.mandiLive')}
              </p>
            </>
          ) : (
            <div className="mt-8 flex flex-col items-center justify-center rounded-sm border-2 border-dashed border-ink/15 py-16 text-center">
              <p className="text-ink/70">
                {liveBoardFailed ? t('common.fetchError') : t('home.mandiLoading')}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Tallies — real counts only; section is omitted entirely when
          there's nothing truthful to show (e.g. a brand-new deployment). */}
      {tallies.length > 0 && (
      <section className="ledger-rule bg-paper-dim">
        <div className="mx-auto max-w-6xl px-8 py-12 sm:pl-16">
          <dl className={`grid grid-cols-1 divide-y divide-ink/15 sm:divide-x sm:divide-y-0 ${
            tallies.length === 1 ? 'sm:grid-cols-1' : tallies.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'
          }`}>
            {tallies.map((item) => (
              <div key={item.label} className="py-6 first:pt-0 sm:px-8 sm:py-0 sm:first:pl-0">
                <dt className="text-sm text-ink/60">{item.label}</dt>
                <dd className={`mt-1 font-ledger text-4xl font-semibold tabular-nums ${item.accent ? 'text-leaf' : 'text-maroon'}`}>
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      )}

      {/* Closing CTA */}
      <section className="ledger-rule bg-paper">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-8 py-16 sm:pl-16">
          <h2 className="max-w-lg font-display text-3xl font-semibold">
            {t('home.closingTitle')}
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button as="a" href="#farmer-signup" variant="primary">
              {t('home.closingFarmerCta')}
            </Button>
            <Button as="a" href="#customer-signup" variant="outline">
              {t('home.closingBuyerCta')}
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
