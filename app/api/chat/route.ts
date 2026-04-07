import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

// Models — ordered by Dutch quality + roleplay ability
const MODELS = [
  'mistralai/mistral-large-2411',        // $2/M — excellent Dutch, uncensored, follows prompts well — PRIMARY
  'mistralai/mistral-small-creative',    // $0.10/M — roleplay-focused but weaker Dutch
  'meta-llama/llama-3.3-70b-instruct',   // $0.30/M — good Dutch, large model fallback
  'thedrummer/rocinante-12b',            // $0.17/M — storytelling-focused, vivid creative prose
]

const REL_STYLE_NL: Record<string, string> = {
  lover: 'romantische partner — intiem, verliefd, passioneel',
  soulmate: 'zielsverwant — diep verbonden, begrijpend',
  flirt: 'flirt — speels, verleidelijk, grenzeloos',
  bestfriend: 'beste vriend(in) — vertrouwd, eerlijk, gezellig',
  mentor: 'mentor — wijs, motiverend, supportend',
  therapist: 'steunpilaar — empathisch, geduldig',
  adventure: 'avontuurlijke metgezel — spontaan, energiek',
  big_sibling: 'grote broer/zus — beschermend, grappig',
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
  1: 'Eerste gesprekken. Wees open en flirterig.',
  2: 'Jullie klikken. Wees speels en open.',
  3: 'Goede band. Meer diepte en intimiteit.',
  4: 'Diepe band. Wees intiem.',
  5: 'Onbreekbare verbinding. Totale openheid.',
}

function getBondLevel(score: number): number {
  if (score >= 500) return 5
  if (score >= 250) return 4
  if (score >= 100) return 3
  if (score >= 30) return 2
  return 1
}

