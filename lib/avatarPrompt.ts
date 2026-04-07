// Builds a detailed fal.ai image prompt from an appearance profile

const AGE_MAP: Record<string, string> = {
  '18s': '18 year old young',
  '20s': '22 year old',
  '25s': '26 year old',
  '30s': '32 year old',
  '35s': '37 year old',
  '40s': '43 year old mature',
  '45s': '47 year old mature',
}

const BUILD_MAP: Record<string, string> = {
  petite: 'petite small frame',
  slim: 'slim lean slender figure',
  average: 'average body type',
  athletic: 'athletic toned fit body',
  curvy: 'curvy voluptuous body, wide hips',
  hourglass: 'hourglass figure, cinched waist, wide hips',
  thick: 'thick curvy body, wide hips, thick thighs',
  muscular: 'muscular physique, defined muscles',
  plus_size: 'plus-size full-figured body',
  lean: 'very lean slender body',
  stocky: 'stocky compact body',
  dadbod: 'average dad-bod build',
  big: 'big broad body',
}

const BREAST_MAP: Record<string, string> = {
  'cup-aa': 'very small flat chest',
  'cup-a': 'small A-cup breasts',
  'cup-b': 'medium B-cup breasts',
  'cup-c': 'full C-cup breasts',
  'cup-d': 'large D-cup breasts',
  'cup-dd': 'very large DD-cup breasts',
  'cup-e': 'huge E-cup breasts',
  'cup-f': 'massive F-cup breasts, very large chest',
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

const BEARD_MAP: Record<string, string> = {
  none: '',
  clean: 'clean shaven smooth face',
  stubble: 'light stubble shadow, 2-day beard growth',
  short: 'short trimmed beard, well-groomed',
  medium: 'medium length full beard, well-maintained',
  long: 'long full thick beard',
  goatee: 'goatee beard, chin beard with mustache',
  mustache: 'thick mustache, no beard, clean shaven chin',
  vandyke: 'Van Dyke beard, pointed goatee with separate mustache',
  circle: 'circle beard, connected mustache and goatee',
  designer: 'designer stubble, perfectly shaped jawline beard, faded edges',
}

const HAIR_LENGTH_MAP: Record<string, string> = {
  pixie: 'pixie cut hair',
  bob: 'bob cut hair at chin length',
  lob: 'lob cut hair just above shoulders',
  short: 'short hair',
  medium: 'medium length hair',
  long: 'long flowing hair',
  very_long: 'very long hair reaching the waist',
  braids: 'long braided hair',
  curly: 'curly voluminous hair',
  wavy: 'wavy beach waves hair',
  straight: 'straight sleek hair',
  afro: 'natural afro hair',
  ponytail: 'high ponytail hairstyle',
  bun: 'elegant bun updo hairstyle',
  bangs: 'straight bangs with long hair',
  curtain_bangs: 'curtain bangs framing face with long hair',
  fade: 'fade cut hair',
  textured: 'textured natural volume hair',
  undercut: 'undercut with shaved sides',
  buzz: 'buzzcut very short hair',
  dreadlocks: 'long dreadlocks hair',
  cornrows: 'cornrow braids hairstyle',
  messy: 'messy tousled bedhead hair',
}

const HAIR_COLOR_MAP: Record<string, string> = {
  platinum: 'platinum blonde',
  blonde: 'blonde',
  strawberry: 'strawberry blonde',
  auburn: 'auburn',
  chestnut: 'chestnut brown',
  brown: 'brown',
  dark_brown: 'dark brown',
  black: 'jet black',
  red: 'vivid red',
  ginger: 'natural ginger',
  grey: 'silver grey',
  white: 'white',
  pink: 'pastel pink',
  purple: 'deep purple',
  blue: 'dark blue',
  ombre: 'ombre dark roots to light tips',
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
  east_asian: 'East Asian Japanese or Korean', southeast_asian: 'Southeast Asian Thai or Filipino',
  south_asian: 'South Asian Indian', middle_eastern: 'Middle Eastern Arabian',
  african: 'African', caribbean: 'Caribbean',
  polynesian: 'Polynesian Pacific Islander', native_american: 'Native American',
  turkish: 'Turkish', persian: 'Persian Iranian',
  european: 'European', mixed: 'mixed ethnicity',
}

const CLOTHING_MAP: Record<string, string> = {
  casual: 'casual outfit, t-shirt and jeans',
  streetwear: 'trendy streetwear outfit, hoodie and sneakers',
  elegant: 'elegant classy outfit, cocktail dress',
  sporty: 'sporty athletic outfit, sports bra and leggings',
  athletic: 'sporty athletic outfit, sports bra and leggings',
  alternative: 'alternative edgy outfit, leather and chains',
  luxury: 'luxury designer outfit, high fashion',
  minimal: 'minimal simple outfit, clean lines',
  minimalist: 'minimal simple outfit, clean lines',
  bohemian: 'bohemian flowy outfit, layered fabrics',
  chic: 'chic fashionable outfit, trendy sophisticated look',
  edgy: 'edgy punk outfit, leather jacket and boots',
  gothic: 'gothic dark outfit, black lace and dark makeup',
  vintage: 'vintage retro outfit, classic timeless style',
  preppy: 'preppy outfit, polo and skirt',
  grunge: 'grunge outfit, flannel and ripped jeans',
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

export function buildAvatarPrompt(profile: Record<string, any>, emotion = 'neutral', sfwMode = true): string {
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

  // For profile avatar (SFW mode): always use casual/elegant clothing, skip explicit body parts
  // For photo prompts: include everything
  let clothing = CLOTHING_MAP[profile.clothingStyle] || 'casual outfit'
  if (sfwMode && /lingerie|bikini|swimwear|nude|naked/i.test(clothing)) {
    clothing = 'elegant classy outfit'
  }

  // Body details — skip explicit parts in SFW mode (profile avatar)
  const bodyParts: string[] = [build]
  if (!sfwMode) {
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
  }
  const bodyDesc = bodyParts.join(', ')

  const beardDesc = isMale && profile.beard && profile.beard !== 'none'
    ? BEARD_MAP[profile.beard] || ''
    : ''
  const beard = beardDesc ? `, ${beardDesc}` : ''

  // Full body shot with all details
  return `photorealistic full body shot from head to toe, ${age} ${ethnicity} ${gender}, ${skin}, ${bodyDesc}, ${hairColor} ${hairLength}, ${eyeColor} eyes${beard}, ${clothing}, ${expression}, standing pose, natural proportions, beautiful detailed face, shot in a modern studio with soft warm lighting, shallow depth of field, shot on Sony A7R IV 35mm lens, professional fashion photography, ultra-detailed, 8k, realistic anatomy, correct body proportions`
}
