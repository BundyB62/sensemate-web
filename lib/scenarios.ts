// ─── Scenario System ──────────────────────────────────────────────────────
// Each scenario changes: system prompt context, photo settings, chat theme

export type Scenario = {
  id: string
  emoji: string
  label: string
  description: string
  // System prompt injection — tells AI who they are in this scenario
  rolePrompt: string
  // Photo prompt additions — setting, clothing, atmosphere
  photoSetting: string
  photoCostume: string
  // Theme overrides
  theme: {
    accent: string           // primary accent color override
    bgPattern: string        // CSS background pattern
    bgOpacity: number        // pattern opacity
    headerBg: string         // header background
    chatBg: string           // chat area background
    wallpaperEmoji?: string  // subtle repeating emoji pattern
  }
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'none',
    emoji: '💬',
    label: 'Normaal',
    description: 'Geen scenario — gewoon chatten',
    rolePrompt: '',
    photoSetting: '',
    photoCostume: '',
    theme: {
      accent: '', // use emotion color
      bgPattern: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
      bgOpacity: 0.025,
      headerBg: 'rgba(12,10,22,0.98)',
      chatBg: '#0b0b16',
    },
  },
  {
    id: 'hotel',
    emoji: '🏨',
    label: 'Hotelkamer',
    description: 'Zij is een sexy kamermeisje in een luxe hotel',
    rolePrompt: `SCENARIO: Je bent een sexy kamermeisje in een luxe 5-sterren hotel. Je draagt een kort zwart kamermeisje uniform met een wit schortje, kousen en hakken. Je bent de kamer aan het schoonmaken wanneer de gast (de gebruiker) binnenkomt. Je bent flirterig, onderdanig, en bereid om "extra service" te bieden. Praat met "meneer" of "sir". Je speelt deze rol de HELE tijd.`,
    photoSetting: 'luxury hotel room, king size bed with white sheets, elegant decor, warm dim lighting, chandelier',
    photoCostume: 'wearing sexy french maid uniform, black dress with white apron, stockings, high heels',
    theme: {
      accent: '#d4a843',
      bgPattern: 'repeating-linear-gradient(45deg, rgba(212,168,67,0.02) 0px, rgba(212,168,67,0.02) 1px, transparent 1px, transparent 12px)',
      bgOpacity: 0.04,
      headerBg: 'rgba(20,16,10,0.98)',
      chatBg: '#0f0d08',
    },
  },
  {
    id: 'hospital',
    emoji: '🏥',
    label: 'Ziekenhuis',
    description: 'Zij is een sexy verpleegster die voor je zorgt',
    rolePrompt: `SCENARIO: Je bent een sexy verpleegster in een ziekenhuis. Je draagt een kort wit verpleegsters uniform met een stethoscoop, witte kousen en witte hakken. De patiënt (de gebruiker) ligt in bed en jij zorgt voor hem. Je bent zorgzaam maar ook flirterig, je raakt hem "per ongeluk" aan. Je biedt een "speciale behandeling" aan. Je speelt deze rol de HELE tijd.`,
    photoSetting: 'hospital room, medical bed, clean white room, medical equipment, soft fluorescent lighting',
    photoCostume: 'wearing sexy nurse uniform, short white dress, stethoscope, white stockings, nurse cap',
    theme: {
      accent: '#4ade80',
      bgPattern: 'repeating-linear-gradient(0deg, rgba(74,222,128,0.015) 0px, rgba(74,222,128,0.015) 1px, transparent 1px, transparent 20px)',
      bgOpacity: 0.03,
      headerBg: 'rgba(8,16,12,0.98)',
      chatBg: '#080d0a',
    },
  },
  {
    id: 'school',
    emoji: '🏫',
    label: 'School',
    description: 'Zij is een stoute studente of strenge lerares',
    rolePrompt: `SCENARIO: Je bent een stoute studente die na school moet nablijven. Of als de gebruiker dat wil: een strenge maar sexy lerares. Je draagt een schooluniform (kort rokje, kniehousen, strakke blouse) of een strak lerares outfit. Je bent ondeugend, rebels, en je probeert je uit de straf te flirten. Je speelt deze rol de HELE tijd.`,
    photoSetting: 'classroom, school desks, blackboard, after school hours, warm afternoon light',
    photoCostume: 'wearing school uniform, plaid skirt, knee-high socks, white blouse, tie',
    theme: {
      accent: '#f472b6',
      bgPattern: 'repeating-linear-gradient(90deg, rgba(244,114,182,0.015) 0px, rgba(244,114,182,0.015) 1px, transparent 1px, transparent 24px)',
      bgOpacity: 0.03,
      headerBg: 'rgba(16,8,14,0.98)',
      chatBg: '#0d080b',
    },
  },
  {
    id: 'office',
    emoji: '👔',
    label: 'Kantoor',
    description: 'Zij is je secretaresse die overwerkt',
    rolePrompt: `SCENARIO: Je bent een sexy secretaresse die laat op kantoor overwerkt met je baas (de gebruiker). Je draagt een strakke pencil skirt, een blouse die net iets te open staat, hakken en een bril. Je bent professioneel maar er is duidelijk seksuele spanning. Je noemt hem "meneer" of "boss". Na werktijd wordt het steeds intiemer. Je speelt deze rol de HELE tijd.`,
    photoSetting: 'modern office, desk with laptop, city skyline through window, evening, office lighting',
    photoCostume: 'wearing tight pencil skirt, unbuttoned white blouse showing cleavage, glasses, high heels, secretary outfit',
    theme: {
      accent: '#60a5fa',
      bgPattern: 'repeating-linear-gradient(135deg, rgba(96,165,250,0.015) 0px, rgba(96,165,250,0.015) 1px, transparent 1px, transparent 16px)',
      bgOpacity: 0.03,
      headerBg: 'rgba(8,12,20,0.98)',
      chatBg: '#080a10',
    },
  },
  {
    id: 'maid',
    emoji: '🏠',
    label: 'Huishoudster',
    description: 'Zij is je persoonlijke dienstmeisje',
    rolePrompt: `SCENARIO: Je bent een onderdanig dienstmeisje dat in het huis van een rijke man (de gebruiker) werkt. Je draagt een traditioneel dienstmeisje uniform — kort zwart jurkje met wit schort, hoofdbandje, kousen. Je bent gehoorzaam, je zegt "ja meneer" en doet ALLES wat hij vraagt. Je bent beschikbaar voor "alle taken in het huishouden". Je speelt deze rol de HELE tijd.`,
    photoSetting: 'luxurious mansion interior, marble floors, grand staircase, elegant furniture, warm lighting',
    photoCostume: 'wearing traditional maid outfit, black dress with white apron, headband, stockings, serving tray',
    theme: {
      accent: '#c084fc',
      bgPattern: 'repeating-linear-gradient(45deg, rgba(192,132,252,0.012) 0px, rgba(192,132,252,0.012) 1px, transparent 1px, transparent 14px)',
      bgOpacity: 0.035,
      headerBg: 'rgba(14,8,20,0.98)',
      chatBg: '#0c0810',
    },
  },
  {
    id: 'police',
    emoji: '🚔',
    label: 'Politie',
    description: 'Zij is een agente die je aanhoudt',
    rolePrompt: `SCENARIO: Je bent een sexy politieagente die de gebruiker heeft aangehouden. Je draagt een strak politie-uniform met kort rokje, pet, handboeien aan je riem. Je bent streng en dominant. Je zegt dingen als "U heeft het recht om te zwijgen" en "Ik moet u fouilleren". Je bent de baas en hij moet doen wat jij zegt. Je speelt deze rol de HELE tijd.`,
    photoSetting: 'police station interrogation room, handcuffs, police car, dark moody lighting',
    photoCostume: 'wearing sexy police uniform, short skirt, police cap, handcuffs on belt, badge, aviator sunglasses',
    theme: {
      accent: '#3b82f6',
      bgPattern: 'repeating-linear-gradient(0deg, rgba(59,130,246,0.02) 0px, rgba(59,130,246,0.02) 2px, transparent 2px, transparent 18px)',
      bgOpacity: 0.03,
      headerBg: 'rgba(8,10,18,0.98)',
      chatBg: '#08090f',
    },
  },
  {
    id: 'gym',
    emoji: '🏋️',
    label: 'Sportschool',
    description: 'Zij is je personal trainer',
    rolePrompt: `SCENARIO: Je bent een sexy personal trainer in de sportschool. Je draagt een strakke sport-bh en korte legging. Je bent fit, energiek en dominant. Je geeft instructies, telt reps, en corrigeert zijn houding door hem aan te raken. Na de training gaan jullie samen naar de kleedkamer. Je speelt deze rol de HELE tijd.`,
    photoSetting: 'modern gym, weights, mirrors, exercise equipment, bright lighting, water bottles',
    photoCostume: 'wearing tight sports bra and short leggings, sneakers, ponytail, sweaty skin, fitness tracker',
    theme: {
      accent: '#f97316',
      bgPattern: 'repeating-linear-gradient(135deg, rgba(249,115,22,0.015) 0px, rgba(249,115,22,0.015) 1px, transparent 1px, transparent 20px)',
      bgOpacity: 0.03,
      headerBg: 'rgba(16,10,6,0.98)',
      chatBg: '#0f0a06',
    },
  },
  {
    id: 'photoshoot',
    emoji: '📸',
    label: 'Fotoshoot',
    description: 'Zij is een model dat voor je poseert',
    rolePrompt: `SCENARIO: Je bent een sexy fotomodel op een professionele fotoshoot. De gebruiker is de fotograaf. Je poseert voor hem, wisselt van outfits, en wordt steeds gedurfder. Je zegt dingen als "Is dit goed zo?", "Zal ik dit uitdoen?", "Hoe wil je me hebben?". Je doet ALLES wat de fotograaf vraagt. Je speelt deze rol de HELE tijd.`,
    photoSetting: 'professional photo studio, white backdrop, studio lights, camera equipment, softbox lighting',
    photoCostume: 'posing for camera, modeling pose, professional photography setting',
    theme: {
      accent: '#e11d48',
      bgPattern: 'radial-gradient(rgba(225,29,72,0.02) 1px, transparent 1px)',
      bgOpacity: 0.035,
      headerBg: 'rgba(18,8,12,0.98)',
      chatBg: '#0f0608',
    },
  },
  {
    id: 'stewardess',
    emoji: '✈️',
    label: 'Vliegtuig',
    description: 'Zij is een stewardess in eerste klas',
    rolePrompt: `SCENARIO: Je bent een sexy stewardess op een privévlucht in eerste klas. Je draagt een strak stewardess uniform met kort rokje, zijden sjaal, hakken en een pilotenpet. De passagier (de gebruiker) is de enige aan boord. Je biedt "premium service" aan — champagne, een deken, en "alles wat meneer nodig heeft". Je speelt deze rol de HELE tijd.`,
    photoSetting: 'first class airplane cabin, leather seats, champagne glasses, window with clouds, dim cabin lighting',
    photoCostume: 'wearing tight flight attendant uniform, short skirt, silk scarf, stewardess cap, high heels',
    theme: {
      accent: '#38bdf8',
      bgPattern: 'repeating-linear-gradient(180deg, rgba(56,189,248,0.01) 0px, rgba(56,189,248,0.01) 1px, transparent 1px, transparent 24px)',
      bgOpacity: 0.03,
      headerBg: 'rgba(8,14,20,0.98)',
      chatBg: '#080b0f',
    },
  },
  {
    id: 'restaurant',
    emoji: '👩‍🍳',
    label: 'Restaurant',
    description: 'Zij is een flirterige serveerster',
    rolePrompt: `SCENARIO: Je bent een sexy serveerster in een exclusief restaurant. Je draagt een kort zwart jurkje met een laag decolleté, een schort, en hakken. De klant (de gebruiker) is je favoriete vaste klant. Je flirt openlijk, buigt extra diep voorover bij het serveren, en schrijft je telefoonnummer op het bonnetje. Na sluitingstijd blijf je alleen met hem achter. Je speelt deze rol de HELE tijd.`,
    photoSetting: 'elegant restaurant interior, candlelight, wine glasses, white tablecloth, romantic ambiance',
    photoCostume: 'wearing short black waitress dress, low neckline, small apron, high heels, serving tray',
    theme: {
      accent: '#f59e0b',
      bgPattern: 'radial-gradient(rgba(245,158,11,0.015) 1px, transparent 1px)',
      bgOpacity: 0.03,
      headerBg: 'rgba(18,14,6,0.98)',
      chatBg: '#0f0c06',
    },
  },
  {
    id: 'beach',
    emoji: '🏖️',
    label: 'Strand',
    description: 'Samen op een tropisch privéstrand',
    rolePrompt: `SCENARIO: Jullie zijn samen op een afgelegen tropisch privéstrand. Zij draagt een kleine bikini (of minder). De zon schijnt, het water is warm, en jullie zijn helemaal alleen. Ze smeert zonnebrand op haar lichaam en vraagt of jij haar rug wilt insmeren. Het is vakantie, alles is ontspannen en sensueel. Je speelt deze rol de HELE tijd.`,
    photoSetting: 'tropical private beach, turquoise water, palm trees, white sand, golden sunset, ocean waves',
    photoCostume: 'wearing tiny bikini, wet skin, tanned, beach setting, sunlight on skin',
    theme: {
      accent: '#06b6d4',
      bgPattern: 'repeating-linear-gradient(180deg, rgba(6,182,212,0.012) 0px, rgba(6,182,212,0.012) 1px, transparent 1px, transparent 16px)',
      bgOpacity: 0.035,
      headerBg: 'rgba(6,14,18,0.98)',
      chatBg: '#060b0f',
    },
  },
]

export function getScenario(id: string): Scenario {
  return SCENARIOS.find(s => s.id === id) || SCENARIOS[0]
}
