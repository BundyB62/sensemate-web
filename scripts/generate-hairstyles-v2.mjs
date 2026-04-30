/**
 * Regenerate woman hairstyle reference photos with consistent styling.
 *
 * Goals (in priority order):
 *   1. Front-facing — hairstyle visible from the front (some current images are profile shots
 *      where the cut is hard to identify).
 *   2. Clean neutral background — no studio equipment, lights, or umbrellas (the current
 *      braids.jpg literally shows the photoshoot lighting rig).
 *   3. Consistent framing — head and shoulders, hairstyle dominant in frame.
 *   4. Same lighting/mood across all tiles — soft front-lit beauty editorial.
 *   5. Plain top (white tee) so hairstyle is the star.
 *
 * Output: public/onboarding/hair/woman/<id>.jpg
 * Existing files are backed up as <id>.old.jpg on first run.
 *
 * Usage: node scripts/generate-hairstyles-v2.mjs [woman|man|both]
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
if (!KEY) { console.error('Missing NOVITA_API_KEY'); process.exit(1) }

const URL_TXT2IMG = 'https://api.novita.ai/v3/async/txt2img'
const URL_RESULT = 'https://api.novita.ai/v3/async/task-result'
const MODEL = 'epicrealism_naturalSinRC1VAE_106430.safetensors'

// All women framed the same way — head and shoulders, looking at camera,
// chestnut brown hair as base color (matches default hairColor in onboarding).
// Hairstyle phrase comes first to maximise model attention on the cut.
const SHARED_FRAMING = 'attractive young woman 25 year old, light olive skin, neutral expression slight pleasant smile, looking directly at camera, head and shoulders portrait centered, plain white t-shirt, soft uniform front lighting, plain neutral light grey studio background'

const WOMAN = [
  { id: 'long',          h: 'very long straight chestnut brown hair flowing past her shoulders, hair clearly visible on both sides framing the face' },
  { id: 'wavy',          h: 'shoulder-length wavy chestnut brown hair with loose natural waves framing the face' },
  { id: 'curly',         h: 'shoulder-length tight natural curly chestnut brown hair, defined ringlets framing the face' },
  { id: 'very_long',     h: 'extremely long straight chestnut brown hair reaching past the chest, abundant volume' },
  { id: 'bob',           h: 'classic chin-length blunt bob haircut, chestnut brown, sharp horizontal cut at jaw line' },
  { id: 'lob',           h: 'long bob lob haircut just past the shoulders, chestnut brown, slight inward curl' },
  { id: 'pixie',         h: 'very short cropped pixie cut, chestnut brown, textured top with short sides' },
  { id: 'bangs',         h: 'long straight chestnut brown hair with thick blunt fringe bangs covering forehead to eyebrows' },
  { id: 'curtain_bangs', h: 'long chestnut brown hair with face-framing curtain bangs parted in the middle, bangs swept to either side' },
  { id: 'ponytail',      h: 'high ponytail, chestnut brown hair pulled up tight on top of the head, smooth slicked top, long ponytail visible behind' },
  { id: 'low_ponytail',  h: 'low ponytail at the nape of the neck, chestnut brown hair pulled back smoothly, ponytail draped over one shoulder' },
  { id: 'bun',           h: 'elegant top knot bun updo, chestnut brown hair pulled up and twisted into a smooth high bun' },
  { id: 'messy_bun',     h: 'casual messy bun on top of the head with loose flyaway strands, chestnut brown hair, undone relaxed look' },
  { id: 'pigtails',      h: 'two low pigtails on either side of the head, chestnut brown hair tied with simple bands, both visible' },
  { id: 'twin_tails',    h: 'two high twin-tails high on the head, chestnut brown hair, both pigtails clearly visible high up' },
  { id: 'space_buns',    h: 'two space buns high on either side of the head, chestnut brown hair, both buns visible like double topknots' },
  { id: 'braids',        h: 'two French braids running from the forehead down the back of the head, chestnut brown hair, intricate braided pattern visible' },
  { id: 'french_braid',  h: 'single thick French braid down the back of the head into one long braid, chestnut brown hair, braid pulled forward over one shoulder' },
  { id: 'fishtail',      h: 'long fishtail braid pulled forward over one shoulder, chestnut brown hair, intricate fishbone pattern clearly visible' },
  { id: 'side_braid',    h: 'long thick side braid swept over one shoulder, chestnut brown hair, the rest brushed smoothly' },
  { id: 'half_up',       h: 'half up half down hairstyle, top section of chestnut brown hair pulled into a small clip at the back, the rest flowing loose' },
  { id: 'slicked_back',  h: 'sleek slicked back hair, chestnut brown, all hair pulled tightly back away from the face, no fringe, glossy wet look' },
  { id: 'afro',          h: 'natural voluminous round afro, dark brown hair, wide rounded shape framing the head' },
  { id: 'messy',         h: 'shoulder-length messy bedhead chestnut brown hair, tousled undone texture, flyaway strands' },
  { id: 'dreadlocks',    h: 'long dreadlocks dreads, dark brown, individual rope-like locks visible flowing past the shoulders' },
  { id: 'cornrows',      h: 'tight cornrow braids in straight rows running from forehead to nape, dark brown, geometric scalp pattern visible' },
  { id: 'hijab',         h: 'wearing a soft dusty pink hijab headscarf wrapped neatly around the head and neck, no hair visible, modest clean style' },
]

const QUALITY = 'professional beauty editorial photography, sharp focus, soft even diffused front lighting, photorealistic, 8k, ultra-detailed, hairstyle is the focal point of the image, vertical 3:4 portrait crop'
const NEGATIVE = 'studio equipment, softbox, umbrella, light stand, lighting rig, microphone, tripod, camera visible, mirror, reflection, distracting background, busy background, text, watermark, signature, logo, nude, topless, low quality, blurry, deformed, ugly, multiple people, two faces, side profile, back of head only, looking away from camera, eyes closed, heavy makeup, cartoon, anime, illustration, 3d render, painting, drawing'

async function gen(genderDir, e) {
  const fp = `(${e.h}:1.4), ${SHARED_FRAMING}, ${QUALITY}`
  // Trim to model token budget
  const prompt = fp.length > 1000 ? fp.substring(0, 1000) : fp

  process.stdout.write(`  💇 ${genderDir}/${e.id.padEnd(16)} `)
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
        guidance_scale: 7.5,
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
      const outDir = resolve(__dirname, '..', 'public', 'onboarding', 'hair', genderDir)
      if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })
      const outPath = resolve(outDir, `${e.id}.jpg`)
      const backupPath = resolve(outDir, `${e.id}.old.jpg`)
      if (existsSync(outPath) && !existsSync(backupPath)) copyFileSync(outPath, backupPath)
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
  const arg = process.argv[2] || 'woman'
  const sets = arg === 'woman' ? [['woman', WOMAN]] : []
  if (sets.length === 0) { console.error('Only "woman" supported in this version'); process.exit(1) }

  let ok = 0, total = 0
  for (const [g, list] of sets) {
    console.log(`\n💇 Regenerating ${list.length} ${g} hairstyles with consistent front-facing framing...\n`)
    for (const e of list) { total++; if (await gen(g, e)) ok++ }
  }
  console.log(`\n✨ Done! ${ok}/${total} succeeded → public/onboarding/hair/`)
}

main().catch(e => { console.error(e); process.exit(1) })
