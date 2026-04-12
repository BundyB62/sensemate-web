// Script to generate anime character avatar images via Novita.ai
// Run: node scripts/generate-anime-avatars.mjs

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Parse .env.local manually (no dotenv dependency needed)
const envFile = readFileSync(resolve(__dirname, '..', '.env.local'), 'utf-8')
for (const line of envFile.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) process.env[match[1].trim()] = match[2].trim()
}

const NOVITA_URL = 'https://api.novita.ai/v3/async/txt2img'
const NOVITA_RESULT_URL = 'https://api.novita.ai/v3/async/task-result'
const NOVITA_KEY = process.env.NOVITA_API_KEY
const ANIME_MODEL = 'sdxlYamersAnimeUltra_yamersAnimeV3_121537.safetensors'

if (!NOVITA_KEY) { console.error('NOVITA_API_KEY not found in .env.local'); process.exit(1) }

const CHARACTERS = [
  // ANIME (10)
  { id: 'hinata', prompt: '1girl, anime style, hinata hyuga, young woman, long dark blue hair, lavender white eyes, byakugan, curvy body, large breasts, wearing purple and white jacket, mesh shirt underneath, ninja headband, blushing shy expression' },
  { id: 'rias', prompt: '1girl, anime style, rias gremory, young woman, long flowing crimson red hair, blue-green eyes, voluptuous body, very large breasts, wide hips, wearing school uniform, white shirt, black corset, short skirt, confident seductive smile' },
  { id: 'zerotwo', prompt: '1girl, anime style, zero two, young woman, long pink hair, red horns on head, cyan green eyes, athletic body, medium breasts, wearing red military uniform, white bodysuit, red eyeliner, confident playful smirk, lollipop' },
  { id: 'rem', prompt: '1girl, anime style, rem re zero, young woman, short blue hair, hair over one eye, blue eyes, petite body, medium breasts, wearing maid outfit, blue and white maid dress, hair ornament, gentle devoted smile' },
  { id: 'robin', prompt: '1girl, anime style, nico robin, young woman, long black hair, blue eyes, tall slender body, large breasts, long legs, wearing purple leather jacket, sunglasses on head, cowgirl hat, mysterious calm smile' },
  { id: 'mikasa', prompt: '1girl, anime style, mikasa ackerman, young woman, short black hair, dark grey eyes, athletic muscular body, medium breasts, wearing white blouse, brown leather jacket, red scarf around neck, serious determined expression' },
  { id: 'nami', prompt: '1girl, anime style, nami one piece, young woman, long orange hair, brown eyes, curvy body, very large breasts, slim waist, wearing bikini top, low-rise jeans, tattoo on left arm, confident flirty wink' },
  { id: 'erza', prompt: '1girl, anime style, erza scarlet, young woman, long scarlet red hair, brown eyes, athletic body, large breasts, wearing silver chest armor, blue skirt, gauntlets, sword, fierce determined expression' },
  { id: 'android18', prompt: '1girl, anime style, android 18 dragon ball, young woman, short straight blonde hair, icy blue eyes, athletic toned body, medium breasts, wearing denim vest, striped shirt, black leggings, cool confident expression' },
  { id: 'nezuko', prompt: '1girl, anime style, nezuko kamado, young woman, long dark hair with orange tips, pink eyes, petite body, small breasts, wearing pink kimono, bamboo muzzle around neck, hair ribbon, gentle innocent expression' },
  // GAME (10)
  { id: 'lara', prompt: '1girl, anime style, lara croft, young woman, long brown hair in ponytail, brown eyes, athletic toned body, medium breasts, wearing teal tank top, brown shorts, dual pistol holsters, adventurer gear, confident smirk, jungle background' },
  { id: 'tifa', prompt: '1girl, anime style, tifa lockhart, young woman, long straight black hair, dark red brown eyes, athletic body, very large breasts, wearing white crop top, black mini skirt, red gloves, suspenders, martial arts pose, confident warm smile' },
  { id: '2b', prompt: '1girl, anime style, 2b nier automata, young woman, short white silver hair, wearing black blindfold visor, pale skin, slender athletic body, medium breasts, wearing black gothic maid dress, thigh-high boots, black gloves, katana, stoic expression' },
  { id: 'dva', prompt: '1girl, anime style, dva overwatch, young korean woman, long brown hair in ponytail, brown eyes, petite athletic body, small breasts, wearing pink and blue bodysuit, headset, face marks, playful peace sign, wink, gaming setup background' },
  { id: 'jill', prompt: '1girl, anime style, jill valentine, young woman, short brown hair, blue eyes, athletic body, medium breasts, wearing blue tube top, black tactical pants, shoulder holster, beret, determined confident expression' },
  { id: 'bayonetta', prompt: '1girl, anime style, bayonetta, young woman, very long black hair in updo, grey eyes, beauty mark near mouth, tall voluptuous body, very large breasts, long legs, wearing black skintight catsuit, glasses, high heels, guns, seductive dominant pose' },
  { id: 'yennefer', prompt: '1girl, anime style, yennefer of vengerberg, young woman, long curly black hair, violet purple eyes, slender body, medium breasts, wearing black and white elegant dress, fur collar, choker with star pendant, confident regal expression' },
  { id: 'quiet', prompt: '1girl, anime style, quiet metal gear, young woman, long dark brown hair in ponytail, green eyes, athletic toned body, medium breasts, toned abs, wearing torn black bikini top, ripped stockings, military gear, sniper rifle, intense silent stare' },
  { id: 'morrigan', prompt: '1girl, anime style, morrigan dragon age, young woman, long dark hair tied up, golden amber eyes, slender body, medium breasts, wearing purple and brown revealing robes, feather accessories, staff, dark lipstick, mysterious smirk, swamp forest background' },
  { id: 'chun-li', prompt: '1girl, anime style, chun-li street fighter, young chinese woman, brown hair in ox horn buns with ribbons, brown eyes, muscular athletic body, very thick thighs, large legs, medium breasts, wearing blue qipao dress, white boots, spiked bracelets, fighting stance, confident smile' },
]

