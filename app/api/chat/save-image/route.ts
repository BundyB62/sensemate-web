import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

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

    const { companionId, imageUrl } = await request.json()
    if (!companionId || !imageUrl) return NextResponse.json({ error: 'Missing data' }, { status: 400 })

    // Save as an image message in the messages table
    await supabase.from('messages').insert({
      companion_id: companionId,
      user_id: user.id,
      role: 'assistant',
      content: imageUrl,
      type: 'image',
      emotion: 'neutral',
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Save image error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
