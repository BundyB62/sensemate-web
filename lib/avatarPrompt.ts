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
  jellaba: 'traditional Moroccan jellaba long robe with hood and embroidery, fitted at the waist showing hourglass silhouette, elegant modest full-length dress',
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

// ─── Anime-specific negative prompt ──────────────────────────────────────
export function buildAnimeNegativePrompt(): string {
  return 'realistic, photograph, 3d render, photorealistic, skin pores, skin texture, wrinkles, deformed, ugly, blurry, low quality, bad anatomy, bad proportions, extra fingers, mutated hands, poorly drawn face, disfigured, watermark, text, logo, signature'
}

// ─── Game-specific negative prompt (semi-realistic 3D) ───────────────────
export function buildGameNegativePrompt(): string {
  return 'cartoon, flat colors, cel shading, sketch, painting, deformed, ugly, blurry, low quality, bad anatomy, bad proportions, extra fingers, mutated hands, poorly drawn face, disfigured, watermark, text, logo, signature'
}

// ─── Build a clean appearance description string (for chat photo prompts) ────
// This gives a consistent, parseable appearance block without prompt engineering artifacts
export function buildAppearanceDescription(profile: Record<string, any>, includeBody = true, includeClothing = true): string {
  // Anime/game characters use promptTags directly instead of building from profile fields
  if (profile.style === 'anime' || profile.style === 'game') {
    let tags = profile.promptTags || ''
    if (!includeClothing) {
      // Strip outfit/clothing descriptions for nude/explicit requests
      tags = tags
        .replace(/,?\s*wearing [^,]+/gi, '')
        .replace(/,?\s*(school uniform|sailor uniform|shrine maiden outfit|maid outfit|maid dress|idol costume|tactical bodysuit|fantasy armor|sorceress robes|royal attire|samurai hakama|open kimono|kimono|corset|boots|thigh-high boots|knee-high boots|stockings|white stockings|headband|frilly headband|cape|fur cape|black cape|dress|white dress|blouse|white blouse|skirt|pleated skirt|frilly skirt|crop top[^,]*|hotpants|choker[^,]*|tiara|silver tiara|microphone|sword[^,]*|katana[^,]*|magical staff|arcane symbols|neon accents|cyberpunk implants|leather and steel|silver accessories|white haori|red hakama|hair ribbons|bowing|warrior pose|tube top[^,]*|tactical pants|shoulder holster|beret|catsuit|glasses|high heels|guns|elegant dress|fur collar|pendant|bikini top|ripped stockings|military gear|sniper rifle|revealing robes|feather accessories|staff|dark lipstick|qipao dress|white boots|spiked bracelets|mini skirt|red gloves|suspenders|blindfold visor|gothic maid dress|black gloves|bodysuit|headset|face marks|pistol holsters|adventurer gear|dual pistol)[^,]*/gi, '')
        .replace(/,\s*,/g, ',').replace(/,\s*$/, '').replace(/^\s*,/, '')
    }
    if (profile.style === 'game') {
      return `${tags}, 3d render, unreal engine 5, semi-realistic, game character, detailed skin texture, volumetric lighting, highres`
    }
    return `${tags}, anime style, masterpiece, best quality, highres, detailed`
  }

  const gender = profile.gender === 'man' ? 'man' : 'woman'
  const isMale = gender === 'man'

  const age = AGE_MAP[profile.age] || '25 year old'
  const ethnicity = ETHNICITY_MAP[profile.ethnicity] || 'European'
  const skin = SKIN_MAP[profile.skinTone] || 'fair light skin'
  const build = BUILD_MAP[profile.build] || 'slim lean body'
  const hairLength = HAIR_LENGTH_MAP[profile.hairLength] || 'medium length hair'
  const hairColor = HAIR_COLOR_MAP[profile.hairColor] || 'brown'
  const eyeColor = EYE_COLOR_MAP[profile.eyeColor] || 'brown'

  // Hijab special handling — always include color consistency
  const isHijab = profile.hairLength === 'hijab'
  const hairDesc = isHijab
    ? `(wearing ${hairColor} colored hijab headscarf:1.4)`
    : `(${hairColor} ${hairLength}:1.3)`

  const parts: string[] = [
    `(${age} ${ethnicity} ${gender}:1.2)`,
    `(${skin}:1.1)`,
    hairDesc,
    `(${eyeColor} eyes:1.3)`,
  ]

  // Beard for men
  if (isMale) {
    const beardDesc = profile.beard && profile.beard !== 'none'
      ? BEARD_MAP[profile.beard] || ''
      : 'clean shaven'
    if (beardDesc) parts.push(`(${beardDesc}:1.3)`)
  }

  // Body details with strong emphasis for consistency
  if (includeBody) {
    parts.push(`(${build}:1.3)`)
    if (!isMale && profile.breastSize) {
      const breast = BREAST_MAP[profile.breastSize] || ''
      if (breast) parts.push(`(${breast}:1.3)`)
    }
    if (profile.assSize) {
      const ass = ASS_MAP[profile.assSize] || ''
      if (ass) parts.push(`(${ass}:1.2)`)
    }
  }

  // Clothing style — skip when scenario overrides it
  if (includeClothing && profile.clothingStyle) {
    const clothing = CLOTHING_MAP[profile.clothingStyle] || ''
    if (clothing) parts.push(clothing)
  }

  // Same person reinforcement
  parts.push('consistent appearance, same person throughout')

  return parts.join(', ')
}

