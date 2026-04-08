// Regenerate all 6 side images at HIGH RESOLUTION (1024x1536) + remove backgrounds
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envContent = readFileSync(resolve(__dirname, '..', '.env.local'), 'utf8')
const FAL_KEY = envContent.match(/FAL_API_KEY=(.+)/)?.[1]?.trim()

const WOMEN = [
  { name: 'side-woman-1', prompt: 'full body portrait of a 24 year old woman, slim slender figure, long blonde hair, blue eyes, wearing red lace lingerie bra and panties and high heels, standing pose hand on hip, looking at camera seductively, (solid black background:1.5), professional photography, ultra realistic, 8k, sharp focus, high detail' },
  { name: 'side-woman-2', prompt: 'full body portrait of a 28 year old latina woman, curvy voluptuous body wide hips, long dark brown wavy hair, brown eyes, tan skin, wearing tight white crop top and denim mini skirt showing midriff, one hand in her hair, standing pose, (solid black background:1.5), professional photography, ultra realistic, 8k, sharp focus, high detail' },
  { name: 'side-woman-3', prompt: 'full body portrait of a 22 year old woman, athletic toned fit body, short red bob haircut, green eyes, fair skin, wearing black gothic corset with fishnet stockings and platform boots, edgy dark makeup, confident pose, (solid black background:1.5), professional photography, ultra realistic, 8k, sharp focus, high detail' },
  { name: 'side-woman-4', prompt: 'full body portrait of a 26 year old asian woman, petite small slim frame, long straight black hair, dark eyes, wearing pink silk short nightgown negligee, barefoot, feminine soft pose, (solid black background:1.5), professional photography, ultra realistic, 8k, sharp focus, high detail' },
  { name: 'side-woman-5', prompt: 'full body portrait of a 30 year old woman, hourglass figure, long purple hair, hazel eyes, tan skin, wearing leather jacket open over black bralette and tight leather pants, badass confident pose, (solid black background:1.5), professional photography, ultra realistic, 8k, sharp focus, high detail' },
  { name: 'side-woman-6', prompt: 'full body portrait of a 25 year old black woman, thick curvy body, long curly dark hair, brown eyes, dark skin, wearing string bikini gold color, glamorous standing pose, (solid black background:1.5), professional photography, ultra realistic, 8k, sharp focus, high detail' },
]

async function processWoman(w) {
  console.log(`[${w.name}] Generating HD image (1024x1536)...`)
  const genRes = await fetch('https://fal.run/fal-ai/flux/dev', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Key ${FAL_KEY}` },
    body: JSON.stringify({
      prompt: w.prompt,
      image_size: { width: 1024, height: 1536 },
      num_inference_steps: 30, num_images: 1, enable_safety_checker: false, guidance_scale: 3.5,
    }),
  })
  const d = await genRes.json()
  const imgUrl = d.images?.[0]?.url
  if (!imgUrl) { console.error(`[${w.name}] No URL:`, JSON.stringify(d).slice(0, 200)); return }
  const imgBuf = Buffer.from(await (await fetch(imgUrl)).arrayBuffer())

  console.log(`[${w.name}] Removing background...`)
  const bgRes = await fetch('https://fal.run/fal-ai/birefnet/v2', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Key ${FAL_KEY}` },
    body: JSON.stringify({ image_url: `data:image/png;base64,${imgBuf.toString('base64')}`, model: 'General Use (Heavy)', operating_resolution: '2048x2048', output_format: 'png' }),
  })
  const bg = await bgRes.json()
  const resultUrl = bg.image?.url
  if (!resultUrl) { console.error(`[${w.name}] BG fail:`, JSON.stringify(bg).slice(0, 200)); return }
  const pngBuf = Buffer.from(await (await fetch(resultUrl)).arrayBuffer())
  const outPath = resolve(__dirname, '..', 'public', `${w.name}.png`)
  writeFileSync(outPath, pngBuf)
  console.log(`[${w.name}] Done! (${(pngBuf.length / 1024).toFixed(0)}KB)`)
}

for (const w of WOMEN) {
  await processWoman(w)
}
console.log('\nAll 6 HD images generated!')
