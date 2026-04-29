/**
 * Regenerate ethnicity portraits with strong differentiation.
 *
 * Each ethnicity gets a UNIQUE combination of:
 *   - age (22-35 mix, not all 25)
 *   - hair color (where plausible)
 *   - hair length + style (bob, pixie, long, curly, straight, voluminous)
 *   - expression (smile vs serious vs intense)
 *   - setting / lighting
 *   - cultural markers (jewelry, clothing, location hints)
 *
 * Goal: avoid the "21 brunettes with long wavy hair" problem.
 *
 * Usage: node scripts/generate-ethnicity-v3.mjs [woman|man|both]
 *   default: woman only
 */

import { readFileSync, writeFileSync, existsSync, copyFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load env
const envFile = readFileSync(resolve(__dirname, '..', '.env.local'), 'utf-8')
for (const line of envFile.split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/)
  if (m) process.env[m[1].trim()] = m[2].trim()
}

const KEY = process.env.NOVITA_API_KEY
if (!KEY) { console.error('Missing NOVITA_API_KEY'); process.exit(1) }

const URL_TXT2IMG = 'https://api.novita.ai/v3/async/txt2img'
const URL_RESULT = 'https://api.novita.ai/v3/async/task-result'
const MODEL = 'epicrealism_naturalSinRC1VAE_106430.safetensors'

// ──────────────────────────────────────────────────────────────────────────
// Strongly differentiated prompts — each visually unique
// ──────────────────────────────────────────────────────────────────────────

