// Builds a detailed fal.ai image prompt from an appearance profile
// Uses emphasis weights (:1.3) for key distinguishing features

const AGE_MAP: Record<string, string> = {
  '18s': '18 year old',
  '20s': '22 year old',
  '25s': '26 year old',
  '30s': '32 year old',
  '35s': '37 year old',
  '40s': '43 year old',
  '45s': '47 year old',
}

const BUILD_MAP: Record<string, string> = {
  petite: 'petite small thin frame',
  slim: 'slim lean slender thin figure',
  average: 'average body type',
  athletic: 'athletic toned fit muscular body',
  curvy: 'curvy voluptuous body wide hips',
  hourglass: 'hourglass figure cinched waist wide hips',
  thick: 'thick curvy body wide hips thick thighs',
  muscular: 'muscular physique defined muscles',
  plus_size: 'plus-size full-figured body',
  lean: 'very lean slender thin body',
  stocky: 'stocky compact body',
  dadbod: 'average dad-bod build soft stomach',
  big: 'big broad heavy body',
}

const BREAST_MAP: Record<string, string> = {
  'cup-aa': 'very small flat chest',
  'cup-a': 'small A-cup breasts',
  'cup-b': 'medium B-cup breasts',
  'cup-c': 'full C-cup breasts',
  'cup-d': 'large D-cup breasts',
  'cup-dd': 'very large DD-cup breasts',
  'cup-e': 'huge E-cup breasts',
  'cup-f': 'massive F-cup breasts very large chest',
}

const ASS_MAP: Record<string, string> = {
  small: 'small tight butt',
  medium: 'medium round butt',
  large: 'large round thick butt',
  xl: 'very large thick juicy butt wide hips',
}

const DICK_MAP: Record<string, string> = {
  small: 'slim build',
  average: 'average build',
  large: 'muscular build',
  xl: 'muscular athletic build',
}

const BEARD_MAP: Record<string, string> = {
  none: '',
  clean: 'clean shaven smooth face no facial hair',
  stubble: 'light stubble shadow 2-day beard growth',
  short: 'short trimmed full beard well-groomed',
  medium: 'medium length full beard well-maintained thick beard',
  long: 'long full thick flowing beard',
  goatee: 'goatee beard chin beard with mustache clean cheeks',
  mustache: 'thick mustache no beard clean shaven chin',
  vandyke: 'Van Dyke beard pointed goatee with separate mustache',
  circle: 'circle beard connected mustache and round goatee',
  designer: 'designer stubble perfectly shaped jawline beard faded edges',
}

const HAIR_LENGTH_MAP: Record<string, string> = {
  pixie: 'pixie cut very short hair',
  bob: 'bob cut hair at chin length',
  lob: 'lob cut hair just above shoulders',
  short: 'short cropped hair',
  medium: 'medium length hair',
  long: 'long flowing hair past shoulders',
  very_long: 'very long hair reaching the waist',
  braids: 'long braided hair box braids',
  curly: 'curly voluminous tight curls hair',
  wavy: 'wavy beach waves hair',
  straight: 'straight sleek smooth hair',
  afro: 'natural afro hair big round shape',
  ponytail: 'high ponytail hairstyle',
  bun: 'elegant bun updo hairstyle',
  bangs: 'straight blunt bangs with long hair',
  curtain_bangs: 'curtain bangs framing face with long hair',
  fade: 'fade cut hair short on sides',
  textured: 'textured natural volume hair',
  undercut: 'undercut with shaved sides longer on top',
  buzz: 'buzzcut very short military hair',
  dreadlocks: 'long dreadlocks hairstyle',
  cornrows: 'cornrow braids hairstyle',
  messy: 'messy tousled bedhead hair',
  hijab: 'wearing hijab headscarf covering hair',
}

const HAIR_COLOR_MAP: Record<string, string> = {
  platinum: 'platinum blonde white-blonde',
  blonde: 'golden blonde',
  strawberry: 'strawberry blonde reddish',
  auburn: 'auburn reddish-brown',
  chestnut: 'chestnut brown',
  brown: 'medium brown',
  dark_brown: 'dark brown nearly black',
  black: 'jet black dark',
  red: 'vivid bright red',
  ginger: 'natural ginger orange-red',
  grey: 'silver grey',
  white: 'pure white snow white',
  pink: 'pastel pink',
  purple: 'deep purple violet',
  blue: 'dark navy blue',
  ombre: 'ombre dark roots to light blonde tips gradient',
}

