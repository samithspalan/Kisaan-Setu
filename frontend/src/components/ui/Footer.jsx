import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="ledger-scope bg-maroon-dark py-8 text-paper/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="font-ledger tracking-wide">{t('home.footerTagline')}</p>
        <p>{t('home.footerNote')}</p>
      </div>
    </footer>
  )
}
