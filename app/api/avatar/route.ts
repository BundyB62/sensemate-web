import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { buildAvatarPrompt } from '@/lib/avatarPrompt'

const FAL_URL = 'https://fal.run/fal-ai/flux/schnell'

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

    const prompt = buildAvatarPrompt(appearance, emotion)

    const response = await fetch(FAL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${process.env.FAL_API_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        image_size: 'portrait_4_3',
        num_inference_steps: 8,
        num_images: 1,
        enable_safety_checker: false,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Fal.ai avatar error:', err)
      return NextResponse.json({ error: 'Avatar generation failed' }, { status: 500 })
    }

    const data = await response.json()
    const imageUrl = data.images?.[0]?.url

    if (!imageUrl) return NextResponse.json({ error: 'No image returned' }, { status: 500 })

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
