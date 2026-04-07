import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { buildAvatarPrompt } from '@/lib/avatarPrompt'

// Flux Dev — high quality, 30 steps, no content filter
const FAL_URL = 'https://fal.run/fal-ai/flux/dev'
// Novita.ai — fallback when Flux blocks the prompt
const NOVITA_URL = 'https://api.novita.ai/v3/async/txt2img'
const NOVITA_RESULT_URL = 'https://api.novita.ai/v3/async/task-result'

// ─── Generate with Novita.ai (NSFW-safe fallback) ──────────────────────────
async function generateNovita(prompt: string, apiKey: string): Promise<string | null> {
  const fullPrompt = prompt +
    ', (masterpiece, best quality, photorealistic:1.4), RAW photo, 8k uhd' +
    ', detailed skin texture, realistic lighting, natural colors, sharp focus, film grain'

  const negativePrompt =
    'cartoon, anime, illustration, painting, drawing, sketch, 3d render, cgi, ' +
    'deformed, ugly, blurry, low quality, bad anatomy, bad proportions, ' +
    'extra fingers, mutated hands, poorly drawn face, disfigured, watermark, text, ' +
    'nude, naked, topless, nsfw, explicit'

  try {
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
      console.error(`[Avatar] Novita submit error (${submitRes.status})`)
      return null
    }

    const submitData = await submitRes.json()
    const taskId = submitData.task_id
    if (!taskId) return null

    console.log(`[Avatar] Novita task: ${taskId}`)

    // Poll for result (max 45 seconds)
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 1500))
      const resultRes = await fetch(`${NOVITA_RESULT_URL}?task_id=${taskId}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      })
      if (!resultRes.ok) continue
      const resultData = await resultRes.json()
      const status = resultData.task?.status
      if (status === 'TASK_STATUS_SUCCEED') {
        const imageUrl = resultData.images?.[0]?.image_url
        if (imageUrl) {
          console.log(`[Avatar] Novita success after ${(i + 1) * 1.5}s`)
          return imageUrl
        }
        return null
      }
      if (status === 'TASK_STATUS_FAILED') {
        console.error('[Avatar] Novita task failed:', resultData.task?.reason)
        return null
      }
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

    console.log(`[Avatar] Appearance:`, JSON.stringify(appearance).substring(0, 300))

    // SFW mode for profile avatar — skip explicit body parts, use appropriate clothing
    const prompt = buildAvatarPrompt(appearance, emotion, true)
    console.log(`[Avatar] SFW Prompt: ${prompt.substring(0, 300)}`)

    let imageUrl: string | null = null

    // Try Flux Dev first (best quality)
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 45000)

      const response = await fetch(FAL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Key ${process.env.FAL_API_KEY}`,
        },
        body: JSON.stringify({
          prompt,
          image_size: 'portrait_4_3',
          num_inference_steps: 30,
          num_images: 1,
          enable_safety_checker: false,
          guidance_scale: 3.5,
        }),
        signal: controller.signal,
      })
      clearTimeout(timeout)

      if (response.ok) {
        const falData = await response.json()
        const url = falData.images?.[0]?.url
        console.log(`[Avatar] Flux response: ${url ? 'got URL' : 'no URL'} — ${JSON.stringify(falData).substring(0, 150)}`)

        if (url) {
          // Check for black placeholder image (blocked by safety filter)
          try {
            const head = await fetch(url, { method: 'HEAD' })
            const size = parseInt(head.headers.get('content-length') || '0', 10)
            if (size > 0 && size < 25000) {
              console.log(`[Avatar] Flux returned black placeholder (${size} bytes), trying Novita...`)
              imageUrl = null // Force fallback
            } else {
              imageUrl = url
              console.log(`[Avatar] ✅ Flux Dev success`)
            }
          } catch {
            imageUrl = url // If HEAD fails, use it anyway
          }
        }
      } else {
        console.error(`[Avatar] Flux Dev error: ${response.status}`)
      }
    } catch (err) {
      console.error('[Avatar] Flux Dev failed:', err)
    }

    // Fallback to Novita.ai if Flux failed or returned black placeholder
    if (!imageUrl && process.env.NOVITA_API_KEY) {
      console.log('[Avatar] Falling back to Novita.ai...')
      imageUrl = await generateNovita(prompt, process.env.NOVITA_API_KEY)
    }

    if (!imageUrl) {
      return NextResponse.json({ error: 'Avatar generation failed' }, { status: 500 })
    }

    // Save as companion avatar_url if requested
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
