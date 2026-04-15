import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { buildAppearanceDescription, buildBodyReinforcement } from '@/lib/avatarPrompt'

export const maxDuration = 60

// Novita.ai — supports NSFW with enable_nsfw_detection: false
const NOVITA_TXT2IMG_URL = 'https://api.novita.ai/v3/async/txt2img'
const NOVITA_IMG2IMG_URL = 'https://api.novita.ai/v3/async/img2img'
const NOVITA_RESULT_URL = 'https://api.novita.ai/v3/async/task-result'

// Model names
const NOVITA_REALISTIC_MODEL = 'lustifySDXLNSFW_endgame_999340.safetensors'
const NOVITA_FANTASY_MODEL = 'animeRealisticXL_animeXLReal_211225.safetensors'

// ─── Pose skeleton mapping for ControlNet ──────────────────────────────────
// Maps pose IDs to OpenPose skeleton image files in public/poses/
const POSE_SKELETONS: Record<string, string> = {
  'spread-front': 'spread-front.png',
  'rear-standing': 'rear-standing.png',
  'bent-over': 'bent-over.png',
  'doggy': 'doggy.png',
  'kneeling': 'kneeling.png',
  'lying-back': 'lying-back.png',
  'squatting': 'squatting.png',
}

function getPoseBase64(poseId: string): string | null {
  const filename = POSE_SKELETONS[poseId]
  if (!filename) return null
  const filepath = resolve(process.cwd(), 'public', 'poses', filename)
  if (!existsSync(filepath)) return null
  return readFileSync(filepath).toString('base64')
}
const NOVITA_MERGE_FACE_URL = 'https://api.novita.ai/v3/merge-face'
// Fal.ai Flux 2 Pro — latest generation, best quality + prompt adherence
const FAL_URL = 'https://fal.run/fal-ai/flux-2-pro'

// ─── Check if prompt needs NSFW model ──────────────────────────────────────
function isExplicitPrompt(prompt: string): boolean {
  return /\b(naked|nude|topless|lingerie|underwear|bra\b|panties|bikini|sexy|seductiv|sensual|erotic|bed\b|bedroom|shower|bath\b|intimate|provocat|revealing|sheer|lace\b|stockings|garter|cleavage|undress|strip|tease|bare\s*skin|thong|nightgown|negligee|corset|bodysuit|spiernaakt|naakt|geile?|stout|verleidel|ass\b|butt|boobs?|breast|nipple|pussy|vagina|penis|dick|cock|spread|legs\s*open|orgasm|moan|cum|wet\b|horny|aroused|pleasure|masturbat|finger|dildo|toy|bondage|tied|handcuff|whip|spank|choking|throat|blowjob|oral|anal|penetrat|riding|doggy|missionary|bent\s*over|on\s*knees|submissiv|dominat|fetish|feet|toes|armpit|sweat|pee|squirt|cream|load|facial|deep\s*throat|gagg|suck|lick|grind|hump|mount|straddle|lap\s*dance|pole\s*dance|kut|pik|lul|tieten|kontje|behaarde?|kutje|neuk|pijp|aftrek|klaarkom|spuit|zuig|lik|anus|aars)/i.test(prompt)
}

