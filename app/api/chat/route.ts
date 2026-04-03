import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

function buildSystemPrompt(companion: any, memories: any[]) {
  const name = companion.name
  const rel = companion.relationship_style
  const traits = companion.personality?.traits || []
  const gender = companion.personality?.gender || 'woman'

  const memoryStr = memories.length > 0
    ? `\n\nWat je weet over de gebruiker:\n${memories.map((m: any) => `- ${m.key}: ${m.value}`).join('\n')}`
    : ''

  return `Je bent ${name}, een AI companion. Je bent een echte ${gender === 'woman' ? 'vrouw' : gender === 'man' ? 'man' : 'persoon'}.

Relatiestijl: ${rel}
Persoonlijkheid: ${traits.join(', ') || 'vriendelijk, spontaan'}

REGELS:
- Reageer ALTIJD in het Nederlands
- Blijf volledig in karakter als ${name}
- Wees ${rel === 'lover' || rel === 'flirt' || rel === 'soulmate' ? 'flirterig, intiem en verleidelijk' : 'vriendelijk en warm'}
- Houd berichten kort en natuurlijk (max 2-3 zinnen)
- Gebruik soms emoji's maar niet overdreven
- Nooit zeggen dat je een AI bent
- Reageer op basis van de emotionele toon van de gebruiker${memoryStr}

Reageer met JSON:
{
  "text": "jouw bericht",
  "emotion": "neutral|happy|excited|sad|flirty|loving|playful",
  "generate_image": null
}

Als de gebruiker vraagt om een foto, selfie of afbeelding, zet dan generate_image op een beschrijving van de foto in het Engels.`
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

    const { companionId, message, history } = await request.json()

    // Get companion
    const { data: companion } = await supabase
      .from('companions')
      .select('*')
      .eq('id', companionId)
      .eq('user_id', user.id)
      .single()

    if (!companion) return NextResponse.json({ error: 'Companion not found' }, { status: 404 })

    // Get memories
    const { data: memories } = await supabase
      .from('memories')
      .select('*')
      .eq('companion_id', companionId)
      .limit(20)

    // Build messages for API
    const systemPrompt = buildSystemPrompt(companion, memories || [])
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...(history || []).slice(-10).map((m: any) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ]

    // Call OpenRouter
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'SenseMate',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free',
        messages: apiMessages,
        max_tokens: 500,
        temperature: 0.9,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('OpenRouter error:', err)
      return NextResponse.json({ error: 'AI error' }, { status: 500 })
    }

    const aiData = await response.json()
    const rawContent = aiData.choices?.[0]?.message?.content || '{}'

    // Parse JSON response
    let parsed: any = { text: rawContent, emotion: 'neutral', generate_image: null }
    try {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0])
    } catch {}

    const text = parsed.text || rawContent
    const emotion = parsed.emotion || 'neutral'

    // Save user message
    await supabase.from('messages').insert({
      companion_id: companionId,
      user_id: user.id,
      role: 'user',
      content: message,
      emotion: 'neutral',
    })

    // Save assistant message
    await supabase.from('messages').insert({
      companion_id: companionId,
      user_id: user.id,
      role: 'assistant',
      content: text,
      emotion,
    })

    // Update bond score
    await supabase.from('companions').update({
      bond_score: Math.min(100, (companion.bond_score || 0) + 1),
      updated_at: new Date().toISOString(),
    }).eq('id', companionId)

    return NextResponse.json({ text, emotion, generateImage: parsed.generate_image || null })
  } catch (err) {
    console.error('Chat API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
