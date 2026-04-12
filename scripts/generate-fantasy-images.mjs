// Generate fantasy race + clothing selection images via Novita animeRealisticXL
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envFile = readFileSync(resolve(__dirname, '..', '.env.local'), 'utf-8')
for (const line of envFile.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) process.env[match[1].trim()] = match[2].trim()
}

const NOVITA_URL = 'https://api.novita.ai/v3/async/txt2img'
const NOVITA_RESULT_URL = 'https://api.novita.ai/v3/async/task-result'
const KEY = process.env.NOVITA_API_KEY
const MODEL = 'animeRealisticXL_animeXLReal_211225.safetensors'

const RACES = [
  { id: 'elf', prompt: 'beautiful elf woman, pointed ears, ethereal elegant features, long silver hair, green eyes, forest background' },
  { id: 'dark_elf', prompt: 'dark elf drow woman, sharp angular features, dark purple skin, white hair, red eyes, underground cave background' },
  { id: 'demon', prompt: 'beautiful demon succubus woman, small horns, demon tail, red eyes, seductive, dark wings, hellfire background' },
  { id: 'angel', prompt: 'beautiful angel woman, divine radiant aura, white feathered wings, golden hair, blue eyes, heavenly clouds background' },
  { id: 'vampire', prompt: 'beautiful vampire woman, pale white skin, sharp fangs, red eyes, gothic beauty, long black hair, dark castle background' },
  { id: 'fairy', prompt: 'beautiful fairy fae woman, translucent glowing wings, small delicate features, colorful hair, ethereal glow, flower garden background' },
  { id: 'orc', prompt: 'orc woman, green skin, strong fierce features, small tusks, braided hair, tribal markings, warrior, forest camp background' },
  { id: 'dragon_kin', prompt: 'dragonborn dragon-kin woman, scales on skin, draconic features, horns, amber slit eyes, fierce, volcanic background' },
  { id: 'catgirl', prompt: 'catgirl nekomimi woman, cat ears on head, cat tail, playful feline features, cute face, pink hair, bedroom background' },
  { id: 'foxgirl', prompt: 'foxgirl kitsune woman, fox ears on head, fluffy fox tail, sly beautiful features, orange hair, amber eyes, shrine background' },
  { id: 'werewolf', prompt: 'werewolf lycan woman, wild feral beauty, amber glowing eyes, sharp features, wild hair, moonlit forest background' },
  { id: 'mermaid', prompt: 'mermaid siren woman, beautiful aquatic features, wet glistening skin, long flowing hair, ocean eyes, underwater coral background' },
]

const CLOTHING = [
  { id: 'armor', prompt: 'fantasy woman wearing ornate plate armor, detailed engravings, silver metal, warrior pose' },
  { id: 'leather', prompt: 'fantasy woman wearing dark leather armor, straps and buckles, ranger outfit, hooded' },
  { id: 'robes', prompt: 'fantasy woman wearing flowing magical robes, mystical glowing patterns, mage staff' },
  { id: 'elvish', prompt: 'fantasy woman wearing elegant elvish outfit, leaf patterns, nature-themed, green and gold' },
  { id: 'royal', prompt: 'fantasy woman wearing royal elegant gown, golden crown, jewels, regal, purple velvet' },
  { id: 'priestess', prompt: 'fantasy woman wearing white priestess robes, holy symbols, ethereal glow, temple' },
  { id: 'tribal', prompt: 'fantasy woman wearing tribal outfit, fur and bone accessories, primal, painted skin' },
  { id: 'dark', prompt: 'fantasy woman wearing dark gothic outfit, black lace, chains, spikes, dark makeup' },
  { id: 'minimal', prompt: 'fantasy woman wearing minimal cloth wraps, barely covered, natural, vines and flowers' },
  { id: 'chains', prompt: 'fantasy woman wearing chains and leather straps, harness style, dark aesthetic' },
  { id: 'nothing', prompt: 'fantasy woman nude, artistic pose, strategically covered, tasteful, nature background' },
]

async function generateOne(id, prompt, outDir) {
  const fullPrompt = `${prompt}, portrait, upper body, looking at camera, 3d render, unreal engine 5, semi-realistic, fantasy, detailed, volumetric lighting, highres`
  const negPrompt = 'cartoon, flat colors, cel shading, sketch, anime, deformed, ugly, blurry, low quality, bad anatomy, watermark, text'

  console.log(`  🎨 ${id}...`)

  const r = await fetch(NOVITA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${KEY}` },
    body: JSON.stringify({
      extra: { response_image_type: 'jpeg', enable_nsfw_detection: false },
      request: {
        model_name: MODEL, prompt: fullPrompt, negative_prompt: negPrompt,
        width: 512, height: 680, image_num: 1, steps: 25, clip_skip: 2,
        guidance_scale: 7, seed: Math.floor(Math.random() * 2147483647),
        sampler_name: 'DPM++ 2M Karras',
      },
    }),
  })

  if (!r.ok) { const e = await r.text(); console.error(`    ❌ ${e.substring(0, 150)}`); return false }
  const { task_id } = await r.json()
  if (!task_id) { console.error('    ❌ No task_id'); return false }

  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 2000))
    const res = await fetch(`${NOVITA_RESULT_URL}?task_id=${task_id}`, { headers: { 'Authorization': `Bearer ${KEY}` } })
    if (!res.ok) continue
    const d = await res.json()
    if (d.task?.status === 'TASK_STATUS_SUCCEED') {
      const url = d.images?.[0]?.image_url
      if (!url) return false
      const img = await fetch(url)
      const buf = Buffer.from(await img.arrayBuffer())
      const outPath = resolve(__dirname, '..', outDir, `${id}.jpg`)
      mkdirSync(dirname(outPath), { recursive: true })
      writeFileSync(outPath, buf)
      console.log(`    ✅ ${Math.round(buf.length / 1024)}KB`)
      return true
    }
    if (d.task?.status === 'TASK_STATUS_FAILED') { console.error(`    ❌ Failed`); return false }
    process.stdout.write('.')
  }
  console.error('    ❌ Timeout'); return false
}

async function main() {
  let ok = 0, fail = 0

  console.log(`\n🧝 Generating ${RACES.length} race images...\n`)
  for (const r of RACES) {
    const success = await generateOne(r.id, r.prompt, 'public/onboarding/fantasy/race')
    if (success) ok++; else fail++
  }

  console.log(`\n⚔️ Generating ${CLOTHING.length} clothing images...\n`)
  for (const c of CLOTHING) {
    const success = await generateOne(c.id, c.prompt, 'public/onboarding/fantasy/clothing')
    if (success) ok++; else fail++
  }

  console.log(`\n✨ Done! ${ok} succeeded, ${fail} failed`)
}
main()
