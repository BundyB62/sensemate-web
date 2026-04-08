// Regenerate side-woman-2: new image + remove bg + sexy video
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envContent = readFileSync(resolve(__dirname, '..', '.env.local'), 'utf8')
const FAL_KEY = envContent.match(/FAL_API_KEY=(.+)/)?.[1]?.trim()

// Step 1: New image — better hand/body positioning
console.log('Step 1: Generating new image...')
const genRes = await fetch('https://fal.run/fal-ai/flux/dev', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Key ${FAL_KEY}` },
  body: JSON.stringify({
    prompt: 'full body portrait of a 28 year old latina woman, curvy voluptuous body wide hips, long dark brown wavy hair, brown eyes, tan skin, wearing tight white crop top and denim mini skirt showing midriff, one hand in her hair and other hand on her hip, standing pose legs crossed, (hands clearly visible not touching torso:1.3), (solid black background:1.5), professional fashion photography, ultra realistic, 8k',
    image_size: { width: 512, height: 768 },
    num_inference_steps: 30, num_images: 1, enable_safety_checker: false, guidance_scale: 3.5,
  }),
})
const genData = await genRes.json()
const imgUrl = genData.images?.[0]?.url
if (!imgUrl) { console.error('No image:', JSON.stringify(genData).slice(0,300)); process.exit(1) }
const imgBuf = Buffer.from(await (await fetch(imgUrl)).arrayBuffer())
console.log('Image generated')

// Step 2: Remove background
console.log('Step 2: Removing background...')
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
const bgUrl = bgData.image?.url
if (!bgUrl) { console.error('No bg result:', JSON.stringify(bgData).slice(0,300)); process.exit(1) }
const pngBuf = Buffer.from(await (await fetch(bgUrl)).arrayBuffer())
const pngPath = resolve(__dirname, '..', 'public', 'side-woman-2.png')
writeFileSync(pngPath, pngBuf)
console.log(`PNG saved (${(pngBuf.length/1024).toFixed(0)}KB)`)

// Step 3: Generate sexy video
console.log('Step 3: Generating video (this takes ~3 min)...')
const vidBase64 = pngBuf.toString('base64')
const vidRes = await fetch('https://fal.run/fal-ai/kling-video/v1/standard/image-to-video', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Key ${FAL_KEY}` },
  body: JSON.stringify({
    image_url: `data:image/png;base64,${vidBase64}`,
    prompt: 'woman sensually swaying her hips side to side, running hand through her hair slowly, seductive body movement, arching back slightly, looking into camera flirtatiously, smooth slow motion',
    duration: '5',
    aspect_ratio: '9:16',
  }),
})
if (!vidRes.ok) { console.error('Video failed:', vidRes.status, await vidRes.text()); process.exit(1) }
const vidData = await vidRes.json()
const videoUrl = vidData?.video?.url
if (!videoUrl) { console.error('No video URL:', JSON.stringify(vidData).slice(0,300)); process.exit(1) }

const mp4Buf = Buffer.from(await (await fetch(videoUrl)).arrayBuffer())
const mp4Path = resolve(__dirname, '..', 'public', 'side-woman-2.mp4')
writeFileSync(mp4Path, mp4Buf)
console.log(`Video saved (${(mp4Buf.length/1024/1024).toFixed(1)}MB)`)

console.log('\nDone! side-woman-2 fully regenerated.')
