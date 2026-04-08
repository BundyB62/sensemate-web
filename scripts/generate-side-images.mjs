// Generate 6 diverse sensemate images for the landing page
// Usage: node scripts/generate-side-images.mjs

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '..', '.env.local')
const envContent = readFileSync(envPath, 'utf8')
const FAL_KEY = envContent.match(/FAL_API_KEY=(.+)/)?.[1]?.trim()

if (!FAL_KEY) { console.error('FAL_API_KEY not found'); process.exit(1) }

const WOMEN = [
  {
    name: 'side-woman-1',
    prompt: 'full body portrait of a 24 year old woman, slim slender figure, long blonde hair, blue eyes, wearing red lace lingerie bra and panties and high heels, standing pose hand on hip, looking at camera seductively, (solid black background:1.5), professional photography, ultra realistic, 8k',
  },
  {
    name: 'side-woman-2',
    prompt: 'full body portrait of a 28 year old latina woman, curvy voluptuous body wide hips, long dark brown wavy hair, brown eyes, tan skin, wearing tight white crop top and denim mini skirt showing midriff, standing pose, (solid black background:1.5), professional photography, ultra realistic, 8k',
  },
  {
    name: 'side-woman-3',
    prompt: 'full body portrait of a 22 year old woman, athletic toned fit body, short red bob haircut, green eyes, fair skin, wearing black gothic corset with fishnet stockings and platform boots, edgy dark makeup, confident pose, (solid black background:1.5), professional photography, ultra realistic, 8k',
  },
  {
    name: 'side-woman-4',
    prompt: 'full body portrait of a 26 year old asian woman, petite small slim frame, long straight black hair, dark eyes, wearing pink silk short nightgown negligee, barefoot, feminine soft pose, (solid black background:1.5), professional photography, ultra realistic, 8k',
  },
  {
    name: 'side-woman-5',
    prompt: 'full body portrait of a 30 year old woman, hourglass figure, long purple hair, hazel eyes, tan skin, wearing leather jacket open over black bralette and tight leather pants, badass confident pose, (solid black background:1.5), professional photography, ultra realistic, 8k',
  },
  {
    name: 'side-woman-6',
    prompt: 'full body portrait of a 25 year old black woman, thick curvy body, long curly dark hair, brown eyes, dark skin, wearing string bikini gold color, glamorous standing pose, (solid black background:1.5), professional photography, ultra realistic, 8k',
  },
]

async function generate(woman) {
  console.log(`Generating ${woman.name}...`)

  const res = await fetch('https://fal.run/fal-ai/flux/dev', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Key ${FAL_KEY}`,
    },
    body: JSON.stringify({
      prompt: woman.prompt,
      image_size: { width: 512, height: 768 },
      num_inference_steps: 30,
      num_images: 1,
      enable_safety_checker: false,
      guidance_scale: 3.5,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error(`Failed ${woman.name}: ${res.status} ${err}`)
    return
  }

  const data = await res.json()
  const imageUrl = data.images?.[0]?.url
  if (!imageUrl) { console.error(`No image URL for ${woman.name}`); return }

  const imgRes = await fetch(imageUrl)
  const buffer = Buffer.from(await imgRes.arrayBuffer())
  const outPath = resolve(__dirname, '..', 'public', `${woman.name}.png`)
  writeFileSync(outPath, buffer)
  console.log(`Saved ${outPath}`)
}

for (const woman of WOMEN) {
  await generate(woman)
}
console.log('Done! Now run: node scripts/remove-backgrounds.mjs')
