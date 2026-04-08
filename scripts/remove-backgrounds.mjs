// Remove backgrounds from side images using fal.ai background removal
// Usage: node scripts/remove-backgrounds.mjs

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '..', '.env.local')
const envContent = readFileSync(envPath, 'utf8')
const FAL_KEY = envContent.match(/FAL_API_KEY=(.+)/)?.[1]?.trim()

if (!FAL_KEY) { console.error('FAL_API_KEY not found'); process.exit(1) }

const NAMES = [
  'side-woman-1',
  'side-woman-2',
  'side-woman-3',
  'side-woman-4',
  'side-woman-5',
  'side-woman-6',
]

async function removeBackground(name) {
  const imgPath = resolve(__dirname, '..', 'public', `${name}.png`)
  if (!existsSync(imgPath)) {
    console.log(`[${name}] Image not found, skipping`)
    return
  }

  console.log(`[${name}] Removing background...`)

  const imgBuffer = readFileSync(imgPath)
  const base64 = imgBuffer.toString('base64')
  const dataUrl = `data:image/png;base64,${base64}`

  const res = await fetch('https://fal.run/fal-ai/birefnet/v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Key ${FAL_KEY}`,
    },
    body: JSON.stringify({
      image_url: dataUrl,
      model: 'General Use (Heavy)',
      operating_resolution: '1024x1024',
      output_format: 'png',
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error(`[${name}] Failed: ${res.status} ${err.slice(0, 200)}`)
    return
  }

  const data = await res.json()
  const resultUrl = data.image?.url
  if (!resultUrl) {
    console.error(`[${name}] No result URL:`, JSON.stringify(data).slice(0, 200))
    return
  }

  const resultRes = await fetch(resultUrl)
  const buffer = Buffer.from(await resultRes.arrayBuffer())
  writeFileSync(imgPath, buffer)
  console.log(`[${name}] Background removed, saved (${(buffer.length / 1024).toFixed(0)}KB)`)
}

for (const name of NAMES) {
  await removeBackground(name)
}
console.log('\nDone! All backgrounds removed.')
