#!/usr/bin/env node
/**
 * Generate MISSING onboarding images via Fal.ai Flux Dev
 * Generates clothing + ethnicity images that don't exist yet
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PUBLIC = path.join(__dirname, '..', 'public', 'onboarding')

const FAL_KEY = process.env.FAL_API_KEY
if (!FAL_KEY) { console.error('Missing FAL_API_KEY'); process.exit(1) }

const FAL_URL = 'https://fal.run/fal-ai/flux/dev'
const QUALITY = ', photorealistic, 8k, ultra detailed, professional fashion photography, natural lighting, studio portrait, beautiful detailed face, shot on Sony A7R IV 35mm lens, shallow depth of field'

async function generateImage(prompt, outputPath) {
  if (fs.existsSync(outputPath)) {
    console.log(`  ✅ EXISTS: ${outputPath.replace(PUBLIC, '')}`)
    return true
  }

  console.log(`  🎨 Generating: ${outputPath.replace(PUBLIC, '')}...`)

  try {
    const res = await fetch(FAL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${FAL_KEY}`,
      },
      body: JSON.stringify({
        prompt: prompt + QUALITY,
        image_size: 'portrait_4_3',
        num_inference_steps: 28,
        num_images: 1,
        enable_safety_checker: false,
        guidance_scale: 3.5,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error(`  ❌ HTTP ${res.status}: ${err.substring(0, 100)}`)
      return false
    }

    const data = await res.json()
    const url = data.images?.[0]?.url
    if (!url) {
      console.error(`  ❌ No image URL returned`)
      return false
    }

    // Download
    const imgRes = await fetch(url)
    const buffer = Buffer.from(await imgRes.arrayBuffer())

    if (buffer.length < 25000) {
      console.error(`  ⚠️ Black placeholder (${buffer.length} bytes), skipping`)
      return false
    }

    fs.mkdirSync(path.dirname(outputPath), { recursive: true })
    fs.writeFileSync(outputPath, buffer)
    console.log(`  ✅ SAVED: ${outputPath.replace(PUBLIC, '')} (${Math.round(buffer.length/1024)}KB)`)
    return true
  } catch (err) {
    console.error(`  ❌ ERROR:`, err.message)
    return false
  }
}

const delay = (ms) => new Promise(r => setTimeout(r, ms))

async function main() {
  let total = 0, ok = 0

  // ═══════════════════════════════════════════
  // CLOTHING — WOMAN
  // ═══════════════════════════════════════════
  console.log('\n═══ CLOTHING WOMAN ═══')
  const clothingW = [
    ['gothic',    'photorealistic portrait of a 25 year old woman wearing gothic dark outfit, black lace corset dress, dark lipstick, silver chain jewelry, mysterious smoky look, dark aesthetic background'],
    ['vintage',   'photorealistic portrait of a 25 year old woman wearing vintage retro 1950s style dress with polka dots, pearl necklace, pin-up inspired hairstyle, classic timeless elegance'],
    ['preppy',    'photorealistic portrait of a 25 year old woman wearing preppy outfit, navy polo shirt tucked into plaid skirt, headband, clean classic collegiate style, bright natural smile'],
    ['grunge',    'photorealistic portrait of a 25 year old woman wearing grunge outfit, oversized flannel shirt, ripped black jeans, combat boots, messy tousled hair, edgy rebellious attitude'],
    ['luxury',    'photorealistic portrait of a 25 year old woman wearing luxury high fashion designer gown, gold statement jewelry, glamorous makeup, red carpet sophistication, confident elegant pose'],
    ['lingerie',  'photorealistic portrait of a 25 year old woman wearing elegant silk robe with lace trim, soft bedroom lighting, boudoir photography style, sensual but classy, warm intimate atmosphere'],
    ['swimwear',  'photorealistic portrait of a 25 year old woman wearing stylish designer bikini, beach setting, golden hour sunlight, sun-kissed glowing skin, tropical summer aesthetic'],
  ]
  for (const [id, prompt] of clothingW) {
    total++
    if (await generateImage(prompt, path.join(PUBLIC, 'clothing', 'woman', `${id}.jpg`))) ok++
    await delay(2000)
  }

  // ═══════════════════════════════════════════
  // CLOTHING — MAN
  // ═══════════════════════════════════════════
  console.log('\n═══ CLOTHING MAN ═══')
  const clothingM = [
    ['grunge',  'photorealistic portrait of a 25 year old man wearing grunge outfit, open flannel shirt over band tee, ripped jeans, messy hair, rugged edgy look, moody lighting'],
    ['luxury',  'photorealistic portrait of a 25 year old man wearing luxury tailored designer suit, gold watch, slicked back hair, sophisticated confident, red carpet style'],
    ['preppy',  'photorealistic portrait of a 25 year old man wearing preppy outfit, navy polo shirt, khaki chinos, clean shaven, classic collegiate style, bright confident smile'],
  ]
  for (const [id, prompt] of clothingM) {
    total++
    if (await generateImage(prompt, path.join(PUBLIC, 'clothing', 'man', `${id}.jpg`))) ok++
    await delay(2000)
  }

  // ═══════════════════════════════════════════
  // ETHNICITY — WOMAN
  // ═══════════════════════════════════════════
  console.log('\n═══ ETHNICITY WOMAN ═══')
  const ethW = [
    ['southeast_asian', 'photorealistic portrait of a beautiful 25 year old Southeast Asian woman, warm golden-brown skin, dark silky hair, almond eyes, elegant modern outfit, warm genuine smile, Thai or Filipino beauty'],
    ['turkish',         'photorealistic portrait of a beautiful 25 year old Turkish woman, light olive skin, dark wavy hair, deep brown eyes, elegant chic modern outfit, warm Mediterranean beauty, Istanbul fashion'],
    ['persian',         'photorealistic portrait of a beautiful 25 year old Persian Iranian woman, light olive skin, thick dark eyebrows, long flowing dark hair, striking green-brown eyes, elegant regal appearance'],
    ['caribbean',       'photorealistic portrait of a beautiful 25 year old Caribbean woman, rich brown skin, dark curly natural hair, bright radiant smile, colorful stylish modern outfit, warm tropical beauty'],
    ['polynesian',      'photorealistic portrait of a beautiful 25 year old Polynesian Pacific Islander woman, tan golden-brown skin, long dark wavy hair, warm brown eyes, floral modern style, exotic natural beauty'],
    ['native_american', 'photorealistic portrait of a beautiful 25 year old Native American woman, warm brown skin, long straight dark hair, high cheekbones, elegant modern outfit, dignified natural beauty, turquoise jewelry accent'],
  ]
  for (const [id, prompt] of ethW) {
    total++
    if (await generateImage(prompt, path.join(PUBLIC, 'ethnicity', 'woman', `${id}.jpg`))) ok++
    await delay(2000)
  }

  // ═══════════════════════════════════════════
  // ETHNICITY — MAN
  // ═══════════════════════════════════════════
  console.log('\n═══ ETHNICITY MAN ═══')
  const ethM = [
    ['southeast_asian', 'photorealistic portrait of a handsome 25 year old Southeast Asian man, warm golden-brown skin, dark hair, clean shaven, modern casual outfit, friendly confident smile, Filipino or Thai'],
    ['turkish',         'photorealistic portrait of a handsome 25 year old Turkish man, olive skin, dark hair, light designer stubble, strong jawline, modern stylish outfit, warm confident Mediterranean look'],
    ['persian',         'photorealistic portrait of a handsome 25 year old Persian Iranian man, olive skin, dark hair, well-groomed short beard, striking dark eyes, elegant modern style, regal handsome features'],
    ['caribbean',       'photorealistic portrait of a handsome 25 year old Caribbean man, rich brown skin, dark hair, bright warm smile, stylish modern casual outfit, confident charismatic tropical vibes'],
    ['polynesian',      'photorealistic portrait of a handsome 25 year old Polynesian Pacific Islander man, tan golden-brown skin, dark wavy hair, strong jawline, athletic build, warm confident smile'],
    ['native_american', 'photorealistic portrait of a handsome 25 year old Native American man, warm brown skin, long straight dark hair, high cheekbones, strong dignified features, modern stylish outfit'],
  ]
  for (const [id, prompt] of ethM) {
    total++
    if (await generateImage(prompt, path.join(PUBLIC, 'ethnicity', 'man', `${id}.jpg`))) ok++
    await delay(2000)
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`📊 ${ok}/${total} images generated successfully`)
  if (ok < total) console.log(`⚠️ ${total - ok} images failed — run script again to retry`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
}

main().catch(console.error)
