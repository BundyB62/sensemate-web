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
  { id: 'sakura', prompt: '1girl, anime style, young woman, long pink hair, soft pink eyes, slender body, small breasts, school uniform, sailor uniform, white blouse, short pleated skirt, thigh-high socks, blushing, shy expression, cherry blossom background' },
  { id: 'miko', prompt: '1girl, anime style, young woman, long straight black hair, red eyes, slender body, medium breasts, shrine maiden outfit, white haori, red hakama, hair ribbons, serene expression, traditional Japanese shrine background' },
  { id: 'luna', prompt: '1girl, anime style, young woman, short purple hair, cat ears, golden eyes, cat tail, athletic body, medium breasts, wearing crop top and hotpants, choker with bell, playful smirk, fang tooth, neon city background' },
  { id: 'lilith', prompt: '1girl, anime style, young woman, long wavy white hair, red demon eyes, demon horns, demon tail, voluptuous body, large breasts, wide hips, wearing black leather corset, thigh-high boots, confident smirk, dark flames background' },
  { id: 'aria', prompt: '1girl, anime style, young woman, very long silver hair, bright blue eyes, elf ears, slender elegant body, small breasts, wearing flowing white dress, silver tiara, ethereal glow, gentle smile, fantasy forest background' },
  { id: 'hana', prompt: '1girl, anime style, young woman, long blonde hair in twin tails, big green eyes, petite body, small breasts, wearing French maid outfit, black and white maid dress, frilly headband, white stockings, cheerful expression' },
  { id: 'yui', prompt: '1girl, anime style, young woman, medium length orange hair, bright amber eyes, athletic body, medium breasts, wearing idol costume, frilly skirt, knee-high boots, microphone, confident wink, colorful stage lighting' },
  { id: 'nova', prompt: '1girl, anime style, young woman, short neon blue hair with undercut, cybernetic red eyes, athletic toned body, medium breasts, wearing black tactical bodysuit, neon accents, cyberpunk implants, confident stance, neon city background' },
  { id: 'freya', prompt: '1girl, anime style, young woman, long braided red hair, fierce green eyes, muscular athletic body, large breasts, wearing fantasy armor, leather and steel, fur cape, sword on back, warrior pose, mountain landscape background' },
  { id: 'morgana', prompt: '1girl, anime style, young woman, long dark purple hair, glowing violet eyes, curvy body, large breasts, wearing dark sorceress robes, revealing, magical staff, floating arcane symbols, mysterious smile, dark castle background' },
  { id: 'kaito', prompt: '1boy, anime style, young man, messy black hair, sharp dark blue eyes, tall muscular build, wearing traditional samurai hakama, open kimono showing chest, katana at side, serious expression, cherry blossom background' },
  { id: 'raven', prompt: '1boy, anime style, young man, long silver white hair, piercing red eyes, tall lean muscular build, wearing dark royal attire, black cape, silver accessories, smirk, dark throne room background' },
  // Gender selection image
  { id: 'anime-gender', prompt: '1girl, anime style, young woman, colorful hair, big expressive eyes, beautiful face, upper body portrait, school uniform, gentle smile, sparkle effects, anime key visual, pastel gradient background' },
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
