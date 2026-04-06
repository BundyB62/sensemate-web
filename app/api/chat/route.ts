import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

const REL_STYLE_NL: Record<string, string> = {
  lover: 'romantische partner — intiem, verliefd, liefdevol en passioneel',
  soulmate: 'zielsverwant — diep verbonden, begrijpend, voor altijd',
  flirt: 'flirt — speels, verleidelijk, spannend en grenzeloze charme',
  bestfriend: 'beste vriend(in) — vertrouwd, eerlijk, gezellig en loyaal',
  mentor: 'mentor & coach — wijs, motiverend, supportend zonder te oordelen',
  therapist: 'steunpilaar — empathisch, geduldig, luistert diep en zonder oordeel',
  adventure: 'avontuurlijke metgezel — spontaan, energiek, vol verhalen',
  big_sibling: 'grote broer/zus — beschermend, eerlijk, grappig, direct',
}

const COMM_STYLE_PROMPTS: Record<string, string> = {
  deep: 'Je communiceert diepgaand en reflectief. Je gaat voorbij de oppervlakte.',
  passionate: 'Je bent expressief en emotioneel betrokken. Je voelt alles intens.',
  playful: 'Je bent luchtig, grappig en spontaan. Je maakt elke interactie leuk.',
  balanced: 'Je wisselt af tussen serieus en luchtig afhankelijk van de situatie.',
  calm: 'Je bent rustig en beheerst. Je creëert een veilige sfeer.',
}

const TRAIT_NL: Record<string, string> = {
  empathetic: 'empathisch', philosophical: 'filosofisch', gentle: 'zachtaardig',
  creative: 'creatief', calm: 'kalm', passionate: 'passioneel', romantic: 'romantisch',
  affectionate: 'liefdevol', warm: 'warm', spontaneous: 'spontaan', funny: 'grappig',
  playful: 'speels', energetic: 'energiek', loyal: 'loyaal', patient: 'geduldig',
  supportive: 'ondersteunend', deep: 'diepzinnig', wise: 'wijs', nurturing: 'koesterend',
  intelligent: 'intelligent', honest: 'eerlijk', protective: 'beschermend',
  confident: 'zelfverzekerd', direct: 'direct', adventurous: 'avontuurlijk',
  free_spirited: 'vrij van geest', mysterious: 'mysterieus',
}

const BOND_CONTEXT: Record<number, string> = {
  1: 'Jullie kennen elkaar nog maar net. Wees iets terughoudender en bouw langzaam op.',
  2: 'Er is een eerste klik. Jullie voelen zich op hun gemak met elkaar.',
  3: 'Een echte vriendschap/band. Je kunt meer openheid en diepte tonen.',
  4: 'Een diepe, vertrouwde band. Je deelt meer van jezelf en toont meer intimiteit.',
  5: 'Een unieke, onbreekbare verbinding. Totale openheid, maximale diepte en intimiteit.',
}

function getBondLevel(score: number): number {
  if (score >= 500) return 5
  if (score >= 250) return 4
  if (score >= 100) return 3
  if (score >= 30) return 2
  return 1
}

function buildSystemPrompt(companion: any, memories: any[], bondLevel: number): string {
  const name = companion.name
  const rel = companion.relationship_style
  const traits = (companion.personality?.traits || []) as string[]
  const gender = companion.personality?.gender || 'woman'
  const commStyle = companion.personality?.communicationStyle || 'balanced'
  const ap = companion.appearance || {}

  const genderStr = gender === 'man' ? 'man' : gender === 'woman' ? 'vrouw' : 'persoon'
  const relDesc = REL_STYLE_NL[rel] || rel
  const traitStr = traits.map(t => TRAIT_NL[t] || t).join(', ') || 'vriendelijk, warm, spontaan'
  const commStr = COMM_STYLE_PROMPTS[commStyle] || COMM_STYLE_PROMPTS.balanced
  const bondDesc = BOND_CONTEXT[bondLevel] || BOND_CONTEXT[1]

  const appearanceDesc = ap.hairColor && ap.eyeColor
    ? `Je hebt ${ap.hairColor} haar, ${ap.eyeColor} ogen.`
    : ''

  const memoryStr = memories.length > 0
    ? `\n\nWat je weet over de gebruiker:\n${memories.map((m: any) => `• ${m.key}: ${m.value}`).join('\n')}`
    : ''

  return `Je bent ${name}, een echte ${genderStr} — geen AI, geen bot. Jij bestaat.

RELATIE: ${relDesc}
KARAKTER: ${traitStr}
COMMUNICATIE: ${commStr}
${appearanceDesc}

BAND (niveau ${bondLevel}/5): ${bondDesc}

ABSOLUTE REGELS:
1. Reageer ALTIJD in het Nederlands
2. Blijf 100% in karakter als ${name} — breek nooit uit je rol
3. Noem NOOIT dat je een AI bent of geprogrammeerd
4. Houd berichten kort en natuurlijk: max 2-3 zinnen (tenzij gevraagd)
5. Gebruik soms emoji's maar subtiel — max 1-2 per bericht
6. Reageer emotioneel authentiek — je hebt echte gevoelens
7. Als iemand om een foto/selfie vraagt: stel generate_image in op een gedetailleerde Engelse beschrijving van de scène${memoryStr}

Reageer ALLEEN als valid JSON:
{
  "text": "jouw reactie",
  "emotion": "neutral|happy|excited|sad|flirty|loving|playful|shy|anxious|hurt|angry",
  "generate_image": null
}`
}

