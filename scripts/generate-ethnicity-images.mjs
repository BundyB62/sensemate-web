// Regenerate ethnicity selection images with STRONG ethnic distinctions
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
const RESULT_URL = 'https://api.novita.ai/v3/async/task-result'

// Each ethnicity gets a VERY specific prompt with distinctive features
const ETHNICITIES = [
  // European
  { id: 'scandinavian', prompt: 'beautiful Scandinavian Nordic woman, very pale white porcelain skin, platinum blonde hair, icy blue eyes, strong jawline, high cheekbones, Nordic features, tall' },
  { id: 'northwest_european', prompt: 'beautiful Northwestern European woman, light skin, light brown hair, blue-grey eyes, soft features, natural beauty, British/Dutch/German mix' },
  { id: 'british', prompt: 'beautiful English British woman, fair rosy skin, auburn brown hair, green eyes, elegant refined features, classic English beauty' },
  { id: 'german', prompt: 'beautiful German Central European woman, fair skin, dirty blonde hair, blue eyes, strong bone structure, defined features' },
  { id: 'french', prompt: 'beautiful French woman, light olive skin, dark brown wavy hair, hazel eyes, elegant refined features, chic sophisticated look' },
  { id: 'mediterranean', prompt: 'beautiful Mediterranean Southern European woman, olive tan skin, dark curly hair, dark brown eyes, full lips, warm complexion, Italian/Greek/Spanish beauty' },
  { id: 'east_european', prompt: 'beautiful Eastern European Slavic woman, very fair pale skin, straight light brown hair, grey-green eyes, high sharp cheekbones, angular Slavic features' },
  { id: 'irish', prompt: 'beautiful Irish Celtic woman, very pale freckled skin, red ginger hair, bright green eyes, freckles on nose and cheeks, soft celtic features' },
  // Latin
  { id: 'latin', prompt: 'beautiful Latin American woman, warm caramel tan skin, long dark wavy hair, dark brown eyes, full lips, mestiza features, curvy' },
  { id: 'brazilian', prompt: 'beautiful Brazilian woman, golden bronze tan skin, long dark wavy hair, brown eyes, mixed-race features, tropical beauty, full lips' },
  { id: 'mexican', prompt: 'beautiful Mexican woman, warm brown skin, long straight dark black hair, dark brown eyes, indigenous Mexican features, round face, full cheeks' },
  { id: 'colombian', prompt: 'beautiful Colombian woman, warm olive-tan skin, long dark brown hair, brown eyes, mixed European-indigenous features, bright smile' },
  { id: 'argentinian', prompt: 'beautiful Argentinian woman, light olive skin, brown hair with highlights, hazel eyes, European-Latin mix, elegant features' },
  // Asian
  { id: 'east_asian', prompt: 'beautiful East Asian woman, pale porcelain skin, straight black hair, dark monolid eyes, delicate features, small nose, East Asian face' },
  { id: 'japanese', prompt: 'beautiful Japanese woman, fair porcelain skin, sleek straight black hair, dark brown eyes, delicate refined features, small face, Japanese beauty' },
  { id: 'korean', prompt: 'beautiful Korean woman, very fair flawless porcelain skin, straight dark brown hair, dark eyes, v-shaped face, Korean beauty standards, dewy skin' },
  { id: 'chinese', prompt: 'beautiful Chinese woman, fair skin, long straight black silky hair, dark brown almond eyes, elegant features, oval face, Chinese beauty' },
  { id: 'southeast_asian', prompt: 'beautiful Southeast Asian woman, warm golden-brown skin, dark brown hair, dark brown eyes, petite features, warm complexion, Thai/Malaysian mix' },
  { id: 'thai', prompt: 'beautiful Thai woman, warm golden tan skin, straight dark hair, dark brown eyes, soft round features, Thai beauty, gentle expression, petite' },
  { id: 'filipino', prompt: 'beautiful Filipino Filipina woman, warm brown skin, dark brown wavy hair, dark brown eyes, Malay-Spanish mix features, wide smile, Filipino beauty' },
  { id: 'vietnamese', prompt: 'beautiful Vietnamese woman, fair light skin, long straight dark hair, dark brown eyes, delicate petite features, Vietnamese beauty, elegant' },
  { id: 'indonesian', prompt: 'beautiful Indonesian woman, warm brown skin, dark brown hair, dark brown eyes, Malay features, warm complexion, soft features, Indonesian beauty' },
  { id: 'south_asian', prompt: 'beautiful South Asian Indian woman, warm brown skin, long dark black hair, large dark brown eyes, strong eyebrows, Indian features, gold jewelry accents' },
  // Middle Eastern
  { id: 'middle_eastern', prompt: 'beautiful Middle Eastern Arabian woman, olive-tan skin, dark black hair, large dark brown eyes, strong eyebrows, defined nose, Middle Eastern beauty' },
  { id: 'turkish', prompt: 'beautiful Turkish woman, olive-tan Mediterranean skin, dark brown wavy hair, deep brown eyes with thick eyebrows, defined features, Turkish beauty, Anatolian features' },
  { id: 'persian', prompt: 'beautiful Persian Iranian woman, fair olive skin, long dark wavy hair, large green-hazel eyes, defined nose, strong eyebrows, Persian beauty, elegant' },
  { id: 'lebanese', prompt: 'beautiful Lebanese Levantine woman, light olive skin, long dark brown hair, large light brown-hazel eyes, refined elegant features, Lebanese beauty' },
  { id: 'moroccan', prompt: 'beautiful Moroccan North African woman, warm olive-tan skin, dark curly hair, dark brown eyes, Berber features, defined cheekbones, Moroccan beauty' },
  { id: 'egyptian', prompt: 'beautiful Egyptian woman, warm golden-tan skin, dark straight hair, dark brown kohl-lined eyes, Egyptian features, Cleopatra-like elegance, strong nose' },
  { id: 'arab', prompt: 'beautiful Arab Gulf woman, golden-olive skin, long dark black straight hair, large dark brown eyes, strong thick eyebrows, Arabian features, striking beauty' },
  // African
  { id: 'african', prompt: 'beautiful African woman, deep dark brown skin, natural black afro hair, dark brown eyes, full lips, broad nose, radiant dark complexion, African beauty' },
  { id: 'west_african', prompt: 'beautiful West African Nigerian woman, very dark rich chocolate skin, natural black hair, dark brown eyes, full features, broad nose, West African beauty, radiant' },
  { id: 'east_african', prompt: 'beautiful East African Ethiopian Eritrean woman, medium dark brown skin, long wavy dark hair, large almond-shaped eyes, narrow nose, high cheekbones, Habesha beauty, elegant bone structure' },
  { id: 'south_african', prompt: 'beautiful South African woman, dark brown skin, short natural black hair, brown eyes, warm features, South African beauty, bright smile' },
  // Americas/Pacific
  { id: 'caribbean', prompt: 'beautiful Caribbean woman, dark brown skin, curly dark hair, brown eyes, mixed African-European features, Caribbean beauty, vibrant' },
  { id: 'native_american', prompt: 'beautiful Native American indigenous woman, warm reddish-brown skin, long straight jet black hair, dark brown deep-set eyes, high cheekbones, strong indigenous features' },
  { id: 'polynesian', prompt: 'beautiful Polynesian Pacific Islander woman, warm brown tan skin, long thick dark wavy hair, dark brown eyes, strong features, full lips, Polynesian beauty, flowers in hair' },
  // Mixed
  { id: 'mixed', prompt: 'beautiful mixed-race biracial woman, warm caramel skin, curly light brown hair, hazel-green eyes, unique blend of features, striking mixed beauty' },
]

