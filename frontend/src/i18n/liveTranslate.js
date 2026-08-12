// Live machine translation via MyMemory (free, no API key, CORS-open —
// used client-side by many apps). Used only as a fallback for commodity
// names outside the hand-curated dictionary in commodityNames.js, so the
// long tail of data.gov.in names isn't permanently stuck in English.
// Results are cached in localStorage — one network call per (text, lang)
// pair for the lifetime of the browser, not per render.
const CACHE_PREFIX = 'kisansetu_translate_'

// MyMemory pulls from a crowd-sourced translation memory and occasionally
// returns a confident-looking but wrong match for obscure terms (e.g.
// "Plum" -> "color", "Drumstick" -> "Constellation name (optional)"). All
// our target languages use a non-Latin script, so a "translation" that
// comes back pure ASCII is almost certainly one of these bad matches
// rather than a real result — reject it and keep the English original.
function looksTranslated(text) {
  return /[^\x00-\x7F]/.test(text)
}

function cacheGet(text, lang) {
  try {
    const value = localStorage.getItem(`${CACHE_PREFIX}${lang}:${text}`)
    return value && looksTranslated(value) ? value : null
  } catch {
    return null
  }
}

function cacheSet(text, lang, value) {
  try {
    localStorage.setItem(`${CACHE_PREFIX}${lang}:${text}`, value)
  } catch {
    // localStorage full or unavailable — translation just won't be cached
  }
}

const inFlight = new Map()

export async function translateText(text, lang) {
  if (!text || !lang || lang === 'en') return text

  const cached = cacheGet(text, lang)
  if (cached) return cached

  const key = `${lang}:${text}`
  if (inFlight.has(key)) return inFlight.get(key)

  const request = fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${lang}`
  )
    .then((res) => res.json())
    .then((data) => {
      const translated = data?.responseData?.translatedText
      if (translated && data.responseStatus === 200 && looksTranslated(translated)) {
        cacheSet(text, lang, translated)
        return translated
      }
      return text
    })
    .catch(() => text)
    .finally(() => inFlight.delete(key))

  inFlight.set(key, request)
  return request
}
