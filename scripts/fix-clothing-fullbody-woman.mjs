/**
 * Regenerate the 7 woman clothing styles that were previously upper-body
 * portraits (from generate-missing-images.mjs) as full-body top-to-toe shots,
 * matching the framing used in generate-onboarding-v2.mjs.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, '..', 'public', 'onboarding', 'clothing', 'woman')
const FAL_URL = 'https://fal.run/fal-ai/flux/schnell'
const FAL_KEY = process.env.FAL_API_KEY

if (!FAL_KEY) { console.error('Missing FAL_API_KEY'); process.exit(1) }

const QUALITY_FULL = 'full body shot head to toe visible, standing pose, professional photography, studio lighting, cinematic, ultra-detailed, 8k, fashion photography'

const IMAGES = [
  {
    file: 'preppy.jpg',
    prompt: `photorealistic full body shot of beautiful 25 year old woman wearing preppy outfit, navy polo shirt tucked into plaid pleated skirt, white knee-high socks, loafers, headband, classic collegiate Ivy League style, bright natural smile, head to toe visible, ${QUALITY_FULL}`,
  },
  {
    file: 'vintage.jpg',
    prompt: `photorealistic full body shot of beautiful 25 year old woman wearing vintage 1950s retro pin-up polka dot midi dress with cinched waist, red lipstick, pearl necklace, victory-roll hairstyle, classic black pumps, timeless elegance, head to toe visible, ${QUALITY_FULL}`,
  },
  {
    file: 'luxury.jpg',
    prompt: `photorealistic full body shot of beautiful 25 year old woman wearing luxury haute-couture designer evening gown, gold statement jewelry, diamond earrings, glamorous makeup, stiletto heels, red carpet sophistication, confident elegant pose, head to toe visible, ${QUALITY_FULL}`,
  },
  {
    file: 'gothic.jpg',
    prompt: `photorealistic full body shot of beautiful 25 year old woman wearing gothic outfit, black lace corset dress with long flowing skirt, fishnet stockings, platform combat boots, silver chain jewelry, dark lipstick, smoky eye makeup, mysterious dark aesthetic, head to toe visible, ${QUALITY_FULL}`,
  },
  {
    file: 'lingerie.jpg',
    prompt: `photorealistic full body boudoir shot of beautiful 25 year old woman wearing elegant black lace lingerie set with matching robe loosely draped, sheer thigh-high stockings, high heels, soft warm bedroom lighting, sensual but classy boudoir photography, standing graceful pose, head to toe visible, ${QUALITY_FULL}`,
  },
  {
    file: 'swimwear.jpg',
    prompt: `photorealistic full body shot of beautiful 25 year old woman wearing stylish designer bikini swimwear, tropical beach setting, golden hour sunlight, sun-kissed glowing skin, wet hair, summer aesthetic, standing confident pose at the shoreline, head to toe visible, ${QUALITY_FULL}`,
  },
  {
    file: 'jellaba.jpg',
    prompt: `photorealistic full body shot of beautiful 25 year old woman wearing traditional Moroccan embroidered jellaba kaftan with intricate gold patterns, matching hijab, leather babouche slippers, traditional jewelry, warm earthy desert tones, elegant poised stance, head to toe visible, ${QUALITY_FULL}`,
  },
]

async function generate({ file, prompt }) {
  const dest = path.join(OUT_DIR, file)
  console.log(`→ ${file}`)
  const res = await fetch(FAL_URL, {
    method: 'POST',
    headers: { 'Authorization': `Key ${FAL_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      image_size: { width: 768, height: 1024 },
      num_inference_steps: 4,
      enable_safety_checker: false,
    }),
  })
  if (!res.ok) throw new Error(`FAL ${res.status}: ${await res.text()}`)
  const data = await res.json()
  const url = data.images?.[0]?.url
  if (!url) throw new Error(`No image url in response: ${JSON.stringify(data)}`)
  const img = await fetch(url)
  const buf = Buffer.from(await img.arrayBuffer())
  fs.writeFileSync(dest, buf)
  console.log(`  ✓ saved (${(buf.length / 1024).toFixed(0)} KB)`)
}

console.log(`\nRegenerating ${IMAGES.length} woman clothing images as full-body...\n`)
let ok = 0, fail = 0
for (const img of IMAGES) {
  try { await generate(img); ok++ }
  catch (e) { console.error(`  ✗ ${img.file}: ${e.message}`); fail++ }
}
console.log(`\nDone. ${ok} succeeded, ${fail} failed.`)
