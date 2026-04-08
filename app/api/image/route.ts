import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Novita.ai — supports NSFW with enable_nsfw_detection: false
const NOVITA_URL = 'https://api.novita.ai/v3/async/txt2img'
const NOVITA_RESULT_URL = 'https://api.novita.ai/v3/async/task-result'
const NOVITA_MERGE_FACE_URL = 'https://api.novita.ai/v3/merge-face'
// Fal.ai Flux Dev — fast, high quality, but SFW only
const FAL_URL = 'https://fal.run/fal-ai/flux/dev'

// ─── Check if prompt needs NSFW model ──────────────────────────────────────
function isExplicitPrompt(prompt: string): boolean {
  return /\b(naked|nude|topless|lingerie|underwear|bra\b|panties|bikini|sexy|seductiv|sensual|erotic|bed\b|bedroom|shower|bath\b|intimate|provocat|revealing|sheer|lace\b|stockings|garter|cleavage|undress|strip|tease|bare\s*skin|thong|nightgown|negligee|corset|bodysuit|spiernaakt|naakt|geile?|stout|verleidel|ass\b|butt|boobs?|breast|nipple|pussy|vagina|penis|dick|cock|spread|legs\s*open|orgasm|moan|cum|wet\b|horny|aroused|pleasure|masturbat|finger|dildo|toy|bondage|tied|handcuff|whip|spank|choking|throat|blowjob|oral|anal|penetrat|riding|doggy|missionary|bent\s*over|on\s*knees|submissiv|dominat|fetish|feet|toes|armpit|sweat|pee|squirt|cream|load|facial|deep\s*throat|gagg|suck|lick|grind|hump|mount|straddle|lap\s*dance|pole\s*dance|kut|pik|lul|tieten|kontje|behaarde?|kutje|neuk|pijp|aftrek|klaarkom|spuit|zuig|lik)/i.test(prompt)
}

// ─── Generate with Novita.ai (NSFW allowed) ────────────────────────────────
async function generateNovita(prompt: string, apiKey: string): Promise<string | null> {
  // Enhance for photorealism
  const fullPrompt = prompt +
    ', (masterpiece, best quality, photorealistic:1.4), RAW photo, 8k uhd' +
    ', detailed skin texture, realistic lighting, natural colors, sharp focus, film grain'

  const negativePrompt =
    'cartoon, anime, illustration, painting, drawing, sketch, 3d render, cgi, ' +
    'deformed, ugly, blurry, low quality, bad anatomy, bad proportions, ' +
    'extra fingers, mutated hands, poorly drawn face, disfigured, watermark, text, ' +
    'extra limbs, extra legs, extra arms, missing limbs, fused limbs, too many fingers, ' +
    'three legs, four legs, three arms, four arms, duplicate limbs, malformed limbs, ' +
    'conjoined, siamese, mutation, mutant, gross proportions, malformed, cropped'

  try {
    // Step 1: Submit async task
    const submitRes = await fetch(NOVITA_URL, {
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
          model_name: 'epicrealism_naturalSinRC1VAE_106430.safetensors',
          prompt: fullPrompt,
          negative_prompt: negativePrompt,
          width: 768,
          height: 1024,
          image_num: 1,
          steps: 30,
          clip_skip: 2,
          guidance_scale: 7,
          sampler_name: 'DPM++ 2M Karras',
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

    // Step 2: Poll for result (max 45 seconds)
    const maxAttempts = 30
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

    console.error('[Image] Novita timed out after 45s')
    return null
  } catch (err) {
    console.error('[Image] Novita error:', err)
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
        image_size: 'portrait_4_3',
        num_inference_steps: 30,
        num_images: 1,
        enable_safety_checker: false,
        guidance_scale: 3.5,
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
    const [imgRes, avatarRes] = await Promise.all([
      fetch(imageUrl),
      fetch(avatarUrl),
    ])

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
    })

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

    const { prompt, avatarUrl } = await request.json()
    if (!prompt) return NextResponse.json({ error: 'No prompt' }, { status: 400 })

    const explicit = isExplicitPrompt(prompt)
    const novitaKey = process.env.NOVITA_API_KEY
    const falKey = process.env.FAL_API_KEY!

    console.log(`[Image] ${explicit ? '🔞 NSFW' : '✅ SFW'} | Prompt: ${prompt.substring(0, 150)}`)

    let imageUrl: string | null = null

    if (explicit && novitaKey) {
      // NSFW → Novita.ai (no content filter)
      console.log('[Image] Using Novita.ai (NSFW allowed)')
      imageUrl = await generateNovita(prompt, novitaKey)

      // If Novita fails, try Flux as last resort (might be blocked but worth trying)
      if (!imageUrl) {
        console.log('[Image] Novita failed, trying Flux Dev as fallback')
        imageUrl = await generateFlux(prompt, falKey)
      }
    } else if (explicit && !novitaKey) {
      // NSFW but no Novita key — try Flux anyway
      console.warn('[Image] ⚠️ NSFW prompt but no NOVITA_API_KEY set! Trying Flux (may be blocked)')
      imageUrl = await generateFlux(prompt, falKey)
    } else {
      // SFW → Flux Dev (best quality)
      console.log('[Image] Using Flux Dev (SFW)')
      imageUrl = await generateFlux(prompt, falKey)

      // Flux failed → try Novita as fallback
      if (!imageUrl && novitaKey) {
        console.log('[Image] Flux failed, falling back to Novita')
        imageUrl = await generateNovita(prompt, novitaKey)
      }
    }

    if (!imageUrl) {
      console.error('[Image] All generators failed')
      return NextResponse.json({ error: 'Image generation failed' }, { status: 500 })
    }

    // Face merge — swap the avatar's face onto the generated image for consistency
    // Retry up to 2 times if face merge fails (it can be flaky)
    console.log(`[Image] Face merge check: avatarUrl=${avatarUrl ? 'yes(' + avatarUrl.substring(0, 60) + '...)' : 'NONE'}, novitaKey=${novitaKey ? 'yes' : 'NONE'}`)
    if (avatarUrl && novitaKey) {
      let mergedUrl: string | null = null
      for (let attempt = 1; attempt <= 2; attempt++) {
        mergedUrl = await mergeAvatarFace(imageUrl, avatarUrl, novitaKey)
        if (mergedUrl) {
          console.log(`[Image] ✅ Face merged successfully (attempt ${attempt})`)
          return NextResponse.json({ url: mergedUrl })
        }
        if (attempt < 2) {
          console.warn(`[Image] Face merge attempt ${attempt} failed, retrying...`)
          await new Promise(r => setTimeout(r, 1000))
        }
      }
      // If merge fails after retries, return the original image anyway
      console.warn('[Image] Face merge failed after 2 attempts, returning original image')
    }

    console.log(`[Image] ✅ Success: ${imageUrl.substring(0, 80)}...`)
    return NextResponse.json({ url: imageUrl })
  } catch (err: any) {
    console.error('Image API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
