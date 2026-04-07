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
  petite: 'petite small frame',
  slim: 'slim lean slender figure',
  average: 'average body type',
  athletic: 'athletic toned fit body',
  curvy: 'curvy voluptuous body, wide hips',
  hourglass: 'hourglass figure, cinched waist, wide hips',
  muscular: 'muscular physique, defined muscles',
  plus_size: 'plus-size full-figured body',
  lean: 'very lean slender body',
  stocky: 'stocky compact body',
}

const BREAST_MAP: Record<string, string> = {
  'cup-aa': 'very small flat chest',
  'cup-a': 'small A-cup breasts',
  'cup-b': 'medium B-cup breasts',
  'cup-c': 'full C-cup breasts',
  'cup-d': 'large D-cup breasts',
  'cup-dd': 'very large DD-cup breasts',
  'cup-e': 'huge E-cup breasts',
}

const ASS_MAP: Record<string, string> = {
  small: 'small tight butt',
  medium: 'medium round butt',
  large: 'large round thick butt',
  xl: 'very large thick juicy butt, wide hips',
}

const DICK_MAP: Record<string, string> = {
  small: 'slim build',
  average: 'average build',
  large: 'muscular build',
  xl: 'muscular athletic build',
}

const HAIR_LENGTH_MAP: Record<string, string> = {
  pixie: 'pixie cut hair',
  bob: 'bob cut hair at chin length',
  lob: 'lob cut hair just above shoulders',
  short: 'short hair',
  medium: 'medium length hair',
  long: 'long flowing hair',
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
  blue: 'bright blue', green: 'vivid green', hazel: 'hazel', amber: 'amber',
  brown: 'brown', dark_brown: 'dark brown', grey: 'grey', violet: 'violet',
}

const SKIN_MAP: Record<string, string> = {
  porcelain: 'porcelain pale skin', fair: 'fair light skin', warm_beige: 'warm beige skin',
  olive: 'olive skin', tan: 'tan golden-brown skin', brown: 'medium brown skin',
  dark: 'deep dark skin',
}

const ETHNICITY_MAP: Record<string, string> = {
  scandinavian: 'Scandinavian Nordic', northwest_european: 'Northwestern European Dutch',
  mediterranean: 'Mediterranean Italian or Spanish', east_european: 'Eastern European Slavic',
  latin: 'Latin American', latino: 'Latin American',
  east_asian: 'East Asian', south_asian: 'South Asian Indian',
  middle_eastern: 'Middle Eastern', african: 'African',
  european: 'European', mixed: 'mixed ethnicity',
}

const CLOTHING_MAP: Record<string, string> = {
  casual: 'casual outfit, t-shirt and jeans',
  streetwear: 'trendy streetwear outfit',
  elegant: 'elegant classy outfit',
  sporty: 'sporty athletic outfit, sports bra and leggings',
  alternative: 'alternative edgy outfit',
  luxury: 'luxury designer outfit',
  minimal: 'minimal simple outfit',
  bohemian: 'bohemian flowy outfit',
  lingerie: 'lingerie, lace bra and panties',
  swimwear: 'bikini swimwear',
}

export const EMOTION_EXPRESSIONS: Record<string, string> = {
  neutral: 'calm neutral expression, soft natural smile, direct eye contact',
  happy: 'genuine smile showing teeth, eyes crinkled with joy, glowing',
  excited: 'excited wide smile, sparkling eyes, eyebrows raised',
  sad: 'sad expression, eyes glistening, slight pout',
  angry: 'angry expression, furrowed brows, intense stare',
  jealous: 'suspicious side-eye, pouty lips, arms crossed',
  shy: 'blushing cheeks, bashful smile, eyes glancing away',
  loving: 'dreamy adoring gaze, warm tender smile',
  anxious: 'worried expression, biting lower lip, wide eyes',
  hurt: 'hurt expression, tears, lip quivering',
  flirty: 'flirtatious smirk, one eyebrow raised, seductive confident gaze',
  playful: 'playful bright smile, mischievous eyes, laughing',
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
  const expression = EMOTION_EXPRESSIONS[emotion] || EMOTION_EXPRESSIONS.neutral
  const clothing = CLOTHING_MAP[profile.clothingStyle] || 'casual outfit'

  // Body details
  const bodyParts: string[] = [build]
  if (!isMale && profile.breastSize) {
    const breast = BREAST_MAP[profile.breastSize] || ''
    if (breast) bodyParts.push(breast)
  }
  if (profile.assSize) {
    const ass = ASS_MAP[profile.assSize] || ''
    if (ass) bodyParts.push(ass)
  }
  if (isMale && profile.dickSize) {
    const dick = DICK_MAP[profile.dickSize] || ''
    if (dick) bodyParts.push(dick)
  }
  const bodyDesc = bodyParts.join(', ')

  const beard = isMale && profile.beard && profile.beard !== 'none'
    ? `, ${profile.beard === 'stubble' ? 'light stubble beard' : profile.beard.replace('_', ' ')}`
    : ''

  // Full body shot with all details
  return `photorealistic full body shot from head to toe, ${age} ${ethnicity} ${gender}, ${skin}, ${bodyDesc}, ${hairColor} ${hairLength}, ${eyeColor} eyes${beard}, ${clothing}, ${expression}, standing pose, natural proportions, beautiful detailed face, shot in a modern studio with soft warm lighting, shallow depth of field, shot on Sony A7R IV 35mm lens, professional fashion photography, ultra-detailed, 8k, realistic anatomy, correct body proportions`
}