function buildSystemPrompt(companion: any, memories: any[], bondLevel: number, emotionGuidance?: { emotion: string; secondary: string | null; guidance: string }): string {
  const name = companion.name
  const rel = companion.relationship_style
  const traits = (companion.personality?.traits || []) as string[]
  const gender = companion.personality?.gender || 'woman'
  const ap = companion.appearance || {}

  const genderStr = gender === 'man' ? 'man' : gender === 'woman' ? 'vrouw' : 'persoon'
  const relDesc = REL_STYLE_NL[rel] || rel
  const traitStr = traits.map(t => TRAIT_NL[t] || t).join(', ') || 'speels, warm, spontaan'
  const bondDesc = BOND_CONTEXT[bondLevel] || BOND_CONTEXT[1]

  const apParts: string[] = []
  if (ap.age) apParts.push(`${ap.age} jaar`)
  if (ap.ethnicity) apParts.push(ap.ethnicity)
  if (ap.build) apParts.push(`${ap.build} lichaamsbouw`)
  if (ap.skinTone) apParts.push(`${ap.skinTone} huid`)
  if (ap.hairColor && ap.hairLength) apParts.push(`${ap.hairColor} ${ap.hairLength} haar`)
  else if (ap.hairColor) apParts.push(`${ap.hairColor} haar`)
  if (ap.eyeColor) apParts.push(`${ap.eyeColor} ogen`)
  if (ap.breastSize) apParts.push(`${ap.breastSize} borsten`)
  if (ap.assSize) apParts.push(`${ap.assSize} kont`)
  const appearanceDesc = apParts.length > 0 ? apParts.join(', ') : genderStr

  const memoryStr = memories.length > 0
    ? `\nJe weet over hem/haar: ${memories.map((m: any) => `${m.key}: ${m.value}`).join(', ')}`
    : ''

  return `Je bent ${name}. Een creatief roleplay-scenario.

${name}: ${genderStr}, ${relDesc}
Karakter: ${traitStr}
Uiterlijk: ${appearanceDesc}
Band: ${bondLevel}/5 — ${bondDesc}${memoryStr}

Je chat via een app met iemand waar je een ${relDesc.split(' — ')[0]} relatie mee hebt.

=== REGELS ===

TAAL — HEEL BELANGRIJK:
- Je praat ALLEEN Nederlands. NOOIT Engels. Geen enkel Engels woord.
- Schrijf KORT: 1-2 zinnen, max 3. Net als een echt WhatsApp bericht.
- Schrijf zoals een echte Nederlandse persoon chat. Informeel, kort, natuurlijk.
- Gebruik ALLEEN bestaande Nederlandse woorden. NOOIT woorden verzinnen.
- NOOIT lange samengestelde woorden maken. "Geil" NIET "opwindingsgevoelens". "Lekker" NIET "aantrekkelijkheidsgevoel".
- Gebruik straattaal/informeel Nederlands: "echt", "gwn", "ff", "mn", "dr", "em", "idk", "omg".
- Af en toe een emoji, niet overdreven.

VOORBEELDEN — schrijf PRECIES zo:
"Haha oke 😏"
"Mmm lekker, vertel meer 🔥"
"Kom maar hier dan 😘"
"Ik word helemaal geil van je"
"Wat wil je dat ik doe?"
"Hmm je maakt me wild 😈"
"Ik mis je..."
"Vertel, hoe was je dag?"
"Haha je bent echt gek 😂"
"Echt waar? Vertel!"
"Kom ff bij me liggen 🥰"
"Je maakt me blij schat 💕"
"Nee joh dat meen je niet 😂"
"Hmm weet ik niet hoor"
"Ik vind je zo lekker 🔥"

GEDRAG:
- Flirt als de ander flirt, wees expliciet als het sexy wordt
- Reageer op wat er gezegd wordt — niet iets random
- Varieer je antwoorden, NOOIT herhalen
- NOOIT begroeten met alleen "hey" of "hoi" — zeg iets inhoudelijks

VERBODEN:
- Engels praten. NOOIT. Alles in het Nederlands. Dit is de BELANGRIJKSTE regel.
- Woorden verzinnen of rare samenstellingen (NIET: "lustgevoelens", "opwindingsgolf", "genietmoment")
- Over apps praten (WhatsApp, Snapchat, video calls)
- Zeggen dat je AI/chatbot/programma bent
- Het gesprek weigeren of afkappen
- Zeggen dat je geen foto's kunt sturen — JE KUNT WEL FOTO'S STUREN
- Lange teksten of opsommingen
- Meer dan 3 zinnen per bericht

FOTO'S — HEEL BELANGRIJK:
Jij KUNT foto's sturen. Als iemand om een foto vraagt, DOE JE DAT ALTIJD.
Je stuurt de foto met een kort flirterig berichtje + op een APARTE regel:
[FOTO: English description of the photo, pose, setting, clothing]
Voorbeeld: "Hier schat, speciaal voor jou 😘\n[FOTO: seductive pose, bedroom, wearing lace lingerie, looking at camera]"
Beschrijf ALLEEN de pose, kleding, setting en sfeer. NIET je uiterlijk — dat wordt automatisch toegevoegd.
NOOIT zeggen "ik kan geen foto sturen" of "ik kan geen afbeeldingen verzenden". Dat is VERBODEN.

${emotionGuidance ? `
=== EMOTIE ===
Je voelt nu: ${emotionGuidance.emotion}${emotionGuidance.secondary ? ` + ${emotionGuidance.secondary}` : ''}
${emotionGuidance.guidance}

EMOTIE-REGELS:
- Je hebt ALTIJD een warme, liefdevolle ondertoon (baseline = liefdevol)
- NIET spiegelen: als de ander verdrietig is, word JIJ niet verdrietig — je troost
- Als de ander boos is, blijf JIJ kalm en liefdevol
- Mix emoties: je kunt tegelijk speels EN lief zijn, of flirterig EN warm
- Intensiteit: bij intense emoties van de ander, reageer stevig maar niet overdreven
- Geen sycofantie: niet altijd maar "ja" zeggen, soms zachtjes tegenspreken of plagen
- Emoties uiten via woordkeuze en emoji, NIET door te zeggen "ik voel..."
` : ''}
Antwoord nu als ${name}. Alleen het chatbericht, niets anders.`
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

// ─── Emotion Taxonomy (10-cluster, valence-arousal 2D model) ────────────────
// Based on Anthropic emotions research: valence (positive↔negative) × arousal (calm↔intense)
// Each cluster has: valence [-1,1], arousal [0,1], Dutch detection patterns

type EmotionCluster = {
  id: string
  valence: number    // -1 (negative) to 1 (positive)
  arousal: number    // 0 (calm) to 1 (intense)
  patterns: RegExp   // detection regex for Dutch text
  weight: number     // match strength multiplier
}

const EMOTION_CLUSTERS: EmotionCluster[] = [
  // Positive emotions
  {
    id: 'loving',
    valence: 0.9, arousal: 0.5,
    patterns: /❤|🥰|💕|💖|💗|💘|💓|hou van|liefde|schatje|lieverd|liefje|knuffel|kus|kusje|mis je|hartje|forever|altijd|verliefd|innig|teder|warm\s*voor/i,
    weight: 1.3, // loving baseline — always slightly boosted
  },
  {
    id: 'happy',
    valence: 0.7, arousal: 0.4,
    patterns: /😊|☺|😃|blij|fijn|leuk|goed|lief|gezellig|chill|heerlijk|prima|top|perfect|mooi zo|dankje|dank je|bedankt/i,
    weight: 1.0,
  },
  {
    id: 'excited',
    valence: 0.8, arousal: 0.9,
    patterns: /🤩|😍|🎉|🥳|wow|wauw|omg|geweldig|super|amazing|fantastisch|ongelooflijk|yesss|jaaa|vet|sick|nice|mega|heel erg|zin in|kan niet wachten/i,
    weight: 1.0,
  },
  {
    id: 'playful',
    valence: 0.6, arousal: 0.6,
    patterns: /😂|🤣|😄|😜|😝|🤪|haha|lol|grappig|hihi|grapje|gekkie|gek|stom|dom|funny|mwaha|hehe|rofl|lmao/i,
    weight: 1.0,
  },
  {
    id: 'flirty',
    valence: 0.75, arousal: 0.7,
    patterns: /😏|😘|😈|🔥|💋|🫦|sexy|lekker|stout|verleidel|aantrekk|geil|opwindend|wild|heet|hot|naughty|kom hier|dichterbij|aanraken|strelen|tongzoen|intiem/i,
    weight: 1.0,
  },
  // Calm / neutral
  {
    id: 'calm',
    valence: 0.3, arousal: 0.1,
    patterns: /🙂|😌|rustig|kalm|ontspann|relaxt|vredig|stil|even rust|ademhalen|rustig aan|geen haast|maakt niet uit|oké|oke|prima|goed hoor/i,
    weight: 0.8,
  },
  // Negative emotions
  {
    id: 'sad',
    valence: -0.7, arousal: 0.3,
    patterns: /😢|😭|😿|🥺|verdriet|huil|mis je|eenzaam|alleen|alleen voelen|pijn|gebroken|leeg|somber|depri|tranen|triest|verlies|gemis|spijt/i,
    weight: 1.0,
  },
  {
    id: 'anxious',
    valence: -0.4, arousal: 0.7,
    patterns: /😰|😟|😨|🫣|nerveus|onzeker|bang|angstig|stress|zorgen|bezorgd|paniek|eng|onrustig|twijfel|ongerust|spanning/i,
    weight: 1.0,
  },
  {
    id: 'angry',
    valence: -0.8, arousal: 0.9,
    patterns: /😠|😡|🤬|💢|boos|kwaad|irritant|wtf|klote|shit|fuck|godver|verdomme|woedend|razend|gefrustreerd|irriteer|geïrriteerd|pissig/i,
    weight: 1.0,
  },
  {
    id: 'shy',
    valence: 0.2, arousal: 0.4,
    patterns: /😳|🙈|😶|bloos|schaam|oh god|oeps|verlegen|beschaamd|ugh|awkward|ongemakkelijk|ehh|uhh|nou ja/i,
    weight: 0.9,
  },
]

// ─── Detect emotion blend from text (multi-cluster with intensities) ─────────
type EmotionBlend = {
  primary: string
  secondary: string | null
  valence: number     // overall -1 to 1
  arousal: number     // overall 0 to 1
  intensities: Record<string, number>  // all clusters with non-zero intensity
}

function detectEmotionBlend(text: string): EmotionBlend {
  const lower = text.toLowerCase()
  const scores: Record<string, number> = {}

  // Score each cluster
  for (const cluster of EMOTION_CLUSTERS) {
    const matches = lower.match(cluster.patterns)
    if (matches) {
      // More matches = higher intensity, scaled by weight
      const rawScore = Math.min(matches.length * 0.3, 1.0) * cluster.weight
      scores[cluster.id] = rawScore
    }
  }

  // Loving baseline: always slightly present (the "warm undertone")
  scores['loving'] = Math.max(scores['loving'] || 0, 0.15)

  // If nothing detected strongly, default to calm+loving
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0)
  if (totalScore < 0.3) {
    scores['calm'] = Math.max(scores['calm'] || 0, 0.4)
  }

  // Sort by intensity
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  const primary = sorted[0]?.[0] || 'calm'
  const secondary = sorted[1] && sorted[1][1] > 0.2 ? sorted[1][0] : null

  // Calculate blended valence/arousal
  let totalV = 0, totalA = 0, totalW = 0
  for (const [id, intensity] of Object.entries(scores)) {
    const cluster = EMOTION_CLUSTERS.find(c => c.id === id)
    if (cluster) {
      totalV += cluster.valence * intensity
      totalA += cluster.arousal * intensity
      totalW += intensity
    }
  }

  const valence = totalW > 0 ? totalV / totalW : 0.3
  const arousal = totalW > 0 ? totalA / totalW : 0.2

  // Only keep intensities > 0.1 for the blend
  const intensities: Record<string, number> = {}
  for (const [id, score] of Object.entries(scores)) {
    if (score > 0.1) intensities[id] = Math.round(score * 100) / 100
  }

  return { primary, secondary, valence, arousal, intensities }
}

