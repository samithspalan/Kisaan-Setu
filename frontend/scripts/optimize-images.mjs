/**
 * One-time image optimisation for public/images/products.
 *
 * The source photos are camera-resolution JPEGs (213 files, ~46MB, some
 * over 1MB each) that the UI renders into a 128px-tall card. On a rural
 * 3G connection a single dashboard load was pulling many megabytes and
 * a real slice of a prepaid data pack.
 *
 * This rewrites them as WebP at the sizes actually displayed. WebP is
 * supported on Android 4.2+/Chrome 32+, which covers the low-end devices
 * this app targets.
 *
 * Run manually after adding new photos — deliberately NOT part of `npm
 * run build`, so deploys don't re-encode 46MB every time:
 *
 *   node scripts/optimize-images.mjs           # writes .webp alongside
 *   node scripts/optimize-images.mjs --replace # also deletes the .jpg
 */
import { readdir, stat, unlink, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(__dirname, '..', 'public', 'images', 'products');

// Cards render at ~128px tall in a flexible-width grid; 400w covers that
// at 2x on a phone. 800w is there for the larger detail thumbnail.
const WIDTHS = [400, 800];
const QUALITY = 72;

const replaceOriginals = process.argv.includes('--replace');

const bytesToMb = (n) => (n / 1024 / 1024).toFixed(1);

async function dirSize(dir, filterExt) {
  const files = await readdir(dir);
  let total = 0;
  for (const f of files) {
    if (filterExt && !f.endsWith(filterExt)) continue;
    total += (await stat(path.join(dir, f))).size;
  }
  return total;
}

async function main() {
  const before = await dirSize(DIR);
  const files = (await readdir(DIR)).filter((f) => /\.(jpe?g|png)$/i.test(f));

  if (files.length === 0) {
    console.log('No source images found — nothing to do.');
    return;
  }

  console.log(`Optimising ${files.length} images (${bytesToMb(before)}MB)…`);

  let done = 0;
  for (const file of files) {
    const base = file.replace(/\.(jpe?g|png)$/i, '');
    const src = path.join(DIR, file);

    // Read into a buffer rather than letting sharp open the path — on
    // Windows sharp keeps the source handle open, which makes the
    // subsequent unlink fail with EBUSY.
    const input = await readFile(src);

    for (const width of WIDTHS) {
      // 400w keeps the plain name so existing <img src> paths keep
      // working; wider variants get a suffix for srcset.
      const suffix = width === WIDTHS[0] ? '' : `@${width}`;
      const out = path.join(DIR, `${base}${suffix}.webp`);
      await sharp(input)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(out);
    }

    if (replaceOriginals) await unlink(src);
    done += 1;
    if (done % 25 === 0) console.log(`  …${done}/${files.length}`);
  }

  const after = await dirSize(DIR);
  console.log(
    `Done. ${bytesToMb(before)}MB -> ${bytesToMb(after)}MB` +
      (replaceOriginals ? '' : ' (originals kept; re-run with --replace to remove them)')
  );
}

main().catch((error) => {
  console.error('Image optimisation failed:', error);
  process.exit(1);
});