async function generateOne(char) {
  const fullPrompt = `${char.prompt}, portrait, upper body, looking at camera, anime style, masterpiece, best quality, highres, detailed face, vibrant colors`
  const negPrompt = 'realistic, photograph, 3d render, photorealistic, deformed, ugly, blurry, low quality, bad anatomy, extra fingers, mutated hands, watermark, text, nsfw, nude, naked'

  console.log(`\n🎨 Generating ${char.id}...`)

  // Submit
  const submitRes = await fetch(NOVITA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${NOVITA_KEY}` },
    body: JSON.stringify({
      extra: { response_image_type: 'jpeg', enable_nsfw_detection: false },
      request: {
        model_name: ANIME_MODEL,
        prompt: fullPrompt,
        negative_prompt: negPrompt,
        width: 768, height: 1024,
        image_num: 1, steps: 30, clip_skip: 2,
        guidance_scale: 7,
        seed: Math.floor(Math.random() * 2147483647),
        sampler_name: 'DPM++ 2M Karras',
      },
    }),
  })

  if (!submitRes.ok) {
    const err = await submitRes.text()
    console.error(`  ❌ Submit failed (${submitRes.status}): ${err.substring(0, 200)}`)
    return false
  }

  const { task_id } = await submitRes.json()
  if (!task_id) { console.error('  ❌ No task_id'); return false }
  console.log(`  ⏳ Task: ${task_id}`)

  // Poll
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 2000))
    const res = await fetch(`${NOVITA_RESULT_URL}?task_id=${task_id}`, {
      headers: { 'Authorization': `Bearer ${NOVITA_KEY}` },
    })
    if (!res.ok) continue
    const data = await res.json()
    const status = data.task?.status

    if (status === 'TASK_STATUS_SUCCEED') {
      const imageUrl = data.images?.[0]?.image_url
      if (!imageUrl) { console.error('  ❌ No image URL'); return false }

      // Download and save
      const imgRes = await fetch(imageUrl)
      const buf = Buffer.from(await imgRes.arrayBuffer())

      let outPath
      if (char.id === 'anime-gender') {
        outPath = resolve(__dirname, '..', 'public', 'onboarding', 'gender', 'anime.jpg')
      } else {
        outPath = resolve(__dirname, '..', 'public', 'avatars', 'anime', `${char.id}.jpg`)
      }
      mkdirSync(dirname(outPath), { recursive: true })
      writeFileSync(outPath, buf)
      console.log(`  ✅ Saved: ${outPath} (${Math.round(buf.length / 1024)}KB)`)
      return true
    }

    if (status === 'TASK_STATUS_FAILED') {
      console.error(`  ❌ Failed: ${data.task?.reason}`)
      return false
    }

    process.stdout.write('.')
  }

  console.error('  ❌ Timed out')
  return false
}

async function main() {
  console.log(`🚀 Generating ${CHARACTERS.length} anime avatar images...\n`)
  let success = 0
  let fail = 0

  for (const char of CHARACTERS) {
    const ok = await generateOne(char)
    if (ok) success++; else fail++
  }

  console.log(`\n\n✨ Done! ${success} succeeded, ${fail} failed`)
}

main()