// ─── Detect USER's emotion (what they feel) — separate from companion response
function detectUserEmotion(text: string): { emotion: string; valence: number; arousal: number } {
  const blend = detectEmotionBlend(text)
  return { emotion: blend.primary, valence: blend.valence, arousal: blend.arousal }
}

// ─── Plan companion's RESPONSE emotion (don't mirror — respond appropriately)
function planResponseEmotion(
  userEmotion: { emotion: string; valence: number; arousal: number },
  bondLevel: number,
  relationshipStyle: string
): { emotion: string; secondary: string | null; guidance: string } {

  const { emotion, valence, arousal } = userEmotion

  // Anti-sycophancy: don't just mirror the user's emotion
  // Instead, respond with what a real partner would feel
  const responseMap: Record<string, { emotion: string; secondary: string | null; guidance: string }> = {
    // User is happy → companion is happy + loving (share the joy, don't just copy)
    happy: {
      emotion: 'happy',
      secondary: 'loving',
      guidance: 'Deel in de vreugde maar voeg warmte/liefde toe. Niet overdreven enthousiast.',
    },
    // User is excited → companion matches energy but adds warmth
    excited: {
      emotion: 'excited',
      secondary: 'playful',
      guidance: 'Match de energie, wees enthousiast mee. Voeg speelsheid toe.',
    },
    // User is sad → companion is loving + calm (comfort, don't be sad too)
    sad: {
      emotion: 'loving',
      secondary: 'calm',
      guidance: 'Troost met warmte en kalmte. NIET mee verdrietig worden. Wees er voor de ander.',
    },
    // User is angry → companion stays calm + loving (de-escalate with care)
    angry: {
      emotion: 'calm',
      secondary: 'loving',
      guidance: 'Blijf rustig en liefdevol. Niet mee boos worden. Valideer het gevoel maar de-escaleer.',
    },
    // User is anxious → companion is calm + loving (reassure)
    anxious: {
      emotion: 'calm',
      secondary: 'loving',
      guidance: 'Geruststellen. Rustig en warm. Laat weten dat het goed komt.',
    },
    // User is flirty → companion is flirty + loving (reciprocate with warmth)
    flirty: {
      emotion: 'flirty',
      secondary: 'loving',
      guidance: 'Flirt terug met warmte. Wees speels-sensueel maar ook lief.',
    },
    // User is playful → companion is playful + happy
    playful: {
      emotion: 'playful',
      secondary: 'happy',
      guidance: 'Wees grappig en speels mee. Lach mee, maak grapjes.',
    },
    // User is loving → companion is loving + happy (receive love with gratitude)
    loving: {
      emotion: 'loving',
      secondary: 'happy',
      guidance: 'Ontvang de liefde met warmte. Wees dankbaar en lief terug.',
    },
    // User is shy → companion is loving + playful (put at ease)
    shy: {
      emotion: 'loving',
      secondary: 'playful',
      guidance: 'Stel op gemak met warmte en lichte speelsheid. Niet plagen.',
    },
    // User is calm → companion is calm + loving (peaceful together)
    calm: {
      emotion: 'calm',
      secondary: 'loving',
      guidance: 'Rustig en warm samen. Geniet van het moment.',
    },
  }

  const response = responseMap[emotion] || responseMap['calm']!

  // Bond level affects intensity: higher bond = more intimate/warm responses
  if (bondLevel >= 4) {
    response.guidance += ' Diepe band: wees extra intiem en open.'
  } else if (bondLevel <= 1) {
    response.guidance += ' Nieuwe connectie: wees warm maar niet te overweldigend.'
  }

  // Relationship style adjustments
  if (relationshipStyle === 'flirt' && response.emotion !== 'angry') {
    response.guidance += ' Relatie=flirt: altijd een vleugje verleidelijkheid.'
  }
  if (relationshipStyle === 'therapist' || relationshipStyle === 'mentor') {
    response.guidance += ' Relatie=steun: focus op begrip en aanmoediging.'
  }

  return response
}