const WOMAN = [
  { id: 'scandinavian', p: 'stunning 22 year old Scandinavian Nordic woman, very pale porcelain milk-white skin, ice platinum blonde short pixie cut, piercing icy pale blue eyes, sharp Nordic features, soft confident smile, minimalist white turtleneck, snowy winter outdoor light' },
  { id: 'irish', p: 'stunning 26 year old Irish Celtic woman, very pale freckled skin face covered with freckles, fiery bright red curly long hair, vivid emerald green eyes, soft warm genuine smile, green wool sweater, soft Irish countryside golden afternoon light' },
  { id: 'british', p: 'stunning 30 year old British English woman, fair rosy porcelain skin, dark auburn straight long hair pulled into a low elegant ponytail, warm hazel brown eyes, refined neutral aristocratic expression, pearl earrings, navy blazer, classic library interior soft window light' },
  { id: 'east_european', p: 'stunning 24 year old Eastern European Slavic woman, very pale white cool-toned skin, ash blonde straight long hair parted in middle, intense steel grey-blue eyes, very sharp angular high cheekbones, serious intense gaze no smile, black leather jacket, cold urban gray daylight' },
  { id: 'french', p: 'stunning 28 year old French Parisian woman, light olive warm skin, dark chocolate brown bob with blunt bangs at jaw level, warm hazel eyes, bold red matte lipstick, slight knowing smirk, striped breton top, Parisian cafe golden interior light' },
  { id: 'mediterranean', p: 'stunning 32 year old Mediterranean Italian woman, deeply tanned warm olive bronze skin, dark glossy thick wavy curly long black hair flowing freely, dark espresso brown eyes, full natural lips, golden hoop earrings, white linen dress, sun-drenched golden Mediterranean afternoon beach light' },

  { id: 'latina', p: 'stunning 25 year old Latin American Colombian woman, warm caramel honey-tan skin, dark brown long sleek straight hair, warm dark brown eyes with thick lashes, full lips, big bright joyful warm smile showing teeth, large gold hoop earrings, red off-shoulder top, vibrant warm tropical golden hour light' },
  { id: 'brazilian', p: 'stunning 23 year old Brazilian woman, golden bronzed sun-tanned glowing skin, long wavy beach-blonde caramel ombre highlighted hair, light hazel-brown eyes, mixed-race Pardo beauty, dazzling bright white teeth smile, gold body chain, beach in background, golden hour beach photoshoot' },
  { id: 'mexican', p: 'stunning 28 year old Mexican indigenous Mestiza woman, warm cinnamon copper-brown skin, jet black very long straight hair styled in single braid over shoulder, deep dark almond brown eyes, round soft face with full cheeks, indigenous Aztec Mayan features, traditional turquoise silver jewelry, embroidered traditional Mexican blouse, warm earthy adobe wall background' },

  { id: 'japanese', p: 'stunning 26 year old Japanese woman, fair flawless porcelain skin, sleek glossy jet black hair styled in chic chin-length bob with precise blunt bangs, dark brown almond-shaped eyes, small delicate refined features, neutral serene contemplative expression, subtle pearl ear stud, kimono-inspired modern blouse, soft even Tokyo studio lighting' },
  { id: 'korean', p: 'stunning 24 year old Korean woman, extremely fair flawless dewy glass skin, medium-length straight ash-brown hair to shoulders, dark brown eyes with double eyelid, tiny perfect v-shape face, gradient soft pink lips, glowing dewy makeup, gold delicate ear cuff, silk camisole, bright soft K-beauty studio lighting' },
  { id: 'southeast_asian', p: 'stunning 30 year old Southeast Asian Thai woman, warm golden glowing tan skin, dark brown hair styled in long voluminous waves, dark brown warm almond eyes, soft round gentle features, gentle warm subtle smile, gold filigree earrings, traditional Thai silk wrap top, tropical warm Bangkok temple background' },

  { id: 'south_asian', p: 'stunning 28 year old South Asian Indian woman, rich warm brown copper skin, very long jet black silky straight hair down to waist, very large expressive deep dark brown eyes, strong dark perfectly arched eyebrows, traditional small red bindi on forehead, gold nose ring, ornate gold jhumka earrings, vibrant magenta silk sari, intense direct gaze, rich warm temple lighting' },

  { id: 'middle_eastern', p: 'stunning 25 year old Middle Eastern Arabian Lebanese woman, light olive warm skin, very long dark glossy black straight hair, large dark brown kohl-lined eyes with dramatic eyeliner, perfectly thick dark eyebrows, statement gold earrings and necklace, dramatic smoky eye makeup, neutral confident expression, dark luxurious silk hijab pulled back loose, rich dramatic warm tones' },
  { id: 'turkish', p: 'stunning 32 year old Turkish Anatolian woman, warm olive Mediterranean skin, dark chestnut brown thick wavy hair styled in chic shoulder-length lob bob, deep coffee brown eyes with very thick natural prominent dark eyebrows, defined strong nose, subtle gold hoop earrings, cream silk blouse, soft warm Istanbul afternoon light' },
  { id: 'persian', p: 'stunning 26 year old Persian Iranian woman, fair light olive porcelain skin, long luxurious dark wavy hair with subtle highlights styled flowing freely, striking light hazel-green eyes, elegant refined high straight nose, aristocratic high cheekbones, emerald green statement earrings, deep burgundy velvet top, dramatic chiaroscuro lighting' },
  { id: 'north_african', p: 'stunning 22 year old North African Moroccan Berber woman, warm caramel olive-tan skin, dark brown voluminous big curly afro-textured hair, warm dark brown eyes, small traditional Berber face tattoos on chin, intricate henna patterns on hands, layered silver Berber tribal jewelry, colorful embroidered kaftan, warm Moroccan desert sunset tones' },

  { id: 'west_african', p: 'stunning 28 year old West African Nigerian Yoruba woman, very deep dark rich chocolate ebony skin, natural black tightly coily 4C hair styled in voluminous afro, dark brown eyes, broad nose, full lush lips, radiant glowing dark complexion with gold highlighter, bold colorful gele head wrap purple and gold, vibrant ankara print, vibrant warm Lagos studio lighting' },
  { id: 'east_african', p: 'stunning 24 year old East African Ethiopian Habesha woman, medium dark cocoa brown smooth skin, long wavy dark hair pulled back in a loose low bun, large almond-shaped warm brown eyes, very narrow elegant straight nose, extremely high prominent sculpted cheekbones, refined elegant bone structure, delicate gold filigree cross necklace, simple white shamma drape, soft minimalist Addis Ababa morning light' },

  { id: 'caribbean', p: 'stunning 26 year old Caribbean Jamaican woman, golden brown skin, big voluminous curly natural 3C hair, warm hazel green eyes, mixed African-European Creole features, bright joyful laughing smile, large bright pink hibiscus tropical flower tucked behind ear, gold layered necklaces, colorful tropical print top, tropical Caribbean beach golden hour vibrant light' },
  { id: 'native_american', p: 'stunning 30 year old Native American indigenous Navajo woman, warm reddish-copper bronze brown skin, very long jet black straight thick hair flowing past waist, deep dark brown deep-set thoughtful eyes, very high prominent broad cheekbones, traditional turquoise and silver squash blossom necklace, single decorative feather woven in hair, traditional Pendleton blanket draped on shoulder, natural earth tones southwestern desert background' },
  { id: 'polynesian', p: 'stunning 28 year old Polynesian Samoan Hawaiian woman, warm golden brown tan skin, very long thick dark wavy hair, dark brown eyes, full features, full natural lips, soft confident smile, large fresh white plumeria flower behind right ear, traditional Polynesian tribal tattoo on shoulder, floral pareu wrap, tropical ocean Hawaiian beach background' },
]

