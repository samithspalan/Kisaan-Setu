// Real product photos in public/images/products/, keyed by the file's
// basename. Manifest generated from the actual directory contents — most
// commodities have both a short form ("onion") and a long form mirroring
// the full data.gov.in name including its parenthetical/typos
// ("pegeon_pea_arhar_fali") since the feed itself misspells some names.
const PRODUCT_IMAGES = new Set([
  'amaranthus', 'amla', 'amla_nelli_kai', 'apple', 'ashgourd', 'baby_corn', 'bajra',
  'bajra_pearl_millet_cumbu', 'banana', 'banana_green', 'barley', 'barley_jau', 'batri_grass_pea',
  'beans', 'beetroot', 'bengal_gram_dal', 'bengal_gram_dal_chana_dal', 'bengal_gram_gram_whole',
  'bengal_gram_whole', 'betal_leaves', 'betel_leaves', 'bhindi', 'bhindi_ladies_finger',
  'bitter_gourd', 'black_gram_dal', 'black_gram_dal_urd_dal', 'black_pepper', 'bottle_gourd',
  'brinjal', 'bull', 'buttery', 'cabbage', 'capsicum', 'carrot', 'cashewnuts', 'cauliflower',
  'chicory', 'chicory_chikori_kasni', 'chikoos', 'chikoos_sapota', 'chili_red', 'chilly_capsicum',
  'chow_chow', 'cluster_beans', 'coconut', 'coconut_oil', 'coconut_seed', 'colacasia', 'colocasia',
  'coriander_leaves', 'coriander_seeds', 'corriander_seed', 'cotton', 'cowpea',
  'cowpea_lobia_karamani', 'cowpea_veg', 'cucumbar_kheera', 'cucumber', 'cumin_seeds',
  'cummin_seed_jeera', 'custard_apple', 'custard_apple_sharifa', 'drumstick', 'elephant_yam',
  'elephant_yam_suran_amorphophallus', 'field_bean', 'field_bean_anumulu', 'field_pea', 'fig',
  'fig_anjura_anjeer', 'firewood', 'fish', 'french_beans', 'french_beans_frasbean', 'garlic',
  'ginger', 'ginger_green', 'gram_raw', 'gram_raw_chholia', 'grapes', 'green_avare',
  'green_avare_w', 'green_chilli', 'green_gram_dal', 'green_gram_dal_moong_dal',
  'green_gram_moong_whole', 'green_gram_whole', 'green_peas', 'groundnut', 'guar', 'guava',
  'gulli', 'gur', 'gur_jaggery', 'hen', 'indian_beans', 'indian_beans_seam', 'jack_fruit',
  'jack_fruit_ripe', 'jamun', 'jamun_narale_hannu', 'jasmine', 'jowar', 'jowar_sorghum', 'jute',
  'kakada', 'karbuja', 'karbuja_musk_melon', 'khandsari', 'khandsari_desi_khand', 'knool_khol',
  'kodo_millet', 'kodo_millet_varagu', 'kulthi', 'kulthi_horse_gram', 'kutki', 'ladies_finger',
  'leafy_vegetable', 'lemon', 'lime', 'little_gourd', 'little_gourd_kundru', 'long_melon',
  'long_melon_kakri', 'mahua', 'mahua_seed_gulli', 'maize', 'makhana', 'makhana_foxnut', 'mango',
  'mango_raw_ripe', 'marigold', 'marigold_calcutta', 'mashrooms', 'masur_dal', 'mentha_oil',
  'methi_leaves', 'mint', 'mint_pudina', 'mousambi', 'mousambi_sweet_lime', 'mushrooms', 'mustard',
  'mustard_oil', 'onion', 'onion_green', 'orange', 'other_green_and_fresh_vegetables',
  'other_green_fresh_vegetables', 'ox', 'paddy', 'paddy_common', 'papaya', 'passion_fruit',
  'peach', 'pear', 'pear_marasebu', 'peas_dry', 'pegeon_pea_arhar_fali', 'pigeon_pea', 'pineapple',
  'plum', 'pointed_gourd', 'pointed_gourd_parval', 'pomegranate', 'potato', 'prawn', 'pumpkin',
  'rab_liquid_jaggery', 'rab_liquid_jaggery_molasses', 'raddish', 'radish',
  'red_gram_arhar_tur_whole', 'red_gram_whole', 'rice', 'ridge_gourd', 'ridgeguard_tori', 'rose',
  'rose_local', 'sesamum', 'she_buffalo', 'snake_gourd', 'snakeguard', 'soyabean', 'spinach',
  'spiny_gourd', 'spiny_gourd_kartali_kantola', 'sponge_gourd', 'squash', 'squash_chappal_kadoo',
  'sweet_corn', 'sweet_potato', 'sweet_pumpkin', 'tamarind_fruit', 'tapioca', 'taro_arvi_stem',
  'taro_stem', 'tender_coconut', 'thondekai', 'tinda', 'tobacco', 'tomato', 'tube_flower',
  'tube_rose', 'tube_rose_loose', 'turnip', 'water_melon', 'wheat', 'wild_cucumber', 'wood', 'yam',
  'yam_ratalu',
])

// Two normalizations of the API's commodity name: "long" keeps whatever was
// inside parens/slashes (matches files that spell out the full name, e.g.
// "Pegeon Pea(Arhar Fali)" -> pegeon_pea_arhar_fali — the feed's own typo,
// mirrored in the filename), "short" drops it (matches the plain files,
// e.g. "Bhindi(Ladies Finger)" -> bhindi). Try long first since it's more
// specific, fall back to short.
function longKey(name = '') {
  return name
    .replace(/[(),/]/g, ' ')
    .replace(/[^a-zA-Z ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/ /g, '_')
}

function shortKey(name = '') {
  return name
    .replace(/\(.*?\)/g, ' ')
    .replace(/[^a-zA-Z ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/ /g, '_')
}

/**
 * Returns the 400w WebP for a commodity, or null when we have no photo.
 * Images are pre-resized by scripts/optimize-images.mjs — the originals
 * were camera-resolution JPEGs (up to 1.4MB each) being rendered into a
 * 128px card.
 */
export function getProductImagePath(commodityName) {
  if (!commodityName) return null
  const long = longKey(commodityName)
  if (PRODUCT_IMAGES.has(long)) return `/images/products/${long}.webp`
  const short = shortKey(commodityName)
  if (PRODUCT_IMAGES.has(short)) return `/images/products/${short}.webp`
  return null
}

/**
 * srcSet pairing the 400w and 800w variants, so a high-DPI phone gets a
 * sharp image without every device downloading the larger file.
 */
export function getProductImageSrcSet(commodityName) {
  const base = getProductImagePath(commodityName)
  if (!base) return null
  const name = base.replace(/\.webp$/, '')
  return `${base} 400w, ${name}@800.webp 800w`
}
