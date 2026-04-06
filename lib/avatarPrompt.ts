// Builds a detailed fal.ai image prompt from an appearance profile

const AGE_MAP: Record<string, string> = {
  '18s': '18 year old young',
  '20s': '22 year old young',
  '25s': '26 year old',
  '30s': '31 year old',
  '35s': '36 year old',
  '40s': '41 year old',
}

const BUILD_MAP: Record<string, string> = {
  petite: 'petite small frame, short and slim',
  slim: 'slim lean body, slender figure',
  average: 'average body type, normal build',
  athletic: 'athletic toned fit body',
  curvy: 'curvy voluptuous body, full bust, wide hips',
  hourglass: 'hourglass figure, cinched waist, full bust, wide hips',
  muscular: 'muscular physique, defined muscles',
  plus_size: 'plus-size full-figured body',
  lean: 'very lean slender body',
  stocky: 'stocky compact body',
}

const HAIR_LENGTH_MAP: Record<string, string> = {
  pixie: 'pixie cut hair',
  bob: 'bob cut hair at chin length',
  lob: 'lob cut hair just above shoulders',
  short: 'short hair',
  medium: 'medium length hair',
  long: 'long hair',
  very_long: 'very long hair reaching the waist',
  braids: 'braided hair',
  fade: 'fade cut hair',
  textured: 'textured natural volume hair',
  undercut: 'undercut with shaved sides',
}

const HAIR_COLOR_MAP: Record<string, string> = {
  platinum: 'platinum blonde',
  blonde: 'blonde',
  auburn: 'auburn',
  chestnut: 'chestnut brown',
  brown: 'brown',
  dark_brown: 'dark brown',
  black: 'jet black',
  red: 'vivid red',
  grey: 'silver grey',
}

const EYE_COLOR_MAP: Record<string, string> = {
  blue: 'blue', green: 'green', hazel: 'hazel', amber: 'amber',
  brown: 'brown', dark_brown: 'dark brown', grey: 'grey', violet: 'violet',
}

const SKIN_MAP: Record<string, string> = {
  porcelain: 'porcelain pale skin', fair: 'fair light skin', warm_beige: 'warm beige skin',
  olive: 'olive skin', tan: 'tan golden-brown skin', brown: 'medium brown skin',
  dark: 'deep dark skin',
}

const ETHNICITY_MAP: Record<string, string> = {
  scandinavian: 'Scandinavian Nordic', northwest_european: 'Northwestern European Dutch',
  mediterranean: 'Mediterranean Italian or Spanish', east_european: 'Eastern European',
  latin: 'Latin American', latino: 'Latin American',
  east_asian: 'East Asian', south_asian: 'South Asian Indian',
  middle_eastern: 'Middle Eastern', african: 'African',
  european: 'European',
}

export const EMOTION_EXPRESSIONS: Record<string, string> = {
  neutral: 'calm neutral expression, soft natural smile, direct eye contact, relaxed',
  happy: 'huge radiant genuine smile showing teeth, eyes crinkled with joy, rosy glowing cheeks',
  excited: 'enormous excited wide-open smile, eyes sparkling and wide, eyebrows raised high',
  sad: 'deeply sad heartbroken expression, single tear rolling down cheek, eyes glistening',
  angry: 'angry scowling expression, deeply furrowed brows, intense furious stare, jaw clenched',
  jealous: 'jealous suspicious look, sharp side-eye glance, pouty pressed lips, arms crossed',
  shy: 'blushing bright red cheeks, tiny bashful smile, hand shyly covering mouth, eyes glancing away',
  loving: 'soft dreamy adoring gaze, warm tender loving smile, eyes gently half-closed with affection',
  anxious: 'anxious worried expression, biting lower lip nervously, wide tense eyes',
  hurt: 'deeply hurt heartbroken expression, tears streaming down cheeks, lip quivering',
  flirty: 'playful flirtatious smirk, one eyebrow slightly raised, soft confident gaze with mischief',
  playful: 'playful bright smile, sparkling mischievous eyes, lighthearted expression, laughing',
}

export function buildAvatarPrompt(profile: Record<string, any>, emotion = 'neutral'): string {
  const gender = profile.gender === 'man' ? 'man' : 'woman'
  const isMale = gender === 'man'

  const age = AGE_MAP[profile.age] || '25 year old'
  const ethnicity = ETHNICITY_MAP[profile.ethnicity] || 'European'
  const skin = SKIN_MAP[profile.skinTone] || 'fair light skin'
  const build = BUILD_MAP[profile.build] || 'slim lean body'
  const hairLength = HAIR_LENGTH_MAP[profile.hairLength] || 'medium length hair'
  const hairColor = HAIR_COLOR_MAP[profile.hairColor] || 'brown'
  const eyeColor = EYE_COLOR_MAP[profile.eyeColor] || 'brown'
  const hairStyle = profile.hairStyle ? `${profile.hairStyle} ` : ''
  const beard = isMale && profile.beard && profile.beard !== 'none'
    ? `, ${profile.beard === 'stubble' ? 'light stubble beard' : profile.beard.replace('_', ' ')}`
    : ''
  const expression = EMOTION_EXPRESSIONS[emotion] || EMOTION_EXPRESSIONS.neutral

  return `photorealistic portrait, ${age} ${ethnicity} ${gender}, ${skin}, ${build}, ${hairStyle}${hairColor} ${hairLength}, ${eyeColor} eyes${beard}, ${expression}, soft natural studio lighting, shallow depth of field, shot on Sony A7R, high resolution, professional photography, cinematic, ultra-detailed face, upper body shot, 8k`
}
