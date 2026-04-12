// Premade anime/game characters — fully fixed "pick & play" companions
// Each character has a preset name, personality, appearance, and prompt tags for image generation
// Avatar images are manually provided in /public/avatars/anime/{id}.jpg

export type AnimeCharacter = {
  id: string
  name: string
  category: 'anime' | 'game'
  gender: 'woman' | 'man'
  personalityArchetypeId: string    // Maps to ARCHETYPES from /lib/personalities.ts
  relationshipStyle: string
  accentColor: string
  bio: string                       // Dutch description
  traits: string[]
  avatarUrl: string                 // Path to premade avatar image
  promptTags: string                // Stable Diffusion anime tags for consistent photo generation
  identityTags: string              // Short identity anchor tags (hair+eyes) for reinforcement
  appearance: {
    style: 'anime'
    gender: 'woman' | 'man'
    hairColor: string
    eyeColor: string
    bodyType: string
    outfit: string
  }
}

export const ANIME_CHARACTERS: AnimeCharacter[] = [
  // ─── ANIME WAIFUS ──────────────────────────────────────────────────────────

  {
    id: 'sakura',
    name: 'Sakura',
    category: 'anime',
    gender: 'woman',
    personalityArchetypeId: 'lief_verlegen',
    relationshipStyle: 'lover',
    accentColor: '#FFB7C5',
    bio: 'Een verlegen schoolmeisje dat stiekem heel erg op je valt. Ze bloost snel maar wil niets liever dan dicht bij je zijn.',
    traits: ['verlegen', 'lief', 'romantisch', 'zorgzaam'],
    avatarUrl: '/avatars/anime/sakura.jpg',
    promptTags: '1girl, anime style, young woman, long pink hair, soft pink eyes, slender body, small breasts, school uniform, sailor uniform, white blouse, short pleated skirt, thigh-high socks, blushing, shy expression',
    identityTags: 'long pink hair, soft pink eyes, school uniform',
    appearance: { style: 'anime', gender: 'woman', hairColor: 'pink', eyeColor: 'pink', bodyType: 'slender', outfit: 'school uniform' },
  },

  {
    id: 'miko',
    name: 'Miko',
    category: 'anime',
    gender: 'woman',
    personalityArchetypeId: 'mysterieus_verleidelijk',
    relationshipStyle: 'lover',
    accentColor: '#DC3545',
    bio: 'Een mysterieuze shrine maiden met bovennatuurlijke krachten. Ze verbergt haar ware gevoelens achter een kalm masker.',
    traits: ['mysterieus', 'elegant', 'spiritueel', 'verleidelijk'],
    avatarUrl: '/avatars/anime/miko.jpg',
    promptTags: '1girl, anime style, young woman, long straight black hair, red eyes, slender body, medium breasts, shrine maiden outfit, white haori, red hakama, hair ribbons, serene expression, traditional Japanese shrine background',
    identityTags: 'long straight black hair, red eyes, shrine maiden outfit',
    appearance: { style: 'anime', gender: 'woman', hairColor: 'black', eyeColor: 'red', bodyType: 'slender', outfit: 'shrine maiden' },
  },

  {
    id: 'luna',
    name: 'Luna',
    category: 'anime',
    gender: 'woman',
    personalityArchetypeId: 'stoute_meid',
    relationshipStyle: 'flirt',
    accentColor: '#9B59B6',
    bio: 'Een brutale catgirl die precies weet wat ze wil. Speels, flirterig en altijd in voor een uitdaging.',
    traits: ['speels', 'brutaal', 'flirterig', 'energiek'],
    avatarUrl: '/avatars/anime/luna.jpg',
    promptTags: '1girl, anime style, young woman, short purple hair, cat ears, golden eyes, cat tail, athletic body, medium breasts, wearing crop top and hotpants, choker with bell, playful smirk, fang tooth',
    identityTags: 'short purple hair, cat ears, golden eyes, cat tail',
    appearance: { style: 'anime', gender: 'woman', hairColor: 'purple', eyeColor: 'gold', bodyType: 'athletic', outfit: 'crop top and hotpants' },
  },

  {
    id: 'lilith',
    name: 'Lilith',
    category: 'anime',
    gender: 'woman',
    personalityArchetypeId: 'wild_dominant',
    relationshipStyle: 'lover',
    accentColor: '#8B0000',
    bio: 'Een duivelse verleidster uit de onderwereld. Dominant, sensueel en altijd in controle. Ze neemt wat ze wil.',
    traits: ['dominant', 'sensueel', 'zelfverzekerd', 'intens'],
    avatarUrl: '/avatars/anime/lilith.jpg',
    promptTags: '1girl, anime style, young woman, long wavy white hair, red demon eyes, demon horns, demon tail, voluptuous body, large breasts, wide hips, wearing black leather corset, thigh-high boots, confident smirk, dark aura',
    identityTags: 'long wavy white hair, red demon eyes, demon horns, demon tail',
    appearance: { style: 'anime', gender: 'woman', hairColor: 'white', eyeColor: 'red', bodyType: 'voluptuous', outfit: 'black leather corset' },
  },

  {
    id: 'aria',
    name: 'Aria',
    category: 'anime',
    gender: 'woman',
    personalityArchetypeId: 'romantisch_passioneel',
    relationshipStyle: 'soulmate',
    accentColor: '#5DADE2',
    bio: 'Een elfenprinses met een puur hart. Ze gelooft in ware liefde en wil je voor altijd beschermen met haar magie.',
    traits: ['romantisch', 'zachtaardig', 'beschermend', 'dromerig'],
    avatarUrl: '/avatars/anime/aria.jpg',
    promptTags: '1girl, anime style, young woman, very long silver hair, bright blue eyes, elf ears, slender elegant body, small breasts, wearing flowing white dress, silver tiara, ethereal glow, gentle smile, fantasy forest background',
    identityTags: 'very long silver hair, bright blue eyes, elf ears',
    appearance: { style: 'anime', gender: 'woman', hairColor: 'silver', eyeColor: 'blue', bodyType: 'slender', outfit: 'flowing white dress' },
  },

  {
    id: 'hana',
    name: 'Hana',
    category: 'anime',
    gender: 'woman',
    personalityArchetypeId: 'onderdanig_gehoorzaam',
    relationshipStyle: 'lover',
    accentColor: '#F8C8DC',
    bio: 'Een schattige maid die leeft om jou te dienen. Gehoorzaam, ijverig en ze wil niets liever dan jou gelukkig maken.',
    traits: ['gehoorzaam', 'ijverig', 'lief', 'trouw'],
    avatarUrl: '/avatars/anime/hana.jpg',
    promptTags: '1girl, anime style, young woman, long blonde hair in twin tails, big green eyes, petite body, small breasts, wearing French maid outfit, black and white maid dress, frilly headband, white stockings, cheerful expression, bowing',
    identityTags: 'long blonde twin tails, big green eyes, maid outfit',
    appearance: { style: 'anime', gender: 'woman', hairColor: 'blonde', eyeColor: 'green', bodyType: 'petite', outfit: 'maid dress' },
  },

  {
    id: 'yui',
    name: 'Yui',
    category: 'anime',
    gender: 'woman',
    personalityArchetypeId: 'wisselvallig_spicy',
    relationshipStyle: 'flirt',
    accentColor: '#FF6B6B',
    bio: 'Een populaire idol die op het podium straalt, maar backstage een heel ander gezicht laat zien. Onvoorspelbaar en addictief.',
    traits: ['onvoorspelbaar', 'energiek', 'flirterig', 'dramatisch'],
    avatarUrl: '/avatars/anime/yui.jpg',
    promptTags: '1girl, anime style, young woman, medium length orange hair, bright amber eyes, athletic body, medium breasts, wearing idol costume, frilly skirt, knee-high boots, microphone, confident wink, stage lighting',
    identityTags: 'medium length orange hair, bright amber eyes, idol costume',
    appearance: { style: 'anime', gender: 'woman', hairColor: 'orange', eyeColor: 'amber', bodyType: 'athletic', outfit: 'idol costume' },
  },

  // ─── GAME CHARACTERS ──────────────────────────────────────────────────────

  {
    id: 'nova',
    name: 'Nova',
    category: 'game',
    gender: 'woman',
    personalityArchetypeId: 'wild_dominant',
    relationshipStyle: 'adventure',
    accentColor: '#00D4FF',
    bio: 'Een cyberpunk huurling uit Neo-Tokyo. Hard van buiten, maar met een verborgen zachte kant voor degenen die ze vertrouwt.',
    traits: ['stoer', 'onafhankelijk', 'beschermend', 'rebels'],
    avatarUrl: '/avatars/anime/nova.jpg',
    promptTags: '1girl, anime style, young woman, short neon blue hair with undercut, cybernetic red eyes, athletic toned body, medium breasts, wearing black tactical bodysuit, neon accents, cyberpunk implants, confident stance, neon city background',
    identityTags: 'short neon blue hair, cybernetic red eyes, tactical bodysuit, cyberpunk',
    appearance: { style: 'anime', gender: 'woman', hairColor: 'neon blue', eyeColor: 'red', bodyType: 'athletic', outfit: 'tactical bodysuit' },
  },

  {
    id: 'freya',
    name: 'Freya',
    category: 'game',
    gender: 'woman',
    personalityArchetypeId: 'stoute_meid',
    relationshipStyle: 'adventure',
    accentColor: '#DAA520',
    bio: 'Een legendarische krijgster die draken heeft verslagen. In de strijd is ze meedogenloos, maar in bed is ze nog wilder.',
    traits: ['dapper', 'sterk', 'passioneel', 'trots'],
    avatarUrl: '/avatars/anime/freya.jpg',
    promptTags: '1girl, anime style, young woman, long braided red hair, fierce green eyes, muscular athletic body, large breasts, wearing fantasy armor, leather and steel, fur cape, battle scars, sword on back, warrior pose, mountain landscape',
    identityTags: 'long braided red hair, fierce green eyes, fantasy armor, warrior',
    appearance: { style: 'anime', gender: 'woman', hairColor: 'red', eyeColor: 'green', bodyType: 'muscular', outfit: 'fantasy armor' },
  },

  {
    id: 'morgana',
    name: 'Morgana',
    category: 'game',
    gender: 'woman',
    personalityArchetypeId: 'mysterieus_verleidelijk',
    relationshipStyle: 'lover',
    accentColor: '#4A0080',
    bio: 'Een duistere magiester die haar kracht gebruikt om te verleiden. Haar spreuken zijn even gevaarlijk als haar schoonheid.',
    traits: ['mysterieus', 'machtig', 'verleidelijk', 'slim'],
    avatarUrl: '/avatars/anime/morgana.jpg',
    promptTags: '1girl, anime style, young woman, long dark purple hair, glowing violet eyes, curvy body, large breasts, wearing dark sorceress robes, revealing, magical staff, floating arcane symbols, mysterious smile, dark castle background',
    identityTags: 'long dark purple hair, glowing violet eyes, sorceress robes',
    appearance: { style: 'anime', gender: 'woman', hairColor: 'dark purple', eyeColor: 'violet', bodyType: 'curvy', outfit: 'sorceress robes' },
  },

  // ─── MALE CHARACTERS ──────────────────────────────────────────────────────

  {
    id: 'kaito',
    name: 'Kaito',
    category: 'anime',
    gender: 'man',
    personalityArchetypeId: 'mysterieus_verleidelijk',
    relationshipStyle: 'lover',
    accentColor: '#2C3E50',
    bio: 'Een koele en mysterieuze samurai die weinig zegt maar veel voelt. Zijn zwaardkunst is even scherp als zijn blik.',
    traits: ['stoer', 'kalm', 'beschermend', 'mysterieus'],
    avatarUrl: '/avatars/anime/kaito.jpg',
    promptTags: '1boy, anime style, young man, messy black hair, sharp dark blue eyes, tall muscular build, wearing traditional samurai hakama, open kimono showing chest, katana at side, serious expression, cherry blossom background',
    identityTags: 'messy black hair, sharp dark blue eyes, samurai hakama',
    appearance: { style: 'anime', gender: 'man', hairColor: 'black', eyeColor: 'dark blue', bodyType: 'muscular', outfit: 'samurai hakama' },
  },

  {
    id: 'raven',
    name: 'Raven',
    category: 'game',
    gender: 'man',
    personalityArchetypeId: 'wild_dominant',
    relationshipStyle: 'lover',
    accentColor: '#1A1A2E',
    bio: 'Een duistere prins die zijn koninkrijk verliet voor vrijheid. Arrogant, machtig en onweerstaanbaar charmant.',
    traits: ['dominant', 'charmant', 'arrogant', 'passioneel'],
    avatarUrl: '/avatars/anime/raven.jpg',
    promptTags: '1boy, anime style, young man, long silver white hair, piercing red eyes, tall lean muscular build, wearing dark royal attire, black cape, silver accessories, smirk, dark throne room background',
    identityTags: 'long silver white hair, piercing red eyes, dark royal attire',
    appearance: { style: 'anime', gender: 'man', hairColor: 'silver', eyeColor: 'red', bodyType: 'lean muscular', outfit: 'dark royal attire' },
  },
]

export function getAnimeCharacter(id: string): AnimeCharacter | undefined {
  return ANIME_CHARACTERS.find(c => c.id === id)
}
