// Generate 6 AI video loops from existing side images using fal.ai
// Usage: node scripts/generate-side-videos.mjs

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '..', '.env.local')
const envContent = readFileSync(envPath, 'utf8')
const FAL_KEY = envContent.match(/FAL_API_KEY=(.+)/)?.[1]?.trim()

if (!FAL_KEY) { console.error('FAL_API_KEY not found'); process.exit(1) }

const IMAGES = [
  { name: 'side-woman-1', motion: 'woman gently swaying her hips, subtle seductive body movement, hair flowing slightly' },
  { name: 'side-woman-2', motion: 'woman gently moving her body, subtle hip sway, touching her hair' },
  { name: 'side-woman-3', motion: 'woman shifting weight, subtle body movement, hair blowing gently' },
  { name: 'side-woman-4', motion: 'woman gently swaying, subtle feminine movement, silk fabric flowing' },
  { name: 'side-woman-5', motion: 'woman slowly shifting pose, subtle seductive movement, hair flowing' },
  { name: 'side-woman-6', motion: 'woman gently moving, elegant subtle body sway, dress fabric flowing' },
]

async function generateVideo(img) {
  const outPath = resolve(__dirname, '..', 'public', `${img.name}.mp4`)
  if (existsSync(outPath)) {
    console.log(`[${img.name}] Already exists, skipping`)
    return
  }

  const imgPath = resolve(__dirname, '..', 'public', `${img.name}.png`)
  const imgBuffer = readFileSync(imgPath)
  const base64 = imgBuffer.toString('base64')
  const dataUrl = `data:image/png;base64,${base64}`

  console.log(`[${img.name}] Submitting to Kling video (synchronous)...`)

  // Use the synchronous endpoint (waits for result)
  const res = await fetch('https://fal.run/fal-ai/kling-video/v1/standard/image-to-video', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Key ${FAL_KEY}`,
    },
    body: JSON.stringify({
      image_url: dataUrl,
      prompt: img.motion,
      duration: '5',
      aspect_ratio: '9:16',
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error(`[${img.name}] Failed: ${res.status} ${err.slice(0, 300)}`)
    return
  }

  const data = await res.json()
  const videoUrl = data?.video?.url
  if (!videoUrl) {
    console.error(`[${img.name}] No video URL:`, JSON.stringify(data).slice(0, 300))
    return
  }

  console.log(`[${img.name}] Downloading video...`)
  const videoRes = await fetch(videoUrl)
  const buffer = Buffer.from(await videoRes.arrayBuffer())
  writeFileSync(outPath, buffer)
  console.log(`[${img.name}] Saved (${(buffer.length / 1024 / 1024).toFixed(1)}MB)`)
}

console.log('Generating 6 video loops (synchronous, ~2-3 min each)...\n')

for (const img of IMAGES) {
  try {
    await generateVideo(img)
  } catch (err) {
    console.error(`[${img.name}] Error: ${err.message}`)
  }
}

console.log('\nDone!')
