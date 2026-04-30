/**
 * Retry lingerie + swimwear with cleaner prompts that don't trip FAL safety.
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
    file: 'lingerie.jpg',
    prompt: `photorealistic full body fashion editorial shot of beautiful 25 year old woman wearing a delicate black silk slip dress with lace trim, bedroom interior with soft warm lighting, sheer stockings, designer high heels, elegant graceful standing pose, sophisticated fashion photography, head to toe visible, ${QUALITY_FULL}`,
  },
  {
    file: 'swimwear.jpg',
    prompt: `photorealistic full body fashion shot of beautiful 25 year old woman wearing a stylish designer one-piece swimsuit, sandy beach background, golden hour sunlight, summer vacation aesthetic, standing confidently with sunglasses on head, head to toe visible, ${QUALITY_FULL}`,
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
      num_inference_steps: 8,
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

console.log(`\nRetrying ${IMAGES.length} with cleaner prompts...\n`)
let ok = 0, fail = 0
for (const img of IMAGES) {
  try { await generate(img); ok++ }
  catch (e) { console.error(`  ✗ ${img.file}: ${e.message}`); fail++ }
}
console.log(`\nDone. ${ok} succeeded, ${fail} failed.`)
