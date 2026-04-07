#!/usr/bin/env node
/**
 * Generate ALL missing onboarding images
 * - New ethnicities (15 new)
 * - Hairstyles woman (15) + man (14)
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PUBLIC = path.join(__dirname, '..', 'public', 'onboarding')
const FAL_KEY = process.env.FAL_API_KEY
if (!FAL_KEY) { console.error('Missing FAL_API_KEY'); process.exit(1) }

const FAL_URL = 'https://fal.run/fal-ai/flux/dev'
const Q = ', photorealistic, 8k, ultra detailed, professional portrait photography, natural lighting, studio, beautiful detailed face, shot on Sony A7R IV 85mm lens, shallow depth of field'

async function gen(prompt, outPath) {
  if (fs.existsSync(outPath)) { return 'exists' }
  try {
    const res = await fetch(FAL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Key ${FAL_KEY}` },
      body: JSON.stringify({ prompt: prompt + Q, image_size: 'portrait_4_3', num_inference_steps: 28, num_images: 1, enable_safety_checker: false, guidance_scale: 3.5 }),
    })
    if (!res.ok) return 'http-error'
    const d = await res.json()
    const url = d.images?.[0]?.url
    if (!url) return 'no-url'
    const img = await fetch(url)
    const buf = Buffer.from(await img.arrayBuffer())
    if (buf.length < 25000) return 'black'
    fs.mkdirSync(path.dirname(outPath), { recursive: true })
    fs.writeFileSync(outPath, buf)
    return 'ok'
  } catch(e) { return 'error: ' + e.message }
}

const delay = ms => new Promise(r => setTimeout(r, ms))

async function batch(category, items) {
  console.log(`\n═══ ${category} ═══`)
  let ok = 0, skip = 0, fail = 0
  for (const [id, prompt, outPath] of items) {
    const result = await gen(prompt, outPath)
    if (result === 'exists') { skip++; continue }
    if (result === 'ok') { ok++; console.log(`  ✅ ${id}`) }
    else { fail++; console.log(`  ❌ ${id}: ${result}`) }
    await delay(1500)
  }
  console.log(`  → ${ok} new, ${skip} existed, ${fail} failed`)
}

async function main() {
  const p = (folder, id) => path.join(PUBLIC, folder, `${id}.jpg`)

  // ═══ NEW ETHNICITIES — WOMAN ═══
  await batch('ETHNICITY WOMAN (new)', [
    ['british', 'portrait of beautiful 25 year old British English woman, fair skin, light brown hair, blue-green eyes, elegant modern style', p('ethnicity/woman', 'british')],
    ['german', 'portrait of beautiful 25 year old German woman, fair skin, blonde hair, blue eyes, clean modern European style', p('ethnicity/woman', 'german')],
    ['french', 'portrait of beautiful 25 year old French woman, light olive skin, brown wavy hair, chic Parisian fashion, elegant sophisticated', p('ethnicity/woman', 'french')],
    ['irish', 'portrait of beautiful 25 year old Irish woman, very fair pale skin, red-auburn hair, green eyes, freckles, natural beauty', p('ethnicity/woman', 'irish')],
    ['mexican', 'portrait of beautiful 25 year old Mexican woman, warm brown skin, dark hair, dark eyes, vibrant style, warm radiant smile', p('ethnicity/woman', 'mexican')],
    ['colombian', 'portrait of beautiful 25 year old Colombian woman, tan olive skin, dark wavy hair, brown eyes, stylish modern outfit, warm beauty', p('ethnicity/woman', 'colombian')],
    ['argentinian', 'portrait of beautiful 25 year old Argentinian woman, light olive skin, dark hair, European-Latin features, elegant sophisticated style', p('ethnicity/woman', 'argentinian')],
    ['brazilian', 'portrait of beautiful 25 year old Brazilian woman, golden-brown tan skin, dark curly hair, vibrant colorful style, warm stunning beauty', p('ethnicity/woman', 'brazilian')],
    ['japanese', 'portrait of beautiful 25 year old Japanese woman, fair skin, straight black hair, almond eyes, minimalist elegant style, refined beauty', p('ethnicity/woman', 'japanese')],
    ['korean', 'portrait of beautiful 25 year old Korean woman, fair porcelain skin, black hair, soft features, modern K-fashion style, glass skin beauty', p('ethnicity/woman', 'korean')],
    ['chinese', 'portrait of beautiful 25 year old Chinese woman, fair skin, straight dark hair, elegant features, modern chic style, refined beauty', p('ethnicity/woman', 'chinese')],
    ['thai', 'portrait of beautiful 25 year old Thai woman, warm golden-brown skin, dark silky hair, almond eyes, elegant Thai beauty', p('ethnicity/woman', 'thai')],
    ['filipino', 'portrait of beautiful 25 year old Filipino woman, warm tan skin, dark hair, warm brown eyes, bright genuine smile, tropical beauty', p('ethnicity/woman', 'filipino')],
    ['vietnamese', 'portrait of beautiful 25 year old Vietnamese woman, light golden skin, straight dark hair, delicate features, ao dai inspired elegance', p('ethnicity/woman', 'vietnamese')],
    ['indonesian', 'portrait of beautiful 25 year old Indonesian woman, warm brown skin, dark wavy hair, warm eyes, elegant modern Javanese beauty', p('ethnicity/woman', 'indonesian')],
    ['lebanese', 'portrait of beautiful 25 year old Lebanese woman, light olive skin, dark hair, striking green-brown eyes, glamorous Mediterranean-Middle Eastern beauty', p('ethnicity/woman', 'lebanese')],
    ['west_african', 'portrait of beautiful 25 year old West African Nigerian woman, deep dark skin, natural hair, strong features, colorful modern style, regal beauty', p('ethnicity/woman', 'west_african')],
    ['east_african', 'portrait of beautiful 25 year old East African Ethiopian woman, medium brown skin, fine features, natural hair, elegant beauty, striking eyes', p('ethnicity/woman', 'east_african')],
    ['south_african', 'portrait of beautiful 25 year old South African woman, brown skin, natural hair, warm confident smile, modern African fashion', p('ethnicity/woman', 'south_african')],
  ])

  // ═══ NEW ETHNICITIES — MAN ═══
  await batch('ETHNICITY MAN (new)', [
    ['british', 'portrait of handsome 25 year old British English man, fair skin, brown hair, blue eyes, smart casual style, refined features', p('ethnicity/man', 'british')],
    ['german', 'portrait of handsome 25 year old German man, fair skin, light brown hair, strong jawline, clean modern European style', p('ethnicity/man', 'german')],
    ['french', 'portrait of handsome 25 year old French man, olive skin, dark wavy hair, stylish Parisian fashion, sophisticated charm', p('ethnicity/man', 'french')],
    ['irish', 'portrait of handsome 25 year old Irish man, very fair skin, auburn hair, green eyes, light freckles, warm genuine smile', p('ethnicity/man', 'irish')],
    ['mexican', 'portrait of handsome 25 year old Mexican man, warm brown skin, dark hair, dark eyes, modern stylish outfit, confident warm', p('ethnicity/man', 'mexican')],
    ['colombian', 'portrait of handsome 25 year old Colombian man, tan olive skin, dark wavy hair, brown eyes, modern casual style, warm charm', p('ethnicity/man', 'colombian')],
    ['argentinian', 'portrait of handsome 25 year old Argentinian man, light olive skin, dark hair, European-Latin features, elegant sophisticated', p('ethnicity/man', 'argentinian')],
    ['brazilian', 'portrait of handsome 25 year old Brazilian man, golden-brown tan skin, dark curly hair, bright smile, athletic modern style', p('ethnicity/man', 'brazilian')],
    ['japanese', 'portrait of handsome 25 year old Japanese man, fair skin, straight black hair, refined features, minimalist modern Japanese style', p('ethnicity/man', 'japanese')],
    ['korean', 'portrait of handsome 25 year old Korean man, fair porcelain skin, styled black hair, soft features, modern K-fashion, clean handsome', p('ethnicity/man', 'korean')],
    ['chinese', 'portrait of handsome 25 year old Chinese man, fair skin, dark hair, clean shaven, modern style, refined handsome features', p('ethnicity/man', 'chinese')],
    ['thai', 'portrait of handsome 25 year old Thai man, warm golden-brown skin, dark hair, friendly smile, modern casual Thai style', p('ethnicity/man', 'thai')],
    ['filipino', 'portrait of handsome 25 year old Filipino man, warm tan skin, dark hair, warm brown eyes, bright confident smile', p('ethnicity/man', 'filipino')],
    ['vietnamese', 'portrait of handsome 25 year old Vietnamese man, light golden skin, dark straight hair, refined features, modern Vietnamese style', p('ethnicity/man', 'vietnamese')],
    ['indonesian', 'portrait of handsome 25 year old Indonesian man, warm brown skin, dark hair, warm eyes, modern style, Javanese handsome features', p('ethnicity/man', 'indonesian')],
    ['lebanese', 'portrait of handsome 25 year old Lebanese man, light olive skin, dark hair, designer stubble, striking eyes, Mediterranean-Middle Eastern charm', p('ethnicity/man', 'lebanese')],
    ['west_african', 'portrait of handsome 25 year old West African Nigerian man, deep dark skin, short dark hair, strong features, modern stylish, confident', p('ethnicity/man', 'west_african')],
    ['east_african', 'portrait of handsome 25 year old East African Ethiopian man, medium brown skin, fine features, short hair, striking elegant look', p('ethnicity/man', 'east_african')],
    ['south_african', 'portrait of handsome 25 year old South African man, brown skin, short dark hair, warm confident smile, modern African fashion', p('ethnicity/man', 'south_african')],
  ])

  // ═══ HAIRSTYLES — WOMAN ═══
  await batch('HAIR WOMAN', [
    ['long', 'close-up portrait focusing on hair, woman with long straight smooth flowing hair past shoulders, brown hair, side profile showing hair length', p('hair/woman', 'long')],
    ['wavy', 'close-up portrait focusing on hair, woman with wavy beach waves hair, loose natural waves, brown hair', p('hair/woman', 'wavy')],
    ['curly', 'close-up portrait focusing on hair, woman with tight curly voluminous bouncy curls, natural curly hair texture', p('hair/woman', 'curly')],
    ['very_long', 'close-up portrait focusing on hair, woman with very long hair reaching the waist, flowing straight silky hair', p('hair/woman', 'very_long')],
    ['bob', 'close-up portrait focusing on hair, woman with bob cut hair at chin length, sleek straight bob hairstyle', p('hair/woman', 'bob')],
    ['lob', 'close-up portrait focusing on hair, woman with lob cut hair just above shoulders, long bob hairstyle', p('hair/woman', 'lob')],
    ['pixie', 'close-up portrait focusing on hair, woman with pixie cut very short cropped feminine hair, textured pixie', p('hair/woman', 'pixie')],
    ['bangs', 'close-up portrait focusing on hair, woman with straight blunt bangs and long hair, fringe covering forehead', p('hair/woman', 'bangs')],
    ['curtain_bangs', 'close-up portrait focusing on hair, woman with curtain bangs framing face parted in middle with long hair', p('hair/woman', 'curtain_bangs')],
    ['ponytail', 'close-up portrait focusing on hair, woman with high sleek ponytail hairstyle, hair pulled back', p('hair/woman', 'ponytail')],
    ['bun', 'close-up portrait focusing on hair, woman with elegant high bun updo hairstyle, neat clean bun', p('hair/woman', 'bun')],
    ['braids', 'close-up portrait focusing on hair, woman with long braided hair, box braids hairstyle', p('hair/woman', 'braids')],
    ['afro', 'close-up portrait focusing on hair, woman with natural big round afro hair, voluminous natural texture', p('hair/woman', 'afro')],
    ['messy', 'close-up portrait focusing on hair, woman with messy tousled bedhead hair, casual effortless style', p('hair/woman', 'messy')],
    ['dreadlocks', 'close-up portrait focusing on hair, woman with long dreadlocks hairstyle, mature locs', p('hair/woman', 'dreadlocks')],
  ])

  // ═══ HAIRSTYLES — MAN ═══
  await batch('HAIR MAN', [
    ['short', 'close-up portrait focusing on hair, man with short cropped neat hair, classic short sides and top', p('hair/man', 'short')],
    ['medium', 'close-up portrait focusing on hair, man with medium length hair, styled back naturally', p('hair/man', 'medium')],
    ['long', 'close-up portrait focusing on hair, man with long hair past shoulders, flowing masculine long hair', p('hair/man', 'long')],
    ['fade', 'close-up portrait focusing on hair, man with fade haircut, shaved sides with longer top, barber fade', p('hair/man', 'fade')],
    ['undercut', 'close-up portrait focusing on hair, man with undercut hairstyle, shaved sides with slicked back longer top', p('hair/man', 'undercut')],
    ['buzz', 'close-up portrait focusing on hair, man with buzzcut very short military style hair, nearly shaved', p('hair/man', 'buzz')],
    ['curly', 'close-up portrait focusing on hair, man with curly hair, natural tight curls on top', p('hair/man', 'curly')],
    ['wavy', 'close-up portrait focusing on hair, man with wavy textured hair, natural loose waves', p('hair/man', 'wavy')],
    ['textured', 'close-up portrait focusing on hair, man with textured messy styled hair, volume and movement on top', p('hair/man', 'textured')],
    ['cornrows', 'close-up portrait focusing on hair, man with cornrow braids hairstyle, neat tight rows', p('hair/man', 'cornrows')],
    ['dreadlocks', 'close-up portrait focusing on hair, man with dreadlocks hairstyle, thick mature locs', p('hair/man', 'dreadlocks')],
    ['messy', 'close-up portrait focusing on hair, man with messy tousled bedhead hair, casual effortless look', p('hair/man', 'messy')],
    ['ponytail', 'close-up portrait focusing on hair, man with man bun hairstyle, hair pulled up in a knot on top', p('hair/man', 'ponytail')],
    ['afro', 'close-up portrait focusing on hair, man with natural afro hairstyle, big round voluminous shape', p('hair/man', 'afro')],
  ])

  console.log('\n━━━ DONE ━━━')
}

main().catch(console.error)