// Same archetypes for men — masculine versions of each
const MAN = [
  { id: 'scandinavian', p: 'handsome 25 year old Scandinavian Nordic man, very pale porcelain skin, ice platinum blonde short Viking-inspired undercut, piercing icy pale blue eyes, sharp Nordic jawline with light stubble, neutral stoic expression, gray wool turtleneck, snowy winter Norwegian fjord background' },
  { id: 'irish', p: 'handsome 28 year old Irish Celtic man, fair freckled skin, fiery bright red curly medium hair and short red beard, vivid green eyes, warm friendly smile, green plaid flannel, soft Irish countryside golden light' },
  { id: 'british', p: 'handsome 32 year old British English man, fair rosy skin, dark auburn brown swept-back hair with subtle gray at temples, warm hazel eyes, refined gentleman beard, neutral aristocratic expression, navy three-piece tweed suit, classic library interior soft window light' },
  { id: 'east_european', p: 'handsome 26 year old Eastern European Slavic man, very pale cool-toned skin, ash blonde short crew cut, intense steel grey-blue eyes, very sharp angular jawline, serious intense gaze, black leather jacket, cold urban gray daylight' },
  { id: 'french', p: 'handsome 30 year old French Parisian man, light olive skin, dark chocolate brown medium hair tousled and styled, warm hazel eyes, dark stubble, slight charming smirk, navy striped breton top, Parisian cafe golden interior light' },
  { id: 'mediterranean', p: 'handsome 33 year old Mediterranean Italian man, deeply tanned olive bronze skin, dark glossy curly thick black medium hair, dark espresso brown eyes, dark beard, white linen shirt unbuttoned, sun-drenched Mediterranean coast' },

  { id: 'latina', p: 'handsome 27 year old Latin American Colombian man, warm caramel tan skin, dark brown short wavy hair with low fade, warm dark brown eyes, full beard, big confident bright smile, gold chain, white t-shirt, vibrant warm tropical golden light' },
  { id: 'brazilian', p: 'handsome 25 year old Brazilian man, golden bronzed sun-tanned skin, dark brown medium curly tousled beach hair, light hazel-brown eyes, mixed-race Pardo beauty, dazzling bright white teeth smile, athletic build, beach in background, golden hour' },
  { id: 'mexican', p: 'handsome 30 year old Mexican indigenous Mestizo man, warm cinnamon copper skin, jet black medium hair styled back, deep dark brown eyes, indigenous Aztec features, full mustache and beard, traditional turquoise silver jewelry, embroidered traditional Mexican shirt, warm earthy adobe background' },

  { id: 'japanese', p: 'handsome 28 year old Japanese man, fair flawless porcelain skin, sleek glossy jet black short hair styled neat, dark brown almond-shaped eyes, sharp refined features, neutral contemplative expression, modern minimalist black collared shirt, soft Tokyo studio lighting' },
  { id: 'korean', p: 'handsome 25 year old Korean man, extremely fair flawless dewy skin, ash brown medium swept side-parted hair, dark brown eyes, sharp v-shape jawline, glowing healthy skin, gold ear cuff, modern designer streetwear hoodie, bright Seoul fashion studio lighting' },
  { id: 'southeast_asian', p: 'handsome 32 year old Southeast Asian Thai man, warm golden tan skin, dark brown short modern fade hair, dark warm almond eyes, soft features, gentle warm smile, light beard, traditional Thai patterned shirt, tropical warm Bangkok light' },

  { id: 'south_asian', p: 'handsome 29 year old South Asian Indian man, rich warm copper brown skin, jet black medium wavy hair, very large expressive deep dark brown eyes, strong dark perfectly arched eyebrows, full dark beard, single gold ear stud, traditional cream kurta with gold embroidery, intense direct gaze, rich warm temple lighting' },

  { id: 'middle_eastern', p: 'handsome 27 year old Middle Eastern Arabian Lebanese man, light olive warm skin, dark glossy black hair styled back, large dark brown intense eyes, perfectly groomed thick dark beard, gold pinky ring, dark luxurious thobe, neutral confident expression, rich dramatic warm tones' },
  { id: 'turkish', p: 'handsome 33 year old Turkish Anatolian man, warm olive skin, dark chestnut brown thick wavy medium hair, deep coffee brown eyes with thick prominent dark eyebrows, defined strong Roman nose, full thick beard, cream silk shirt unbuttoned, soft warm Istanbul afternoon light' },
  { id: 'persian', p: 'handsome 28 year old Persian Iranian man, fair light olive skin, dark wavy medium hair styled flowing, striking light hazel-green eyes, elegant refined high straight nose, aristocratic high cheekbones, well-groomed beard, deep burgundy velvet jacket, dramatic chiaroscuro lighting' },
  { id: 'north_african', p: 'handsome 24 year old North African Moroccan Berber man, warm caramel olive-tan skin, dark brown curly medium hair, warm dark brown eyes, neat short beard, traditional silver Berber jewelry, colorful embroidered djellaba, warm Moroccan desert sunset' },

  { id: 'west_african', p: 'handsome 30 year old West African Nigerian Yoruba man, very deep dark rich chocolate ebony skin, natural black tightly coily hair styled in low fade, dark brown eyes, broad nose, full lips, full thick black beard, radiant glowing dark complexion, bold purple and gold ankara dashiki, vibrant warm Lagos lighting' },
  { id: 'east_african', p: 'handsome 26 year old East African Ethiopian Habesha man, medium dark cocoa brown smooth skin, very short clean cut hair, large almond-shaped warm brown eyes, very narrow elegant straight nose, extremely high prominent sculpted cheekbones, refined elegant bone structure, simple white shirt, soft minimalist Addis Ababa morning light' },

  { id: 'caribbean', p: 'handsome 28 year old Caribbean Jamaican man, golden brown skin, medium black natural curly hair styled in twist outs, warm hazel green eyes, mixed African-European Creole features, bright laughing smile, gold layered chains, colorful tropical print shirt, tropical Caribbean beach golden hour' },
  { id: 'native_american', p: 'handsome 32 year old Native American indigenous Navajo man, warm reddish-copper bronze brown skin, very long jet black straight thick hair pulled back, deep dark brown deep-set thoughtful eyes, very high prominent broad cheekbones, traditional turquoise silver bolo tie, single decorative feather, traditional Pendleton blanket on shoulder, natural earth tones southwestern desert' },
  { id: 'polynesian', p: 'handsome 30 year old Polynesian Samoan Hawaiian man, warm golden brown tan skin, dark medium thick wavy hair, dark brown eyes, full features, soft confident smile, large traditional Polynesian tribal tattoo on shoulder and chest, single shell pendant necklace, tropical ocean Hawaiian beach background' },
]

