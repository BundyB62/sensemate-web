/**
 * Generate v3 — better breast, ass, dick size images
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, '..', 'public', 'onboarding')
const FAL_URL = 'https://fal.run/fal-ai/flux/schnell'
const FAL_KEY = process.env.FAL_API_KEY

if (!FAL_KEY) { console.error('Missing FAL_API_KEY'); process.exit(1) }

const Q = 'professional photography, studio lighting, soft light, high resolution, 8k, realistic, detailed'

const IMAGES = [
  // ══════════════════════════════════════════════════════════════════════════
  // BREAST SIZE (4) — front view, fitted top, clear size difference
  // ══════════════════════════════════════════════════════════════════════════
  {
    path: 'breast-size/small.jpg',
    prompt: `fashion photography, front view upper body of fit woman wearing tight white tank top, very small flat chest, A cup, small breasts barely visible, slim torso, neutral background, ${Q}`,
  },
  {
    path: 'breast-size/medium.jpg',
    prompt: `fashion photography, front view upper body of woman wearing tight white tank top, medium sized breasts, C cup, noticeable bust, natural proportions, neutral background, ${Q}`,
  },
  {
    path: 'breast-size/large.jpg',
    prompt: `fashion photography, front view upper body of woman wearing tight white tank top, large full breasts, D cup, prominent bust clearly visible, neutral background, ${Q}`,
  },
  {
    path: 'breast-size/xl.jpg',
    prompt: `fashion photography, front view upper body of woman wearing tight white tank top, very large heavy breasts, F cup, extremely prominent full bust stretching fabric, neutral background, ${Q}`,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ASS SIZE (4) — rear view in yoga pants, clear size difference
  // ══════════════════════════════════════════════════════════════════════════
  {
    path: 'ass-size/small.jpg',
    prompt: `fitness photography, rear view from behind of woman wearing tight black yoga leggings, small flat butt, minimal curves from behind, slim narrow hips, standing straight, neutral gym background, ${Q}`,
  },
  {
    path: 'ass-size/medium.jpg',
    prompt: `fitness photography, rear view from behind of woman wearing tight black yoga leggings, medium round butt, nicely shaped moderate curves from behind, standing straight, neutral gym background, ${Q}`,
  },
  {
    path: 'ass-size/large.jpg',
    prompt: `fitness photography, rear view from behind of woman wearing tight black yoga leggings, large round prominent butt, big curvy backside clearly visible, wide hips, standing straight, neutral gym background, ${Q}`,
  },
  {
    path: 'ass-size/xl.jpg',
    prompt: `fitness photography, rear view from behind of woman wearing tight black yoga leggings, extremely large very round butt, very big prominent thick backside, very wide hips, standing straight, neutral gym background, ${Q}`,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // DICK SIZE (3) — grey sweatpants front view, clear bulge difference
  // ══════════════════════════════════════════════════════════════════════════
  {
    path: 'dick-size/average.jpg',
    prompt: `fashion photography, front view waist to knee of athletic man wearing thin light grey sweatpants, small normal average bulge visible in pants, standing relaxed, neutral background, ${Q}`,
  },
  {
    path: 'dick-size/large.jpg',
    prompt: `fashion photography, front view waist to knee of athletic man wearing thin light grey sweatpants, large noticeable bulge clearly visible through thin fabric, standing relaxed, neutral background, ${Q}`,
  },
  {
    path: 'dick-size/xl.jpg',
    prompt: `fashion photography, front view waist to knee of athletic man wearing thin light grey sweatpants, very large extremely prominent bulge very clearly visible through thin fabric, standing relaxed, neutral background, ${Q}`,
  },
]

async function generateImage(entry, index, total) {
  const outPath = path.join(OUT_DIR, entry.path)
  if (fs.existsSync(outPath)) {
    console.log(`[${index + 1}/${total}] SKIP: ${entry.path}`)
    return
  }
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
  console.log(`\n🎨 Generating ${IMAGES.length} body images (v3)...\n`)
  for (let i = 0; i < IMAGES.length; i++) await generateImage(IMAGES[i], i, IMAGES.length)
  console.log(`\n✅ Done!\n`)
}
main()