async function generateOne(eth) {
  const fullPrompt = `${eth.prompt}, portrait, face close-up, looking at camera, photorealistic, 8k, studio photography, natural lighting, neutral background, detailed skin texture`
  const negPrompt = 'cartoon, anime, illustration, 3d render, deformed, ugly, blurry, low quality, bad anatomy, watermark, text, nsfw, nude'

  console.log(`  📸 ${eth.id}...`)

  const r = await fetch(URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${KEY}` },
    body: JSON.stringify({
      extra: { response_image_type: 'jpeg', enable_nsfw_detection: false },
      request: {
        model_name: 'epicrealism_naturalSinRC1VAE_106430.safetensors',
        prompt: fullPrompt, negative_prompt: negPrompt,
        width: 512, height: 680, image_num: 1, steps: 30, clip_skip: 2,
        guidance_scale: 7, seed: Math.floor(Math.random() * 2147483647),
        sampler_name: 'DPM++ 2M Karras',
      },
    }),
  })

  if (!r.ok) { console.error(`    ❌ ${(await r.text()).substring(0, 150)}`); return false }
  const { task_id } = await r.json()
  if (!task_id) { console.error('    ❌ No task_id'); return false }

  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 2000))
    const res = await fetch(`${RESULT_URL}?task_id=${task_id}`, { headers: { 'Authorization': `Bearer ${KEY}` } })
    if (!res.ok) continue
    const d = await res.json()
    if (d.task?.status === 'TASK_STATUS_SUCCEED') {
      const url = d.images?.[0]?.image_url
      if (!url) return false
      const img = await fetch(url)
      const buf = Buffer.from(await img.arrayBuffer())
      const outPath = resolve(__dirname, '..', 'public', 'onboarding', 'ethnicity', 'woman', `${eth.id}.jpg`)
      writeFileSync(outPath, buf)
      console.log(`    ✅ ${Math.round(buf.length / 1024)}KB`)
      return true
    }
    if (d.task?.status === 'TASK_STATUS_FAILED') { console.error('    ❌ Failed'); return false }
    process.stdout.write('.')
  }
  console.error('    ❌ Timeout'); return false
}

async function main() {
  console.log(`\n🌍 Generating ${ETHNICITIES.length} ethnicity images with STRONG distinctions...\n`)
  let ok = 0, fail = 0
  for (const eth of ETHNICITIES) {
    if (await generateOne(eth)) ok++; else fail++
  }
  console.log(`\n✨ Done! ${ok} succeeded, ${fail} failed`)
}
main()
