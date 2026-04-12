// Generate game character avatars in semi-realistic 3D style via animeRealisticXL
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
const NOVITA_KEY = process.env.NOVITA_API_KEY
const GAME_MODEL = 'animeRealisticXL_animeXLReal_211225.safetensors'

const CHARACTERS = [
  { id: 'lara', prompt: 'lara croft tomb raider, young woman, long brown hair in ponytail, brown eyes, athletic toned body, medium breasts, wearing teal tank top, brown shorts, dual pistol holsters, adventurer gear, confident smirk, jungle background' },
  { id: 'tifa', prompt: 'tifa lockhart final fantasy, young woman, long straight black hair, dark red brown eyes, athletic body, very large breasts, wearing white crop top, black mini skirt, red gloves, suspenders, martial arts pose, confident warm smile, bar background' },
  { id: '2b', prompt: '2b nier automata, young woman, short white silver hair, wearing black blindfold visor, pale skin, slender athletic body, medium breasts, wearing black gothic maid dress, thigh-high boots, black gloves, katana, stoic expression, ruined city background' },
  { id: 'dva', prompt: 'dva overwatch hana song, young korean woman, long brown hair in ponytail, brown eyes, petite athletic body, small breasts, wearing pink and blue bodysuit, headset, face marks, playful peace sign, wink, gaming setup background' },
  { id: 'jill', prompt: 'jill valentine resident evil, young woman, short brown hair, blue eyes, athletic body, medium breasts, wearing blue tube top, black tactical pants, shoulder holster, beret, determined confident expression, raccoon city background' },
  { id: 'bayonetta', prompt: 'bayonetta, young woman, very long black hair in updo, grey eyes, beauty mark near mouth, tall voluptuous body, very large breasts, long legs, wearing black skintight catsuit, glasses, high heels, guns, seductive dominant pose' },
  { id: 'yennefer', prompt: 'yennefer of vengerberg witcher, young woman, long curly black hair, violet purple eyes, slender body, medium breasts, wearing black and white elegant dress, fur collar, choker with star pendant, confident regal expression, medieval castle background' },
  { id: 'quiet', prompt: 'quiet metal gear solid, young woman, long dark brown hair in ponytail, green eyes, athletic toned body, medium breasts, toned abs, wearing torn black bikini top, ripped stockings, military gear, sniper rifle, intense silent stare, desert background' },
  { id: 'morrigan', prompt: 'morrigan dragon age, young woman, long dark hair tied up, golden amber eyes, slender body, medium breasts, wearing purple and brown revealing robes, feather accessories, staff, dark lipstick, mysterious smirk, swamp forest background' },
  { id: 'chun-li', prompt: 'chun-li street fighter, young chinese woman, brown hair in ox horn buns with ribbons, brown eyes, muscular athletic body, very thick thighs, large legs, medium breasts, wearing blue qipao dress, white boots, spiked bracelets, fighting stance, confident smile' },
  // Gender selection image
  { id: 'game-gender', prompt: 'lara croft style female game character, young woman, athletic body, beautiful face, confident expression, adventurer outfit, cinematic lighting, game key visual' },
]

async function generateOne(char) {
  const fullPrompt = `${char.prompt}, portrait, upper body, looking at camera, 3d render, unreal engine 5, semi-realistic, game character, detailed skin texture, volumetric lighting, highres, cinematic`
  const negPrompt = 'cartoon, flat colors, cel shading, sketch, painting, deformed, ugly, blurry, low quality, bad anatomy, extra fingers, mutated hands, watermark, text, nsfw, nude, naked'

  console.log(`\n🎮 Generating ${char.id}...`)

  const submitRes = await fetch(NOVITA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${NOVITA_KEY}` },
    body: JSON.stringify({
      extra: { response_image_type: 'jpeg', enable_nsfw_detection: false },
      request: {
        model_name: GAME_MODEL,
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
      const imgRes = await fetch(imageUrl)
      const buf = Buffer.from(await imgRes.arrayBuffer())
      let outPath
      if (char.id === 'game-gender') {
        outPath = resolve(__dirname, '..', 'public', 'onboarding', 'gender', 'game.jpg')
      } else {
        outPath = resolve(__dirname, '..', 'public', 'avatars', 'game', `${char.id}.jpg`)
      }
      mkdirSync(dirname(outPath), { recursive: true })
      writeFileSync(outPath, buf)
      console.log(`  ✅ Saved: ${outPath} (${Math.round(buf.length / 1024)}KB)`)
      return true
    }
    if (status === 'TASK_STATUS_FAILED') { console.error(`  ❌ Failed: ${data.task?.reason}`); return false }
    process.stdout.write('.')
  }
  console.error('  ❌ Timed out')
  return false
}

async function main() {
  console.log(`🚀 Generating ${CHARACTERS.length} game character avatars (semi-realistic 3D)...\n`)
  let success = 0, fail = 0
  for (const char of CHARACTERS) {
    const ok = await generateOne(char)
    if (ok) success++; else fail++
  }
  console.log(`\n\n✨ Done! ${success} succeeded, ${fail} failed`)
}
main()