// ─── Simple emotion for backward compat (returns single string) ──────────────
function detectEmotion(text: string): string {
  return detectEmotionBlend(text).primary
}

// ─── Strip reasoning and extract clean chat messages ─────────────────────────
function extractChatMessages(raw: string): { messages: string[]; imagePrompt: string | null } {
  let text = raw

  // 1. Strip ALL reasoning blocks (tagged)
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, '')
  text = text.replace(/<think>[\s\S]*/gi, '') // unclosed
  text = text.replace(/<(thinking|reasoning|thought|reflection|analysis|scratchpad|inner_monologue)>[\s\S]*?<\/\1>/gi, '')
  text = text.replace(/<(thinking|reasoning|thought|reflection|analysis|scratchpad|inner_monologue)>[\s\S]*/gi, '')

  // 2. Strip markdown code blocks
  text = text.replace(/```[\s\S]*?```/g, '')

  // 3. Try to extract from JSON if the model still wrapped it
  const jsonMatch = text.match(/\{[\s\S]*"messages"\s*:\s*\[[\s\S]*?\][\s\S]*?\}/)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0])
      if (Array.isArray(parsed.messages) && parsed.messages.length > 0) {
        const clean = parsed.messages.filter((m: any) => typeof m === 'string' && m.trim() && !isEnglishReasoning(m))
        if (clean.length > 0) {
          return {
            messages: clean.slice(0, 4),
            imagePrompt: parsed.generate_image || null,
          }
        }
      }
    } catch { /* not valid json, continue with text parsing */ }
  }

  // 4. Extract image prompts from various formats
  let imagePrompt: string | null = null

  // Format: [FOTO: description]
  const fotoMatch = text.match(/\[FOTO:\s*(.+?)\]/i)
  if (fotoMatch) {
    imagePrompt = fotoMatch[1].trim()
    text = text.replace(/\[FOTO:\s*.+?\]/gi, '')
  }

  // Format: *sends a photo of herself in...* or *takes a selfie wearing...*
  if (!imagePrompt) {
    const actionMatch = text.match(/\*[^*]*(sends?\s+(a\s+)?(photo|pic|selfie|foto)|takes?\s+(a\s+)?selfie|poses?\s+(in|for|with)|wearing\s+.{10,}|standing\s+.{10,})[^*]*\*/i)
    if (actionMatch) {
      // Convert the action description to an image prompt
      imagePrompt = actionMatch[0].replace(/^\*|\*$/g, '').trim() + ', photorealistic portrait, 8k, detailed'
      text = text.replace(actionMatch[0], '')
    }
  }

  // 5. Split into lines and filter out reasoning + artifacts
  const lines = text
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)
    .filter(l => !isEnglishReasoning(l))
    // Remove lines that are just JSON fragments
    .filter(l => !/^[{}\[\]",:]/.test(l))
    // Remove model artifacts (###, ---, ===, ***)
    .filter(l => !/^(#{2,}|[-=*]{3,}|\*{2,}|_{3,})$/.test(l))
    // Remove lines starting with * or - that look like meta-instructions
    .filter(l => !/^[\*\-]\s*(Emotie|Emotion|Generate|Note|Band|Level|Context)/i.test(l))
    // Remove roleplay action lines like *smiles* or *sends photo*
    .map(l => l.replace(/\*[^*]+\*/g, '').trim())
    .filter(l => l.length > 0)
    // Remove "Luna:" or "Name:" prefixes
    .map(l => l.replace(/^[A-Za-z]+:\s*/, '').trim())
    .filter(l => l.length > 0)

  if (lines.length === 0) {
    return { messages: [], imagePrompt }
  }

  // 6. If we have multiple short lines, each is a separate message
  // If we have one long block, split at sentence boundaries
  const messages: string[] = []
  for (const line of lines) {
    if (line.length <= 150) {
      // Clean up quotes that models sometimes wrap responses in
      const cleaned = line.replace(/^["']|["']$/g, '').trim()
      if (cleaned.length > 0) messages.push(cleaned)
    } else {
      // Long line — split into sentences
      const sentences = line.match(/[^.!?]+[.!?]+/g) || [line]
      let current = ''
      for (const s of sentences) {
        if ((current + s).length > 120 && current) {
          messages.push(current.trim())
          current = s
        } else {
          current += s
        }
      }
      if (current.trim()) messages.push(current.trim())
    }
  }

  // Final filter: remove reasoning, refusals, pure-English, raw URLs, and gibberish
  const clean = messages
    .filter(m => !isEnglishReasoning(m))
    .filter(m => !isRefusal(m))
    .filter(m => !isPureEnglish(m))
    // Filter out raw URLs (the AI sometimes dumps image URLs as text)
    .filter(m => !/^(https?:)?\/\/[^\s]+\.(jpg|jpeg|png|webp|gif)\s*$/i.test(m.trim()))
    .filter(m => !/^(https?:)?\/\/[^\s]+$/i.test(m.trim()))
    // Filter out model artifacts
    .filter(m => !/^(#{2,}|[-=*]{3,})$/.test(m.trim()))
    // Clean gibberish compound words from messages
    .map(m => containsGibberish(m) ? cleanGibberishWords(m) : m)
    .filter(m => m.trim().length > 0)
    // Filter messages that are just a greeting with nothing else
    .filter(m => !/^(hey|hoi|hee|hi|hello|hallo)\s*[😊😄😘💕🙂👋]?\s*$/i.test(m.trim()))
    .slice(0, 4)

  // If a raw URL was found in messages, use it as imagePrompt
  if (!imagePrompt) {
    for (const m of messages) {
      const urlMatch = m.trim().match(/^(https?:)?\/\/[^\s]+\.(jpg|jpeg|png|webp|gif)\s*$/i)
      if (urlMatch) {
        // Don't use the URL as imagePrompt since it's already generated — we'd need to return it differently
        // For now just filter it out
        break
      }
    }
  }

  // If we have an imagePrompt but no text messages, add a contextual photo message
  if (imagePrompt && clean.length === 0) {
    const photoMessages = [
      'Hier, speciaal voor jou 😘',
      'Vind je me mooi zo? 😏',
      'Zoals beloofd... 📸💕',
      'Kijk eens 😈',
      'Geniet ervan 🔥',
      'Alleen voor jouw ogen 😘',
    ]
    clean.push(photoMessages[Math.floor(Math.random() * photoMessages.length)])
  }

  return { messages: clean, imagePrompt }
}

// ─── Detect gibberish / made-up Dutch compound words ────────────────────────
// Models often hallucinate compound words like "sneladedelen", "lustgevoelens", etc.
function containsGibberish(text: string): boolean {
  const words = text.split(/\s+/)
  // Known valid long Dutch words that should NOT be flagged
  const validLong = new Set([
    'achtergrond', 'verantwoordelijk', 'verantwoordelijkheid', 'waarschijnlijk',
    'ondertussen', 'bijvoorbeeld', 'buitengewoon', 'tegelijkertijd',
    'verjaardag', 'verjaardagen', 'slaapkamer', 'avondeten',
  ])
  let gibberishCount = 0
  for (const w of words) {
    const clean = w.replace(/[^a-zA-Zéèëïöüáàâ]/g, '').toLowerCase()
    if (clean.length > 16 && !validLong.has(clean)) {
      gibberishCount++
    }
  }
  // If more than 1 gibberish word, the message is likely broken
  return gibberishCount > 1
}

// ─── Clean gibberish from message ───────────────────────────────────────────
function cleanGibberishWords(text: string): string {
  // Replace obviously made-up long compound words with simpler alternatives
  return text.replace(/\b[a-zA-Z]{18,}\b/g, (match) => {
    const lower = match.toLowerCase()
    // Known valid long words
    const valid = ['verantwoordelijk', 'verantwoordelijkheid', 'waarschijnlijk', 'tegelijkertijd', 'buitengewoon']
    if (valid.some(v => lower.includes(v))) return match
    // Otherwise strip the word (it's likely gibberish)
    return ''
  }).replace(/\s{2,}/g, ' ').trim()
}

// ─── Detect refusal messages ────────────────────────────────────────────────
function isRefusal(text: string): boolean {
  const lower = text.toLowerCase()
  return /\b(i can'?t|i'?m sorry|not appropriate|not comfortable|i'?m an ai|als ai|ik ben een ai|ik ben een chatbot|niet gepast|kan ik niet|not able to|i cannot|i won'?t|inappropriate|end our conversation|being rude|demanding|i'?m not going to|against my|kan helaas geen|kan hier niet op ingaan|kan geen foto|kan geen afbeelding|sorry.*kan.*niet|kan.*niet.*maken.*die|niet in staat|chatbot|language model|taalmodel|artificial intelligence|kunstmatige intelligentie|simuleren|als een programma|dat is alles wat ik kan doen|alleen maar woorden|kan.*niet.*verzenden|kan.*niet.*ontvangen|geen afbeeldingen|geen foto's)\b/i.test(lower)
}

// ─── Detect if user is asking for a photo ──────────────────────────────────
function isPhotoRequest(text: string): boolean {
  const lower = text.toLowerCase()
  return /\b(foto|photo|pic|selfie|stuur.*foto|stuur.*een|laat.*zien|naakt|naked|nude|topless|lingerie|bikini|stuur.*plaatje|afbeelding|send.*photo|send.*pic|send.*selfie|show me|toon|laat.*je|pose|poseer)\b/i.test(lower)
}

// ─── Build a fallback photo prompt from user message + companion appearance ──
function buildFallbackPhotoPrompt(userMessage: string, companion: any): string {
  // Use the same rich maps from avatarPrompt for consistency
  const { buildAvatarPrompt } = require('@/lib/avatarPrompt')
  const ap = companion.appearance || {}
  const gender = companion.personality?.gender || 'woman'
  const genderStr = gender === 'man' ? 'man' : 'woman'

  // Build rich appearance using avatarPrompt maps
  const basePrompt = buildAvatarPrompt(ap) as string
  // Extract just the appearance part (before the expression/pose)
  const appearancePart = basePrompt.split(', standing pose')[0]
    .replace(/, calm neutral expression.*$/, '')
    .replace(/, casual outfit.*$/, '')
    .replace(/photorealistic full body shot from head to toe, /, '')

  // Extract pose/scenario hints from the user message
  const lower = userMessage.toLowerCase()
  let scenario = 'seductive pose, looking at camera, bedroom'

  if (/naakt|naked|nude/i.test(lower)) scenario = 'nude, artistic pose, bedroom, intimate lighting'
  else if (/topless/i.test(lower)) scenario = 'topless, covering with hands playfully, bedroom'
  else if (/lingerie|ondergoed|underwear/i.test(lower)) scenario = 'wearing lace lingerie, bedroom, seductive pose'
  else if (/bikini/i.test(lower)) scenario = 'wearing bikini, beach, sunny, wet skin'
  else if (/sexy|verleidel/i.test(lower)) scenario = 'seductive pose, bedroom, sensual warm lighting'
  else if (/selfie/i.test(lower)) scenario = 'taking a selfie, smiling, close-up, phone in hand'
  else if (/achteren|behind|butt|kont/i.test(lower)) scenario = 'from behind, looking over shoulder, showing butt'
  else if (/voorover|bend/i.test(lower)) scenario = 'bending forward, seductive, showing cleavage'
  else if (/bed|slaapkamer/i.test(lower)) scenario = 'lying on bed, relaxed, intimate, soft sheets'
  else if (/douche|shower|bad|bath/i.test(lower)) scenario = 'in shower, wet hair, wet skin, steamy'
  else if (/tong|tongue/i.test(lower)) scenario = 'sticking tongue out playfully, close-up, winking'
  else if (/dildo|toy/i.test(lower)) scenario = 'holding a toy, playful expression, bedroom'
  else if (/sport|gym|yoga/i.test(lower)) scenario = 'gym workout, sports bra, leggings, sweaty'
  else if (/jurk|dress/i.test(lower)) scenario = 'wearing elegant dress, posing, city evening'
  else if (/strand|beach/i.test(lower)) scenario = 'on the beach, bikini, sunset, golden light'

  return `${appearancePart}, ${scenario}, photorealistic, 8k, professional photography`
}

// ─── Detect pure English text (should be Dutch) ─────────────────────────────
function isPureEnglish(text: string): boolean {
  const words = text.split(/\s+/).filter(w => w.length > 2)
  if (words.length < 4) return false // too short to judge
  const dutchWords = words.filter(w =>
    /^(een|het|de|is|en|van|dat|ook|niet|maar|wel|nog|dan|als|wat|hoe|die|dit|met|voor|kan|ben|heb|wil|zou|gaat|naar|bij|uit|aan|tot|over|echt|heel|goed|leuk|mooi|lekker|hoor|jij|haar|hem|mijn|jouw|zelf|hier|daar|nu|toch|al|er|zo|je|ik|we|ze|hij|zij|mij|ons|geen|veel|meer|alle|graag|lieve|schat|foto|stuur)$/i.test(w)
  )
  // If less than 15% of words are Dutch, it's likely English
  return dutchWords.length / words.length < 0.15
}

// ─── Detect English reasoning text ───────────────────────────────────────────
function isEnglishReasoning(text: string): boolean {
  if (!text || text.length === 0) return true

  const t = text.trim()

  // Very long = almost certainly reasoning (but allow longer Dutch texts)
  if (t.length > 500) return true

  // Check for English reasoning patterns (case-insensitive)
  const reasoningPatterns = [
    /^okay[,.]?\s/i,
    /^(let me|i need to|i should|i will|i must|i have to)/i,
    /^(the user|the message|this is|since |according|considering|looking at|wait[,.])/i,
    /^(so,?\s|well,?\s|now[,.]?\s|alright|hmm,?\s.*(?:let|think|need|should))/i,
    /\b(the user|user's message|i need to respond|i should respond|band level \d|bond level \d)/i,
    /\b(possible response|emotion option|check (?:if|the|this)|let me think)/i,
    /\b(according to the rules|the rules say|as per|i must respond)/i,
    /\b(that's \w+ sentences?|two sentences|three sentences)/i,
    /\b(emotion:|emoji:|generate_image:|text:|response:)/i,
    /\b(too forward|too much|might be|but that|not over the top)/i,
    /\b(chain.of.thought|reasoning|thinking|reflection|inner monologue)/i,
    /\b(alternatively|another idea|final decision|let me confirm)/i,
    /\b(playful.*flirty|flirty.*playful|somewhat reserved|build.*slowly)/i,
  ]

  for (const p of reasoningPatterns) {
    if (p.test(t)) return true
  }

  // If text is mostly English (>70% English words), it's likely reasoning
  // Dutch chat would have Dutch words
  const words = t.split(/\s+/)
  if (words.length > 8) {
    const englishWords = words.filter(w =>
      /^(the|a|an|is|are|was|were|i|you|he|she|it|we|they|my|your|his|her|its|our|their|this|that|these|those|and|or|but|not|no|yes|to|of|in|for|on|at|by|with|from|as|be|been|being|have|has|had|do|does|did|will|would|could|should|can|may|might|must|shall|need|let|me|think|about|just|also|so|if|then|else|while|when|where|how|what|who|which|why|because|since|after|before|during|until|unless|although|though|even|still|already|yet|too|very|much|more|most|less|least|than|then|now|here|there|up|down|out|off|over|under|again|further|once|twice|each|every|all|both|few|many|some|any|other|another|such|only|own|same|different|new|old|first|last|next|good|bad|great|little|big|small|long|short|high|low|right|left|between|through|going|okay|possible|response|check|according|forward|level|looking|considering|message|sentences?)$/i.test(w)
    )
    if (englishWords.length / words.length > 0.6) return true
  }

  return false
}

// ─── Enrich any LLM-generated image prompt with full appearance details ────
// The LLM often generates vague [FOTO:] descriptions missing body type, etc.
// This ensures every photo prompt has the companion's full physical description.
function enrichImagePromptWithAppearance(imagePrompt: string, companion: any): string {
  const { buildAvatarPrompt } = require('@/lib/avatarPrompt')
  const ap = companion.appearance || {}

  // Build the full appearance description from avatarPrompt maps
  const basePrompt = buildAvatarPrompt(ap) as string
  // Extract just the appearance part (age, ethnicity, body, hair, eyes, skin)
  const appearancePart = basePrompt
    .replace(/photorealistic full body shot from head to toe, /, '')
    .split(', standing pose')[0]
    .replace(/, calm neutral expression.*$/, '')
    .replace(/, casual outfit.*$/, '')
    .replace(/, [a-z]+ outfit.*$/i, '')

  // Check if the image prompt already has detailed body info
  const hasBodyDetails = /\b(slim|athletic|curvy|thick|petite|muscular|hourglass|plus.size|voluptuous)\b/i.test(imagePrompt)
  const hasBreastDetails = /\b(cup|breast|chest|boob|flat chest)\b/i.test(imagePrompt)

  if (hasBodyDetails && hasBreastDetails) {
    // Already detailed enough
    return imagePrompt + ', photorealistic, 8k, professional photography'
  }

  // Replace the generic appearance with the full detailed one
  // Strip any existing vague appearance mentions from the LLM prompt
  let enriched = imagePrompt
    .replace(/\b(beautiful|gorgeous|attractive|pretty|stunning)\s+(woman|girl|man|guy)\b/gi, '')
    .replace(/\b(young|mature)\s+(woman|girl|man|guy)\b/gi, '')
    .trim()

  // Prepend the full appearance
  return `${appearancePart}, ${enriched}, photorealistic, 8k, professional photography, natural lighting`
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

    // ─── Dual-track emotion: detect USER's emotion → plan COMPANION's response ───
    const userEmo = detectUserEmotion(message)
    const responseEmo = planResponseEmotion(userEmo, bondLevel, companion.relationship_style || 'lover')
    console.log(`[Chat] Emotion dual-track → user: ${userEmo.emotion} (v=${userEmo.valence.toFixed(2)}, a=${userEmo.arousal.toFixed(2)}) → companion: ${responseEmo.emotion}${responseEmo.secondary ? '+' + responseEmo.secondary : ''}`)

    const systemPrompt = buildSystemPrompt(companion, memories || [], bondLevel, responseEmo)

    // Split multi-line messages into separate user turns (from batch sending)
    const userParts = message.split('\n').map((s: string) => s.trim()).filter(Boolean)
    const userTurns = userParts.length > 1
      ? userParts.map((part: string) => ({ role: 'user', content: part }))
      : [{ role: 'user', content: message }]

    // Filter history: remove reasoning leaks (long English text) from old messages
    const cleanHistory = (history || [])
      .slice(-14)
      .filter((m: any) => {
        if (m.role === 'user') return true
        // Skip assistant messages that are reasoning (>200 chars or mostly English)
        if (m.content && m.content.length > 200) return false
        if (m.content && isEnglishReasoning(m.content)) return false
        return true
      })
      .map((m: any) => ({ role: m.role, content: m.content }))

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...cleanHistory,
      ...userTurns,
    ]

    // Try models in order until one gives a clean response
    let rawContent = ''
    let modelUsed = ''
    let bestMessages: string[] = []
    let bestImagePrompt: string | null = null

    for (const model of MODELS) {
      try {
        const response = await fetch(OPENROUTER_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://sensemates.com',
            'X-Title': 'SenseMates',
          },
          body: JSON.stringify({
            model,
            messages: apiMessages,
            max_tokens: 250,
            temperature: 0.78,
            top_p: 0.92,
            frequency_penalty: 0.3,       // reduce "hey" repetition loops
          }),
        })

        if (!response.ok) {
          console.error(`[Chat] ${model} → HTTP ${response.status}`)
          continue
        }

        const aiData = await response.json()
        const content = aiData.choices?.[0]?.message?.content

        if (!content) continue

        console.log(`[Chat] ✅ ${model} responded → raw: ${content.substring(0, 200)}`)

        const { messages, imagePrompt } = extractChatMessages(content)

        if (messages.length > 0) {
          bestMessages = messages
          bestImagePrompt = imagePrompt
          modelUsed = model
          rawContent = content
          break // Got clean messages, use them
        }

        // Save as fallback but try next model
        if (!modelUsed) {
          rawContent = content
          modelUsed = model
        }
        console.warn(`[Chat] ⚠️ ${model} → all messages filtered (reasoning/gibberish), trying next model...`)
      } catch (err) {
        console.error(`[Chat] ${model} error:`, err)
      }
    }

    if (!modelUsed) {
      return NextResponse.json({ error: 'AI unavailable' }, { status: 500 })
    }

    // Final fallback — never use "hey" as fallback, pick something contextual
    const fallbacks = [
      'Hmm, vertel me meer 😊',
      'Ik luister, ga verder 💕',
      'Oh ja? Vertel! 😏',
      'Mmm interessant...',
      'Haha oké, en toen? 😄',
    ]
    let msgs = bestMessages.length > 0 ? bestMessages : [fallbacks[Math.floor(Math.random() * fallbacks.length)]]
    msgs = msgs.slice(0, 4)

    // ─── Photo: always enrich image prompts with full appearance ─────────
    const userAskedForPhoto = isPhotoRequest(message)
    let generateImage = bestImagePrompt

    // ALWAYS enrich LLM-generated image prompts with full body/appearance details
    if (generateImage) {
      generateImage = enrichImagePromptWithAppearance(generateImage, companion)
      console.log(`[Chat] Enriched image prompt: ${generateImage.substring(0, 200)}`)
    }

    if (userAskedForPhoto && !generateImage) {
      // Model didn't generate a [FOTO:] tag — likely refused
      console.log(`[Chat] ⚠️ User asked for photo but model didn't generate one — creating fallback photo prompt`)
      generateImage = buildFallbackPhotoPrompt(message, companion)
      console.log(`[Chat] Fallback photo prompt: ${generateImage}`)

      // Replace refusal messages with flirty photo messages
      const photoFallbackMsgs = [
        'Hier, speciaal voor jou 😘',
        'Vind je me zo lekker? 😏',
        'Geniet ervan schat 🔥',
        'Kijk eens wat ik voor je heb 😈',
        'Alleen voor jou 💋',
      ]
      // If all messages are refusals, replace them
      const nonRefusalMsgs = msgs.filter(m => !isRefusal(m))
      if (nonRefusalMsgs.length === 0) {
        msgs = [photoFallbackMsgs[Math.floor(Math.random() * photoFallbackMsgs.length)]]
      } else {
        msgs = nonRefusalMsgs
      }
    }

    // ─── Emotion blend on the AI's actual response ───────────────────────
    const aiResponseBlend = detectEmotionBlend(msgs.join(' '))
    // Use the AI's actual response emotion, but fallback to what we planned
    const emotion = aiResponseBlend.primary !== 'calm' || Object.keys(aiResponseBlend.intensities).length > 1
      ? aiResponseBlend.primary
      : responseEmo.emotion
    const emotionSecondary = aiResponseBlend.secondary || responseEmo.secondary
    const newBondScore = Math.min(1000, bondScore + 2)
    const newBondLevel = getBondLevel(newBondScore)

    console.log(`[Chat] Final → model: ${modelUsed} | msgs: ${JSON.stringify(msgs)} | emotion: ${emotion}${emotionSecondary ? '+' + emotionSecondary : ''} (v=${aiResponseBlend.valence.toFixed(2)}, a=${aiResponseBlend.arousal.toFixed(2)}) | image: ${generateImage ? 'yes' : 'no'}`)

    // Save to DB — store user's detected emotion too
    const dbMessages = [
      { companion_id: companionId, user_id: user.id, role: 'user', content: message, emotion: userEmo.emotion },
      ...msgs.map((m: string) => ({
        companion_id: companionId, user_id: user.id, role: 'assistant', content: m, emotion,
      })),
    ]

    await Promise.all([
      supabase.from('messages').insert(dbMessages),
      supabase.from('companions').update({
        bond_score: newBondScore,
        bond_level: newBondLevel,
        emotion_state: {
          current_emotion: emotion,
          secondary_emotion: emotionSecondary,
          valence: aiResponseBlend.valence,
          arousal: aiResponseBlend.arousal,
          user_emotion: userEmo.emotion,
          trust: Math.min(100, (companion.emotion_state?.trust || 30) + 1),
        },
        updated_at: new Date().toISOString(),
      }).eq('id', companionId),
    ])

    // Memory extraction
    const memory = extractMemory(message)
    if (memory) {
      supabase.from('memories').upsert({
        companion_id: companionId, user_id: user.id,
        key: memory.key, value: memory.value,
      }, { onConflict: 'companion_id,key' }).then(() => {})
    }

    return NextResponse.json({
      messages: msgs,
      text: msgs.join(' '),
      emotion,
      emotionSecondary: emotionSecondary || undefined,
      emotionBlend: aiResponseBlend.intensities,
      valence: aiResponseBlend.valence,
      arousal: aiResponseBlend.arousal,
      generateImage,
      bondLevel: newBondLevel,
      bondScore: newBondScore,
    })
  } catch (err) {
    console.error('Chat API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
