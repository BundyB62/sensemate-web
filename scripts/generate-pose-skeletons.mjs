// Generate OpenPose skeleton images using a simple PPM→PNG approach
// No external dependencies needed

import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = resolve(__dirname, '..', 'public', 'poses')
mkdirSync(OUT_DIR, { recursive: true })

const W = 512, H = 768

function createImage() {
  // Create a simple pixel buffer (RGB)
  return new Uint8Array(W * H * 3) // starts as all black
}

function setPixel(img, x, y, r, g, b) {
  if (x < 0 || x >= W || y < 0 || y >= H) return
  const idx = (y * W + x) * 3
  img[idx] = r; img[idx + 1] = g; img[idx + 2] = b
}

function drawCircle(img, cx, cy, radius, r, g, b) {
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx * dx + dy * dy <= radius * radius) {
        setPixel(img, Math.round(cx + dx), Math.round(cy + dy), r, g, b)
      }
    }
  }
}

function drawLine(img, x1, y1, x2, y2, r, g, b) {
  const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) || 1
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const x = Math.round(x1 + (x2 - x1) * t)
    const y = Math.round(y1 + (y2 - y1) * t)
    // Draw thick line (3px)
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++)
        setPixel(img, x + dx, y + dy, r, g, b)
  }
}

function savePPM(img, filename) {
  const header = `P6\n${W} ${H}\n255\n`
  const headerBuf = Buffer.from(header, 'ascii')
  const dataBuf = Buffer.from(img)
  const ppmPath = resolve(OUT_DIR, filename.replace('.png', '.ppm'))
  const pngPath = resolve(OUT_DIR, filename)
  writeFileSync(ppmPath, Buffer.concat([headerBuf, dataBuf]))

  // Try to convert to PNG using sips (macOS built-in)
  try {
    execSync(`sips -s format png "${ppmPath}" --out "${pngPath}" 2>/dev/null`, { stdio: 'pipe' })
    execSync(`rm "${ppmPath}"`)
  } catch {
    // If sips fails, just keep PPM and rename to png (most tools can read it)
    execSync(`mv "${ppmPath}" "${pngPath}"`)
  }
  console.log(`Created ${filename}`)
}

// Color helper
const C = {
  red: [255, 0, 0], yellow: [255, 255, 0], green: [0, 255, 0],
  cyan: [0, 255, 255], blue: [0, 100, 255], magenta: [255, 0, 255],
  orange: [255, 165, 0], white: [255, 255, 255],
}

function drawSkeleton(joints, limbs, filename) {
  const img = createImage()

  // Draw limbs
  for (const [a, b, color] of limbs) {
    if (joints[a] && joints[b]) {
      drawLine(img, joints[a][0], joints[a][1], joints[b][0], joints[b][1], ...color)
    }
  }

  // Draw joints
  for (const [name, [x, y]] of Object.entries(joints)) {
    drawCircle(img, x, y, 5, ...C.white)
    drawCircle(img, x, y, 3, ...C.red)
  }

  savePPM(img, filename)
}

const LIMBS = (joints) => [
  ['nose', 'neck', C.red], ['neck', 'rShoulder', C.orange], ['rShoulder', 'rElbow', C.yellow],
  ['rElbow', 'rWrist', C.green], ['neck', 'lShoulder', C.cyan], ['lShoulder', 'lElbow', C.blue],
  ['lElbow', 'lWrist', C.magenta], ['neck', 'rHip', C.orange], ['rHip', 'rKnee', C.yellow],
  ['rKnee', 'rAnkle', C.green], ['neck', 'lHip', C.cyan], ['lHip', 'lKnee', C.blue],
  ['lKnee', 'lAnkle', C.magenta],
]

// ─── POSES ─────────────────────────────────────────────────────────────────

// 1. Spread legs facing camera
const spread = {
  nose: [256, 120], neck: [256, 180],
  rShoulder: [190, 200], rElbow: [140, 260], rWrist: [120, 310],
  lShoulder: [322, 200], lElbow: [372, 260], lWrist: [392, 310],
  rHip: [220, 380], rKnee: [130, 500], rAnkle: [80, 620],
  lHip: [292, 380], lKnee: [382, 500], lAnkle: [432, 620],
}
drawSkeleton(spread, LIMBS(spread), 'spread-front.png')

// 2. Rear standing
const rear = {
  nose: [280, 100], neck: [256, 140],
  rShoulder: [200, 170], rElbow: [180, 260], rWrist: [175, 340],
  lShoulder: [312, 170], lElbow: [332, 260], lWrist: [335, 340],
  rHip: [225, 380], rKnee: [222, 530], rAnkle: [220, 670],
  lHip: [287, 380], lKnee: [290, 530], lAnkle: [292, 670],
}
drawSkeleton(rear, LIMBS(rear), 'rear-standing.png')

// 3. Bent over from behind
const bent = {
  nose: [256, 220], neck: [256, 280],
  rShoulder: [200, 300], rElbow: [180, 380], rWrist: [170, 460],
  lShoulder: [312, 300], lElbow: [332, 380], lWrist: [342, 460],
  rHip: [225, 380], rKnee: [210, 530], rAnkle: [200, 670],
  lHip: [287, 380], lKnee: [300, 530], lAnkle: [310, 670],
}
drawSkeleton(bent, LIMBS(bent), 'bent-over.png')

// 4. On all fours / doggy
const doggy = {
  nose: [130, 260], neck: [190, 290],
  rShoulder: [210, 320], rElbow: [200, 420], rWrist: [195, 510],
  lShoulder: [230, 300], lElbow: [220, 400], lWrist: [215, 490],
  rHip: [340, 310], rKnee: [360, 440], rAnkle: [355, 550],
  lHip: [370, 290], lKnee: [390, 420], lAnkle: [385, 530],
}
drawSkeleton(doggy, LIMBS(doggy), 'doggy.png')

// 5. Kneeling
const kneel = {
  nose: [256, 140], neck: [256, 210],
  rShoulder: [195, 240], rElbow: [165, 330], rWrist: [155, 410],
  lShoulder: [317, 240], lElbow: [347, 330], lWrist: [357, 410],
  rHip: [225, 410], rKnee: [220, 560], rAnkle: [260, 620],
  lHip: [287, 410], lKnee: [292, 560], lAnkle: [252, 620],
}
drawSkeleton(kneel, LIMBS(kneel), 'kneeling.png')

// 6. Lying on back
const lying = {
  nose: [256, 80], neck: [256, 150],
  rShoulder: [180, 170], rElbow: [110, 190], rWrist: [60, 210],
  lShoulder: [332, 170], lElbow: [402, 190], lWrist: [452, 210],
  rHip: [220, 360], rKnee: [190, 510], rAnkle: [180, 660],
  lHip: [292, 360], lKnee: [322, 510], lAnkle: [332, 660],
}
drawSkeleton(lying, LIMBS(lying), 'lying-back.png')

// 7. Squatting
const squat = {
  nose: [256, 110], neck: [256, 180],
  rShoulder: [195, 210], rElbow: [160, 290], rWrist: [150, 370],
  lShoulder: [317, 210], lElbow: [352, 290], lWrist: [362, 370],
  rHip: [215, 370], rKnee: [140, 470], rAnkle: [130, 580],
  lHip: [297, 370], lKnee: [372, 470], lAnkle: [382, 580],
}
drawSkeleton(squat, LIMBS(squat), 'squatting.png')

console.log('\nAll 7 pose skeletons generated!')