// ──────────────────────────────────────────────────────────────────────────
// Generator
// ──────────────────────────────────────────────────────────────────────────

const QUALITY = 'portrait, face close-up, looking at camera, photorealistic, 8k professional studio photography, ultra-detailed skin texture, sharp focus, distinct unique appearance'
const NEGATIVE = 'cartoon, anime, illustration, 3d render, deformed, ugly, blurry, low quality, bad anatomy, watermark, text, nsfw, nude, generic, plain, boring, similar features, identical face'

async function gen(genderDir, e) {
  const fp = `${e.p}, ${QUALITY}`
  process.stdout.write(`  📸 ${genderDir}/${e.id}... `)
  const r = await fetch(URL_TXT2IMG, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${KEY}` },
    body: JSON.stringify({
      extra: { response_image_type: 'jpeg', enable_nsfw_detection: false },
      request: {
        model_name: MODEL,
        prompt: fp,
        negative_prompt: NEGATIVE,
        width: 512,
        height: 680,
        image_num: 1,
        steps: 30,
        clip_skip: 2,
        guidance_scale: 8,
        seed: Math.floor(Math.random() * 2147483647),
        sampler_name: 'DPM++ 2M Karras',
      },
    }),
  })
  if (!r.ok) { console.error('FAIL: ' + (await r.text()).substring(0, 100)); return false }
  const { task_id } = await r.json()
  if (!task_id) { console.error('NO ID'); return false }

  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 2000))
    const res = await fetch(`${URL_RESULT}?task_id=${task_id}`, { headers: { 'Authorization': `Bearer ${KEY}` } })
    if (!res.ok) continue
    const d = await res.json()
    if (d.task?.status === 'TASK_STATUS_SUCCEED') {
      const url = d.images?.[0]?.image_url
      if (!url) return false
      const buf = Buffer.from(await (await fetch(url)).arrayBuffer())
      const outDir = resolve(__dirname, '..', 'public', 'onboarding', 'ethnicity', genderDir)
      if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })
      const outPath = resolve(outDir, `${e.id}.jpg`)
      // Backup the existing one if not already backed up
      const backupPath = resolve(outDir, `${e.id}.old.jpg`)
      if (existsSync(outPath) && !existsSync(backupPath)) copyFileSync(outPath, backupPath)
      writeFileSync(outPath, buf)
      console.log(`✅ ${Math.round(buf.length / 1024)}KB`)
      return true
    }
    if (d.task?.status === 'TASK_STATUS_FAILED') { console.error('FAIL'); return false }
    process.stdout.write('.')
  }
  console.error('TIMEOUT')
  return false
}

async function main() {
  const arg = process.argv[2] || 'woman'
  const sets = arg === 'both' ? [['woman', WOMAN], ['man', MAN]] : arg === 'man' ? [['man', MAN]] : [['woman', WOMAN]]

  let total = 0
  let ok = 0
  for (const [genderDir, list] of sets) {
    console.log(`\n🌍 Generating ${list.length} ${genderDir} ethnicity portraits with strong differentiation...\n`)
    for (const e of list) {
      total++
      if (await gen(genderDir, e)) ok++
    }
  }
  console.log(`\n✨ Done! ${ok}/${total} succeeded`)
  console.log(`Backups of overwritten files saved as <id>.old.jpg in same folder`)
}

main()
