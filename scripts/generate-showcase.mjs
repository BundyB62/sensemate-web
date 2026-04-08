// Generate showcase preview images for the dashboard empty state
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envContent = readFileSync(resolve(__dirname, '..', '.env.local'), 'utf8')
const FAL_KEY = envContent.match(/FAL_API_KEY=(.+)/)?.[1]?.trim()

const PREVIEWS = [
  { name: 'showcase-1', prompt: 'close-up portrait of a stunning 24 year old woman, blonde hair, blue eyes, pouty lips, seductive bedroom eyes, soft warm lighting, dark moody background, sensual, cinematic, 8k, sharp' },
  { name: 'showcase-2', prompt: 'close-up portrait of a gorgeous 26 year old asian woman, long black hair, dark mysterious eyes, red lipstick, sultry look, dark moody lighting, elegant, sensual, cinematic, 8k, sharp' },
  { name: 'showcase-3', prompt: 'close-up portrait of a beautiful 28 year old latina woman, long dark wavy hair, brown eyes, glowing tan skin, flirty smile, warm golden lighting, dark background, sensual, cinematic, 8k, sharp' },
  { name: 'showcase-4', prompt: 'close-up portrait of a striking 25 year old black woman, curly natural hair, brown eyes, full lips, confident seductive gaze, purple moody lighting, dark background, elegant sensual, cinematic, 8k, sharp' },
  { name: 'showcase-5', prompt: 'close-up portrait of a captivating 23 year old woman, red hair, green eyes, freckles, mischievous smile, soft pink lighting, dark background, playful and sensual, cinematic, 8k, sharp' },
  { name: 'showcase-6', prompt: 'close-up portrait of a alluring 27 year old middle eastern woman, long dark hair, hazel eyes, olive skin, smoky eye makeup, gold jewelry, warm amber lighting, dark background, exotic sensual, cinematic, 8k, sharp' },
]

async function generate(p) {
  console.log(`[${p.name}] Generating...`)
  const res = await fetch('https://fal.run/fal-ai/flux/dev', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Key ${FAL_KEY}` },
    body: JSON.stringify({
      prompt: p.prompt,
      image_size: { width: 512, height: 512 },
      num_inference_steps: 30, num_images: 1, enable_safety_checker: false, guidance_scale: 3.5,
    }),
  })
  const d = await res.json()
  const url = d.images?.[0]?.url
  if (!url) { console.error(`[${p.name}] Failed`); return }
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer())
  const outPath = resolve(__dirname, '..', 'public', `${p.name}.jpg`)
  writeFileSync(outPath, buf)
  console.log(`[${p.name}] Saved (${(buf.length/1024).toFixed(0)}KB)`)
}

for (const p of PREVIEWS) await generate(p)
console.log('Done!')
