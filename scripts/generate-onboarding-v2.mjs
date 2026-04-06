/**
 * Generate updated onboarding images v2
 * Fixes: age 35/40, adventure, vibes (person-based), clothing (full body),
 *        builds (gender-specific), breast/ass/dick size
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, '..', 'public', 'onboarding')
const FAL_URL = 'https://fal.run/fal-ai/flux/schnell'
const FAL_KEY = process.env.FAL_API_KEY

if (!FAL_KEY) { console.error('Missing FAL_API_KEY'); process.exit(1) }

const QUALITY = 'soft natural studio lighting, shallow depth of field, shot on Sony A7R, professional photography, cinematic, ultra-detailed, 8k'
const QUALITY_FULL = 'full body shot head to toe visible, standing pose, professional photography, studio lighting, cinematic, ultra-detailed, 8k, fashion photography'
const QUALITY_MOOD = 'cinematic atmospheric photography, dramatic lighting, moody, 8k, ultra detailed'

const IMAGES = [
  // ══════════════════════════════════════════════════════════════════════════
  // AGE FIXES — look younger/more attractive (4)
  // ══════════════════════════════════════════════════════════════════════════
  {
    path: 'age/woman/35s.jpg',
    prompt: `photorealistic portrait, beautiful attractive 36 year old woman, youthful for her age, glowing skin, elegant, long hair, warm confident smile, looks 30, ${QUALITY}`,
  },
  {
    path: 'age/woman/40s.jpg',
    prompt: `photorealistic portrait, beautiful attractive 42 year old woman, youthful elegant, well-maintained, radiant skin, sophisticated beauty, looks mid-30s, ${QUALITY}`,
  },
  {
    path: 'age/man/35s.jpg',
    prompt: `photorealistic portrait, handsome attractive 36 year old man, youthful for his age, light stubble, fit, charming confident smile, looks early 30s, ${QUALITY}`,
  },
  {
    path: 'age/man/40s.jpg',
    prompt: `photorealistic portrait, handsome attractive 43 year old man, youthful distinguished, fit, slight grey at temples, charming, looks mid-30s, ${QUALITY}`,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // RELATIONSHIP — adventure fix (1)
  // ══════════════════════════════════════════════════════════════════════════
  {
    path: 'relationship/adventure.jpg',
    prompt: `cinematic atmospheric photo, exciting adventurous romantic couple silhouettes, spontaneous fun energy, travel and exploration together, vibrant warm sunset tones, playful chemistry between two people, ${QUALITY_MOOD}`,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // VIBES — person-based, more varieties (6)
  // ══════════════════════════════════════════════════════════════════════════
  {
    path: 'vibe/sweet.jpg',
    prompt: `photorealistic portrait, beautiful person with sweet caring gentle expression, warm soft smile, kind loving eyes, soft warm golden light, flowers in background, tender romantic atmosphere, ${QUALITY}`,
  },
  {
    path: 'vibe/bold.jpg',
    prompt: `photorealistic portrait, confident bold attractive person, powerful intense gaze, strong presence, dramatic red lighting, leather outfit, fierce and passionate energy, ${QUALITY}`,
  },
  {
    path: 'vibe/mysterious.jpg',
    prompt: `photorealistic portrait, mysterious alluring person, enigmatic half-smile, deep dark eyes, moody blue and purple lighting, shadows across face, seductive and secretive aura, ${QUALITY}`,
  },
  {
    path: 'vibe/playful.jpg',
    prompt: `photorealistic portrait, playful fun attractive person, bright laughing expression, mischievous sparkling eyes, colorful vibrant lighting, energetic and flirtatious mood, ${QUALITY}`,
  },
  {
    path: 'vibe/passionate.jpg',
    prompt: `photorealistic portrait, passionate intense attractive person, smoldering gaze, slightly parted lips, warm red and amber lighting, raw desire and sensual energy, ${QUALITY}`,
  },
  {
    path: 'vibe/intellectual.jpg',
    prompt: `photorealistic portrait, intellectual sophisticated attractive person, thoughtful deep gaze, glasses, warm library setting, books, deep blue and gold tones, wise and cultured aura, ${QUALITY}`,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // CLOTHING — WOMEN full body top to toe (8)
  // ══════════════════════════════════════════════════════════════════════════
  {
    path: 'clothing/woman/casual.jpg',
    prompt: `photorealistic full body shot of beautiful 25 year old woman wearing casual outfit, crop top and high-waisted jeans, white sneakers, relaxed natural look, head to toe visible, ${QUALITY_FULL}`,
  },
  {
    path: 'clothing/woman/elegant.jpg',
    prompt: `photorealistic full body shot of beautiful 25 year old woman wearing elegant long evening gown, high heels, jewelry, sophisticated glamorous look, head to toe visible, ${QUALITY_FULL}`,
  },
  {
    path: 'clothing/woman/streetwear.jpg',
    prompt: `photorealistic full body shot of beautiful 25 year old woman wearing streetwear, oversized hoodie, cargo pants, chunky sneakers, urban style, head to toe visible, ${QUALITY_FULL}`,
  },
  {
    path: 'clothing/woman/athletic.jpg',
    prompt: `photorealistic full body shot of beautiful 25 year old woman wearing athletic sportswear, sports bra and leggings, running shoes, fit sporty look, head to toe visible, ${QUALITY_FULL}`,
  },
  {
    path: 'clothing/woman/bohemian.jpg',
    prompt: `photorealistic full body shot of beautiful 25 year old woman wearing bohemian boho outfit, flowing maxi dress, sandals, earthy tones, head to toe visible, ${QUALITY_FULL}`,
  },
  {
    path: 'clothing/woman/chic.jpg',
    prompt: `photorealistic full body shot of beautiful 25 year old woman wearing chic fashionable outfit, blazer and mini skirt, heels, polished designer look, head to toe visible, ${QUALITY_FULL}`,
  },
  {
    path: 'clothing/woman/edgy.jpg',
    prompt: `photorealistic full body shot of beautiful 25 year old woman wearing edgy dark outfit, leather jacket, ripped jeans, boots, dark makeup, rebellious look, head to toe visible, ${QUALITY_FULL}`,
  },
  {
    path: 'clothing/woman/minimalist.jpg',
    prompt: `photorealistic full body shot of beautiful 25 year old woman wearing minimalist outfit, simple white tee and tailored trousers, clean neutral tones, loafers, head to toe visible, ${QUALITY_FULL}`,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // CLOTHING — MEN full body top to toe (8)
  // ══════════════════════════════════════════════════════════════════════════
  {
    path: 'clothing/man/casual.jpg',
    prompt: `photorealistic full body shot of handsome 27 year old man wearing casual outfit, t-shirt and chinos, clean sneakers, relaxed look, head to toe visible, ${QUALITY_FULL}`,
  },
  {
    path: 'clothing/man/elegant.jpg',
    prompt: `photorealistic full body shot of handsome 27 year old man wearing elegant tailored suit, dress shoes, pocket square, sophisticated gentleman, head to toe visible, ${QUALITY_FULL}`,
  },
  {
    path: 'clothing/man/streetwear.jpg',
    prompt: `photorealistic full body shot of handsome 27 year old man wearing streetwear, hoodie, joggers, chunky sneakers, cap, urban style, head to toe visible, ${QUALITY_FULL}`,
  },
  {
    path: 'clothing/man/athletic.jpg',
    prompt: `photorealistic full body shot of handsome 27 year old man wearing athletic wear, fitted tank top and shorts, running shoes, sporty look, head to toe visible, ${QUALITY_FULL}`,
  },
  {
    path: 'clothing/man/bohemian.jpg',
    prompt: `photorealistic full body shot of handsome 27 year old man wearing bohemian style, linen shirt unbuttoned, loose pants, sandals, relaxed earthy tones, head to toe visible, ${QUALITY_FULL}`,
  },
  {
    path: 'clothing/man/chic.jpg',
    prompt: `photorealistic full body shot of handsome 27 year old man wearing chic modern outfit, turtleneck and tailored coat, designer shoes, polished look, head to toe visible, ${QUALITY_FULL}`,
  },
  {
    path: 'clothing/man/edgy.jpg',
    prompt: `photorealistic full body shot of handsome 27 year old man wearing edgy dark outfit, leather biker jacket, black jeans, combat boots, rebellious style, head to toe visible, ${QUALITY_FULL}`,
  },
  {
    path: 'clothing/man/minimalist.jpg',
    prompt: `photorealistic full body shot of handsome 27 year old man wearing minimalist outfit, plain fitted tee and tailored pants, clean white sneakers, neutral tones, head to toe visible, ${QUALITY_FULL}`,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // BUILDS — WOMEN (9) — clear differences, realistic
  // ══════════════════════════════════════════════════════════════════════════
  {
    path: 'build/woman/petite.jpg',
    prompt: `photorealistic full body shot of beautiful petite small-frame woman, short height, slim tiny body, small proportions, wearing fitted dress, head to toe visible, ${QUALITY_FULL}`,
  },
  {
    path: 'build/woman/slim.jpg',
    prompt: `photorealistic full body shot of beautiful slim slender woman, lean thin figure, long legs, model-like proportions, wearing fitted outfit, head to toe visible, ${QUALITY_FULL}`,
  },
  {
    path: 'build/woman/athletic.jpg',
    prompt: `photorealistic full body shot of beautiful athletic toned fit woman, visible muscle definition, strong legs and arms, wearing sports outfit, head to toe visible, ${QUALITY_FULL}`,
  },
  {
    path: 'build/woman/average.jpg',
    prompt: `photorealistic full body shot of beautiful woman with average normal body type, healthy natural proportions, wearing casual outfit, head to toe visible, ${QUALITY_FULL}`,
  },
  {
    path: 'build/woman/curvy.jpg',
    prompt: `photorealistic full body shot of beautiful curvy woman, full bust, wide hips, soft round figure, wearing fitted dress showing curves, head to toe visible, ${QUALITY_FULL}`,
  },
  {
    path: 'build/woman/hourglass.jpg',
    prompt: `photorealistic full body shot of beautiful woman with hourglass figure, cinched small waist, full bust, wide hips, dramatic curves, wearing bodycon dress, head to toe visible, ${QUALITY_FULL}`,
  },
  {
    path: 'build/woman/thick.jpg',
    prompt: `photorealistic full body shot of beautiful thick woman, thick thighs, big round butt, full figure, voluptuous, wearing tight jeans and crop top, head to toe visible, ${QUALITY_FULL}`,
  },
  {
    path: 'build/woman/muscular.jpg',
    prompt: `photorealistic full body shot of beautiful muscular fit woman, defined strong muscles, six-pack abs, powerful physique, wearing athletic wear, head to toe visible, ${QUALITY_FULL}`,
  },
  {
    path: 'build/woman/plus_size.jpg',
    prompt: `photorealistic full body shot of beautiful plus-size full-figured woman, large soft body, big proportions, confident and radiant, wearing fashionable outfit, head to toe visible, ${QUALITY_FULL}`,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // BUILDS — MEN (8) — male-specific builds
  // ══════════════════════════════════════════════════════════════════════════
  {
    path: 'build/man/slim.jpg',
    prompt: `photorealistic full body shot of handsome slim lean man, thin slender build, narrow frame, wearing fitted shirt and pants, head to toe visible, ${QUALITY_FULL}`,
  },
  {
    path: 'build/man/lean.jpg',
    prompt: `photorealistic full body shot of handsome lean toned man, low body fat, visible lean muscle, runner physique, wearing fitted tee, head to toe visible, ${QUALITY_FULL}`,
  },
  {
    path: 'build/man/athletic.jpg',
    prompt: `photorealistic full body shot of handsome athletic fit man, toned muscular body, broad shoulders, six-pack visible through shirt, wearing fitted outfit, head to toe visible, ${QUALITY_FULL}`,
  },
  {
    path: 'build/man/average.jpg',
    prompt: `photorealistic full body shot of handsome man with average normal build, healthy natural proportions, wearing casual outfit, head to toe visible, ${QUALITY_FULL}`,
  },
  {
    path: 'build/man/dadbod.jpg',
    prompt: `photorealistic full body shot of handsome man with dad bod, slightly soft midsection, broad frame, strong but not lean, wearing casual tee and jeans, head to toe visible, ${QUALITY_FULL}`,
  },
  {
    path: 'build/man/stocky.jpg',
    prompt: `photorealistic full body shot of handsome stocky broad man, compact powerful build, wide shoulders, thick neck and arms, wearing henley shirt, head to toe visible, ${QUALITY_FULL}`,
  },
  {
    path: 'build/man/muscular.jpg',
    prompt: `photorealistic full body shot of handsome very muscular bodybuilder man, huge defined muscles, massive arms and chest, wearing tank top, head to toe visible, ${QUALITY_FULL}`,
  },
  {
    path: 'build/man/big.jpg',
    prompt: `photorealistic full body shot of handsome big bulky large man, tall and broad, heavy powerful frame, wearing smart casual outfit, head to toe visible, ${QUALITY_FULL}`,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // BREAST SIZE — WOMEN (4)
  // ══════════════════════════════════════════════════════════════════════════
  {
    path: 'breast-size/small.jpg',
    prompt: `photorealistic upper body shot of beautiful woman with small petite breasts, A cup, wearing fitted top, natural proportions, tasteful, ${QUALITY}`,
  },
  {
    path: 'breast-size/medium.jpg',
    prompt: `photorealistic upper body shot of beautiful woman with medium breasts, B-C cup, wearing fitted top, natural proportions, tasteful, ${QUALITY}`,
  },
  {
    path: 'breast-size/large.jpg',
    prompt: `photorealistic upper body shot of beautiful woman with large full breasts, D cup, wearing fitted low-cut top, prominent bust, tasteful, ${QUALITY}`,
  },
  {
    path: 'breast-size/xl.jpg',
    prompt: `photorealistic upper body shot of beautiful woman with very large breasts, DD+ cup, wearing fitted top, very prominent full bust, tasteful, ${QUALITY}`,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ASS SIZE — WOMEN (4)
  // ══════════════════════════════════════════════════════════════════════════
  {
    path: 'ass-size/small.jpg',
    prompt: `photorealistic rear three-quarter view of beautiful woman with small petite butt, slim flat backside, wearing tight jeans, tasteful, ${QUALITY}`,
  },
  {
    path: 'ass-size/medium.jpg',
    prompt: `photorealistic rear three-quarter view of beautiful woman with medium round butt, normal proportions, wearing tight jeans, tasteful, ${QUALITY}`,
  },
  {
    path: 'ass-size/large.jpg',
    prompt: `photorealistic rear three-quarter view of beautiful woman with large round butt, big prominent backside, wearing tight jeans, tasteful, ${QUALITY}`,
  },
  {
    path: 'ass-size/xl.jpg',
    prompt: `photorealistic rear three-quarter view of beautiful woman with very large round butt, very big prominent backside, wearing tight leggings, tasteful, ${QUALITY}`,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // DICK SIZE — MEN (3)
  // ══════════════════════════════════════════════════════════════════════════
  {
    path: 'dick-size/average.jpg',
    prompt: `photorealistic photo of handsome fit man from waist down wearing tight grey sweatpants, average normal bulge visible, standing pose, tasteful, ${QUALITY}`,
  },
  {
    path: 'dick-size/large.jpg',
    prompt: `photorealistic photo of handsome fit man from waist down wearing tight grey sweatpants, large prominent bulge visible, standing pose, tasteful, ${QUALITY}`,
  },
  {
    path: 'dick-size/xl.jpg',
    prompt: `photorealistic photo of handsome fit man from waist down wearing tight grey sweatpants, very large very prominent bulge visible, standing pose, tasteful, ${QUALITY}`,
  },
]

// ─── Generator ───────────────────────────────────────────────────────────────

async function generateImage(entry, index, total) {
  const outPath = path.join(OUT_DIR, entry.path)

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

    const imgRes = await fetch(imageUrl)
    const buffer = Buffer.from(await imgRes.arrayBuffer())
    fs.writeFileSync(outPath, buffer)
    console.log(`  ✓ Saved (${(buffer.length / 1024).toFixed(0)}KB)`)

    await new Promise(r => setTimeout(r, 300))
  } catch (err) {
    console.error(`  ERROR: ${err.message}`)
  }
}

async function main() {
  console.log(`\n🎨 Generating ${IMAGES.length} updated onboarding images (v2)...\n`)
  for (let i = 0; i < IMAGES.length; i++) {
    await generateImage(IMAGES[i], i, IMAGES.length)
  }
  console.log(`\n✅ Done!\n`)
}

main()