const EYE_COLOR_MAP: Record<string, string> = {
  blue: 'bright vivid blue',
  green: 'vivid emerald green',
  hazel: 'hazel green-brown',
  amber: 'amber golden',
  brown: 'warm brown',
  dark_brown: 'deep dark brown',
  grey: 'steel grey',
  violet: 'violet purple',
}

const SKIN_MAP: Record<string, string> = {
  porcelain: 'porcelain very pale white skin',
  fair: 'fair light skin',
  warm_beige: 'warm beige light-medium skin',
  olive: 'olive medium skin',
  tan: 'tan golden-brown skin',
  brown: 'medium brown skin',
  dark: 'deep dark brown skin',
}

const ETHNICITY_MAP: Record<string, string> = {
  // European
  scandinavian: 'Scandinavian Nordic',
  northwest_european: 'Northwestern European',
  british: 'British English',
  german: 'German Central European',
  french: 'French',
  mediterranean: 'Mediterranean Southern European',
  east_european: 'Eastern European Slavic',
  irish: 'Irish Celtic',
  // Latin
  latin: 'Latin American',
  latino: 'Latin American',
  brazilian: 'Brazilian',
  mexican: 'Mexican',
  colombian: 'Colombian',
  argentinian: 'Argentinian',
  // Asian
  east_asian: 'East Asian',
  japanese: 'Japanese',
  korean: 'Korean',
  chinese: 'Chinese',
  southeast_asian: 'Southeast Asian',
  thai: 'Thai',
  filipino: 'Filipino',
  vietnamese: 'Vietnamese',
  indonesian: 'Indonesian',
  south_asian: 'South Asian Indian',
  // Middle Eastern
  middle_eastern: 'Middle Eastern Arabian',
  turkish: 'Turkish',
  persian: 'Persian Iranian',
  lebanese: 'Lebanese Levantine',
  moroccan: 'Moroccan North African',
  egyptian: 'Egyptian North African',
  arab: 'Arab Arabian Gulf',
  // African
  african: 'African',
  west_african: 'West African Nigerian',
  east_african: 'East African Ethiopian Eritrean',
  south_african: 'South African',
  // Americas
  caribbean: 'Caribbean',
  native_american: 'Native American',
  // Pacific
  polynesian: 'Polynesian Pacific Islander',
  // Mixed
  european: 'European',
  mixed: 'mixed ethnicity biracial',
}

const CLOTHING_MAP: Record<string, string> = {
  casual: 'casual outfit t-shirt and jeans',
  streetwear: 'trendy streetwear outfit hoodie and sneakers',
  elegant: 'elegant classy outfit',
  sporty: 'sporty athletic outfit',
  athletic: 'sporty athletic outfit',
  alternative: 'alternative edgy outfit leather and chains',
  luxury: 'luxury designer outfit high fashion',
  minimal: 'minimal simple outfit clean lines',
  minimalist: 'minimal simple outfit clean lines',
  bohemian: 'bohemian flowy outfit layered fabrics',
  chic: 'chic fashionable outfit trendy sophisticated',
  edgy: 'edgy punk outfit leather jacket',
  gothic: 'gothic dark outfit black lace dark makeup',
  vintage: 'vintage retro outfit classic timeless style',
  preppy: 'preppy outfit polo and chinos',
  grunge: 'grunge outfit flannel and ripped jeans',
  lingerie: 'lingerie lace bra and panties',
  swimwear: 'bikini swimwear',
  jellaba: 'traditional Moroccan jellaba dress with embroidery',
}

export const EMOTION_EXPRESSIONS: Record<string, string> = {
  neutral: 'calm neutral expression soft natural smile direct eye contact',
  happy: 'genuine smile showing teeth eyes crinkled with joy',
  excited: 'excited wide smile sparkling eyes eyebrows raised',
  sad: 'sad expression eyes glistening slight pout',
  angry: 'angry expression furrowed brows intense stare',
  jealous: 'suspicious side-eye pouty lips',
  shy: 'blushing cheeks bashful smile eyes glancing away',
  loving: 'dreamy adoring gaze warm tender smile',
  anxious: 'worried expression biting lower lip wide eyes',
  hurt: 'hurt expression tears lip quivering',
  flirty: 'flirtatious smirk one eyebrow raised seductive gaze',
  playful: 'playful bright smile mischievous eyes laughing',
}

