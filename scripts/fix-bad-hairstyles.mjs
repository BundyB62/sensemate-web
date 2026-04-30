/**
 * Targeted regen for the 2 hairstyles that came out bad in v2:
 *   - braids: came out as back-of-head shot (face turned)
 *   - space_buns: model baked the word "SPACE" onto the t-shirt
 *
 * Both fixes:
 *   - Stronger framing constraint (front-facing, both eyes visible)
 *   - For space_buns, rephrase to avoid the literal word "space"
 *   - Stronger negative against text on clothing and back-of-head shots
 */

import { readFileSync, writeFileSync, existsSync, copyFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const envFile = readFileSync(resolve(__dirname, '..', '.env.local'), 'utf-8')
for (const line of envFile.split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/)
  if (m) process.env[m[1].trim()] = m[2].trim()
}

const KEY = process.env.NOVITA_API_KEY
const URL_TXT2IMG = 'https://api.novita.ai/v3/async/txt2img'
const URL_RESULT = 'https://api.novita.ai/v3/async/task-result'
const MODEL = 'epicrealism_naturalSinRC1VAE_106430.safetensors'

const SHARED = 'attractive young woman 25 year old, light olive skin, plain white t-shirt with no text or logo, soft uniform front lighting, plain neutral light grey studio background, head and shoulders portrait, face fully visible from front, both eyes looking directly at the camera, neutral expression slight pleasant smile'

const FIXES = [
  {
    id: 'braids',
    // Avoid words that make the model show the back of the head.
    h: 'two French braids running from the hairline along the top of the head down to the nape, chestnut brown hair, braided pattern visible from the front view, braid ends visible falling over the shoulders in front',
  },
  {
    id: 'space_buns',
    // Reword to avoid the word "space" which gets baked into clothing as text.
    h: 'two double topknot buns high on either side of the top of the head, chestnut brown hair, both round buns clearly visible like Mickey Mouse ears style, playful symmetric updo',
  },
]

const QUALITY = 'professional beauty editorial photography, sharp focus, soft even diffused front lighting, photorealistic, 8k, ultra-detailed, hairstyle is the focal point, vertical 3:4 portrait crop, front view'
const NEGATIVE = 'text on clothing, words on shirt, letters on shirt, logo on shirt, printed text, written words, typography, caption, label, studio equipment, softbox, umbrella, light stand, lighting rig, microphone, tripod, camera visible, mirror, distracting background, busy background, watermark, signature, nude, topless, low quality, blurry, deformed, ugly, multiple people, two faces, side profile, back view, back of head, looking away from camera, looking sideways, looking down, looking up, eyes closed, heavy makeup, cartoon, anime, illustration, 3d render, painting, drawing'

async function gen(e) {
  const fp = `(${e.h}:1.5), ${SHARED}, ${QUALITY}`
  const prompt = fp.length > 1000 ? fp.substring(0, 1000) : fp

  process.stdout.write(`  💇 ${e.id.padEnd(16)} `)
  const r = await fetch(URL_TXT2IMG, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${KEY}` },
    body: JSON.stringify({
      extra: { response_image_type: 'jpeg', enable_nsfw_detection: false },
      request: {
        model_name: MODEL,
        prompt,
        negative_prompt: NEGATIVE,
        width: 576,
        height: 768,
        image_num: 1,
        steps: 32,
        clip_skip: 2,
        guidance_scale: 8,
        seed: Math.floor(Math.random() * 2147483647),
        sampler_name: 'DPM++ 2M Karras',
      },
    }),
  })
  if (!r.ok) { console.error('FAIL: ' + (await r.text()).substring(0, 100)); return false }
  const { task_id } = await r.json()
  if (!task_id) { console.error('NO ID'); return false }

  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 2000))
    const res = await fetch(`${URL_RESULT}?task_id=${task_id}`, { headers: { 'Authorization': `Bearer ${KEY}` } })
    if (!res.ok) continue
    const d = await res.json()
    if (d.task?.status === 'TASK_STATUS_SUCCEED') {
      const url = d.images?.[0]?.image_url
      if (!url) return false
      const buf = Buffer.from(await (await fetch(url)).arrayBuffer())
      const outDir = resolve(__dirname, '..', 'public', 'onboarding', 'hair', 'woman')
      if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })
      const outPath = resolve(outDir, `${e.id}.jpg`)
      // The .old.jpg backup already exists from the v2 run; don't overwrite it.
      writeFileSync(outPath, buf)
      console.log(`✅ ${Math.round(buf.length / 1024)}KB`)
      return true
    }
    if (d.task?.status === 'TASK_STATUS_FAILED') { console.error('FAIL'); return false }
    process.stdout.write('.')
  }
  console.error('TIMEOUT')
  return false
}

async function main() {
  console.log(`\n🔧 Fixing ${FIXES.length} bad hairstyles...\n`)
  let ok = 0
  for (const e of FIXES) if (await gen(e)) ok++
  console.log(`\n✨ ${ok}/${FIXES.length} fixed`)
}

main().catch(e => { console.error(e); process.exit(1) })