// ─── Build body-type reinforcement for photo prompts ──────────────────────
// ─── Identity reinforcement — core features that must NEVER change ──────────
// Repeated at the END of prompts to ensure hijab, hair color, eye color, body type persist
export function buildIdentityReinforcement(profile: Record<string, any>): string {
  // Anime/game: use identity tags from character definition
  if (profile.style === 'anime' || profile.style === 'game') {
    return profile.identityTags || ''
  }

  const parts: string[] = []

  // Hijab is the #1 identity feature — must always be present
  const isHijab = profile.hairLength === 'hijab'
  if (isHijab) {
    const hijabColor = HAIR_COLOR_MAP[profile.hairColor] || 'dark'
    parts.push(`(MUST be wearing ${hijabColor} hijab headscarf on head at all times:1.5)`)
  } else {
    const hairColor = HAIR_COLOR_MAP[profile.hairColor] || 'brown'
    const hairLength = HAIR_LENGTH_MAP[profile.hairLength] || 'medium length'
    parts.push(`(${hairColor} ${hairLength} hair:1.3)`)
  }

  // Eye color
  const eyeColor = EYE_COLOR_MAP[profile.eyeColor] || 'brown'
  parts.push(`(${eyeColor} eyes:1.3)`)

  // Body type
  const build = BUILD_MAP[profile.build] || 'slim'
  parts.push(`(${build}:1.2)`)

  // Ethnicity
  const ethnicity = ETHNICITY_MAP[profile.ethnicity] || 'European'
  parts.push(`${ethnicity}`)

  return parts.join(', ')
}

