/**
 * Generate all onboarding selection images via Fal.ai Flux Schnell
 * Usage: FAL_API_KEY=xxx node scripts/generate-onboarding-images.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, '..', 'public', 'onboarding')
const FAL_URL = 'https://fal.run/fal-ai/flux/schnell'
const FAL_KEY = process.env.FAL_API_KEY

if (!FAL_KEY) { console.error('Missing FAL_API_KEY'); process.exit(1) }

// Base prompt suffix for consistent quality
const QUALITY = 'soft natural studio lighting, shallow depth of field, shot on Sony A7R, professional photography, cinematic, ultra-detailed face, 8k, portrait'
const QUALITY_BODY = 'soft natural studio lighting, shallow depth of field, professional photography, cinematic, 8k, full body shot'
const QUALITY_MOOD = 'cinematic atmospheric photography, dramatic lighting, moody, 8k, ultra detailed'

// ─── All image definitions ───────────────────────────────────────────────────

const IMAGES = [
  // ══════════════════════════════════════════════════════════════════════════
  // GENDER (3)
  // ══════════════════════════════════════════════════════════════════════════
  {
    path: 'gender/woman.jpg',
    prompt: `photorealistic portrait, beautiful 25 year old woman, fair skin, soft smile, long brown hair, brown eyes, elegant, ${QUALITY}`,
  },
  {
    path: 'gender/man.jpg',
    prompt: `photorealistic portrait, handsome 27 year old man, short dark hair, strong jawline, warm brown eyes, confident expression, ${QUALITY}`,
  },
  {
    path: 'gender/nonbinary.jpg',
    prompt: `photorealistic portrait, attractive 24 year old androgynous person, medium length hair, soft features, warm expression, gender-neutral styling, ${QUALITY}`,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // AGE — WOMEN (6)
  // ══════════════════════════════════════════════════════════════════════════
  {
    path: 'age/woman/18s.jpg',
    prompt: `photorealistic portrait, beautiful 18 year old young woman, youthful fresh face, long hair, natural look, innocent smile, ${QUALITY}`,
  },
  {
    path: 'age/woman/20s.jpg',
    prompt: `photorealistic portrait, beautiful 22 year old woman, youthful vibrant face, medium brown hair, natural makeup, warm smile, ${QUALITY}`,
  },
  {
    path: 'age/woman/25s.jpg',
    prompt: `photorealistic portrait, beautiful 26 year old woman, confident look, brown hair, elegant natural beauty, ${QUALITY}`,
  },
  {
    path: 'age/woman/30s.jpg',
    prompt: `photorealistic portrait, beautiful 32 year old woman, mature elegant beauty, sophisticated look, warm eyes, ${QUALITY}`,
  },
  {
    path: 'age/woman/35s.jpg',
    prompt: `photorealistic portrait, beautiful 37 year old woman, graceful mature beauty, confident smile, refined features, ${QUALITY}`,
  },
  {
    path: 'age/woman/40s.jpg',
    prompt: `photorealistic portrait, beautiful 43 year old woman, elegant mature woman, distinguished beauty, warm confident expression, ${QUALITY}`,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // AGE — MEN (6)
  // ══════════════════════════════════════════════════════════════════════════
  {
    path: 'age/man/18s.jpg',
    prompt: `photorealistic portrait, handsome 18 year old young man, youthful clean face, short hair, fresh look, ${QUALITY}`,
  },
  {
    path: 'age/man/20s.jpg',
    prompt: `photorealistic portrait, handsome 22 year old man, youthful face, styled hair, warm smile, ${QUALITY}`,
  },
  {
    path: 'age/man/25s.jpg',
    prompt: `photorealistic portrait, handsome 26 year old man, defined jawline, confident look, short dark hair, ${QUALITY}`,
  },
  {
    path: 'age/man/30s.jpg',
    prompt: `photorealistic portrait, handsome 32 year old man, mature confident look, slight stubble, strong features, ${QUALITY}`,
  },
  {
    path: 'age/man/35s.jpg',
    prompt: `photorealistic portrait, handsome 37 year old man, distinguished look, light beard, experienced confident gaze, ${QUALITY}`,
  },
  {
    path: 'age/man/40s.jpg',
    prompt: `photorealistic portrait, handsome 44 year old man, distinguished mature man, grey temples, strong confident presence, ${QUALITY}`,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ETHNICITY — WOMEN (10)
  // ══════════════════════════════════════════════════════════════════════════
  {
    path: 'ethnicity/woman/scandinavian.jpg',
    prompt: `photorealistic portrait, beautiful 25 year old Scandinavian Nordic woman, platinum blonde hair, blue eyes, porcelain fair skin, high cheekbones, ${QUALITY}`,
  },
  {
    path: 'ethnicity/woman/northwest_european.jpg',
    prompt: `photorealistic portrait, beautiful 25 year old Dutch Northwestern European woman, light brown hair, green eyes, fair skin, natural beauty, ${QUALITY}`,
  },
  {
    path: 'ethnicity/woman/mediterranean.jpg',
    prompt: `photorealistic portrait, beautiful 25 year old Mediterranean Italian woman, dark brown wavy hair, brown eyes, olive warm skin, ${QUALITY}`,
  },
  {
    path: 'ethnicity/woman/east_european.jpg',
    prompt: `photorealistic portrait, beautiful 25 year old Eastern European Slavic woman, light brown hair, grey-blue eyes, fair skin, elegant high cheekbones, ${QUALITY}`,
  },
  {
    path: 'ethnicity/woman/latin.jpg',
    prompt: `photorealistic portrait, beautiful 25 year old Latin American woman, dark wavy hair, brown eyes, warm tan golden skin, radiant smile, ${QUALITY}`,
  },
  {
    path: 'ethnicity/woman/east_asian.jpg',
    prompt: `photorealistic portrait, beautiful 25 year old East Asian woman, straight black hair, dark brown eyes, porcelain skin, elegant features, ${QUALITY}`,
  },
  {
    path: 'ethnicity/woman/south_asian.jpg',
    prompt: `photorealistic portrait, beautiful 25 year old South Asian Indian woman, long dark hair, dark brown eyes, warm brown skin, striking features, ${QUALITY}`,
  },
  {
    path: 'ethnicity/woman/middle_eastern.jpg',
    prompt: `photorealistic portrait, beautiful 25 year old Middle Eastern woman, long dark hair, dark expressive eyes, olive warm skin, elegant features, ${QUALITY}`,
  },
  {
    path: 'ethnicity/woman/african.jpg',
    prompt: `photorealistic portrait, beautiful 25 year old African woman, natural dark hair, dark brown eyes, deep dark skin, radiant beautiful features, ${QUALITY}`,
  },
  {
    path: 'ethnicity/woman/mixed.jpg',
    prompt: `photorealistic portrait, beautiful 25 year old mixed race woman, curly brown hair, hazel eyes, warm beige skin, unique exotic beautiful features, ${QUALITY}`,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ETHNICITY — MEN (10)
  // ══════════════════════════════════════════════════════════════════════════
  {
    path: 'ethnicity/man/scandinavian.jpg',
    prompt: `photorealistic portrait, handsome 27 year old Scandinavian Nordic man, blonde hair, blue eyes, fair skin, strong jawline, ${QUALITY}`,
  },
  {
    path: 'ethnicity/man/northwest_european.jpg',
    prompt: `photorealistic portrait, handsome 27 year old Dutch Northwestern European man, brown hair, blue-green eyes, fair skin, ${QUALITY}`,
  },
  {
    path: 'ethnicity/man/mediterranean.jpg',
    prompt: `photorealistic portrait, handsome 27 year old Mediterranean Italian man, dark curly hair, brown eyes, olive skin, stubble, ${QUALITY}`,
  },
  {
    path: 'ethnicity/man/east_european.jpg',
    prompt: `photorealistic portrait, handsome 27 year old Eastern European Slavic man, light brown hair, grey eyes, fair skin, strong features, ${QUALITY}`,
  },
  {
    path: 'ethnicity/man/latin.jpg',
    prompt: `photorealistic portrait, handsome 27 year old Latin American man, dark hair, brown eyes, warm tan skin, charming smile, ${QUALITY}`,
  },
  {
    path: 'ethnicity/man/east_asian.jpg',
    prompt: `photorealistic portrait, handsome 27 year old East Asian man, black hair, dark brown eyes, clean skin, defined features, ${QUALITY}`,
  },
  {
    path: 'ethnicity/man/south_asian.jpg',
    prompt: `photorealistic portrait, handsome 27 year old South Asian Indian man, dark hair, dark brown eyes, brown skin, strong features, ${QUALITY}`,
  },
  {
    path: 'ethnicity/man/middle_eastern.jpg',
    prompt: `photorealistic portrait, handsome 27 year old Middle Eastern man, dark hair, dark eyes, olive skin, well-groomed beard, ${QUALITY}`,
  },
  {
    path: 'ethnicity/man/african.jpg',
    prompt: `photorealistic portrait, handsome 27 year old African man, short dark hair, dark brown eyes, deep dark skin, strong handsome features, ${QUALITY}`,
  },
  {
    path: 'ethnicity/man/mixed.jpg',
    prompt: `photorealistic portrait, handsome 27 year old mixed race man, curly dark hair, hazel eyes, warm skin, unique striking features, ${QUALITY}`,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // BUILD — WOMEN (8)
  // ══════════════════════════════════════════════════════════════════════════
  {
    path: 'build/woman/petite.jpg',
    prompt: `photorealistic full body shot, beautiful 25 year old petite small-frame woman, short and slim, elegant dress, standing pose, ${QUALITY_BODY}`,
  },
  {
    path: 'build/woman/slim.jpg',
    prompt: `photorealistic full body shot, beautiful 25 year old slim slender woman, lean figure, elegant outfit, standing pose, ${QUALITY_BODY}`,
  },
  {
    path: 'build/woman/athletic.jpg',
    prompt: `photorealistic full body shot, beautiful 25 year old athletic toned fit woman, defined muscles, sporty elegant outfit, confident pose, ${QUALITY_BODY}`,
  },
  {
    path: 'build/woman/average.jpg',
    prompt: `photorealistic full body shot, beautiful 25 year old woman with average normal body type, casual elegant outfit, natural pose, ${QUALITY_BODY}`,
  },
  {
    path: 'build/woman/curvy.jpg',
    prompt: `photorealistic full body shot, beautiful 25 year old curvy voluptuous woman, full figure, elegant fitted dress, confident pose, ${QUALITY_BODY}`,
  },
  {
    path: 'build/woman/hourglass.jpg',
    prompt: `photorealistic full body shot, beautiful 25 year old woman with hourglass figure, cinched waist, elegant fitted dress, ${QUALITY_BODY}`,
  },
  {
    path: 'build/woman/muscular.jpg',
    prompt: `photorealistic full body shot, beautiful 25 year old muscular fit woman, defined strong physique, athletic wear, confident pose, ${QUALITY_BODY}`,
  },
  {
    path: 'build/woman/plus_size.jpg',
    prompt: `photorealistic full body shot, beautiful 25 year old plus-size full-figured woman, elegant fashionable outfit, confident radiant pose, ${QUALITY_BODY}`,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // BUILD — MEN (8)
  // ══════════════════════════════════════════════════════════════════════════
  {
    path: 'build/man/petite.jpg',
    prompt: `photorealistic full body shot, handsome 27 year old lean slim short man, compact frame, smart casual outfit, ${QUALITY_BODY}`,
  },
  {
    path: 'build/man/slim.jpg',
    prompt: `photorealistic full body shot, handsome 27 year old slim lean man, slender build, casual stylish outfit, ${QUALITY_BODY}`,
  },
  {
    path: 'build/man/athletic.jpg',
    prompt: `photorealistic full body shot, handsome 27 year old athletic fit man, toned muscular body, fitted shirt, confident pose, ${QUALITY_BODY}`,
  },
  {
    path: 'build/man/average.jpg',
    prompt: `photorealistic full body shot, handsome 27 year old man with average normal build, casual outfit, natural relaxed pose, ${QUALITY_BODY}`,
  },
  {
    path: 'build/man/curvy.jpg',
    prompt: `photorealistic full body shot, handsome 27 year old stocky broad man, sturdy build, casual outfit, confident pose, ${QUALITY_BODY}`,
  },
  {
    path: 'build/man/hourglass.jpg',
    prompt: `photorealistic full body shot, handsome 27 year old man with V-taper athletic physique, broad shoulders narrow waist, fitted shirt, ${QUALITY_BODY}`,
  },
  {
    path: 'build/man/muscular.jpg',
    prompt: `photorealistic full body shot, handsome 27 year old muscular bodybuilder man, very defined muscles, tank top, powerful confident pose, ${QUALITY_BODY}`,
  },
  {
    path: 'build/man/plus_size.jpg',
    prompt: `photorealistic full body shot, handsome 27 year old plus-size big man, large sturdy frame, smart casual outfit, confident warm pose, ${QUALITY_BODY}`,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // CLOTHING STYLE — WOMEN (8)
  // ══════════════════════════════════════════════════════════════════════════
  {
    path: 'clothing/woman/casual.jpg',
    prompt: `photorealistic portrait, beautiful 25 year old woman wearing casual outfit, jeans and nice top, relaxed natural look, ${QUALITY}`,
  },
  {
    path: 'clothing/woman/elegant.jpg',
    prompt: `photorealistic portrait, beautiful 25 year old woman wearing elegant evening dress, sophisticated glamorous look, jewelry, ${QUALITY}`,
  },
  {
    path: 'clothing/woman/streetwear.jpg',
    prompt: `photorealistic portrait, beautiful 25 year old woman wearing streetwear outfit, oversized hoodie, sneakers, urban style, ${QUALITY}`,
  },
  {
    path: 'clothing/woman/athletic.jpg',
    prompt: `photorealistic portrait, beautiful 25 year old woman wearing athletic sportswear, sports bra and leggings, fit look, ${QUALITY}`,
  },
  {
    path: 'clothing/woman/bohemian.jpg',
    prompt: `photorealistic portrait, beautiful 25 year old woman wearing bohemian boho outfit, flowing dress, earthy tones, free spirit, ${QUALITY}`,
  },
  {
    path: 'clothing/woman/chic.jpg',
    prompt: `photorealistic portrait, beautiful 25 year old woman wearing chic fashionable outfit, designer look, polished style, ${QUALITY}`,
  },
  {
    path: 'clothing/woman/edgy.jpg',
    prompt: `photorealistic portrait, beautiful 25 year old woman wearing edgy dark outfit, leather jacket, dark makeup, rebellious look, ${QUALITY}`,
  },
  {
    path: 'clothing/woman/minimalist.jpg',
    prompt: `photorealistic portrait, beautiful 25 year old woman wearing minimalist clean outfit, simple neutral tones, understated elegant, ${QUALITY}`,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // CLOTHING STYLE — MEN (8)
  // ══════════════════════════════════════════════════════════════════════════
  {
    path: 'clothing/man/casual.jpg',
    prompt: `photorealistic portrait, handsome 27 year old man wearing casual outfit, jeans and henley shirt, relaxed look, ${QUALITY}`,
  },
  {
    path: 'clothing/man/elegant.jpg',
    prompt: `photorealistic portrait, handsome 27 year old man wearing elegant suit, tailored fit, sophisticated gentleman look, ${QUALITY}`,
  },
  {
    path: 'clothing/man/streetwear.jpg',
    prompt: `photorealistic portrait, handsome 27 year old man wearing streetwear, hoodie and cap, urban style, ${QUALITY}`,
  },
  {
    path: 'clothing/man/athletic.jpg',
    prompt: `photorealistic portrait, handsome 27 year old man wearing athletic wear, fitted workout clothes, sporty look, ${QUALITY}`,
  },
  {
    path: 'clothing/man/bohemian.jpg',
    prompt: `photorealistic portrait, handsome 27 year old man wearing bohemian style, linen shirt, relaxed earthy tones, ${QUALITY}`,
  },
  {
    path: 'clothing/man/chic.jpg',
    prompt: `photorealistic portrait, handsome 27 year old man wearing chic modern outfit, designer fashion, polished look, ${QUALITY}`,
  },
  {
    path: 'clothing/man/edgy.jpg',
    prompt: `photorealistic portrait, handsome 27 year old man wearing edgy dark outfit, leather jacket, dark style, rebellious, ${QUALITY}`,
  },
  {
    path: 'clothing/man/minimalist.jpg',
    prompt: `photorealistic portrait, handsome 27 year old man wearing minimalist outfit, clean simple style, neutral tones, ${QUALITY}`,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // PERSONALITY VIBES (3)
  // ══════════════════════════════════════════════════════════════════════════
  {
    path: 'vibe/sweet.jpg',
    prompt: `cinematic atmospheric photo, warm golden sunset light, soft dreamy romantic scene, flowers, gentle warm colors, ethereal glow, love and tenderness, ${QUALITY_MOOD}`,
  },
  {
    path: 'vibe/bold.jpg',
    prompt: `cinematic atmospheric photo, confident powerful scene, dramatic red and purple lighting, fire and energy, bold passionate intensity, ${QUALITY_MOOD}`,
  },
  {
    path: 'vibe/mysterious.jpg',
    prompt: `cinematic atmospheric photo, dark mysterious moonlit scene, deep blue and purple tones, mist and shadows, enigmatic alluring atmosphere, ${QUALITY_MOOD}`,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // RELATIONSHIP STYLES (6)
  // ══════════════════════════════════════════════════════════════════════════
  {
    path: 'relationship/lover.jpg',
    prompt: `cinematic atmospheric photo, intimate romantic scene, two silhouettes close together, warm red and pink tones, candle light, passion and desire, ${QUALITY_MOOD}`,
  },
  {
    path: 'relationship/soulmate.jpg',
    prompt: `cinematic atmospheric photo, deep spiritual connection scene, two souls intertwined, cosmic starry background, ethereal purple and gold light, ${QUALITY_MOOD}`,
  },
  {
    path: 'relationship/flirt.jpg',
    prompt: `cinematic atmospheric photo, playful flirtatious scene, sparkling lights, cocktail party ambiance, fun and excitement, warm pink neon glow, ${QUALITY_MOOD}`,
  },
  {
    path: 'relationship/bestfriend.jpg',
    prompt: `cinematic atmospheric photo, warm friendship scene, golden hour sunset, laughter and joy, comfortable warm tones, cozy atmosphere, ${QUALITY_MOOD}`,
  },
  {
    path: 'relationship/mentor.jpg',
    prompt: `cinematic atmospheric photo, inspiring wisdom scene, library with warm light, books and knowledge, deep blue and gold tones, intellectual atmosphere, ${QUALITY_MOOD}`,
  },
  {
    path: 'relationship/adventure.jpg',
    prompt: `cinematic atmospheric photo, exciting adventure scene, mountain peak at sunrise, vast horizon, orange and teal tones, freedom and exploration, ${QUALITY_MOOD}`,
  },
]

// ─── Generator ───────────────────────────────────────────────────────────────

async function generateImage(entry, index, total) {
  const outPath = path.join(OUT_DIR, entry.path)

  // Skip if already exists
  if (fs.existsSync(outPath)) {
    console.log(`[${index + 1}/${total}] SKIP (exists): ${entry.path}`)
    return
  }

  console.log(`[${index + 1}/${total}] Generating: ${entry.path}`)

  try {
    const res = await fetch(FAL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${FAL_KEY}`,
      },
      body: JSON.stringify({
        prompt: entry.prompt,
        image_size: 'portrait_4_3',
        num_inference_steps: 8,
        num_images: 1,
        enable_safety_checker: false,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error(`  ERROR: ${err}`)
      return
    }

    const data = await res.json()
    const imageUrl = data.images?.[0]?.url

    if (!imageUrl) {
      console.error(`  ERROR: No image URL returned`)
      return
    }

    // Download the image
    const imgRes = await fetch(imageUrl)
    const buffer = Buffer.from(await imgRes.arrayBuffer())
    fs.writeFileSync(outPath, buffer)
    console.log(`  ✓ Saved (${(buffer.length / 1024).toFixed(0)}KB)`)

    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 300))
  } catch (err) {
    console.error(`  ERROR: ${err.message}`)
  }
}

async function main() {
  console.log(`\n🎨 Generating ${IMAGES.length} onboarding images...\n`)
  console.log(`Output: ${OUT_DIR}\n`)

  for (let i = 0; i < IMAGES.length; i++) {
    await generateImage(IMAGES[i], i, IMAGES.length)
  }

  console.log(`\n✅ Done! Generated images saved to public/onboarding/\n`)
}

main()
