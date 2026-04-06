/**
 * Generate v5 — using Juggernaut Flux first
 * Fallback: Kolors → Flux Dev
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, '..', 'public', 'onboarding')
const FAL_KEY = process.env.FAL_API_KEY

if (!FAL_KEY) { console.error('Missing FAL_API_KEY'); process.exit(1) }

const MODELS = [
  { name: 'Juggernaut Flux', url: 'https://fal.run/rundiffusion-fal/juggernaut-flux/base' },
  { name: 'Kolors', url: 'https://fal.run/fal-ai/kolors' },
  { name: 'Flux Dev', url: 'https://fal.run/fal-ai/flux/dev' },
]

const Q = 'professional boudoir photography, studio lighting, soft warm light, high resolution, 8k, photorealistic, detailed, dark moody background'

const IMAGES = [
  // BREAST SIZE — 6 cup sizes, different bra styles to emphasize size difference
  {
    path: 'breast-size/cup-a.jpg',
    prompt: `sexy photo, front view upper body of beautiful skinny woman with flat toned stomach wearing tiny black triangle string bikini top, completely flat chest, no breasts at all, no cleavage, the bikini top is loose and empty, boyish flat figure, sexy confident pose, ${Q}`,
  },
  {
    path: 'breast-size/cup-b.jpg',
    prompt: `sexy photo, front view upper body of beautiful slim woman with flat toned stomach wearing small black lace bralette, very small perky breasts, B cup, barely any cleavage, petite small bust, slim feminine figure, sexy pose, ${Q}`,
  },
  {
    path: 'breast-size/cup-c.jpg',
    prompt: `sexy photo, front view upper body of beautiful woman with flat toned stomach wearing black lace balconette bra, medium breasts, C cup, visible cleavage, nicely rounded bust that fills the bra, feminine curves, sexy pose, ${Q}`,
  },
  {
    path: 'breast-size/cup-d.jpg',
    prompt: `sexy photo, front view upper body of beautiful woman with flat toned stomach wearing black lace plunge bra, large full breasts, D cup, deep prominent cleavage, big round bust pushing together in plunge bra, curvy sexy figure, sexy pose, ${Q}`,
  },
  {
    path: 'breast-size/cup-e.jpg',
    prompt: `sexy photo, front view upper body of beautiful woman with toned stomach wearing black lace bra, very large heavy breasts, DD cup E cup, very deep cleavage valley, very big round full bust straining against the bra, busty curvy figure, sexy pose, ${Q}`,
  },
  {
    path: 'breast-size/cup-f.jpg',
    prompt: `sexy photo, front view upper body of beautiful woman with toned stomach wearing black lace bra struggling to contain breasts, extremely large massive breasts, F cup G cup, extreme cleavage, enormous heavy round breasts overflowing and spilling out of the bra on all sides, extremely busty, sexy pose, ${Q}`,
  },

  // ASS SIZE — lingerie thong
  {
    path: 'ass-size/small.jpg',
    prompt: `boudoir photo, rear view from behind of beautiful woman wearing black lace thong lingerie, small petite flat butt, narrow hips, slim backside, standing sensual pose, ${Q}`,
  },
  {
    path: 'ass-size/medium.jpg',
    prompt: `boudoir photo, rear view from behind of beautiful woman wearing black lace thong lingerie, medium round shaped butt, moderate curves, standing sensual pose, ${Q}`,
  },
  {
    path: 'ass-size/large.jpg',
    prompt: `boudoir photo, rear view from behind of beautiful woman wearing black lace thong lingerie, large round big butt, wide hips, prominent curvy backside, standing sensual pose, ${Q}`,
  },
  {
    path: 'ass-size/xl.jpg',
    prompt: `boudoir photo, rear view from behind of beautiful woman wearing black lace thong lingerie, extremely large very round huge butt, very wide hips, very thick prominent backside, standing sensual pose, ${Q}`,
  },

  // DICK SIZE — tight underwear
  {
    path: 'dick-size/average.jpg',
    prompt: `male model photo, front view waist to thigh of athletic man wearing tight black boxer briefs, normal average bulge visible, standing pose, dark background, professional photography, 8k, detailed`,
  },
  {
    path: 'dick-size/large.jpg',
    prompt: `male model photo, front view waist to thigh of athletic man wearing tight black boxer briefs, large prominent bulge clearly visible through fabric, standing pose, dark background, professional photography, 8k, detailed`,
  },
  {
    path: 'dick-size/xl.jpg',
    prompt: `male model photo, front view waist to thigh of athletic man wearing tight black boxer briefs, very large extremely prominent huge bulge stretching fabric, standing pose, dark background, professional photography, 8k, detailed`,
  },
]

async function tryGenerate(entry, modelIdx = 0) {
  if (modelIdx >= MODELS.length) {
    console.error(`  ✗ All models failed for ${entry.path}`)
    return false
  }

  const model = MODELS[modelIdx]

  try {
    const body = {
      prompt: entry.prompt,
      image_size: { width: 768, height: 1024 },
      num_inference_steps: model.name === 'Kolors' ? 25 : 12,
      num_images: 1,
      enable_safety_checker: false,
    }

    const res = await fetch(model.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Key ${FAL_KEY}` },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      console.error(`  ${model.name} failed (${res.status}), trying next...`)
      return tryGenerate(entry, modelIdx + 1)
    }

    const data = await res.json()
    const imageUrl = data.images?.[0]?.url

    if (!imageUrl) {
      console.error(`  ${model.name}: no URL, trying next...`)
      return tryGenerate(entry, modelIdx + 1)
    }

    const imgRes = await fetch(imageUrl)
    const buffer = Buffer.from(await imgRes.arrayBuffer())

    // Check for blank/tiny images (safety filter likely triggered)
    if (buffer.length < 20000) {
      console.error(`  ${model.name}: image too small (${(buffer.length/1024).toFixed(0)}KB, likely blocked), trying next...`)
      // Delete the bad file if it exists
      const outPath = path.join(OUT_DIR, entry.path)
      if (fs.existsSync(outPath)) fs.unlinkSync(outPath)
      return tryGenerate(entry, modelIdx + 1)
    }

    const outPath = path.join(OUT_DIR, entry.path)
    fs.writeFileSync(outPath, buffer)
    console.log(`  ✓ ${model.name} — Saved (${(buffer.length / 1024).toFixed(0)}KB)`)
    return true
  } catch (err) {
    console.error(`  ${model.name} error: ${err.message}, trying next...`)
    return tryGenerate(entry, modelIdx + 1)
  }
}

async function main() {
  console.log(`\n🎨 Generating ${IMAGES.length} images with fallback models...\n`)
  console.log(`Models: ${MODELS.map(m => m.name).join(' → ')}\n`)

  for (let i = 0; i < IMAGES.length; i++) {
    const outPath = path.join(OUT_DIR, IMAGES[i].path)
    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 20000) {
      console.log(`[${i + 1}/${IMAGES.length}] SKIP: ${IMAGES[i].path}`)
      continue
    }
    console.log(`[${i + 1}/${IMAGES.length}] ${IMAGES[i].path}`)
    await tryGenerate(IMAGES[i])
    await new Promise(r => setTimeout(r, 500))
  }

  console.log(`\n✅ Done!\n`)
}
main()
