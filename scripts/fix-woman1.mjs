import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envContent = readFileSync(resolve(__dirname, '..', '.env.local'), 'utf8')
const FAL_KEY = envContent.match(/FAL_API_KEY=(.+)/)?.[1]?.trim()

// Step 1: regenerate image
console.log('Regenerating side-woman-1...')
const genRes = await fetch('https://fal.run/fal-ai/flux/dev', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Key ${FAL_KEY}` },
  body: JSON.stringify({
    prompt: 'full body portrait of a 24 year old woman, slim slender figure, long blonde hair, blue eyes, wearing red lace lingerie bra and panties and high heels, standing pose hand on hip, looking at camera seductively, (solid black background:1.5), professional photography, ultra realistic, 8k',
    image_size: { width: 512, height: 768 },
    num_inference_steps: 30, num_images: 1, enable_safety_checker: false, guidance_scale: 3.5,
  }),
})
const genData = await genRes.json()
const imgUrl = genData.images?.[0]?.url
const imgBuf = Buffer.from(await (await fetch(imgUrl)).arrayBuffer())
const tmpPath = resolve(__dirname, '..', 'public', 'side-woman-1-raw.png')
writeFileSync(tmpPath, imgBuf)
console.log('Image generated')

// Step 2: remove background
console.log('Removing background...')
const base64 = imgBuf.toString('base64')
const bgRes = await fetch('https://fal.run/fal-ai/birefnet/v2', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Key ${FAL_KEY}` },
  body: JSON.stringify({
    image_url: `data:image/png;base64,${base64}`,
    model: 'General Use (Heavy)',
    operating_resolution: '1024x1024',
    output_format: 'png',
  }),
})
const bgData = await bgRes.json()
const resultUrl = bgData.image?.url
if (!resultUrl) { console.error('No result URL:', JSON.stringify(bgData).slice(0, 300)); process.exit(1) }
const resultBuf = Buffer.from(await (await fetch(resultUrl)).arrayBuffer())
const outPath = resolve(__dirname, '..', 'public', 'side-woman-1.png')
writeFileSync(outPath, resultBuf)
console.log(`Done! Saved ${outPath} (${(resultBuf.length / 1024).toFixed(0)}KB)`)