// ─── Generate with Novita.ai (NSFW allowed) ────────────────────────────────
async function generateNovita(prompt: string, apiKey: string, extraNegative?: string, poseId?: string, modelName?: string, faceRefBase64?: string): Promise<string | null> {
  const isFantasyModel = modelName === NOVITA_FANTASY_MODEL
  // Enhance prompt — fantasy uses 3D quality tokens, realistic uses photo tokens
  let fullPrompt = isFantasyModel
    ? prompt + ', 3d render, unreal engine 5, semi-realistic, fantasy, detailed skin texture, volumetric lighting'
    : prompt + ', (photorealistic:1.4), RAW photo, 8k, sharp focus'

  // CRITICAL: Novita has a 1024 character limit for prompts
  if (fullPrompt.length > 1020) {
    console.log(`[Image] Novita prompt too long (${fullPrompt.length}), truncating...`)
    fullPrompt = fullPrompt.substring(0, 1020)
    // Cut at last comma to avoid broken words
    const lastComma = fullPrompt.lastIndexOf(',')
    if (lastComma > 800) fullPrompt = fullPrompt.substring(0, lastComma)
  }

  let negativePrompt = isFantasyModel
    ? 'cartoon, flat colors, cel shading, sketch, anime, deformed, ugly, blurry, low quality, bad anatomy, extra fingers, mutated hands, watermark, text, tattoo, tattoos, body art'
    : 'cartoon, anime, illustration, 3d render, deformed, ugly, blurry, low quality, bad anatomy, extra fingers, mutated hands, watermark, text, tattoo, tattoos, body art, tattooed skin'
  if (extraNegative) {
    // Also truncate negative prompt if needed
    const neg = extraNegative.substring(0, 400)
    negativePrompt += ', ' + neg
  }

  try {
    // Step 1: Submit async task
    const submitRes = await fetch(NOVITA_TXT2IMG_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        extra: {
          response_image_type: 'jpeg',
          enable_nsfw_detection: false,
        },
        request: {
          model_name: modelName || NOVITA_REALISTIC_MODEL,
          prompt: fullPrompt,
          negative_prompt: negativePrompt,
          width: 832,
          height: 1216,
          image_num: 1,
          steps: 30,
          clip_skip: 2,
          guidance_scale: 6,
          seed: Math.floor(Math.random() * 2147483647),
          sampler_name: 'DPM++ 2M Karras',
          ...(poseId && getPoseBase64(poseId) ? {
            controlnet_units: [{
              model: 't2i-adapter_xl_openpose',
              weight: 0.65,
              input_image: getPoseBase64(poseId),
              module: 'openpose',
              control_mode: 0,
            }],
          } : {}),
          ...(faceRefBase64 ? {
            ip_adapter: [{
              model: 'ip-adapter-faceid-plusv2_sdxl',
              image_base64: faceRefBase64,
              weight: 0.85,
            }],
          } : {}),
        },
      }),
    })

    if (!submitRes.ok) {
      const err = await submitRes.text()
      console.error(`[Image] Novita submit error (${submitRes.status}):`, err.substring(0, 300))
      return null
    }

    const submitData = await submitRes.json()
    const taskId = submitData.task_id

    if (!taskId) {
      console.error('[Image] Novita: no task_id returned')
      return null
    }

    console.log(`[Image] Novita task submitted: ${taskId}`)

    // Step 2: Poll for result (max 50 seconds, fits within Vercel Hobby 60s limit)
    const maxAttempts = 25
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(r => setTimeout(r, 1500)) // wait 1.5s between polls

      const resultRes = await fetch(`${NOVITA_RESULT_URL}?task_id=${taskId}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      })

      if (!resultRes.ok) continue

      const resultData = await resultRes.json()
      const status = resultData.task?.status

      if (status === 'TASK_STATUS_SUCCEED') {
        const imageUrl = resultData.images?.[0]?.image_url
        if (imageUrl) {
          console.log(`[Image] Novita success after ${(i + 1) * 1.5}s`)
          return imageUrl
        }
        console.error('[Image] Novita: no image_url in result')
        return null
      }

      if (status === 'TASK_STATUS_FAILED') {
        console.error('[Image] Novita task failed:', resultData.task?.reason)
        return null
      }

      // TASK_STATUS_QUEUED or TASK_STATUS_PROCESSING — keep polling
    }

    console.error('[Image] Novita timed out after 50s')
    return null
  } catch (err) {
    console.error('[Image] Novita error:', err)
    return null
  }
}

// ─── Generate with Novita.ai img2img (avatar-based) ──────────────────────
// Uses the avatar as reference image — keeps face/body consistent
async function generateNovitaImg2Img(
  prompt: string, avatarBase64: string, apiKey: string,
  extraNegative?: string, poseId?: string, modelName?: string, denoising = 0.6
): Promise<string | null> {
  const isFantasyModel = modelName === NOVITA_FANTASY_MODEL
  let fullPrompt = isFantasyModel
    ? prompt + ', 3d render, semi-realistic, fantasy, detailed'
    : prompt + ', (photorealistic:1.4), RAW photo, 8k'

  if (fullPrompt.length > 1020) {
    fullPrompt = fullPrompt.substring(0, 1020)
    const lc = fullPrompt.lastIndexOf(',')
    if (lc > 800) fullPrompt = fullPrompt.substring(0, lc)
  }

  let negativePrompt = isFantasyModel
    ? 'cartoon, sketch, anime, deformed, ugly, blurry, low quality, bad anatomy, extra fingers, watermark, text'
    : 'cartoon, anime, illustration, deformed, ugly, blurry, low quality, bad anatomy, extra fingers, watermark, text, tattoo'
  if (extraNegative) negativePrompt += ', ' + extraNegative.substring(0, 300)

  try {
    console.log(`[Image] img2img submit (denoise: ${denoising}, model: ${(modelName || NOVITA_REALISTIC_MODEL).substring(0, 30)}...)`)
    const submitRes = await fetch(NOVITA_IMG2IMG_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        extra: { response_image_type: 'jpeg', enable_nsfw_detection: false },
        request: {
          model_name: modelName || NOVITA_REALISTIC_MODEL,
          prompt: fullPrompt,
          negative_prompt: negativePrompt,
          image_base64: avatarBase64,
          width: 832,
          height: 1216,
          image_num: 1,
          steps: 30,
          clip_skip: 2,
          guidance_scale: 6,
          denoising_strength: denoising,
          seed: Math.floor(Math.random() * 2147483647),
          sampler_name: 'DPM++ 2M Karras',
          ...(poseId && getPoseBase64(poseId) ? {
            controlnet_units: [{
              model: 't2i-adapter_xl_openpose',
              weight: 0.65,
              input_image: getPoseBase64(poseId),
              module: 'openpose',
              control_mode: 0,
            }],
          } : {}),
        },
      }),
    })

    if (!submitRes.ok) {
      const err = await submitRes.text()
      console.error(`[Image] img2img submit error (${submitRes.status}):`, err.substring(0, 300))
      return null
    }

    const { task_id } = await submitRes.json()
    if (!task_id) { console.error('[Image] img2img: no task_id'); return null }
    console.log(`[Image] img2img task: ${task_id}`)

    // Poll for result (20 attempts × 1.2s = 24s max — leaves room for cold start + download)
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 1200))
      const res = await fetch(`${NOVITA_RESULT_URL}?task_id=${task_id}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      })
      if (!res.ok) continue
      const data = await res.json()
      if (data.task?.status === 'TASK_STATUS_SUCCEED') {
        const url = data.images?.[0]?.image_url
        if (url) { console.log(`[Image] img2img success after ${(i+1)*1.5}s`); return url }
        return null
      }
      if (data.task?.status === 'TASK_STATUS_FAILED') {
        console.error('[Image] img2img failed:', data.task?.reason)
        return null
      }
    }
    console.error('[Image] img2img timed out')
    return null
  } catch (err) {
    console.error('[Image] img2img error:', err)
    return null
  }
}

