import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { translateCommodity } from '../../i18n/commodityNames'
import { translateText } from '../../i18n/liveTranslate'

/**
 * Displays a commodity name in the active language. Checks the hand-curated
 * dictionary first (instant, no network) for common staples; anything it
 * doesn't cover falls through to a live MyMemory translation call, cached
 * in localStorage after the first lookup. Shows the English name while the
 * live call is in flight rather than blocking render.
 */
export default function CommodityLabel({ name, as: Tag = 'span', className }) {
  const { i18n } = useTranslation()
  const lang = i18n.language
  const dictHit = translateCommodity(name, lang)
  const [live, setLive] = useState(null)

  useEffect(() => {
    setLive(null)
    if (lang === 'en' || dictHit !== name) return // already resolved via dictionary
    let cancelled = false
    translateText(name, lang).then((translated) => {
      if (!cancelled) setLive(translated)
    })
    return () => {
      cancelled = true
    }
  }, [name, lang, dictHit])

  return <Tag className={className}>{live || dictHit}</Tag>
}
