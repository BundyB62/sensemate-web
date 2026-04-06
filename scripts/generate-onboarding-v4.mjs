/**
 * Generate v4 — lingerie for women, tight pants for men
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, '..', 'public', 'onboarding')
const FAL_URL = 'https://fal.run/fal-ai/flux/schnell'
const FAL_KEY = process.env.FAL_API_KEY

if (!FAL_KEY) { console.error('Missing FAL_API_KEY'); process.exit(1) }

const Q = 'professional photography, studio lighting, soft warm light, high resolution, 8k, realistic, detailed, dark moody background'

const IMAGES = [
  // BREAST SIZE — lingerie, front view
  {
    path: 'breast-size/small.jpg',
    prompt: `boudoir photography, front view upper body of beautiful woman wearing black lace lingerie bra, very small flat chest, A cup, petite breasts, slim body, dark background, ${Q}`,
  },
  {
    path: 'breast-size/medium.jpg',
    prompt: `boudoir photography, front view upper body of beautiful woman wearing black lace lingerie bra, medium breasts, C cup, natural full bust visible in bra, dark background, ${Q}`,
  },
  {
    path: 'breast-size/large.jpg',
    prompt: `boudoir photography, front view upper body of beautiful woman wearing black lace lingerie bra, large full breasts, D cup, prominent cleavage, big bust filling the bra, dark background, ${Q}`,
  },
  {
    path: 'breast-size/xl.jpg',
    prompt: `boudoir photography, front view upper body of beautiful woman wearing black lace lingerie bra, very large heavy breasts, F cup, extremely full prominent bust overflowing bra, deep cleavage, dark background, ${Q}`,
  },

  // ASS SIZE — lingerie/thong, rear view
  {
    path: 'ass-size/small.jpg',
    prompt: `boudoir photography, rear view from behind of beautiful woman wearing black lace thong lingerie, small flat petite butt, slim narrow hips, minimal curves, standing pose, dark background, ${Q}`,
  },
  {
    path: 'ass-size/medium.jpg',
    prompt: `boudoir photography, rear view from behind of beautiful woman wearing black lace thong lingerie, medium round butt, nicely shaped curves, moderate hips, standing pose, dark background, ${Q}`,
  },
  {
    path: 'ass-size/large.jpg',
    prompt: `boudoir photography, rear view from behind of beautiful woman wearing black lace thong lingerie, large round big butt, prominent curvy backside, wide hips, standing pose, dark background, ${Q}`,
  },
  {
    path: 'ass-size/xl.jpg',
    prompt: `boudoir photography, rear view from behind of beautiful woman wearing black lace thong lingerie, extremely large very round huge butt, very prominent thick backside, very wide hips, standing pose, dark background, ${Q}`,
  },

  // DICK SIZE — tight fitted underwear/briefs
  {
    path: 'dick-size/average.jpg',
    prompt: `fashion photography, front view waist to upper thigh of fit athletic man wearing tight black boxer briefs underwear, small normal average bulge in underwear, standing pose, dark background, ${Q}`,
  },
  {
    path: 'dick-size/large.jpg',
    prompt: `fashion photography, front view waist to upper thigh of fit athletic man wearing tight black boxer briefs underwear, large noticeable prominent bulge clearly visible in tight underwear, standing pose, dark background, ${Q}`,
  },
  {
    path: 'dick-size/xl.jpg',
    prompt: `fashion photography, front view waist to upper thigh of fit athletic man wearing tight black boxer briefs underwear, very large extremely prominent huge bulge stretching the fabric of tight underwear, standing pose, dark background, ${Q}`,
  },
]

async function generateImage(entry, index, total) {
  const outPath = path.join(OUT_DIR, entry.path)
  if (fs.existsSync(outPath)) { console.log(`[${index + 1}/${total}] SKIP: ${entry.path}`); return }
  console.log(`[${index + 1}/${total}] Generating: ${entry.path}`)
  try {
    const res = await fetch(FAL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Key ${FAL_KEY}` },
      body: JSON.stringify({ prompt: entry.prompt, image_size: 'portrait_4_3', num_inference_steps: 8, num_images: 1, enable_safety_checker: false }),
    })
    if (!res.ok) { console.error(`  ERROR: ${await res.text()}`); return }
    const data = await res.json()
    const imageUrl = data.images?.[0]?.url
    if (!imageUrl) { console.error('  ERROR: No URL'); return }
    const imgRes = await fetch(imageUrl)
    const buffer = Buffer.from(await imgRes.arrayBuffer())
    fs.writeFileSync(outPath, buffer)
    console.log(`  ✓ Saved (${(buffer.length / 1024).toFixed(0)}KB)`)
    await new Promise(r => setTimeout(r, 400))
  } catch (err) { console.error(`  ERROR: ${err.message}`) }
}

async function main() {
  console.log(`\n🎨 Generating ${IMAGES.length} images (v4 — lingerie/underwear)...\n`)
  for (let i = 0; i < IMAGES.length; i++) await generateImage(IMAGES[i], i, IMAGES.length)
  console.log(`\n✅ Done!\n`)
}
main()
