import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { buildAvatarPrompt, buildNegativePrompt } from '@/lib/avatarPrompt'

// Flux Pro v1.1 — best prompt adherence, supports high guidance + negative prompts
const FLUX_PRO_URL = 'https://fal.run/fal-ai/flux-pro/v1.1'
// Flux Dev — fallback (cheaper but less accurate)
const FLUX_DEV_URL = 'https://fal.run/fal-ai/flux/dev'
// Novita.ai — NSFW-safe last resort
const NOVITA_URL = 'https://api.novita.ai/v3/async/txt2img'
const NOVITA_RESULT_URL = 'https://api.novita.ai/v3/async/task-result'

// ─── Check if image is a black placeholder ──────────────────────────────
async function isBlackPlaceholder(url: string): Promise<boolean> {
  try {
    const head = await fetch(url, { method: 'HEAD' })
    const size = parseInt(head.headers.get('content-length') || '0', 10)
    return size > 0 && size < 25000
  } catch {
    return false
  }
}

// ─── Generate with Fal.ai ──────────────────────────────────────────────
async function generateFal(prompt: string, apiKey: string, useProModel: boolean): Promise<string | null> {
  const url = useProModel ? FLUX_PRO_URL : FLUX_DEV_URL
  const modelName = useProModel ? 'Flux Pro v1.1' : 'Flux Dev'

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 60000)

  try {
    console.log(`[Avatar] Trying ${modelName}...`)
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${apiKey}`,
      },
      body: JSON.stringify({
        prompt,
        image_size: { width: 768, height: 1152 },
        num_inference_steps: useProModel ? 35 : 30,
        num_images: 1,
        enable_safety_checker: false,
        guidance_scale: useProModel ? 7.5 : 3.5,  // Pro supports higher guidance for better adherence
        safety_tolerance: 6,  // Most permissive
      }),
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!response.ok) {
      const err = await response.text()
      console.error(`[Avatar] ${modelName} error (${response.status}):`, err.substring(0, 200))
      return null
    }

    const data = await response.json()
    const imageUrl = data.images?.[0]?.url

    if (!imageUrl) {
      console.error(`[Avatar] ${modelName}: no image URL`)
      return null
    }

    // Check for black placeholder
    if (await isBlackPlaceholder(imageUrl)) {
      console.warn(`[Avatar] ${modelName}: black placeholder returned`)
      return null
    }

    console.log(`[Avatar] ✅ ${modelName} success`)
    return imageUrl
  } catch (err: any) {
    clearTimeout(timeout)
    console.error(`[Avatar] ${modelName} error:`, err.message)
    return null
  }
}

// ─── Generate with Novita.ai (last resort) ─────────────────────────────
async function generateNovita(prompt: string, negPrompt: string, apiKey: string): Promise<string | null> {
  const fullPrompt = prompt +
    ', (masterpiece, best quality, photorealistic:1.4), RAW photo, 8k uhd' +
    ', detailed skin texture, realistic lighting, sharp focus'

  try {
    console.log('[Avatar] Trying Novita.ai...')
    const submitRes = await fetch(NOVITA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        extra: { response_image_type: 'jpeg', enable_nsfw_detection: false },
        request: {
          model_name: 'epicrealism_naturalSinRC1VAE_106430.safetensors',
          prompt: fullPrompt,
          negative_prompt: negPrompt,
          width: 768, height: 1024,
          image_num: 1, steps: 30, clip_skip: 2,
          guidance_scale: 7, sampler_name: 'DPM++ 2M Karras',
        },
      }),
    })

    if (!submitRes.ok) return null
    const submitData = await submitRes.json()
    const taskId = submitData.task_id
    if (!taskId) return null

    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 1500))
      const resultRes = await fetch(`${NOVITA_RESULT_URL}?task_id=${taskId}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      })
      if (!resultRes.ok) continue
      const resultData = await resultRes.json()
      if (resultData.task?.status === 'TASK_STATUS_SUCCEED') {
        const url = resultData.images?.[0]?.image_url
        if (url) { console.log('[Avatar] ✅ Novita success'); return url }
        return null
      }
      if (resultData.task?.status === 'TASK_STATUS_FAILED') return null
    }
    return null
  } catch (err) {
    console.error('[Avatar] Novita error:', err)
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
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { companionId, appearance, emotion = 'neutral' } = await request.json()

    // Anime characters use fixed avatar images — skip generation entirely
    if (appearance?.style === 'anime') {
      const avatarUrl = appearance.avatarUrl || '/avatars/anime/default.jpg'
      if (companionId) {
        await supabase
          .from('companions')
          .update({ avatar_url: avatarUrl })
          .eq('id', companionId)
          .eq('user_id', user.id)
      }
      return NextResponse.json({ url: avatarUrl })
    }

    // Build prompt with emphasis weights for key features
    const prompt = buildAvatarPrompt(appearance, emotion, true)
    const negativePrompt = buildNegativePrompt(appearance)

    console.log(`[Avatar] Appearance:`, JSON.stringify(appearance).substring(0, 300))
    console.log(`[Avatar] Prompt: ${prompt.substring(0, 400)}`)
    console.log(`[Avatar] Negative: ${negativePrompt.substring(0, 200)}`)

    const falKey = process.env.FAL_API_KEY!
    let imageUrl: string | null = null

    // Chain: Flux Pro → Flux Dev → Novita
    imageUrl = await generateFal(prompt, falKey, true)  // Flux Pro (best quality)

    if (!imageUrl) {
      imageUrl = await generateFal(prompt, falKey, false)  // Flux Dev (fallback)
    }

    if (!imageUrl && process.env.NOVITA_API_KEY) {
      imageUrl = await generateNovita(prompt, negativePrompt, process.env.NOVITA_API_KEY)
    }

    if (!imageUrl) {
      return NextResponse.json({ error: 'Avatar generation failed — all models tried' }, { status: 500 })
    }

    // Save as companion avatar
    if (companionId && emotion === 'neutral') {
      await supabase
        .from('companions')
        .update({ avatar_url: imageUrl })
        .eq('id', companionId)
        .eq('user_id', user.id)
    }

    return NextResponse.json({ url: imageUrl, prompt })
  } catch (err) {
    console.error('Avatar API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