// Adds extra emphasis AND negative hints so the AI follows body type closely
export function buildBodyReinforcement(profile: Record<string, any>): { emphasis: string; negative: string } {
  // Anime/game: body is tag-driven, no reinforcement needed
  if (profile.style === 'anime' || profile.style === 'game') {
    return { emphasis: '', negative: '' }
  }

  const emphasis: string[] = []
  const negative: string[] = []

  // ─── Build / body type reinforcement ──────────────────────────────────────
  const build = profile.build || 'slim'
  if (build === 'petite' || build === 'slim' || build === 'lean') {
    emphasis.push('(very slim thin petite body:1.6)', '(small narrow frame:1.5)', '(skinny:1.4)')
    negative.push('curvy, thick, overweight, fat, muscular, wide hips, voluptuous, chubby, plump, heavy, big body, large frame')
  } else if (build === 'average') {
    emphasis.push('(average normal body type:1.3)')
    negative.push('very thin, anorexic, very fat, obese, extremely muscular')
  } else if (build === 'muscular' || build === 'athletic') {
    emphasis.push('(muscular toned athletic body:1.5)', '(fit defined muscles visible:1.4)')
    negative.push('fat, overweight, skinny, thin, chubby, soft body')
  } else if (build === 'hourglass') {
    emphasis.push('(perfect hourglass figure:1.6)', '(very narrow cinched waist:1.5)', '(proportional curves wide hips:1.4)')
    negative.push('skinny, thin, petite, flat, straight body, thick, chubby, plus-size, overweight')
  } else if (build === 'curvy') {
    emphasis.push('(curvy voluptuous body wide hips:1.5)', '(voluptuous feminine curves:1.4)')
    negative.push('skinny, thin, slim, petite, flat, boyish, straight body')
  } else if (build === 'thick') {
    emphasis.push('(thick curvy body wide hips thick thighs:1.5)', '(full-figured:1.4)')
    negative.push('skinny, thin, slim, petite, flat')
  } else if (build === 'plus_size' || build === 'big') {
    emphasis.push('(plus-size full-figured large body:1.5)', '(heavy thick body:1.4)')
    negative.push('skinny, thin, slim, petite, athletic, fit, toned')
  }

  // ─── Breast reinforcement — EVERY cup size covered ────────────────────────
  const breast = profile.breastSize || ''
  if (breast === 'cup-aa' || breast === 'cup-a') {
    emphasis.push('(completely flat chest:1.7)', '(very small tiny breasts:1.6)', '(no cleavage flat-chested:1.5)', '(AA-cup breasts:1.5)')
    negative.push('large breasts, big breasts, medium breasts, busty, cleavage, big chest, D-cup, C-cup, B-cup, round breasts, full breasts, breast implants, heavy breasts')
  } else if (breast === 'cup-b') {
    emphasis.push('(small B-cup breasts:1.5)', '(modest small chest:1.4)')
    negative.push('large breasts, big breasts, huge breasts, D-cup, DD-cup, busty, flat chest, cleavage')
  } else if (breast === 'cup-c') {
    emphasis.push('(medium C-cup breasts:1.4)', '(moderate chest size:1.3)')
    negative.push('flat chest, huge breasts, very large breasts, tiny breasts')
  } else if (breast === 'cup-d') {
    emphasis.push('(large D-cup breasts:1.4)', '(full round breasts:1.3)')
    negative.push('flat chest, small breasts, tiny breasts, flat-chested')
  } else if (breast === 'cup-dd') {
    emphasis.push('(very large DD-cup breasts:1.5)', '(big heavy round breasts:1.4)')
    negative.push('flat chest, small breasts, tiny breasts, flat-chested, medium breasts')
  } else if (breast === 'cup-e' || breast === 'cup-f') {
    emphasis.push('(extremely large massive breasts:1.6)', '(huge heavy breasts:1.5)', '(enormous chest:1.4)')
    negative.push('small breasts, flat chest, tiny breasts, A-cup, B-cup, medium breasts, modest chest')
  }

  // ─── Ass reinforcement — EVERY size covered ───────────────────────────────
  const ass = profile.assSize || ''
  if (ass === 'small') {
    emphasis.push('(small tight flat butt:1.5)', '(narrow hips small rear:1.4)')
    negative.push('large butt, big butt, thick butt, wide hips, round ass, bubble butt, big rear')
  } else if (ass === 'medium') {
    emphasis.push('(medium round butt:1.3)')
    negative.push('flat butt, huge butt, very large butt')
  } else if (ass === 'large') {
    emphasis.push('(large round thick butt:1.4)', '(big rear wide hips:1.3)')
    negative.push('flat butt, small butt, no butt, narrow hips')
  } else if (ass === 'xl') {
    emphasis.push('(very large thick juicy butt:1.5)', '(massive round rear wide hips:1.4)', '(huge ass:1.3)')
    negative.push('small butt, flat butt, no butt, narrow hips, thin rear')
  }

  return {
    emphasis: emphasis.join(', '),
    negative: negative.join(', '),
  }
}

