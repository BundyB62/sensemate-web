import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envFile = readFileSync(resolve(__dirname, '..', '.env.local'), 'utf-8')
for (const line of envFile.split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/)
  if (m) process.env[m[1].trim()] = m[2].trim()
}

const KEY = process.env.NOVITA_API_KEY
const URL = 'https://api.novita.ai/v3/async/txt2img'
const RESULT = 'https://api.novita.ai/v3/async/task-result'

// Only generate NEW hairstyles (the ones that don't have images yet)
const STYLES = [
  { id: 'low_ponytail', prompt: 'beautiful woman, low ponytail at nape of neck, elegant' },
  { id: 'messy_bun', prompt: 'beautiful woman, messy loose bun on top of head, casual cute' },
  { id: 'pigtails', prompt: 'beautiful woman, two high pigtails, playful cute look' },
  { id: 'twin_tails', prompt: 'beautiful woman, two long low twin tails, flowing hair' },
  { id: 'space_buns', prompt: 'beautiful woman, two small space buns on top with hair hanging down, trendy' },
  { id: 'french_braid', prompt: 'beautiful woman, single french braid down the back, neat elegant' },
  { id: 'fishtail', prompt: 'beautiful woman, fishtail braid over one shoulder, detailed weave' },
  { id: 'side_braid', prompt: 'beautiful woman, loose side braid draped over one shoulder, romantic' },
  { id: 'half_up', prompt: 'beautiful woman, half up half down hairstyle, top section pulled back' },
  { id: 'slicked_back', prompt: 'beautiful woman, slicked back hair pulled away from face, sleek wet look' },
  { id: 'cornrows', prompt: 'beautiful woman, cornrow braids hairstyle, neat rows' },
  // Also regenerate braids to NOT look like box braids/afro
  { id: 'braids', prompt: 'beautiful woman, two long french braid pigtails, european style braids, NOT afro NOT box braids' },
]

async function gen(s) {
  const fp = `${s.prompt}, portrait, face and hair visible, brown hair, photorealistic, studio lighting, neutral background, 8k`
  const neg = 'cartoon, anime, ugly, blurry, nsfw, nude, deformed, watermark, text'

  process.stdout.write(`  📸 ${s.id}... `)
  const r = await fetch(URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${KEY}` },
    body: JSON.stringify({ extra: { response_image_type: 'jpeg', enable_nsfw_detection: false }, request: {
      model_name: 'epicrealism_naturalSinRC1VAE_106430.safetensors', prompt: fp, negative_prompt: neg,
      width: 512, height: 680, image_num: 1, steps: 25, clip_skip: 2, guidance_scale: 7,
      seed: Math.floor(Math.random() * 2147483647), sampler_name: 'DPM++ 2M Karras' } }) })
  if (!r.ok) { console.error('FAIL'); return false }
  const { task_id } = await r.json()
  if (!task_id) { console.error('NO ID'); return false }
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 2000))
    const res = await fetch(`${RESULT}?task_id=${task_id}`, { headers: { 'Authorization': `Bearer ${KEY}` } })
    if (!res.ok) continue
    const d = await res.json()
    if (d.task?.status === 'TASK_STATUS_SUCCEED') {
      const url = d.images?.[0]?.image_url
      if (!url) return false
      const buf = Buffer.from(await (await fetch(url)).arrayBuffer())
      const out = resolve(__dirname, '..', 'public', 'onboarding', 'hair', 'woman', `${s.id}.jpg`)
      mkdirSync(dirname(out), { recursive: true })
      writeFileSync(out, buf)
      console.log(`✅ ${Math.round(buf.length/1024)}KB`)
      return true
    }
    if (d.task?.status === 'TASK_STATUS_FAILED') { console.error('FAIL'); return false }
    process.stdout.write('.')
  }
  return false
}

async function main() {
  console.log(`\n💇 Generating ${STYLES.length} new hairstyle images...\n`)
  let ok = 0
  for (const s of STYLES) { if (await gen(s)) ok++ }
  console.log(`\n✨ Done! ${ok}/${STYLES.length}`)
}
main()