// ─── Download avatar and convert to base64 ───────────────────────────────
async function getAvatarBase64(avatarUrl: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(avatarUrl, { signal: controller.signal })
    clearTimeout(timeout)
    if (!res.ok) return null
    const buf = await res.arrayBuffer()
    return Buffer.from(buf).toString('base64')
  } catch {
    console.error('[Image] Failed to download avatar for img2img')
    return null
  }
}

// ─── Generate with Fal.ai Flux Dev (SFW only) ─────────────────────────────
async function generateFlux(prompt: string, apiKey: string): Promise<string | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 45000)

  try {
    const response = await fetch(FAL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${apiKey}`,
      },
      body: JSON.stringify({
        prompt: prompt + ', photorealistic, 8k, ultra detailed, professional photography, natural lighting',
        image_size: { width: 1024, height: 1536 },
        num_inference_steps: 28,
        num_images: 1,
        enable_safety_checker: false,
        guidance_scale: 2.5,
      }),
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!response.ok) return null
    const data = await response.json()
    const url = data.images?.[0]?.url
    if (!url) return null

    // Check for black placeholder (<25KB = blocked)
    try {
      const head = await fetch(url, { method: 'HEAD' })
      const size = parseInt(head.headers.get('content-length') || '0', 10)
      if (size > 0 && size < 25000) {
        console.log(`[Image] Flux returned black placeholder (${size} bytes)`)
        return null
      }
    } catch {}

    return url
  } catch {
    clearTimeout(timeout)
    return null
  }
}

// ─── Merge avatar face onto generated image ────────────────────────────────
async function mergeAvatarFace(imageUrl: string, avatarUrl: string, apiKey: string): Promise<string | null> {
  try {
    // Download both images as base64
    const dlController = new AbortController()
    const dlTimeout = setTimeout(() => dlController.abort(), 6000)
    const [imgRes, avatarRes] = await Promise.all([
      fetch(imageUrl, { signal: dlController.signal }),
      fetch(avatarUrl, { signal: dlController.signal }),
    ])
    clearTimeout(dlTimeout)

    if (!imgRes.ok || !avatarRes.ok) {
      console.error('[Image] Failed to download images for face merge')
      return null
    }

    const [imgBuf, avatarBuf] = await Promise.all([
      imgRes.arrayBuffer(),
      avatarRes.arrayBuffer(),
    ])

    const imgBase64 = Buffer.from(imgBuf).toString('base64')
    const avatarBase64 = Buffer.from(avatarBuf).toString('base64')

    console.log(`[Image] Merging avatar face onto generated image... (img: ${Math.round(imgBuf.byteLength/1024)}KB, avatar: ${Math.round(avatarBuf.byteLength/1024)}KB)`)

    const mergeController = new AbortController()
    const mergeTimeout = setTimeout(() => mergeController.abort(), 10000)
    const mergeRes = await fetch(NOVITA_MERGE_FACE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        image_file: imgBase64,
        face_image_file: avatarBase64,
        extra: {
          response_image_type: 'jpeg',
          enterprise_plan: { enabled: false },
        },
      }),
      signal: mergeController.signal,
    })
    clearTimeout(mergeTimeout)

    if (!mergeRes.ok) {
      const err = await mergeRes.text()
      console.error(`[Image] Merge face error (${mergeRes.status}):`, err.substring(0, 200))
      return null
    }

    const mergeData = await mergeRes.json()
    const mergedUrl = mergeData.image_file || mergeData.image?.image_file

    if (mergedUrl) {
      // If it's base64, we need to upload it somewhere — for now return as data URI
      if (mergedUrl.startsWith('http')) {
        console.log('[Image] Face merge success (URL)')
        return mergedUrl
      }
      // It's base64 — return as data URI
      console.log('[Image] Face merge success (base64)')
      return `data:image/jpeg;base64,${mergedUrl}`
    }

    // Check alternative response formats
    if (mergeData.image_url) return mergeData.image_url
    if (mergeData.images?.[0]?.url) return mergeData.images[0].url

    console.error('[Image] Merge face: no image in response')
    return null
  } catch (err) {
    console.error('[Image] Merge face error:', err)
    return null
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { prompt, avatarUrl, bodyNegative, appearance, poseId } = await request.json()
    if (!prompt) return NextResponse.json({ error: 'No prompt' }, { status: 400 })

    // The prompt from chat/route.ts already contains full appearance data
    // Only add appearance if it's NOT already in the prompt (e.g. direct API calls)
    let enrichedPrompt = prompt
    let extraNegativeFromAppearance = ''

    const promptAlreadyHasAppearance = /year old.*woman|year old.*man/i.test(prompt) || appearance?.style === 'fantasy'

    if (appearance && !promptAlreadyHasAppearance) {
      const appearanceDesc = buildAppearanceDescription(appearance, true, false)
      const bodyReinforce = buildBodyReinforcement(appearance)
      enrichedPrompt = `${appearanceDesc}, ${bodyReinforce.emphasis}, ${prompt}`
      extraNegativeFromAppearance = bodyReinforce.negative
      console.log(`[Image] Appearance added: ${appearanceDesc.substring(0, 120)}`)
    } else if (appearance) {
      // Prompt already has appearance — only add negative reinforcement
      const bodyReinforce = buildBodyReinforcement(appearance)
      extraNegativeFromAppearance = bodyReinforce.negative
      console.log(`[Image] Prompt already has appearance, adding negatives only`)
    }

    const explicit = isExplicitPrompt(enrichedPrompt)
    const novitaKey = process.env.NOVITA_API_KEY
    const falKey = process.env.FAL_API_KEY!
    const isFantasy = appearance?.style === 'fantasy'

    // Combine all negative prompts
    const combinedNegative = [bodyNegative, extraNegativeFromAppearance].filter(Boolean).join(', ')

    const modelName = isFantasy ? NOVITA_FANTASY_MODEL : NOVITA_REALISTIC_MODEL

    // Determine routing: img2img only for pure SFW (selfie, casual — no clothing change needed)
    // Everything that changes/removes clothing → txt2img + IP-Adapter (needs creative freedom)
    const needsClothingChange = explicit || /lingerie|bikini|underwear|nude|naked|topless|undress|uitgekleed|uitkleden|uitgetrokken/i.test(enrichedPrompt)

    console.log(`[Image] ${isFantasy ? '🧝' : '📷'} ${needsClothingChange ? '🔄 CLOTHING CHANGE' : '✅ SFW'} | Prompt: ${enrichedPrompt.substring(0, 200)}`)

    let imageUrl: string | null = null
    let avatarB64: string | null = null

    // Download avatar once
    if (avatarUrl && novitaKey) {
      avatarB64 = await getAvatarBase64(avatarUrl)
    }

    if (needsClothingChange && avatarB64 && novitaKey) {
      // ─── CLOTHING CHANGE: txt2img + IP-Adapter FaceID ──────────────────
      // Any request that changes/removes clothing needs txt2img for freedom
      // IP-Adapter keeps the face consistent with the avatar
      console.log(`[Image] 🔄🖼️ txt2img + IP-Adapter FaceID${poseId ? ` + pose: ${poseId}` : ''}`)
      imageUrl = await generateNovita(enrichedPrompt, novitaKey, combinedNegative, poseId, modelName, avatarB64)
    } else if (avatarB64 && novitaKey) {
      // ─── PURE SFW (selfie, casual — same clothing as avatar): img2img ──
      console.log(`[Image] 🖼️ img2img (SFW — avatar-based, denoise: 0.50)`)
      imageUrl = await generateNovitaImg2Img(enrichedPrompt, avatarB64, novitaKey, combinedNegative, poseId, modelName, 0.50)
    } else if (novitaKey) {
      // ─── No avatar: plain txt2img ──────────────────────────────────────
      console.log(`[Image] Using txt2img (no avatar available)`)
      imageUrl = await generateNovita(enrichedPrompt, novitaKey, combinedNegative, poseId, modelName)
    }

    // ─── FALLBACK: txt2img without IP-Adapter ────────────────────────────
    if (!imageUrl && novitaKey) {
      console.log(`[Image] Primary failed — falling back to plain txt2img`)
      imageUrl = await generateNovita(enrichedPrompt, novitaKey, combinedNegative, poseId, modelName)
    }

    // ─── LAST RESORT: Flux (SFW only) ───────────────────────────────────
    if (!imageUrl && !explicit) {
      console.log('[Image] Trying Flux Dev as last resort')
      imageUrl = await generateFlux(enrichedPrompt, falKey)
    }

    if (!imageUrl) {
      console.error('[Image] All generators failed')
      return NextResponse.json({ error: 'Image generation failed' }, { status: 500 })
    }

    // No face merge needed — img2img already produces consistent results

    console.log(`[Image] ✅ Success: ${imageUrl.substring(0, 80)}...`)
    return NextResponse.json({ url: imageUrl })
  } catch (err: any) {
    console.error('Image API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