// ─── Build negative prompt to prevent wrong features ──────────────────────
export function buildNegativePrompt(profile: Record<string, any>): string {
  // Anime/game: different negatives
  if (profile.style === 'anime') return buildAnimeNegativePrompt()
  if (profile.style === 'game') return buildGameNegativePrompt()

  const parts = [
    'cartoon, anime, illustration, painting, drawing, sketch, 3d render, cgi',
    'deformed, ugly, blurry, low quality, bad anatomy, bad proportions',
    'extra fingers, mutated hands, poorly drawn face, disfigured',
    'watermark, text, logo, signature',
    'close-up, headshot, bust shot, cropped body, cut off legs, cut off feet',
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

  // Hijab negative — prevent face-covering items only (niqab/burqa), jellaba is allowed
  if (profile.hairLength === 'hijab') {
    parts.push('niqab, burqa, face veil, face covering')
  }

  return parts.join(', ')
}

// ─── Main prompt builder ──────────────────────────────────────────────────
export function buildAvatarPrompt(profile: Record<string, any>, emotion = 'neutral', sfwMode = true): string {
  // Anime: avatar prompt uses character prompt tags directly
  if (profile.style === 'anime') {
    const tags = profile.promptTags || '1girl, anime style'
    const expression = EMOTION_EXPRESSIONS[emotion] || EMOTION_EXPRESSIONS.neutral
    return `${tags}, ${expression}, portrait, upper body, anime style, masterpiece, best quality, highres, detailed face, vibrant colors`
  }

  // Game: semi-realistic 3D avatar
  if (profile.style === 'game') {
    const tags = profile.promptTags || 'young woman, game character'
    const expression = EMOTION_EXPRESSIONS[emotion] || EMOTION_EXPRESSIONS.neutral
    return `${tags}, ${expression}, portrait, upper body, 3d render, unreal engine 5, semi-realistic, game character, detailed skin texture, volumetric lighting, highres, cinematic`
  }

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
  // Hair/hijab with emphasis
  const isHijab = profile.hairLength === 'hijab'
  if (isHijab) {
    faceParts.push(`(wearing ${hairColor} colored hijab headscarf covering hair:1.5)`)
  } else {
    faceParts.push(`(${hairColor} ${hairLength}:1.3)`)
  }
  // Skin
  faceParts.push(skin)
  // Beard with HIGH emphasis (most commonly missed)
  if (beardDesc) {
    faceParts.push(`(${beardDesc}:1.4)`)
  } else if (isMale) {
    faceParts.push('(clean shaven smooth face:1.2)')
  }

  const faceBlock = faceParts.join(', ')

  // Build the prompt — full body portrait from head to toe
  const prompt = [
    // Subject identity (most important — first tokens get highest weight)
    `photorealistic full body portrait from head to toe, showing entire body including feet`,
    `${age} ${ethnicity} ${gender}`,
    // Face details (second highest priority)
    faceBlock,
    // Body (higher emphasis for full body)
    `(${bodyDesc}:1.3)`,
    // Clothing
    clothing,
    // Expression
    expression,
    // Technical quality
    'looking at camera, standing pose, full length shot',
    'professional studio photography, soft warm directional lighting, neutral dark background',
    'shot on Sony A7R IV 35mm wide lens, 8k, ultra-detailed, photorealistic skin texture',
    // Reinforcement of key features (repeat for emphasis)
    `BREAK full body head to toe, ${eyeColor} eyes, ${isHijab ? `${hairColor} hijab headscarf` : `${hairColor} hair`}${beardDesc ? `, ${beardDesc}` : ''}, ${build}`,
  ].join(', ')

  return prompt
}