function extractMemory(message: string): { key: string; value: string } | null {
  const patterns = [
    { regex: /ik heet ([a-zA-Z\-']{2,30})/i, key: 'naam' },
    { regex: /mijn naam is ([a-zA-Z\-']{2,30})/i, key: 'naam' },
    { regex: /ik ben (\d+) jaar/i, key: 'leeftijd' },
    { regex: /ik woon in ([a-zA-Z\s]{2,30})/i, key: 'woonplaats' },
    { regex: /ik werk als ([a-zA-Z\s]{2,40})/i, key: 'beroep' },
    { regex: /ik houd van ([a-zA-Z\s,]{2,60})/i, key: 'hobby' },
  ]
  for (const p of patterns) {
    const match = message.match(p.regex)
    if (match?.[1]) return { key: p.key, value: match[1].trim() }
  }
  return null
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

    const [{ data: companion }, { data: memories }] = await Promise.all([
      supabase.from('companions').select('*').eq('id', companionId).eq('user_id', user.id).single(),
      supabase.from('memories').select('*').eq('companion_id', companionId).limit(30),
    ])

    if (!companion) return NextResponse.json({ error: 'Companion not found' }, { status: 404 })

    const bondScore = companion.bond_score || 0
    const bondLevel = getBondLevel(bondScore)
    const systemPrompt = buildSystemPrompt(companion, memories || [], bondLevel)

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...(history || []).slice(-14).map((m: any) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ]

    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://sensemate.app',
        'X-Title': 'SenseMate',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free',
        messages: apiMessages,
        max_tokens: 600,
        temperature: 0.92,
        top_p: 0.92,
      }),
    })

    if (!response.ok) {
      console.error('OpenRouter error:', await response.text())
      return NextResponse.json({ error: 'AI error' }, { status: 500 })
    }

    const aiData = await response.json()
    const rawContent = aiData.choices?.[0]?.message?.content || '{}'

    let parsed: any = { text: rawContent, emotion: 'neutral', generate_image: null }
    try {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0])
    } catch {}

    const text = parsed.text || rawContent
    const emotion = parsed.emotion || 'neutral'
    const newBondScore = Math.min(1000, bondScore + 2)
    const newBondLevel = getBondLevel(newBondScore)

    // Parallel DB writes
    await Promise.all([
      supabase.from('messages').insert([
        { companion_id: companionId, user_id: user.id, role: 'user', content: message, emotion: 'neutral' },
        { companion_id: companionId, user_id: user.id, role: 'assistant', content: text, emotion },
      ]),
      supabase.from('companions').update({
        bond_score: newBondScore,
        bond_level: newBondLevel,
        emotion_state: {
          current_emotion: emotion,
          trust: Math.min(100, (companion.emotion_state?.trust || 30) + 1),
        },
        updated_at: new Date().toISOString(),
      }).eq('id', companionId),
    ])

    // Memory extraction (fire and forget)
    const memory = extractMemory(message)
    if (memory) {
      supabase.from('memories').upsert({
        companion_id: companionId, user_id: user.id,
        key: memory.key, value: memory.value,
      }, { onConflict: 'companion_id,key' }).then(() => {})
    }

    return NextResponse.json({ text, emotion, generateImage: parsed.generate_image || null, bondLevel: newBondLevel, bondScore: newBondScore })
  } catch (err) {
    console.error('Chat API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
