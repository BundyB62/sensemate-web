import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
const envFile = readFileSync(resolve(__dirname, '..', '.env.local'), 'utf-8')
for (const line of envFile.split('\n')) { const m = line.match(/^([^#=]+)=(.*)$/); if (m) process.env[m[1].trim()] = m[2].trim() }
const KEY = process.env.NOVITA_API_KEY
const URL = 'https://api.novita.ai/v3/async/txt2img'
const RES = 'https://api.novita.ai/v3/async/task-result'

// Each ethnicity with STRONG visual markers + cultural styling
const ETH = [
  { id: 'scandinavian', p: 'stunning Scandinavian woman, extremely pale porcelain white skin, platinum ice blonde hair, piercing icy blue eyes, strong Nordic jawline, tall, minimalist Scandinavian style, cold winter light' },
  { id: 'irish', p: 'stunning Irish Celtic woman, very pale skin covered in freckles, bright fiery red ginger hair, vivid green eyes, rosy cheeks, celtic jewelry, soft Irish countryside light' },
  { id: 'british', p: 'stunning British English woman, fair rosy skin, auburn chestnut hair, warm hazel eyes, refined elegant features, pearl earrings, classic British sophistication' },
  { id: 'east_european', p: 'stunning Eastern European Slavic woman, very pale white skin, straight ash brown hair, steel grey-green eyes, extremely sharp angular high cheekbones, intense gaze, cold lighting' },
  { id: 'french', p: 'stunning French Parisian woman, light olive skin, dark brown wavy bob hair, hazel eyes, red lipstick, elegant chic style, effortlessly sophisticated, beret' },
  { id: 'mediterranean', p: 'stunning Mediterranean woman, warm olive tanned skin, long dark curly black hair, deep dark brown eyes, full lips, golden hoop earrings, sun-kissed, Italian Greek beauty' },
  { id: 'latina', p: 'stunning Latina woman, warm caramel golden-tan skin, long dark wavy brown hair, dark brown eyes, full lips, hoop earrings, warm vibrant energy, tropical warm light' },
  { id: 'brazilian', p: 'stunning Brazilian woman, golden bronze sun-tanned skin, long dark wavy hair with highlights, brown eyes, mixed-race beauty, bright white smile, beach golden hour light' },
  { id: 'mexican', p: 'stunning Mexican indigenous woman, warm brown cinnamon skin, long straight jet black hair, deep dark brown eyes, round face, full cheeks, indigenous Aztec features, turquoise jewelry, warm earthy tones' },
  { id: 'japanese', p: 'stunning Japanese woman, fair porcelain flawless skin, sleek straight black hair with precise bangs, dark brown almond eyes, small delicate features, minimal elegant makeup, soft even lighting' },
  { id: 'korean', p: 'stunning Korean woman, extremely fair flawless glass skin, straight dark brown hair, dark eyes, perfect v-shaped small face, gradient lips, dewy glowing skin, Korean beauty, bright soft lighting' },
  { id: 'southeast_asian', p: 'stunning Southeast Asian Thai woman, warm golden-tan glowing skin, dark brown hair, dark brown warm eyes, soft round features, gentle warm smile, gold jewelry, tropical warm light' },
  { id: 'south_asian', p: 'stunning South Asian Indian woman, rich warm brown skin, long dark black hair, very large expressive dark brown eyes, strong dark eyebrows, red bindi on forehead, gold nose ring, colorful silk, warm rich lighting' },
  { id: 'middle_eastern', p: 'stunning Middle Eastern Arabian woman, olive-tan warm skin, long dark black straight hair, large dark brown kohl-lined eyes, very thick dark eyebrows, gold statement jewelry, dramatic eye makeup, rich warm tones' },
  { id: 'turkish', p: 'stunning Turkish Anatolian woman, warm olive skin, dark brown wavy thick hair, deep brown eyes with very thick prominent dark eyebrows, defined features, subtle gold jewelry, Mediterranean warmth' },
  { id: 'persian', p: 'stunning Persian Iranian woman, fair light olive skin, long luxurious dark wavy hair, striking light green-hazel eyes, elegant defined nose, refined aristocratic features, emerald jewelry, dramatic lighting' },
  { id: 'north_african', p: 'stunning North African Moroccan Berber woman, warm olive-tan skin, dark curly voluminous hair, dark brown eyes, high cheekbones, Berber tribal jewelry and tattoos, henna patterns, warm desert tones' },
  { id: 'west_african', p: 'stunning West African Nigerian woman, very deep dark rich chocolate ebony skin, natural black coily hair, dark brown eyes, broad nose, full lips, radiant glowing dark complexion, bold colorful head wrap, vibrant' },
  { id: 'east_african', p: 'stunning East African Ethiopian Habesha woman, medium dark brown smooth skin, long wavy dark hair, large almond-shaped eyes, very narrow elegant nose, extremely high prominent cheekbones, elegant bone structure, gold jewelry' },
  { id: 'caribbean', p: 'stunning Caribbean woman, dark brown skin, voluminous curly dark hair, warm brown eyes, mixed African-European features, bright colorful flower in hair, tropical vibrant energy, golden warm light' },
  { id: 'native_american', p: 'stunning Native American indigenous woman, warm reddish-copper brown skin, very long straight jet black hair, deep dark brown deep-set eyes, very high prominent cheekbones, turquoise silver jewelry, feather accent, natural earth tones' },
  { id: 'polynesian', p: 'stunning Polynesian Samoan woman, warm brown tan skin, long thick dark wavy hair with tropical flower, dark brown eyes, full features, full lips, floral print, plumeria flower behind ear, tropical ocean background' },
]

async function gen(e) {
  const fp = `${e.p}, portrait, face close-up, looking at camera, photorealistic, 8k, professional studio photography, detailed skin texture, sharp focus`
  const neg = 'cartoon, anime, illustration, 3d render, deformed, ugly, blurry, low quality, bad anatomy, watermark, text, nsfw, nude, generic, plain, boring'
  process.stdout.write(`  📸 ${e.id}... `)
  const r = await fetch(URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${KEY}` },
    body: JSON.stringify({ extra: { response_image_type: 'jpeg', enable_nsfw_detection: false }, request: {
      model_name: 'epicrealism_naturalSinRC1VAE_106430.safetensors', prompt: fp, negative_prompt: neg,
      width: 512, height: 680, image_num: 1, steps: 30, clip_skip: 2, guidance_scale: 8,
      seed: Math.floor(Math.random()*2147483647), sampler_name: 'DPM++ 2M Karras' } }) })
  if (!r.ok) { console.error('FAIL: ' + (await r.text()).substring(0,100)); return false }
  const { task_id } = await r.json()
  if (!task_id) { console.error('NO ID'); return false }
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 2000))
    const res = await fetch(`${RES}?task_id=${task_id}`, { headers: { 'Authorization': `Bearer ${KEY}` } })
    if (!res.ok) continue
    const d = await res.json()
    if (d.task?.status === 'TASK_STATUS_SUCCEED') {
      const url = d.images?.[0]?.image_url; if (!url) return false
      const buf = Buffer.from(await (await fetch(url)).arrayBuffer())
      writeFileSync(resolve(__dirname, '..', 'public', 'onboarding', 'ethnicity', 'woman', `${e.id}.jpg`), buf)
      console.log(`✅ ${Math.round(buf.length/1024)}KB`)
      return true
    }
    if (d.task?.status === 'TASK_STATUS_FAILED') { console.error('FAIL'); return false }
    process.stdout.write('.')
  }
  return false
}

async function main() {
  console.log(`\n🌍 Generating ${ETH.length} DISTINCT ethnicity images...\n`)
  let ok = 0
  for (const e of ETH) { if (await gen(e)) ok++ }
  console.log(`\n✨ Done! ${ok}/${ETH.length}`)
}
main()