// ─── Build a clean appearance description string (for chat photo prompts) ────
// This gives a consistent, parseable appearance block without prompt engineering artifacts
export function buildAppearanceDescription(profile: Record<string, any>, includeBody = true, includeClothing = true): string {
  const gender = profile.gender === 'man' ? 'man' : 'woman'
  const isMale = gender === 'man'

  const age = AGE_MAP[profile.age] || '25 year old'
  const ethnicity = ETHNICITY_MAP[profile.ethnicity] || 'European'
  const skin = SKIN_MAP[profile.skinTone] || 'fair light skin'
  const build = BUILD_MAP[profile.build] || 'slim lean body'
  const hairLength = HAIR_LENGTH_MAP[profile.hairLength] || 'medium length hair'
  const hairColor = HAIR_COLOR_MAP[profile.hairColor] || 'brown'
  const eyeColor = EYE_COLOR_MAP[profile.eyeColor] || 'brown'

  const parts: string[] = [
    `${age} ${ethnicity} ${gender}`,
    `${skin}`,
    `${hairColor} ${hairLength}`,
    `${eyeColor} eyes`,
  ]

  // Beard for men
  if (isMale) {
    const beardDesc = profile.beard && profile.beard !== 'none'
      ? BEARD_MAP[profile.beard] || ''
      : 'clean shaven'
    if (beardDesc) parts.push(beardDesc)
  }

  // Body details
  if (includeBody) {
    parts.push(build)
    if (!isMale && profile.breastSize) {
      const breast = BREAST_MAP[profile.breastSize] || ''
      if (breast) parts.push(breast)
    }
    if (profile.assSize) {
      const ass = ASS_MAP[profile.assSize] || ''
      if (ass) parts.push(ass)
    }
  }

  // Clothing style — skip when scenario overrides it
  if (includeClothing && profile.clothingStyle) {
    const clothing = CLOTHING_MAP[profile.clothingStyle] || ''
    if (clothing) parts.push(clothing)
  }

  return parts.join(', ')
}

// ─── Build body-type reinforcement for photo prompts ──────────────────────
// Adds extra emphasis AND negative hints so the AI follows body type closely
export function buildBodyReinforcement(profile: Record<string, any>): { emphasis: string; negative: string } {
  const emphasis: string[] = []
  const negative: string[] = []

  // Build reinforcement
  const build = profile.build || 'slim'
  if (build === 'petite' || build === 'slim' || build === 'lean') {
    emphasis.push('(very slim thin petite body:1.4)', '(small frame:1.3)')
    negative.push('large breasts, big breasts, curvy, thick, overweight, fat, muscular, wide hips, voluptuous')
  } else if (build === 'muscular' || build === 'athletic') {
    emphasis.push('(muscular toned athletic body:1.3)')
    negative.push('fat, overweight, skinny, thin')
  } else if (build === 'thick' || build === 'curvy' || build === 'plus_size') {
    emphasis.push('(curvy thick voluptuous body:1.3)')
    negative.push('skinny, thin, slim, petite, flat')
  }

  // Breast reinforcement
  const breast = profile.breastSize || ''
  if (breast === 'cup-aa' || breast === 'cup-a') {
    emphasis.push('(very small flat chest:1.5)', '(tiny breasts:1.4)', '(flat-chested:1.3)')
    negative.push('large breasts, big breasts, medium breasts, busty, cleavage, big chest, D-cup, C-cup')
  } else if (breast === 'cup-b') {
    emphasis.push('(small breasts:1.3)')
    negative.push('large breasts, big breasts, huge breasts, flat chest')
  } else if (breast === 'cup-e' || breast === 'cup-f') {
    emphasis.push('(very large huge breasts:1.4)', '(massive chest:1.3)')
    negative.push('small breasts, flat chest, tiny breasts, A-cup')
  }

  // Ass reinforcement
  const ass = profile.assSize || ''
  if (ass === 'small') {
    emphasis.push('(small tight butt:1.3)')
    negative.push('large butt, big butt, thick butt, wide hips')
  } else if (ass === 'xl') {
    emphasis.push('(very large thick butt:1.3)')
    negative.push('small butt, flat butt, no butt')
  }

  return {
    emphasis: emphasis.join(', '),
    negative: negative.join(', '),
  }
}

// ─── Build negative prompt to prevent wrong features ──────────────────────
export function buildNegativePrompt(profile: Record<string, any>): string {
  const parts = [
    'cartoon, anime, illustration, painting, drawing, sketch, 3d render, cgi',
    'deformed, ugly, blurry, low quality, bad anatomy, bad proportions',
    'extra fingers, mutated hands, poorly drawn face, disfigured',
    'watermark, text, logo, signature',
  ]

  const isMale = profile.gender === 'man'

  // Negative for beard — prevent wrong beard
  if (isMale) {
    const beard = profile.beard || 'none'
    if (beard === 'none' || beard === 'clean') {
      parts.push('beard, facial hair, stubble, mustache')
    } else if (beard === 'stubble' || beard === 'designer') {
      parts.push('long beard, full beard, thick beard, no facial hair')
    } else if (beard === 'long') {
      parts.push('clean shaven, smooth face, no beard, stubble, short beard')
    } else if (beard === 'mustache') {
      parts.push('beard, chin hair, goatee, full beard')
    }
  }

  // Negative for build
  const build = profile.build || 'slim'
  if (build === 'slim' || build === 'lean' || build === 'petite') {
    parts.push('muscular, fat, overweight, thick, stocky, heavy')
  } else if (build === 'muscular' || build === 'athletic') {
    parts.push('skinny, thin, fat, overweight, slim')
  } else if (build === 'thick' || build === 'curvy' || build === 'plus_size') {
    parts.push('skinny, thin, slim, lean, petite')
  }

  return parts.join(', ')
}

// ─── Main prompt builder ──────────────────────────────────────────────────
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

  // Clothing — SFW swap for profile avatar
  let clothing = CLOTHING_MAP[profile.clothingStyle] || 'casual outfit'
  if (sfwMode && /lingerie|bikini|swimwear|nude|naked/i.test(clothing)) {
    clothing = 'elegant classy outfit'
  }

  // Beard (men only)
  const beardDesc = isMale && profile.beard && profile.beard !== 'none'
    ? BEARD_MAP[profile.beard] || ''
    : ''

  // Body details — skip explicit parts in SFW mode
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
  }
  const bodyDesc = bodyParts.join(', ')

  // ─── Build structured prompt with emphasis weights ───────────────────
  // Structure: Subject → Face (high priority) → Body → Clothing → Technical
  // Front-load the most distinguishing features for better adherence

  const faceParts: string[] = []
  // Eye color with emphasis
  faceParts.push(`(${eyeColor} eyes:1.3)`)
  // Hair with emphasis
  faceParts.push(`(${hairColor} ${hairLength}:1.2)`)
  // Skin
  faceParts.push(skin)
  // Beard with HIGH emphasis (most commonly missed)
  if (beardDesc) {
    faceParts.push(`(${beardDesc}:1.4)`)
  } else if (isMale) {
    faceParts.push('(clean shaven smooth face:1.2)')
  }

  const faceBlock = faceParts.join(', ')

  // Build the prompt — upper body portrait for better face/feature detail
  const prompt = [
    // Subject identity (most important — first tokens get highest weight)
    `photorealistic upper body portrait`,
    `${age} ${ethnicity} ${gender}`,
    // Face details (second highest priority)
    faceBlock,
    // Body
    `(${bodyDesc}:1.2)`,
    // Clothing
    clothing,
    // Expression
    expression,
    // Technical quality
    'looking at camera, sharp focus on face',
    'professional studio portrait, soft warm directional lighting, shallow depth of field',
    'shot on Sony A7R IV 85mm lens, 8k, ultra-detailed, photorealistic skin texture',
    // Reinforcement of key features (repeat for emphasis)
    `BREAK ${eyeColor} eyes, ${hairColor} hair${beardDesc ? `, ${beardDesc}` : ''}, ${build}`,
  ].join(', ')

  return prompt
}
