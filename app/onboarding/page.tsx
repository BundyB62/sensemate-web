'use client'
import { useState, useCallback, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ARCHETYPES } from '@/lib/personalities'

// ─── Types ───────────────────────────────────────────────────────────────────
type Gender = 'woman' | 'man' | 'nonbinary' | 'fantasy'

interface FormData {
  name: string
  gender: Gender
  relationshipStyle: string
  personality: string
  age: string
  ethnicity: string
  build: string
  skinTone: string
  hairColor: string
  hairLength: string
  eyeColor: string
  clothingStyle: string
  vibe: string
  breastSize: string
  assSize: string
  dickSize: string
  beard: string
  features: string[]  // multi-select kenmerken
  // Fantasy-specific (dynamic per race)
  race: string
  ears: string
  horns: string
  wings: string
  tail: string
  markings: string
  aura: string
  halo: string
  fangs: string
  antenna: string
  fur: string
  scales: string
  fins: string
  gills: string
  form: string
  accessories: string
}

// ─── Data ────────────────────────────────────────────────────────────────────
const ACCENT = '#e91e8c'

const GENDERS = [
  { id: 'woman', label: 'Woman', img: '/onboarding/gender/woman.jpg' },
  { id: 'man', label: 'Man', img: '/onboarding/gender/man.jpg' },
  { id: 'nonbinary', label: 'Non-binary', img: '/onboarding/gender/nonbinary.jpg' },
  { id: 'fantasy', label: 'Fantasy', img: '/onboarding/gender/fantasy.jpg' },
]

// ─── Fantasy Data ───────────────────────────────────────────────────────────
const FANTASY_RACES = [
  { id: 'elf', label: 'Elf', img: '/onboarding/fantasy/race/elf.jpg' },
  { id: 'dark_elf', label: 'Dark Elf', img: '/onboarding/fantasy/race/dark_elf.jpg' },
  { id: 'demon', label: 'Demon / Succubus', img: '/onboarding/fantasy/race/demon.jpg' },
  { id: 'angel', label: 'Angel', img: '/onboarding/fantasy/race/angel.jpg' },
  { id: 'vampire', label: 'Vampire', img: '/onboarding/fantasy/race/vampire.jpg' },
  { id: 'fairy', label: 'Fairy', img: '/onboarding/fantasy/race/fairy.jpg' },
  { id: 'orc', label: 'Orc', img: '/onboarding/fantasy/race/orc.jpg' },
  { id: 'dragon_kin', label: 'Dragon-kin', img: '/onboarding/fantasy/race/dragon_kin.jpg' },
  { id: 'catgirl', label: 'Catgirl', img: '/onboarding/fantasy/race/catgirl.jpg' },
  { id: 'foxgirl', label: 'Foxgirl / Kitsune', img: '/onboarding/fantasy/race/foxgirl.jpg' },
  { id: 'werewolf', label: 'Werewolf', img: '/onboarding/fantasy/race/werewolf.jpg' },
  { id: 'mermaid', label: 'Mermaid / Siren', img: '/onboarding/fantasy/race/mermaid.jpg' },
]

// ─── Facial features / kenmerken (multi-select) ────────────────────────────
const FACIAL_FEATURES = [
  { id: 'freckles', label: 'Freckles', emoji: '✨' },
  { id: 'beauty_mark', label: 'Beauty mark', emoji: '•' },
  { id: 'dimples', label: 'Dimples', emoji: '😊' },
  { id: 'thick_brows', label: 'Thick eyebrows', emoji: '🤨' },
  { id: 'thin_brows', label: 'Thin eyebrows', emoji: '〰️' },
  { id: 'chubby_cheeks', label: 'Chubby cheeks', emoji: '🥰' },
  { id: 'sharp_jaw', label: 'Sharp jawline', emoji: '💎' },
  { id: 'high_cheekbones', label: 'High cheekbones', emoji: '👸' },
  { id: 'round_face', label: 'Round face', emoji: '🌕' },
  { id: 'full_lips', label: 'Full lips', emoji: '👄' },
  { id: 'thin_lips', label: 'Thin lips', emoji: '—' },
  { id: 'button_nose', label: 'Button nose', emoji: '🔘' },
  { id: 'big_nose', label: 'Prominent nose', emoji: '👃' },
  { id: 'nose_piercing', label: 'Nose piercing', emoji: '💍' },
  { id: 'septum', label: 'Septum ring', emoji: '🔗' },
  { id: 'lip_piercing', label: 'Lip piercing', emoji: '💋' },
  { id: 'eyebrow_piercing', label: 'Brow piercing', emoji: '⚡' },
  { id: 'ear_piercings', label: 'Ear piercings', emoji: '✦' },
  { id: 'glasses', label: 'Glasses', emoji: '👓' },
  { id: 'gap_teeth', label: 'Gap teeth', emoji: '🦷' },
  { id: 'scar_face', label: 'Face scar', emoji: '⚔️' },
  { id: 'rosy_cheeks', label: 'Rosy cheeks', emoji: '🌸' },
]

// ─── Race-specific feature sets ─────────────────────────────────────────────
// Each race has its own relevant features with appropriate options
type FeatureGroup = { label: string; key: string; options: { id: string; label: string }[] }

const RACE_FEATURES: Record<string, FeatureGroup[]> = {
  elf: [
    { label: 'Ears', key: 'ears', options: [
      { id: 'pointed_short', label: 'Pointed (short)' }, { id: 'pointed_long', label: 'Pointed (long)' }, { id: 'very_long', label: 'Very long elven' },
    ]},
    { label: 'Markings', key: 'markings', options: [
      { id: 'none', label: 'None' }, { id: 'facial_tattoo', label: 'Facial tattoos' }, { id: 'rune_marks', label: 'Rune markings' }, { id: 'freckles', label: 'Freckles' },
    ]},
    { label: 'Aura', key: 'aura', options: [
      { id: 'none', label: 'None' }, { id: 'nature_glow', label: 'Nature glow' }, { id: 'moonlight', label: 'Moonlight shimmer' }, { id: 'golden', label: 'Golden aura' },
    ]},
  ],
  dark_elf: [
    { label: 'Ears', key: 'ears', options: [
      { id: 'pointed_short', label: 'Pointed (short)' }, { id: 'pointed_long', label: 'Pointed (long)' }, { id: 'very_long', label: 'Very long' },
    ]},
    { label: 'Markings', key: 'markings', options: [
      { id: 'none', label: 'None' }, { id: 'facial_tattoo', label: 'Face tattoos' }, { id: 'rune_marks', label: 'Dark runes' }, { id: 'war_paint', label: 'War paint' }, { id: 'glowing_veins', label: 'Glowing veins' },
    ]},
    { label: 'Aura', key: 'aura', options: [
      { id: 'none', label: 'None' }, { id: 'dark_magic', label: 'Dark magic aura' }, { id: 'shadow', label: 'Shadow wisps' }, { id: 'purple_glow', label: 'Purple glow' },
    ]},
  ],
  demon: [
    { label: 'Horns', key: 'horns', options: [
      { id: 'small', label: 'Small' }, { id: 'large', label: 'Large curved' }, { id: 'ram', label: 'Ram-style' }, { id: 'demon', label: 'Demon crown' }, { id: 'none', label: 'None' },
    ]},
    { label: 'Wings', key: 'wings', options: [
      { id: 'none', label: 'None' }, { id: 'demon', label: 'Bat wings (small)' }, { id: 'demon_large', label: 'Bat wings (large)' },
    ]},
    { label: 'Tail', key: 'tail', options: [
      { id: 'none', label: 'None' }, { id: 'demon', label: 'Thin pointed' }, { id: 'demon_thick', label: 'Thick barbed' }, { id: 'demon_whip', label: 'Whip-like' },
    ]},
    { label: 'Markings', key: 'markings', options: [
      { id: 'none', label: 'None' }, { id: 'rune_marks', label: 'Rune tattoos' }, { id: 'glowing_veins', label: 'Glowing veins' }, { id: 'body_marks', label: 'Body markings' },
    ]},
  ],
  angel: [
    { label: 'Wings', key: 'wings', options: [
      { id: 'angel', label: 'White feathered' }, { id: 'angel_large', label: 'Large white wings' }, { id: 'golden_wings', label: 'Golden wings' }, { id: 'fallen', label: 'Broken/fallen wings' },
    ]},
    { label: 'Halo', key: 'halo', options: [
      { id: 'none', label: 'None' }, { id: 'golden', label: 'Golden halo' }, { id: 'broken', label: 'Broken halo' }, { id: 'dark', label: 'Dark halo' },
    ]},
    { label: 'Aura', key: 'aura', options: [
      { id: 'none', label: 'None' }, { id: 'holy_glow', label: 'Holy glow' }, { id: 'divine_radiance', label: 'Divine radiance' }, { id: 'subtle_shimmer', label: 'Subtle shimmer' },
    ]},
  ],
  vampire: [
    { label: 'Fangs', key: 'fangs', options: [
      { id: 'subtle', label: 'Subtle' }, { id: 'prominent', label: 'Prominent' }, { id: 'long', label: 'Long & sharp' },
    ]},
    { label: 'Features', key: 'markings', options: [
      { id: 'none', label: 'None' }, { id: 'pale_veins', label: 'Pale veins' }, { id: 'blood_tears', label: 'Blood tears' }, { id: 'dark_circles', label: 'Dark under-eyes' },
    ]},
    { label: 'Aura', key: 'aura', options: [
      { id: 'none', label: 'None' }, { id: 'dark_mist', label: 'Dark mist' }, { id: 'blood_red_glow', label: 'Blood red glow' }, { id: 'shadow', label: 'Shadow wisps' },
    ]},
  ],
  fairy: [
    { label: 'Wings', key: 'wings', options: [
      { id: 'fairy', label: 'Translucent' }, { id: 'butterfly', label: 'Butterfly' }, { id: 'dragonfly', label: 'Dragonfly' }, { id: 'petal', label: 'Petal-shaped' },
    ]},
    { label: 'Glow', key: 'aura', options: [
      { id: 'none', label: 'None' }, { id: 'body_shimmer', label: 'Body shimmer' }, { id: 'sparkle_trail', label: 'Sparkle trail' }, { id: 'bioluminescent', label: 'Bioluminescent' },
    ]},
    { label: 'Antenna', key: 'antenna', options: [
      { id: 'none', label: 'None' }, { id: 'butterfly', label: 'Butterfly antenna' }, { id: 'moth', label: 'Moth antenna' },
    ]},
    { label: 'Ears', key: 'ears', options: [
      { id: 'pointed_short', label: 'Pointed' }, { id: 'normal', label: 'Normal' },
    ]},
  ],
  orc: [
    { label: 'Tusks', key: 'fangs', options: [
      { id: 'small', label: 'Small tusks' }, { id: 'prominent', label: 'Medium tusks' }, { id: 'long', label: 'Large tusks' },
    ]},
    { label: 'Markings', key: 'markings', options: [
      { id: 'none', label: 'None' }, { id: 'war_paint', label: 'War paint' }, { id: 'tribal_scars', label: 'Tribal scars' }, { id: 'facial_tattoo', label: 'Tattoos' },
    ]},
    { label: 'Accessories', key: 'accessories', options: [
      { id: 'none', label: 'None' }, { id: 'piercings', label: 'Piercings' }, { id: 'bone_jewelry', label: 'Bone jewelry' }, { id: 'war_braids', label: 'War braids' },
    ]},
  ],
  dragon_kin: [
    { label: 'Horns', key: 'horns', options: [
      { id: 'small', label: 'Small ridges' }, { id: 'large', label: 'Large horns' }, { id: 'crown', label: 'Crown horns' }, { id: 'antlers', label: 'Antler-style' },
    ]},
    { label: 'Scales', key: 'scales', options: [
      { id: 'none', label: 'None' }, { id: 'scattered', label: 'Scattered (face)' }, { id: 'partial', label: 'Partial body' }, { id: 'full', label: 'Full coverage' },
    ]},
    { label: 'Tail', key: 'tail', options: [
      { id: 'none', label: 'None' }, { id: 'dragon', label: 'Dragon tail' }, { id: 'dragon_spiked', label: 'Spiked dragon tail' },
    ]},
    { label: 'Wings', key: 'wings', options: [
      { id: 'none', label: 'None' }, { id: 'dragon', label: 'Dragon wings (small)' }, { id: 'dragon_large', label: 'Dragon wings (large)' },
    ]},
    { label: 'Breath Element', key: 'aura', options: [
      { id: 'none', label: 'None' }, { id: 'fire_aura', label: 'Fire aura' }, { id: 'ice_aura', label: 'Ice aura' }, { id: 'lightning_aura', label: 'Lightning aura' },
    ]},
  ],
  catgirl: [
    { label: 'Cat Ears', key: 'ears', options: [
      { id: 'cat_pointed', label: 'Pointed' }, { id: 'cat_round', label: 'Round' }, { id: 'cat_folded', label: 'Folded (Scottish)' }, { id: 'cat_tufted', label: 'Tufted (lynx)' },
    ]},
    { label: 'Tail', key: 'tail', options: [
      { id: 'cat', label: 'Sleek tail' }, { id: 'cat_fluffy', label: 'Fluffy tail' }, { id: 'cat_short', label: 'Short bobbed' }, { id: 'cat_striped', label: 'Striped tail' },
    ]},
    { label: 'Extra Features', key: 'markings', options: [
      { id: 'none', label: 'None' }, { id: 'whiskers', label: 'Whisker marks' }, { id: 'paw_pads', label: 'Paw pads (hands)' }, { id: 'fangs', label: 'Small fangs' },
    ]},
    { label: 'Fur Patches', key: 'fur', options: [
      { id: 'none', label: 'None' }, { id: 'hands_feet', label: 'Hands & feet' }, { id: 'scattered', label: 'Scattered' },
    ]},
  ],
  foxgirl: [
    { label: 'Fox Ears', key: 'ears', options: [
      { id: 'fox_pointed', label: 'Pointed fox' }, { id: 'fox_large', label: 'Large fluffy' }, { id: 'fox_round', label: 'Round fox' },
    ]},
    { label: 'Tails', key: 'tail', options: [
      { id: 'fox', label: 'Single fluffy' }, { id: 'fox_multi', label: 'Multiple tails (kitsune)' }, { id: 'fox_short', label: 'Short fluffy' },
    ]},
    { label: 'Extra Features', key: 'markings', options: [
      { id: 'none', label: 'None' }, { id: 'whisker_marks', label: 'Whisker marks' }, { id: 'facial_marks', label: 'Face markings' },
    ]},
    { label: 'Fur', key: 'fur', options: [
      { id: 'none', label: 'None' }, { id: 'fluffy_collar', label: 'Fluffy neck fur' }, { id: 'arm_leg', label: 'Arm & leg fur' },
    ]},
  ],
  werewolf: [
    { label: 'Form', key: 'form', options: [
      { id: 'mostly_human', label: 'Mostly human' }, { id: 'partial_wolf', label: 'Partial wolf' }, { id: 'hybrid', label: 'Full hybrid' },
    ]},
    { label: 'Ears', key: 'ears', options: [
      { id: 'normal', label: 'Human' }, { id: 'wolf', label: 'Wolf ears' }, { id: 'pointed_short', label: 'Pointed' },
    ]},
    { label: 'Tail', key: 'tail', options: [
      { id: 'none', label: 'None' }, { id: 'wolf', label: 'Wolf tail' }, { id: 'wolf_bushy', label: 'Bushy wolf tail' },
    ]},
    { label: 'Fur', key: 'fur', options: [
      { id: 'none', label: 'None' }, { id: 'arm_leg', label: 'Arms & legs' }, { id: 'partial', label: 'Chest & back too' }, { id: 'full', label: 'Full body fur' },
    ]},
    { label: 'Fangs', key: 'fangs', options: [
      { id: 'subtle', label: 'Subtle' }, { id: 'prominent', label: 'Prominent' }, { id: 'long', label: 'Large & wild' },
    ]},
  ],
  mermaid: [
    { label: 'Ears', key: 'ears', options: [
      { id: 'fin_ears', label: 'Fin-shaped' }, { id: 'pointed_short', label: 'Pointed' }, { id: 'shell_ears', label: 'Shell-decorated' }, { id: 'normal', label: 'Normal' },
    ]},
    { label: 'Fins', key: 'fins', options: [
      { id: 'none', label: 'None' }, { id: 'dorsal', label: 'Dorsal fin (back)' }, { id: 'arm_fins', label: 'Arm fins' }, { id: 'crown_fin', label: 'Head fin crown' },
    ]},
    { label: 'Scales', key: 'scales', options: [
      { id: 'none', label: 'None' }, { id: 'scattered', label: 'Scattered' }, { id: 'neckline', label: 'Neckline & shoulders' }, { id: 'full_shimmer', label: 'Full body shimmer' },
    ]},
    { label: 'Gills', key: 'gills', options: [
      { id: 'none', label: 'None' }, { id: 'neck', label: 'Neck gills' }, { id: 'side', label: 'Side gills' },
    ]},
    { label: 'Aura', key: 'aura', options: [
      { id: 'none', label: 'None' }, { id: 'water_glow', label: 'Water glow' }, { id: 'bioluminescent', label: 'Bioluminescent' }, { id: 'pearl_shimmer', label: 'Pearl shimmer' },
    ]},
  ],
}

const FANTASY_SKIN = [
  { id: 'porcelain', label: 'Porcelain', color: '#F5E6D3' },
  { id: 'fair', label: 'Fair', color: '#F0D5B8' },
  { id: 'warm_beige', label: 'Warm Beige', color: '#D4A574' },
  { id: 'olive', label: 'Olive', color: '#B89B6A' },
  { id: 'tan', label: 'Tan', color: '#A67C52' },
  { id: 'brown', label: 'Brown', color: '#8B6914' },
  { id: 'dark', label: 'Dark', color: '#4A2C0A' },
  { id: 'blue', label: 'Blue', color: '#5B8DB8' },
  { id: 'dark_blue', label: 'Dark Blue', color: '#2C4A6E' },
  { id: 'green', label: 'Green', color: '#5B8B5A' },
  { id: 'purple', label: 'Purple', color: '#8B5EA0' },
  { id: 'red', label: 'Red', color: '#C0392B' },
  { id: 'grey', label: 'Grey', color: '#808080' },
  { id: 'gold', label: 'Gold', color: '#DAA520' },
  { id: 'white', label: 'Snow White', color: '#F0F0F0' },
]

const FANTASY_EYES = [
  { id: 'blue', label: 'Blue', color: '#4a90d9' },
  { id: 'green', label: 'Green', color: '#4a9d6b' },
  { id: 'hazel', label: 'Hazel', color: '#8b6914' },
  { id: 'amber', label: 'Amber', color: '#c4720a' },
  { id: 'brown', label: 'Brown', color: '#6b3a1a' },
  { id: 'dark_brown', label: 'Dark Brown', color: '#3a1a0a' },
  { id: 'grey', label: 'Grey', color: '#808080' },
  { id: 'violet', label: 'Violet', color: '#8B5CF6' },
  { id: 'red', label: 'Red', color: '#DC2626' },
  { id: 'gold', label: 'Gold', color: '#DAA520' },
  { id: 'silver', label: 'Silver', color: '#C0C0C0' },
  { id: 'slit', label: 'Slit pupils', color: '#9ACD32' },
  { id: 'solid_white', label: 'White (no pupil)', color: '#F0F0F0' },
  { id: 'solid_black', label: 'Black (void)', color: '#1a1a1a' },
  { id: 'heterochromia', label: '2 colors', color: 'linear-gradient(135deg, #4a90d9 50%, #c4720a 50%)' },
]

const FANTASY_CLOTHING = [
  { id: 'armor', label: 'Plate Armor', img: '/onboarding/fantasy/clothing/armor.jpg' },
  { id: 'leather', label: 'Leather Armor', img: '/onboarding/fantasy/clothing/leather.jpg' },
  { id: 'robes', label: 'Mage Robes', img: '/onboarding/fantasy/clothing/robes.jpg' },
  { id: 'elvish', label: 'Elvish Outfit', img: '/onboarding/fantasy/clothing/elvish.jpg' },
  { id: 'royal', label: 'Royal Gown', img: '/onboarding/fantasy/clothing/royal.jpg' },
  { id: 'priestess', label: 'Priestess Robes', img: '/onboarding/fantasy/clothing/priestess.jpg' },
  { id: 'tribal', label: 'Tribal', img: '/onboarding/fantasy/clothing/tribal.jpg' },
  { id: 'dark', label: 'Dark Gothic', img: '/onboarding/fantasy/clothing/dark.jpg' },
  { id: 'minimal', label: 'Minimal / Wraps', img: '/onboarding/fantasy/clothing/minimal.jpg' },
  { id: 'chains', label: 'Chains & Straps', img: '/onboarding/fantasy/clothing/chains.jpg' },
  { id: 'nothing', label: 'Nothing', img: '/onboarding/fantasy/clothing/nothing.jpg' },
]

const RELATIONSHIPS = [
  { id: 'lover', label: 'Lover', desc: 'Romantic, intimate, passionate', img: '/onboarding/relationship/lover.jpg' },
  { id: 'soulmate', label: 'Soulmate', desc: 'Deep connection, forever yours', img: '/onboarding/relationship/soulmate.jpg' },
  { id: 'flirt', label: 'Flirt', desc: 'Playful, teasing, exciting', img: '/onboarding/relationship/flirt.jpg' },
  { id: 'bestfriend', label: 'Best Friend', desc: 'Trusted, warm, honest', img: '/onboarding/relationship/bestfriend.jpg' },
  { id: 'mentor', label: 'Mentor', desc: 'Wise, supportive, guiding', img: '/onboarding/relationship/mentor.jpg' },
  { id: 'adventure', label: 'Adventurer', desc: 'Spontaneous, wild, thrilling', img: '/onboarding/relationship/adventure.jpg' },
]

const AGES = [
  { id: '18s', label: '18–22' },
  { id: '20s', label: '23–28' },
  { id: '25s', label: '29–34' },
  { id: '30s', label: '35–40' },
  { id: '35s', label: '41–46' },
  { id: '40s', label: '47+' },
]

const ETHNICITY_LIST = [
  // Europe
  { id: 'scandinavian', label: 'Scandinavian', img: '/onboarding/ethnicity/woman/scandinavian.jpg' },
  { id: 'irish', label: 'Irish / Celtic', img: '/onboarding/ethnicity/woman/irish.jpg' },
  { id: 'british', label: 'British', img: '/onboarding/ethnicity/woman/british.jpg' },
  { id: 'east_european', label: 'Eastern European', img: '/onboarding/ethnicity/woman/east_european.jpg' },
  { id: 'french', label: 'French', img: '/onboarding/ethnicity/woman/french.jpg' },
  { id: 'mediterranean', label: 'Mediterranean', img: '/onboarding/ethnicity/woman/mediterranean.jpg' },
  // Americas
  { id: 'latina', label: 'Latina', img: '/onboarding/ethnicity/woman/latina.jpg' },
  { id: 'brazilian', label: 'Brazilian', img: '/onboarding/ethnicity/woman/brazilian.jpg' },
  { id: 'mexican', label: 'Mexican', img: '/onboarding/ethnicity/woman/mexican.jpg' },
  // East Asia
  { id: 'japanese', label: 'Japanese', img: '/onboarding/ethnicity/woman/japanese.jpg' },
  { id: 'korean', label: 'Korean', img: '/onboarding/ethnicity/woman/korean.jpg' },
  { id: 'southeast_asian', label: 'Southeast Asian', img: '/onboarding/ethnicity/woman/southeast_asian.jpg' },
  // South Asia
  { id: 'south_asian', label: 'South Asian', img: '/onboarding/ethnicity/woman/south_asian.jpg' },
  // Middle East
  { id: 'middle_eastern', label: 'Middle Eastern', img: '/onboarding/ethnicity/woman/middle_eastern.jpg' },
  { id: 'turkish', label: 'Turkish', img: '/onboarding/ethnicity/woman/turkish.jpg' },
  { id: 'persian', label: 'Persian', img: '/onboarding/ethnicity/woman/persian.jpg' },
  { id: 'north_african', label: 'North African', img: '/onboarding/ethnicity/woman/north_african.jpg' },
  // Africa
  { id: 'west_african', label: 'West African', img: '/onboarding/ethnicity/woman/west_african.jpg' },
  { id: 'east_african', label: 'East African', img: '/onboarding/ethnicity/woman/east_african.jpg' },
  // Americas / Pacific
  { id: 'caribbean', label: 'Caribbean', img: '/onboarding/ethnicity/woman/caribbean.jpg' },
  { id: 'native_american', label: 'Native American', img: '/onboarding/ethnicity/woman/native_american.jpg' },
  { id: 'polynesian', label: 'Polynesian', img: '/onboarding/ethnicity/woman/polynesian.jpg' },
]

const BUILDS_WOMAN = [
  { id: 'petite', label: 'Petite', img: '/onboarding/build/woman/petite.jpg' },
  { id: 'slim', label: 'Slim', img: '/onboarding/build/woman/slim.jpg' },
  { id: 'athletic', label: 'Athletic', img: '/onboarding/build/woman/athletic.jpg' },
  { id: 'average', label: 'Average', img: '/onboarding/build/woman/average.jpg' },
  { id: 'curvy', label: 'Curvy', img: '/onboarding/build/woman/curvy.jpg' },
  { id: 'hourglass', label: 'Hourglass', img: '/onboarding/build/woman/hourglass.jpg' },
  { id: 'thick', label: 'Thick', img: '/onboarding/build/woman/thick.jpg' },
  { id: 'muscular', label: 'Muscular', img: '/onboarding/build/woman/muscular.jpg' },
  { id: 'plus_size', label: 'Plus Size', img: '/onboarding/build/woman/plus_size.jpg' },
]

const BUILDS_MAN = [
  { id: 'slim', label: 'Slim', img: '/onboarding/build/man/slim.jpg' },
  { id: 'lean', label: 'Lean', img: '/onboarding/build/man/lean.jpg' },
  { id: 'athletic', label: 'Athletic', img: '/onboarding/build/man/athletic.jpg' },
  { id: 'average', label: 'Average', img: '/onboarding/build/man/average.jpg' },
  { id: 'dadbod', label: 'Dad Bod', img: '/onboarding/build/man/dadbod.jpg' },
  { id: 'stocky', label: 'Stocky', img: '/onboarding/build/man/stocky.jpg' },
  { id: 'muscular', label: 'Muscular', img: '/onboarding/build/man/muscular.jpg' },
  { id: 'big', label: 'Big', img: '/onboarding/build/man/big.jpg' },
]

const BREAST_SIZES = [
  { id: 'cup-a', label: 'Cup A', img: '/onboarding/breast-size/cup-a.jpg' },
  { id: 'cup-b', label: 'Cup B', img: '/onboarding/breast-size/cup-b.jpg' },
  { id: 'cup-c', label: 'Cup C', img: '/onboarding/breast-size/cup-c.jpg' },
  { id: 'cup-d', label: 'Cup D', img: '/onboarding/breast-size/cup-d.jpg' },
  { id: 'cup-e', label: 'Cup E', img: '/onboarding/breast-size/cup-e.jpg' },
  { id: 'cup-f', label: 'Cup F', img: '/onboarding/breast-size/cup-f.jpg' },
]

const ASS_SIZES = [
  { id: 'small', label: 'Small', img: '/onboarding/ass-size/small.jpg' },
  { id: 'medium', label: 'Medium', img: '/onboarding/ass-size/medium.jpg' },
  { id: 'large', label: 'Large', img: '/onboarding/ass-size/large.jpg' },
  { id: 'xl', label: 'Extra Large', img: '/onboarding/ass-size/xl.jpg' },
]

const DICK_SIZES = [
  { id: 'average', label: 'Average', img: '/onboarding/dick-size/average.jpg' },
  { id: 'large', label: 'Large', img: '/onboarding/dick-size/large.jpg' },
  { id: 'xl', label: 'Extra Large', img: '/onboarding/dick-size/xl.jpg' },
]

const BEARD_STYLES = [
  { id: 'none', label: 'Clean Shaven', img: '/onboarding/beard/none.jpg' },
  { id: 'stubble', label: 'Stubble', img: '/onboarding/beard/stubble.jpg' },
  { id: 'designer', label: 'Designer Stubble', img: '/onboarding/beard/designer.jpg' },
  { id: 'short', label: 'Short Beard', img: '/onboarding/beard/short.jpg' },
  { id: 'medium', label: 'Full Beard', img: '/onboarding/beard/medium.jpg' },
  { id: 'long', label: 'Long Beard', img: '/onboarding/beard/long.jpg' },
  { id: 'goatee', label: 'Goatee', img: '/onboarding/beard/goatee.jpg' },
  { id: 'mustache', label: 'Mustache', img: '/onboarding/beard/mustache.jpg' },
  { id: 'vandyke', label: 'Van Dyke', img: '/onboarding/beard/vandyke.jpg' },
  { id: 'circle', label: 'Circle Beard', img: '/onboarding/beard/circle.jpg' },
]

const VIBES = [
  { id: 'sweet', label: 'Sweet', img: '/onboarding/vibe/sweet.jpg' },
  { id: 'playful', label: 'Playful', img: '/onboarding/vibe/playful.jpg' },
  { id: 'passionate', label: 'Passionate', img: '/onboarding/vibe/passionate.jpg' },
  { id: 'mysterious', label: 'Mysterious', img: '/onboarding/vibe/mysterious.jpg' },
  { id: 'bold', label: 'Bold', img: '/onboarding/vibe/bold.jpg' },
  { id: 'intellectual', label: 'Intellectual', img: '/onboarding/vibe/intellectual.jpg' },
]

const CLOTHING_WOMAN = [
  { id: 'casual', label: 'Casual', img: '/onboarding/clothing/woman/casual.jpg' },
  { id: 'elegant', label: 'Elegant', img: '/onboarding/clothing/woman/elegant.jpg' },
  { id: 'streetwear', label: 'Streetwear', img: '/onboarding/clothing/woman/streetwear.jpg' },
  { id: 'athletic', label: 'Sporty', img: '/onboarding/clothing/woman/athletic.jpg' },
  { id: 'bohemian', label: 'Bohemian', img: '/onboarding/clothing/woman/bohemian.jpg' },
  { id: 'chic', label: 'Chic', img: '/onboarding/clothing/woman/chic.jpg' },
  { id: 'edgy', label: 'Edgy', img: '/onboarding/clothing/woman/edgy.jpg' },
  { id: 'minimalist', label: 'Minimalist', img: '/onboarding/clothing/woman/minimalist.jpg' },
  { id: 'gothic', label: 'Gothic', img: '/onboarding/clothing/woman/gothic.jpg' },
  { id: 'vintage', label: 'Vintage', img: '/onboarding/clothing/woman/vintage.jpg' },
  { id: 'preppy', label: 'Preppy', img: '/onboarding/clothing/woman/preppy.jpg' },
  { id: 'grunge', label: 'Grunge', img: '/onboarding/clothing/woman/grunge.jpg' },
  { id: 'luxury', label: 'Luxury', img: '/onboarding/clothing/woman/luxury.jpg' },
  { id: 'lingerie', label: 'Lingerie', img: '/onboarding/clothing/woman/lingerie.jpg' },
  { id: 'swimwear', label: 'Swimwear', img: '/onboarding/clothing/woman/swimwear.jpg' },
  { id: 'jellaba', label: 'Jellaba', img: '/onboarding/clothing/woman/jellaba.jpg' },
]

const CLOTHING_MAN = [
  { id: 'casual', label: 'Casual', img: '/onboarding/clothing/man/casual.jpg' },
  { id: 'elegant', label: 'Elegant', img: '/onboarding/clothing/man/elegant.jpg' },
  { id: 'streetwear', label: 'Streetwear', img: '/onboarding/clothing/man/streetwear.jpg' },
  { id: 'athletic', label: 'Sporty', img: '/onboarding/clothing/man/athletic.jpg' },
  { id: 'bohemian', label: 'Bohemian', img: '/onboarding/clothing/man/bohemian.jpg' },
  { id: 'chic', label: 'Chic', img: '/onboarding/clothing/man/chic.jpg' },
  { id: 'edgy', label: 'Edgy', img: '/onboarding/clothing/man/edgy.jpg' },
  { id: 'minimalist', label: 'Minimalist', img: '/onboarding/clothing/man/minimalist.jpg' },
  { id: 'grunge', label: 'Grunge', img: '/onboarding/clothing/man/grunge.jpg' },
  { id: 'luxury', label: 'Luxury', img: '/onboarding/clothing/man/luxury.jpg' },
  { id: 'preppy', label: 'Preppy', img: '/onboarding/clothing/man/preppy.jpg' },
]

const CLOTHING_GROUPS_WOMAN: { title: string; ids: string[] }[] = [
  { title: 'Daily', ids: ['casual', 'streetwear', 'athletic', 'minimalist', 'preppy'] },
  { title: 'Dressed up', ids: ['elegant', 'chic', 'vintage', 'luxury'] },
  { title: 'Alternative', ids: ['bohemian', 'edgy', 'gothic', 'grunge'] },
  { title: 'Intimate & beach', ids: ['lingerie', 'swimwear'] },
  { title: 'Traditional', ids: ['jellaba'] },
]

const CLOTHING_GROUPS_MAN: { title: string; ids: string[] }[] = [
  { title: 'Daily', ids: ['casual', 'streetwear', 'athletic', 'minimalist', 'preppy'] },
  { title: 'Dressed up', ids: ['elegant', 'chic', 'luxury'] },
  { title: 'Alternative', ids: ['bohemian', 'edgy', 'grunge'] },
]

const SKIN_TONES = [
  { id: 'porcelain', label: 'Porcelain', color: '#f5e6d3' },
  { id: 'fair', label: 'Fair', color: '#f0d5b8' },
  { id: 'warm_beige', label: 'Warm Beige', color: '#d4a574' },
  { id: 'olive', label: 'Olive', color: '#b8956a' },
  { id: 'tan', label: 'Tan', color: '#a0785a' },
  { id: 'brown', label: 'Brown', color: '#7a4f3a' },
  { id: 'dark', label: 'Dark', color: '#4a2c1a' },
]

const HAIR_COLORS = [
  { id: 'platinum', label: 'Platinum', color: '#f0ece0' },
  { id: 'blonde', label: 'Blonde', color: '#d4a843' },
  { id: 'strawberry', label: 'Strawberry', color: '#d4845a' },
  { id: 'auburn', label: 'Auburn', color: '#8b3a2a' },
  { id: 'ginger', label: 'Ginger', color: '#c46030' },
  { id: 'chestnut', label: 'Chestnut', color: '#6b3a2a' },
  { id: 'brown', label: 'Brown', color: '#4a2c1a' },
  { id: 'dark_brown', label: 'Dark Brown', color: '#2a1a0a' },
  { id: 'black', label: 'Black', color: '#1a1a1a' },
  { id: 'red', label: 'Red', color: '#c0392b' },
  { id: 'grey', label: 'Silver', color: '#a0a0a0' },
  { id: 'white', label: 'White', color: '#e8e8e8' },
  { id: 'pink', label: 'Pink', color: '#e091b0' },
  { id: 'purple', label: 'Purple', color: '#8040a0' },
  { id: 'blue', label: 'Blue', color: '#4060a0' },
  { id: 'ombre', label: 'Ombré', color: 'linear-gradient(180deg, #2a1a0a, #d4a843)' },
]

const HAIR_STYLES_WOMAN = [
  { id: 'long', label: 'Long Straight', img: '/onboarding/hair/woman/long.jpg' },
  { id: 'wavy', label: 'Wavy', img: '/onboarding/hair/woman/wavy.jpg' },
  { id: 'curly', label: 'Curly', img: '/onboarding/hair/woman/curly.jpg' },
  { id: 'very_long', label: 'Very Long', img: '/onboarding/hair/woman/very_long.jpg' },
  { id: 'bob', label: 'Bob', img: '/onboarding/hair/woman/bob.jpg' },
  { id: 'lob', label: 'Lob', img: '/onboarding/hair/woman/lob.jpg' },
  { id: 'pixie', label: 'Pixie Cut', img: '/onboarding/hair/woman/pixie.jpg' },
  { id: 'bangs', label: 'Bangs', img: '/onboarding/hair/woman/bangs.jpg' },
  { id: 'curtain_bangs', label: 'Curtain Bangs', img: '/onboarding/hair/woman/curtain_bangs.jpg' },
  { id: 'ponytail', label: 'Ponytail', img: '/onboarding/hair/woman/ponytail.jpg' },
  { id: 'low_ponytail', label: 'Low Ponytail', img: '/onboarding/hair/woman/low_ponytail.jpg' },
  { id: 'bun', label: 'Bun / Updo', img: '/onboarding/hair/woman/bun.jpg' },
  { id: 'messy_bun', label: 'Messy Bun', img: '/onboarding/hair/woman/messy_bun.jpg' },
  { id: 'pigtails', label: 'Pigtails', img: '/onboarding/hair/woman/pigtails.jpg' },
  { id: 'twin_tails', label: 'Twin Tails', img: '/onboarding/hair/woman/twin_tails.jpg' },
  { id: 'space_buns', label: 'Space Buns', img: '/onboarding/hair/woman/space_buns.jpg' },
  { id: 'braids', label: 'French Braids', img: '/onboarding/hair/woman/braids.jpg' },
  { id: 'french_braid', label: 'Single Braid', img: '/onboarding/hair/woman/french_braid.jpg' },
  { id: 'fishtail', label: 'Fishtail Braid', img: '/onboarding/hair/woman/fishtail.jpg' },
  { id: 'side_braid', label: 'Side Braid', img: '/onboarding/hair/woman/side_braid.jpg' },
  { id: 'half_up', label: 'Half Up', img: '/onboarding/hair/woman/half_up.jpg' },
  { id: 'slicked_back', label: 'Slicked Back', img: '/onboarding/hair/woman/slicked_back.jpg' },
  { id: 'afro', label: 'Afro', img: '/onboarding/hair/woman/afro.jpg' },
  { id: 'messy', label: 'Messy', img: '/onboarding/hair/woman/messy.jpg' },
  { id: 'dreadlocks', label: 'Dreadlocks', img: '/onboarding/hair/woman/dreadlocks.jpg' },
  { id: 'cornrows', label: 'Cornrows', img: '/onboarding/hair/woman/cornrows.jpg' },
  { id: 'hijab', label: 'Hijab', img: '/onboarding/hair/woman/hijab.jpg' },
]
const HAIR_STYLES_MAN = [
  { id: 'short', label: 'Short', img: '/onboarding/hair/man/short.jpg' },
  { id: 'medium', label: 'Medium', img: '/onboarding/hair/man/medium.jpg' },
  { id: 'long', label: 'Long', img: '/onboarding/hair/man/long.jpg' },
  { id: 'fade', label: 'Fade', img: '/onboarding/hair/man/fade.jpg' },
  { id: 'undercut', label: 'Undercut', img: '/onboarding/hair/man/undercut.jpg' },
  { id: 'buzz', label: 'Buzz Cut', img: '/onboarding/hair/man/buzz.jpg' },
  { id: 'curly', label: 'Curly', img: '/onboarding/hair/man/curly.jpg' },
  { id: 'wavy', label: 'Wavy', img: '/onboarding/hair/man/wavy.jpg' },
  { id: 'textured', label: 'Textured', img: '/onboarding/hair/man/textured.jpg' },
  { id: 'cornrows', label: 'Cornrows', img: '/onboarding/hair/man/cornrows.jpg' },
  { id: 'dreadlocks', label: 'Dreadlocks', img: '/onboarding/hair/man/dreadlocks.jpg' },
  { id: 'messy', label: 'Messy', img: '/onboarding/hair/man/messy.jpg' },
  { id: 'ponytail', label: 'Man Bun', img: '/onboarding/hair/man/ponytail.jpg' },
  { id: 'afro', label: 'Afro', img: '/onboarding/hair/man/afro.jpg' },
]

const EYE_COLORS = [
  { id: 'blue', label: 'Blue', img: '/onboarding/eye-color/blue.jpg' },
  { id: 'green', label: 'Green', img: '/onboarding/eye-color/green.jpg' },
  { id: 'hazel', label: 'Hazel', img: '/onboarding/eye-color/hazel.jpg' },
  { id: 'brown', label: 'Brown', img: '/onboarding/eye-color/brown.jpg' },
  { id: 'dark_brown', label: 'Dark Brown', img: '/onboarding/eye-color/dark_brown.jpg' },
  { id: 'grey', label: 'Grey', img: '/onboarding/eye-color/grey.jpg' },
  { id: 'amber', label: 'Amber', img: '/onboarding/eye-color/amber.jpg' },
]

// ─── Random name lists ──────────────────────────────────────────────────────
const RANDOM_NAMES_WOMAN = ['Luna', 'Maya', 'Nana', 'Yuki', 'Sofia', 'Aria', 'Mila', 'Zara', 'Lina', 'Nova', 'Ivy', 'Jade', 'Ruby', 'Suki', 'Kira', 'Mimi', 'Cleo', 'Ava', 'Ella', 'Lola']
const RANDOM_NAMES_MAN = ['Kai', 'Leo', 'Ren', 'Axel', 'Dante', 'Zane', 'Milo', 'Nico', 'Ezra', 'Jax', 'Ryu', 'Soren', 'Theo', 'Liam', 'Finn', 'Hugo', 'Marco', 'Rafael', 'Mateo', 'Aiden']
const RANDOM_NAMES_NB = ['Sky', 'Sage', 'River', 'Quinn', 'Rowan', 'Ash', 'Eden', 'Ari', 'Kai', 'Nova', 'Phoenix', 'Rain', 'Sol', 'Zen', 'Indigo', 'Blair', 'Remi', 'Jules', 'Morgan', 'Alex']

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }

function randomizeAll(): FormData {
  const gender = pick(['woman', 'man', 'nonbinary'] as Gender[])
  const isMale = gender === 'man'
  const isNB = gender === 'nonbinary'

  const names = isMale ? RANDOM_NAMES_MAN : isNB ? RANDOM_NAMES_NB : RANDOM_NAMES_WOMAN
  const builds = isMale ? BUILDS_MAN : BUILDS_WOMAN
  const hairStyles = isMale ? HAIR_STYLES_MAN : HAIR_STYLES_WOMAN
  const clothingList = isMale ? CLOTHING_MAN : CLOTHING_WOMAN

  return {
    name: pick(names),
    gender,
    relationshipStyle: 'lover',
    personality: pick(ARCHETYPES).id,
    age: pick(AGES).id,
    ethnicity: pick(ETHNICITY_LIST).id,
    build: pick(builds).id,
    skinTone: pick(SKIN_TONES).id,
    hairColor: pick(HAIR_COLORS).id,
    hairLength: pick(hairStyles).id,
    eyeColor: pick(EYE_COLORS).id,
    clothingStyle: pick(clothingList).id,
    vibe: '',
    breastSize: !isMale ? pick(BREAST_SIZES).id : '',
    assSize: !isMale ? pick(ASS_SIZES).id : '',
    dickSize: isMale ? pick(DICK_SIZES).id : '',
    beard: isMale ? pick(BEARD_STYLES).id : '',
    features: [] as string[],
    race: '', ears: '', horns: '', wings: '', tail: '',
    markings: '', aura: '', halo: '', fangs: '', antenna: '', fur: '', scales: '', fins: '', gills: '', form: '', accessories: '',
  }
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [animDir, setAnimDir] = useState<'forward' | 'back'>('forward')
  const [createdCompanionId, setCreatedCompanionId] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [regenerating, setRegenerating] = useState(false)
  const [showBodyDetails, setShowBodyDetails] = useState(false)
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState(false)
  const [previewExpanded, setPreviewExpanded] = useState(false)
  const lastPreviewHashRef = useRef<string | null>(null)

  const [data, setData] = useState<FormData>({
    name: '', gender: '' as Gender, relationshipStyle: 'lover',
    personality: '', age: '', ethnicity: '',
    build: '', skinTone: '', hairColor: '',
    hairLength: '', eyeColor: '', clothingStyle: '',
    vibe: '', breastSize: '', assSize: '', dickSize: '',
    beard: 'none', features: [] as string[],
    race: '', ears: '', horns: '', wings: '', tail: '',
    markings: '', aura: '', halo: '', fangs: '', antenna: '', fur: '', scales: '', fins: '', gills: '', form: '', accessories: '',
  })

  const set = useCallback((key: string, val: string | string[]) => {
    setData(prev => ({ ...prev, [key]: val }))
  }, [])

  // Steps: gender-specific flow
  const totalSteps = 8
  const goNext = () => { setAnimDir('forward'); setStep(s => Math.min(s + 1, totalSteps)) }
  const goBack = () => { setAnimDir('back'); setStep(s => Math.max(s - 1, 1)) }

  function buildAppearance() {
    const isFantasy = data.gender === 'fantasy'
    return isFantasy ? {
      style: 'fantasy' as const,
      gender: 'woman' as const,
      race: data.race,
      // All possible race-specific features (most will be empty for non-relevant races)
      ears: data.ears, horns: data.horns, wings: data.wings, tail: data.tail,
      markings: data.markings, aura: data.aura, halo: data.halo, fangs: data.fangs,
      antenna: data.antenna, fur: data.fur, scales: data.scales, fins: data.fins,
      gills: data.gills, form: data.form, accessories: data.accessories,
      // Standard appearance fields
      build: data.build, skinTone: data.skinTone, hairColor: data.hairColor,
      hairLength: data.hairLength, eyeColor: data.eyeColor, clothingStyle: data.clothingStyle,
      breastSize: data.breastSize, assSize: data.assSize,
    } : {
      gender: data.gender, age: data.age, ethnicity: data.ethnicity,
      build: data.build, skinTone: data.skinTone, hairColor: data.hairColor,
      hairLength: data.hairLength, eyeColor: data.eyeColor, clothingStyle: data.clothingStyle,
      ...(data.features.length > 0 ? { features: data.features } : {}),
      ...(data.gender === 'woman' || data.gender === 'nonbinary' || data.gender === 'fantasy' ? { breastSize: data.breastSize, assSize: data.assSize } : {}),
      ...(data.gender === 'man' ? { dickSize: data.dickSize, beard: data.beard } : {}),
    }
  }

  async function generatePreview(force = false) {
    const appearance = buildAppearance()
    const hash = JSON.stringify(appearance)
    if (!force && hash === lastPreviewHashRef.current && previewAvatarUrl) return
    lastPreviewHashRef.current = hash
    setPreviewLoading(true)
    setPreviewError(false)
    try {
      const res = await fetch('/api/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appearance, emotion: 'neutral' }),
      })
      const result = await res.json()
      if (result.url) setPreviewAvatarUrl(result.url)
      else setPreviewError(true)
    } catch (e) {
      console.error('Preview gen failed:', e)
      setPreviewError(true)
    }
    setPreviewLoading(false)
  }

  // Generate live avatar preview when user reaches step 7
  useEffect(() => {
    if (step === 7) generatePreview()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  // ESC closes the expanded avatar lightbox
  useEffect(() => {
    if (!previewExpanded) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPreviewExpanded(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [previewExpanded])

  async function handleCreate() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    setLoading(true)

    const isFantasy = data.gender === 'fantasy'
    const appearance = buildAppearance()

    let companionId = createdCompanionId

    if (companionId) {
      // UPDATE existing companion (user came back from preview to edit)
      const { error } = await supabase
        .from('companions')
        .update({
          name: data.name,
          relationship_style: data.relationshipStyle,
          personality: { archetype: data.personality, gender: isFantasy ? 'woman' : data.gender },
          appearance,
        })
        .eq('id', companionId)

      if (error) {
        console.error(error)
        setLoading(false)
        return
      }
    } else {
      // CREATE new companion
      const { data: companion, error } = await supabase
        .from('companions')
        .insert({
          user_id: user.id,
          name: data.name,
          relationship_style: data.relationshipStyle,
          personality: { archetype: data.personality, gender: isFantasy ? 'woman' : data.gender },
          appearance,
        })
        .select()
        .single()

      if (error || !companion) {
        console.error(error)
        setLoading(false)
        return
      }

      companionId = companion.id
      setCreatedCompanionId(companion.id)

      // Insert welcome message (only for new companions)
      const welcomeMessages = [
        `Hey! 😊 I'm ${data.name}. Nice to meet you! What's your name?`,
        `Hi there! 💕 I'm ${data.name}. So glad you're here. Let's chat!`,
        `Hey 😏 I'm ${data.name}. I'm curious about you... tell me something about yourself?`,
      ]
      await supabase.from('messages').insert({
        companion_id: companion.id,
        user_id: user.id,
        role: 'assistant',
        content: welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)],
        emotion: 'happy',
      })
    }

    // Reuse the live preview avatar if it matches current appearance — saves an
    // expensive regeneration. Otherwise fall back to generating now.
    const reusable = previewAvatarUrl && lastPreviewHashRef.current === JSON.stringify(appearance)
    if (reusable && previewAvatarUrl) {
      await supabase.from('companions').update({ avatar_url: previewAvatarUrl }).eq('id', companionId)
      setAvatarUrl(previewAvatarUrl)
    } else {
      setGenerating(true)
      try {
        console.log('[Onboarding] Generating avatar...', { companionId, appearance })
        const res = await fetch('/api/avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companionId, appearance, emotion: 'neutral' }),
        })
        const result = await res.json()
        console.log('[Onboarding] Avatar result:', result)
        if (result.url) {
          setAvatarUrl(result.url)
        } else {
          console.error('[Onboarding] Avatar failed:', result.error || 'No URL returned')
        }
      } catch (e) {
        console.error('Avatar gen failed:', e)
      }
      setGenerating(false)
    }
    setLoading(false)
    setAnimDir('forward')
    setStep(8)
  }

  async function handleRegenerateAvatar() {
    if (!createdCompanionId) return
    setRegenerating(true)
    const appearance = {
      gender: data.gender, age: data.age, ethnicity: data.ethnicity,
      build: data.build, skinTone: data.skinTone, hairColor: data.hairColor,
      hairLength: data.hairLength, eyeColor: data.eyeColor, clothingStyle: data.clothingStyle,
      ...(data.features.length > 0 ? { features: data.features } : {}),
      ...(data.gender === 'woman' || data.gender === 'nonbinary' || data.gender === 'fantasy' ? { breastSize: data.breastSize, assSize: data.assSize } : {}),
      ...(data.gender === 'man' ? { dickSize: data.dickSize, beard: data.beard } : {}),
    }
    try {
      const res = await fetch('/api/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companionId: createdCompanionId, appearance, emotion: 'neutral' }),
      })
      const result = await res.json()
      if (result.url) setAvatarUrl(result.url)
    } catch (e) {
      console.error('Avatar regen failed:', e)
    }
    setRegenerating(false)
  }

  // ─── Loading screen ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24, textAlign: 'center', position: 'relative' }}>
        <div style={{
          width: 90, height: 90, borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(233,30,140,0.2), rgba(91,66,243,0.15))',
          border: '2px solid rgba(233,30,140,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40,
          animation: 'pulse-glow 2s ease-in-out infinite', position: 'relative', zIndex: 1,
        }}>
          {generating ? '📸' : '✨'}
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
            {generating ? 'Generating avatar...' : 'Creating your SenseMate...'}
          </div>
          <div style={{ color: 'var(--muted-fg)', fontSize: 15 }}>
            {generating ? 'Crafting a unique look just for you.' : 'Setting everything up.'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, position: 'relative', zIndex: 1 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: '50%', background: ACCENT,
              animation: `typing-dot 1.3s ${i * 0.18}s infinite`,
            }} />
          ))}
        </div>
      </div>
    )
  }

  // ─── Main render ───────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>

      {/* ── Top bar ── (hidden on preview step) */}
      {step < 8 && (
        <div style={{
          position: 'sticky', top: 0, zIndex: 50,
          padding: '16px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(6,5,20,0.85)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          <button onClick={() => step === 1 ? router.push('/dashboard') : goBack()} style={{
            background: 'none', border: 'none', color: 'var(--fg-2)', cursor: 'pointer',
            fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 0',
          }}>
            ← {step === 1 ? 'Dashboard' : 'Back'}
          </button>

          <div style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontStyle: 'italic', fontSize: 20, fontWeight: 400,
            background: 'linear-gradient(135deg, #e91e8c, #ff6b6b)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            SenseMates
          </div>

          <div style={{ fontSize: 13, color: 'var(--muted-fg)', fontWeight: 600, minWidth: 60, textAlign: 'right' }}>
            {step} / 7
          </div>
        </div>
      )}

      {/* ── Progress bar ── (hidden on preview step) */}
      {step < 8 && (
        <div style={{ display: 'flex', gap: 3, padding: '0 24px', marginTop: -1 }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} style={{
              height: 3, flex: 1, borderRadius: 2,
              background: i < step
                ? 'linear-gradient(90deg, #e91e8c, #ff6b6b)'
                : 'rgba(255,255,255,0.06)',
              transition: 'all 0.5s ease',
            }} />
          ))}
        </div>
      )}

      {/* ── Content ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '32px 24px 40px',
        animation: `${animDir === 'forward' ? 'onb-slide-in' : 'onb-slide-back'} 0.4s ease both`,
      }} key={step}>

        {/* STEP 1 — Gender */}
        {step === 1 && (
          <StepContainer
            title="Who is your SenseMate?"
            subtitle="This shapes how your companion looks, sounds and feels."
          >
            <div style={{ width: '100%', maxWidth: 720 }}>
              <ImageGrid cols={2}>
                {GENDERS.map(g => (
                  <ImageCard
                    key={g.id}
                    img={g.img}
                    label={g.label}
                    selected={data.gender === g.id}
                    onClick={() => { set('gender', g.id as Gender); goNext() }}
                    aspectRatio="3/4"
                  />
                ))}
              </ImageGrid>
            </div>

            {/* Randomize button */}
            <button
              onClick={() => {
                const randomData = randomizeAll()
                setData(randomData)
                setAnimDir('forward')
                setStep(7) // Jump to Name & Personality (last step before create)
              }}
              style={{
                marginTop: 32, padding: '16px 32px', fontSize: 16, fontWeight: 700,
                borderRadius: 16, cursor: 'pointer',
                background: 'linear-gradient(135deg, rgba(233,30,140,0.08), rgba(124,58,237,0.08))',
                border: '1px solid rgba(233,30,140,0.25)',
                color: 'rgba(255,255,255,0.85)',
                transition: 'all 0.3s ease',
                display: 'flex', alignItems: 'center', gap: 10,
                letterSpacing: '0.3px',
              }}
              onMouseEnter={ev => {
                ev.currentTarget.style.background = 'linear-gradient(135deg, rgba(233,30,140,0.2), rgba(124,58,237,0.2))'
                ev.currentTarget.style.borderColor = 'rgba(233,30,140,0.5)'
                ev.currentTarget.style.color = '#fff'
                ev.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={ev => {
                ev.currentTarget.style.background = 'linear-gradient(135deg, rgba(233,30,140,0.08), rgba(124,58,237,0.08))'
                ev.currentTarget.style.borderColor = 'rgba(233,30,140,0.25)'
                ev.currentTarget.style.color = 'rgba(255,255,255,0.85)'
                ev.currentTarget.style.transform = 'scale(1)'
              }}
            >
              <span style={{ fontSize: 22 }}>🎲</span> Surprise me — Randomize!
            </button>
          </StepContainer>
        )}

        {/* STEP 2 — Race (fantasy) or Age (realistic) */}
        {step === 2 && data.gender === 'fantasy' && (
          <StepContainer
            title="Choose a race"
            subtitle="What kind of fantasy being will your companion be?"
          >
            <ImageGrid cols={4}>
              {FANTASY_RACES.map(r => (
                <ImageCard
                  key={r.id}
                  img={r.img}
                  label={r.label}
                  selected={data.race === r.id}
                  onClick={() => { set('race', r.id); goNext() }}
                  aspectRatio="3/4"
                  small
                />
              ))}
            </ImageGrid>
          </StepContainer>
        )}

        {step === 2 && data.gender !== 'fantasy' && (
          <StepContainer
            title="How old?"
            subtitle="Pick an age range that feels right."
          >
            <div style={{ width: '100%', maxWidth: 720 }}>
              <ImageGrid cols={3}>
                {AGES.map(a => {
                  // Non-binary falls back to woman portraits (no nb-specific age set yet)
                  const genderDir = data.gender === 'man' ? 'man' : 'woman'
                  return (
                    <ImageCard
                      key={a.id}
                      img={`/onboarding/age/${genderDir}/${a.id}.jpg`}
                      label={a.label}
                      selected={data.age === a.id}
                      onClick={() => { set('age', a.id); goNext() }}
                      aspectRatio="3/4"
                    />
                  )
                })}
              </ImageGrid>
            </div>
          </StepContainer>
        )}

        {/* STEP 3 — Fantasy features (dynamic per race) */}
        {step === 3 && data.gender === 'fantasy' && (
          <StepContainer
            title="Fantasy features"
            subtitle={`Customize your ${FANTASY_RACES.find(r => r.id === data.race)?.label || 'companion'}'s unique traits.`}
          >
            <div style={{ width: '100%', maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 24 }}>
              {(RACE_FEATURES[data.race] || []).map(group => (
                <div key={group.key}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>{group.label}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {group.options.map(opt => {
                      const val = (data as any)[group.key] || group.options[0]?.id
                      const sel = val === opt.id
                      return (
                        <button key={opt.id} onClick={() => set(group.key, opt.id)} style={{
                          padding: '10px 18px', borderRadius: 12, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                          border: sel ? '2px solid rgba(233,30,140,0.6)' : '1px solid rgba(255,255,255,0.1)',
                          background: sel ? 'rgba(233,30,140,0.15)' : 'rgba(255,255,255,0.03)',
                          color: sel ? '#e91e8c' : 'rgba(255,255,255,0.7)', transition: 'all 0.2s',
                        }}>{opt.label}</button>
                      )
                    })}
                  </div>
                </div>
              ))}
              {(!RACE_FEATURES[data.race] || RACE_FEATURES[data.race].length === 0) && (
                <div style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: 40 }}>
                  No special features for this race. Continue to body type.
                </div>
              )}
            </div>
            <NavButton onClick={goNext} label="Next →" />
          </StepContainer>
        )}

        {/* STEP 3 — Ethnicity (realistic only) */}
        {step === 3 && data.gender !== 'fantasy' && (
          <StepContainer
            title="Ethnicity"
            subtitle="What look are you drawn to?"
          >
            <ImageGrid cols={3}>
              {ETHNICITY_LIST.map(e => {
                const genderFolder = data.gender === 'man' ? 'man' : 'woman'
                const imgSrc = `/onboarding/ethnicity/${genderFolder}/${e.id}.jpg`
                return (
                  <ImageCard
                    key={e.id}
                    img={imgSrc}
                    label={e.label}
                    selected={data.ethnicity === e.id}
                    onClick={() => { set('ethnicity', e.id); goNext() }}
                    aspectRatio="3/4"
                  />
                )
              })}
            </ImageGrid>
          </StepContainer>
        )}

        {/* STEP 4 — Build + Body */}
        {step === 4 && (
          <StepContainer
            title="Body type"
            subtitle="Choose the physique you prefer."
          >
            {/* Build */}
            <div style={{ marginBottom: 32 }}>
              <SectionTitle>Build</SectionTitle>
              <ImageGrid cols={3}>
                {(data.gender === 'man' ? BUILDS_MAN : BUILDS_WOMAN).map(b => (
                  <ImageCard
                    key={b.id}
                    img={b.img}
                    label={b.label}
                    selected={data.build === b.id}
                    onClick={() => set('build', b.id)}
                    aspectRatio="3/4"
                  />
                ))}
              </ImageGrid>
            </div>

            {/* Advanced body details — collapsible */}
            <button onClick={() => setShowBodyDetails(s => !s)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '12px', borderRadius: 12, marginBottom: showBodyDetails ? 24 : 0,
              background: showBodyDetails ? 'rgba(233,30,140,0.08)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${showBodyDetails ? 'rgba(233,30,140,0.2)' : 'rgba(255,255,255,0.06)'}`,
              color: showBodyDetails ? '#e91e8c' : 'rgba(255,255,255,0.4)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s',
            }}>
              <span style={{ transform: showBodyDetails ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>▼</span>
              {showBodyDetails ? 'Hide advanced body options' : 'Advanced body options (optional)'}
            </button>

            {showBodyDetails && (
              <>
                {/* Breast size (woman/nonbinary/fantasy) */}
                {(data.gender === 'woman' || data.gender === 'nonbinary' || data.gender === 'fantasy') && (
                  <>
                    <div style={{ marginBottom: 32 }}>
                      <SectionTitle>Breast Size</SectionTitle>
                      <ImageGrid cols={6}>
                        {BREAST_SIZES.map(b => (
                          <ImageCard
                            key={b.id}
                            img={b.img}
                            label={b.label}
                            selected={data.breastSize === b.id}
                            onClick={() => set('breastSize', b.id)}
                            aspectRatio="3/4"
                            small
                          />
                        ))}
                      </ImageGrid>
                    </div>
                    <div style={{ marginBottom: 32 }}>
                      <SectionTitle>Butt Size</SectionTitle>
                      <ImageGrid cols={4}>
                        {ASS_SIZES.map(a => (
                          <ImageCard
                            key={a.id}
                            img={a.img}
                            label={a.label}
                            selected={data.assSize === a.id}
                            onClick={() => set('assSize', a.id)}
                            aspectRatio="3/4"
                            small
                          />
                        ))}
                      </ImageGrid>
                    </div>
                  </>
                )}

                {/* Dick size + beard (man) */}
                {data.gender === 'man' && (
                  <>
                    <div style={{ marginBottom: 32 }}>
                      <SectionTitle>Size</SectionTitle>
                      <ImageGrid cols={3}>
                        {DICK_SIZES.map(d => (
                          <ImageCard
                            key={d.id}
                            img={d.img}
                            label={d.label}
                            selected={data.dickSize === d.id}
                            onClick={() => set('dickSize', d.id)}
                            aspectRatio="3/4"
                            small
                          />
                        ))}
                      </ImageGrid>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Facial Hair — always visible for men (not explicit) */}
            {data.gender === 'man' && (
              <div style={{ marginBottom: 32 }}>
                <SectionTitle>Facial Hair</SectionTitle>
                <ImageGrid cols={5}>
                  {BEARD_STYLES.map(b => (
                    <ImageCard
                      key={b.id}
                      img={b.img}
                      label={b.label}
                      selected={data.beard === b.id}
                      onClick={() => set('beard', b.id)}
                      aspectRatio="3/4"
                      small
                    />
                  ))}
                </ImageGrid>
              </div>
            )}

            <NavButton onClick={goNext} label="Continue →" />
          </StepContainer>
        )}

        {/* STEP 5 — Features (skin, hair, eyes) */}
        {step === 5 && (
          <StepContainer
            title="Features"
            subtitle="Fine-tune the details."
          >
            <div style={{ width: '100%', maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 28 }}>
              {/* Skin tone — expanded for fantasy */}
              <div>
                <SectionTitle>Skin Tone</SectionTitle>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {(data.gender === 'fantasy' ? FANTASY_SKIN : SKIN_TONES).map(s => (
                    <ColorCircle
                      key={s.id}
                      color={s.color}
                      label={s.label}
                      selected={data.skinTone === s.id}
                      onClick={() => set('skinTone', s.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Hair color */}
              <div>
                <SectionTitle>Hair Color</SectionTitle>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {HAIR_COLORS.map(h => (
                    <ColorCircle
                      key={h.id}
                      color={h.color}
                      label={h.label}
                      selected={data.hairColor === h.id}
                      onClick={() => set('hairColor', h.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Hairstyle */}
              <div>
                <SectionTitle>Hairstyle</SectionTitle>
                <ImageGrid cols={5}>
                  {(data.gender === 'man' ? HAIR_STYLES_MAN : HAIR_STYLES_WOMAN).filter(h => data.gender === 'fantasy' ? h.id !== 'hijab' : true).map(h => (
                    <ImageCard
                      key={h.id}
                      img={h.img}
                      label={h.label}
                      selected={data.hairLength === h.id}
                      onClick={() => set('hairLength', h.id)}
                      aspectRatio="3/4"
                      small
                    />
                  ))}
                </ImageGrid>
              </div>

              {/* Eye color — expanded for fantasy */}
              <div>
                <SectionTitle>Eye Color</SectionTitle>
                {data.gender === 'fantasy' ? (
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {FANTASY_EYES.map(e => (
                      <ColorCircle
                        key={e.id}
                        color={e.color}
                        label={e.label}
                        selected={data.eyeColor === e.id}
                        onClick={() => set('eyeColor', e.id)}
                        variant="iris"
                      />
                    ))}
                  </div>
                ) : (
                  <ImageGrid cols={7}>
                    {EYE_COLORS.map(e => (
                      <ImageCard
                        key={e.id}
                        img={e.img}
                        label={e.label}
                        selected={data.eyeColor === e.id}
                        onClick={() => set('eyeColor', e.id)}
                        aspectRatio="1/1"
                        small
                      />
                    ))}
                  </ImageGrid>
                )}
              </div>
              {/* Kenmerken / facial features — multi-select */}
              <div>
                <SectionTitle>Features (optional, pick any)</SectionTitle>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {FACIAL_FEATURES.map(f => {
                    const sel = (data.features || []).includes(f.id)
                    return (
                      <button
                        key={f.id}
                        onClick={() => {
                          const current = data.features || []
                          if (sel) {
                            set('features', current.filter((x: string) => x !== f.id))
                          } else {
                            set('features', [...current, f.id])
                          }
                        }}
                        style={{
                          padding: '8px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                          border: sel ? '2px solid rgba(233,30,140,0.6)' : '1px solid rgba(255,255,255,0.1)',
                          background: sel ? 'rgba(233,30,140,0.15)' : 'rgba(255,255,255,0.03)',
                          color: sel ? '#e91e8c' : 'rgba(255,255,255,0.6)', transition: 'all 0.2s',
                          display: 'flex', alignItems: 'center', gap: 6,
                        }}
                      >
                        <span style={{ fontSize: 14 }}>{f.emoji}</span> {f.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 32 }}>
              <NavButton onClick={goNext} label="Continue →" />
            </div>
          </StepContainer>
        )}

        {/* STEP 6 — Clothing Style */}
        {step === 6 && (
          <StepContainer
            title="Clothing Style"
            subtitle="How does your SenseMate dress?"
            maxWidth={data.gender === 'fantasy' ? 900 : 1200}
          >
            {data.gender === 'fantasy' ? (
              <ImageGrid cols={5}>
                {FANTASY_CLOTHING.map(c => (
                  <ImageCard
                    key={c.id}
                    img={c.img}
                    label={c.label}
                    selected={data.clothingStyle === c.id}
                    onClick={() => set('clothingStyle', c.id)}
                    aspectRatio="4/5"
                    small
                  />
                ))}
              </ImageGrid>
            ) : (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 28 }}>
                {(() => {
                  const all = data.gender === 'man' ? CLOTHING_MAN : CLOTHING_WOMAN
                  const groups = data.gender === 'man' ? CLOTHING_GROUPS_MAN : CLOTHING_GROUPS_WOMAN
                  const byId = Object.fromEntries(all.map(c => [c.id, c]))
                  return groups.map(g => {
                    const items = g.ids.map(id => byId[id]).filter(Boolean)
                    if (items.length === 0) return null
                    return (
                      <div key={g.title}>
                        <SectionTitle>{g.title}</SectionTitle>
                        <ImageGrid cols={6}>
                          {items.map(c => (
                            <ImageCard
                              key={c.id}
                              img={c.img}
                              label={c.label}
                              selected={data.clothingStyle === c.id}
                              onClick={() => set('clothingStyle', c.id)}
                              aspectRatio="4/5"
                              small
                            />
                          ))}
                        </ImageGrid>
                      </div>
                    )
                  })
                })()}
              </div>
            )}

            <div style={{ marginTop: 24, width: '100%', display: 'flex', justifyContent: 'center' }}>
              <NavButton onClick={goNext} label="Almost done →" />
            </div>
          </StepContainer>
        )}

        {/* STEP 7 — Name & Personality + Live Avatar Preview */}
        {step === 7 && (
          <StepContainer
            title={data.name ? `Meet ${data.name}` : 'Bring them to life'}
            subtitle="Pick a name and personality — we're already painting them."
            maxWidth={1100}
          >
            <div className="onb-step7-grid" style={{
              width: '100%', display: 'grid',
              gridTemplateColumns: 'minmax(280px, 360px) 1fr',
              gap: 48, alignItems: 'flex-start',
            }}>
              {/* ── Left: live avatar preview ───────────────────────────── */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: 320, height: 420, borderRadius: 24, overflow: 'hidden',
                    border: '2px solid rgba(233,30,140,0.25)',
                    boxShadow: '0 0 60px rgba(233,30,140,0.15), 0 20px 60px rgba(0,0,0,0.5)',
                    background: 'rgba(255,255,255,0.03)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {previewAvatarUrl && !previewLoading ? (
                      <img
                        src={previewAvatarUrl}
                        alt={data.name || 'Preview'}
                        onClick={() => setPreviewExpanded(true)}
                        style={{
                          width: '100%', height: '100%', objectFit: 'cover',
                          cursor: 'zoom-in',
                        }}
                      />
                    ) : previewLoading ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, padding: 24, textAlign: 'center' }}>
                        <div style={{
                          width: 56, height: 56, borderRadius: '50%',
                          border: '3px solid rgba(233,30,140,0.2)', borderTopColor: ACCENT,
                          animation: 'animate-spin-slow 0.9s linear infinite',
                        }} />
                        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 500 }}>
                          Painting your SenseMate...
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
                          This usually takes 15–30 seconds.
                        </div>
                      </div>
                    ) : previewError ? (
                      <div style={{ textAlign: 'center', color: 'var(--muted-fg)', padding: 24 }}>
                        <div style={{ fontSize: 36, marginBottom: 10 }}>📸</div>
                        <div style={{ fontSize: 13 }}>Preview failed — you can still create.</div>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', color: 'var(--muted-fg)' }}>
                        <div style={{ fontSize: 36, marginBottom: 10 }}>✨</div>
                      </div>
                    )}
                  </div>

                  {/* Name badge */}
                  {data.name && (
                    <div style={{
                      position: 'absolute', bottom: -16, left: '50%', transform: 'translateX(-50%)',
                      padding: '10px 28px', borderRadius: 100,
                      background: 'linear-gradient(135deg, rgba(91,66,243,0.9), rgba(233,30,140,0.9))',
                      boxShadow: '0 4px 20px rgba(233,30,140,0.3)',
                      fontSize: 18, fontWeight: 700, color: 'white', whiteSpace: 'nowrap',
                      letterSpacing: '0.3px',
                    }}>
                      {data.name}
                    </div>
                  )}
                </div>

                {/* Try again button */}
                <button
                  onClick={() => generatePreview(true)}
                  disabled={previewLoading}
                  style={{
                    marginTop: 16,
                    padding: '10px 20px', fontSize: 13, fontWeight: 600,
                    borderRadius: 12, cursor: previewLoading ? 'wait' : 'pointer',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.6)',
                    transition: 'all 0.25s',
                  }}
                  onMouseEnter={ev => { if (!previewLoading) { ev.currentTarget.style.background = 'rgba(233,30,140,0.08)'; ev.currentTarget.style.borderColor = 'rgba(233,30,140,0.25)'; ev.currentTarget.style.color = ACCENT } }}
                  onMouseLeave={ev => { ev.currentTarget.style.background = 'rgba(255,255,255,0.04)'; ev.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; ev.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
                >
                  {previewLoading ? 'Painting...' : '↻ Try another look'}
                </button>
              </div>

              {/* ── Right: name + personality + create ──────────────────── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                {/* Name */}
                <div>
                  <SectionTitle>Name</SectionTitle>
                  <input
                    type="text"
                    className="input"
                    value={data.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="Luna, Alex, Sophie..."
                    maxLength={30}
                    autoFocus
                    style={{
                      padding: '16px 20px', fontSize: 18, width: '100%',
                      borderRadius: 16, background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'var(--fg)', outline: 'none',
                      transition: 'border-color 0.3s',
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = 'rgba(233,30,140,0.5)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>

                {/* Personality archetype */}
                <div>
                  <SectionTitle>Personality</SectionTitle>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                    {ARCHETYPES.map(arch => {
                      const sel = data.personality === arch.id
                      return (
                        <button
                          key={arch.id}
                          onClick={() => set('personality', arch.id)}
                          style={{
                            padding: '16px 14px', borderRadius: 16, cursor: 'pointer',
                            textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 6,
                            border: `1px solid ${sel ? 'rgba(233,30,140,0.6)' : 'rgba(255,255,255,0.06)'}`,
                            background: sel ? 'rgba(233,30,140,0.12)' : 'rgba(255,255,255,0.02)',
                            transition: 'all 0.25s',
                            transform: sel ? 'scale(1.02)' : 'scale(1)',
                            boxShadow: sel ? '0 4px 20px rgba(233,30,140,0.15)' : 'none',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 22 }}>{arch.emoji}</span>
                            <span style={{ fontSize: 14, fontWeight: 700, color: sel ? ACCENT : 'rgba(255,255,255,0.85)' }}>{arch.name}</span>
                          </div>
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.4 }}>{arch.description}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Create button */}
                <button
                  onClick={handleCreate}
                  disabled={!data.name.trim() || !data.personality || loading}
                  style={{
                    width: '100%', padding: '18px', fontSize: 17, fontWeight: 700,
                    borderRadius: 16, border: 'none', cursor: 'pointer',
                    background: data.name.trim() && data.personality
                      ? 'linear-gradient(135deg, #e91e8c, #c026d3, #7c3aed)'
                      : 'rgba(255,255,255,0.06)',
                    color: data.name.trim() && data.personality ? 'white' : 'var(--muted-fg)',
                    boxShadow: data.name.trim() && data.personality
                      ? '0 8px 32px rgba(233,30,140,0.3), 0 0 60px rgba(233,30,140,0.1)'
                      : 'none',
                    transition: 'all 0.3s ease',
                    letterSpacing: '0.5px',
                  }}
                >
                  Create {data.name || 'SenseMate'} ✨
                </button>
              </div>
            </div>
          </StepContainer>
        )}

        {/* ─── Step 8: Preview ─────────────────────────────────────────── */}
        {step === 8 && (
          <StepContainer
            title={`Meet ${data.name}`}
            subtitle="Here's your SenseMate! Like what you see?"
          >
            <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>

              {/* Avatar preview */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: 320, height: 420, borderRadius: 24, overflow: 'hidden',
                  border: '2px solid rgba(233,30,140,0.25)',
                  boxShadow: '0 0 60px rgba(233,30,140,0.15), 0 20px 60px rgba(0,0,0,0.5)',
                  background: 'rgba(255,255,255,0.03)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={data.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--muted-fg)' }}>
                      <div style={{ fontSize: 48, marginBottom: 12 }}>📸</div>
                      <div style={{ fontSize: 14 }}>Avatar could not be generated</div>
                    </div>
                  )}

                  {/* Regenerating overlay */}
                  {regenerating && (
                    <div style={{
                      position: 'absolute', inset: 0, background: 'rgba(6,4,14,0.8)',
                      backdropFilter: 'blur(8px)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
                      borderRadius: 24,
                    }}>
                      <div style={{
                        width: 60, height: 60, borderRadius: '50%',
                        border: '3px solid rgba(233,30,140,0.2)', borderTopColor: ACCENT,
                        animation: 'animate-spin-slow 0.8s linear infinite',
                      }} />
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, fontWeight: 500 }}>
                        Generating new photo...
                      </div>
                    </div>
                  )}
                </div>

                {/* Name badge */}
                <div style={{
                  position: 'absolute', bottom: -16, left: '50%', transform: 'translateX(-50%)',
                  padding: '10px 28px', borderRadius: 100,
                  background: 'linear-gradient(135deg, rgba(91,66,243,0.9), rgba(233,30,140,0.9))',
                  boxShadow: '0 4px 20px rgba(233,30,140,0.3)',
                  fontSize: 18, fontWeight: 700, color: 'white', whiteSpace: 'nowrap',
                  letterSpacing: '0.3px',
                }}>
                  {data.name}
                </div>
              </div>

              {/* Personality archetype badge */}
              {data.personality && (() => {
                const arch = ARCHETYPES.find(a => a.id === data.personality)
                return arch ? (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '8px 20px', borderRadius: 100, marginTop: 8,
                    background: 'rgba(233,30,140,0.1)', border: '1px solid rgba(233,30,140,0.2)',
                  }}>
                    <span style={{ fontSize: 18 }}>{arch.emoji}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: ACCENT }}>{arch.name}</span>
                  </div>
                ) : null
              })()}

              {/* Action buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 360 }}>
                {/* Start chatting */}
                <button
                  onClick={() => router.push(`/chat/${createdCompanionId}`)}
                  style={{
                    width: '100%', padding: '18px', fontSize: 17, fontWeight: 700,
                    borderRadius: 16, border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(135deg, #e91e8c, #c026d3, #7c3aed)',
                    color: 'white',
                    boxShadow: '0 8px 32px rgba(233,30,140,0.3), 0 0 60px rgba(233,30,140,0.1)',
                    transition: 'all 0.3s ease',
                    letterSpacing: '0.5px',
                  }}
                  onMouseEnter={ev => { ev.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; ev.currentTarget.style.boxShadow = '0 12px 40px rgba(233,30,140,0.4)' }}
                  onMouseLeave={ev => { ev.currentTarget.style.transform = 'none'; ev.currentTarget.style.boxShadow = '0 8px 32px rgba(233,30,140,0.3), 0 0 60px rgba(233,30,140,0.1)' }}
                >
                  Start chatting with {data.name} 💬
                </button>

                {/* Regenerate photo — hide for anime (fixed avatars) */}
                {true /* always show for all types */ && (
                <button
                  onClick={handleRegenerateAvatar}
                  disabled={regenerating}
                  style={{
                    width: '100%', padding: '16px', fontSize: 15, fontWeight: 600,
                    borderRadius: 16, cursor: regenerating ? 'wait' : 'pointer',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.6)',
                    transition: 'all 0.3s ease',
                    letterSpacing: '0.3px',
                  }}
                  onMouseEnter={ev => { if (!regenerating) { ev.currentTarget.style.background = 'rgba(233,30,140,0.08)'; ev.currentTarget.style.borderColor = 'rgba(233,30,140,0.25)'; ev.currentTarget.style.color = ACCENT } }}
                  onMouseLeave={ev => { ev.currentTarget.style.background = 'rgba(255,255,255,0.04)'; ev.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; ev.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
                >
                  {regenerating ? 'Generating...' : 'Generate new photo 📸'}
                </button>
                )}

                {/* Edit appearance — go back to step 1 (hide for anime) */}
                {true /* always show for all types */ && (
                <button
                  onClick={() => { setAnimDir('back'); setStep(1) }}
                  style={{
                    width: '100%', padding: '14px', fontSize: 14, fontWeight: 500,
                    borderRadius: 16, cursor: 'pointer',
                    background: 'none',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.35)',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={ev => { ev.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; ev.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
                  onMouseLeave={ev => { ev.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; ev.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}
                >
                  ← Edit appearance
                </button>
                )}
              </div>
            </div>
          </StepContainer>
        )}
      </div>

      {/* ── CSS Animations ── */}
      <style jsx>{`
        @keyframes onb-slide-in {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes onb-slide-back {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {/* ── Avatar lightbox (step 7 click-to-zoom) ── */}
      {previewExpanded && previewAvatarUrl && (
        <div
          onClick={() => setPreviewExpanded(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(4,2,10,0.92)', backdropFilter: 'blur(20px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 32, cursor: 'zoom-out',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setPreviewExpanded(false) }}
            style={{
              position: 'absolute', top: 20, right: 20,
              width: 44, height: 44, borderRadius: 22,
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.8)', fontSize: 22, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(10px)',
            }}
            aria-label="Close"
          >×</button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewAvatarUrl}
            alt={data.name || 'Avatar'}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '100%', maxHeight: '100%', objectFit: 'contain',
              borderRadius: 20, boxShadow: '0 20px 80px rgba(0,0,0,0.6)',
              cursor: 'default',
            }}
          />
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StepContainer({ title, subtitle, children, maxWidth = 900 }: {
  title: string; subtitle: string; children: React.ReactNode; maxWidth?: number
}) {
  return (
    <div style={{ width: '100%', maxWidth, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{
          fontSize: 32, fontWeight: 800, letterSpacing: '-1px', marginBottom: 8,
          background: 'linear-gradient(135deg, #ffffff, rgba(255,255,255,0.7))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          {title}
        </h1>
        <p style={{ color: 'var(--muted-fg)', fontSize: 15 }}>{subtitle}</p>
      </div>
      {children}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 12, fontWeight: 700, color: 'var(--muted-fg)',
      textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12,
    }}>
      {children}
    </div>
  )
}

function ImageGrid({ cols, children }: { cols: number; children: React.ReactNode }) {
  return (
    <div className="onb-image-grid" data-cols={cols} style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: 12,
      width: '100%',
    }}>
      {children}
    </div>
  )
}

function ImageCard({ img, label, sublabel, selected, onClick, aspectRatio = '3/4', small = false }: {
  img: string; label: string; sublabel?: string; selected: boolean
  onClick: () => void; aspectRatio?: string; small?: boolean
}) {
  const [hov, setHov] = useState(false)
  const active = selected || hov

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: 'relative', overflow: 'hidden', cursor: 'pointer',
        borderRadius: small ? 14 : 18,
        border: `2px solid ${selected ? ACCENT : hov ? 'rgba(233,30,140,0.4)' : 'rgba(255,255,255,0.06)'}`,
        background: 'rgba(255,255,255,0.02)',
        aspectRatio,
        transition: 'all 0.3s cubic-bezier(0.34,1.2,0.64,1)',
        transform: active ? 'scale(1.03)' : 'scale(1)',
        boxShadow: selected
          ? '0 0 24px rgba(233,30,140,0.3), 0 8px 30px rgba(0,0,0,0.3)'
          : hov
            ? '0 8px 24px rgba(0,0,0,0.3)'
            : '0 2px 8px rgba(0,0,0,0.2)',
        padding: 0,
      }}
    >
      {/* Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={img}
        alt={label}
        style={{
          width: '100%', height: '100%', objectFit: 'cover',
          display: 'block',
          filter: active ? 'brightness(1.1)' : 'brightness(0.85)',
          transition: 'filter 0.3s',
        }}
      />

      {/* Gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 40%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      {/* Label */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: small ? '8px 10px' : '14px 16px',
        pointerEvents: 'none',
      }}>
        <div style={{
          fontSize: small ? 12 : 15, fontWeight: 700, color: 'white',
          textShadow: '0 1px 4px rgba(0,0,0,0.6)',
        }}>
          {label}
        </div>
        {sublabel && (
          <div style={{
            fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2,
            textShadow: '0 1px 3px rgba(0,0,0,0.5)',
          }}>
            {sublabel}
          </div>
        )}
      </div>

      {/* Selection checkmark */}
      {selected && (
        <div style={{
          position: 'absolute', top: small ? 6 : 10, right: small ? 6 : 10,
          width: small ? 22 : 28, height: small ? 22 : 28,
          borderRadius: '50%', background: ACCENT,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: small ? 10 : 13, color: 'white', fontWeight: 700,
          boxShadow: '0 2px 8px rgba(233,30,140,0.4)',
        }}>
          ✓
        </div>
      )}
    </button>
  )
}

function ColorCircle({ color, label, selected, onClick, variant = 'solid' }: {
  color: string; label: string; selected: boolean; onClick: () => void
  variant?: 'solid' | 'iris'
}) {
  // Iris variant: dark pupil center + colored ring + specular highlight
  // Solid variant: glossy orb with subtle radial highlight (depth)
  const orbBackground = variant === 'iris'
    ? `radial-gradient(circle at 50% 50%, #0a0a0a 0%, #0a0a0a 18%, ${color} 24%, ${color} 78%, rgba(0,0,0,0.45) 100%)`
    : `radial-gradient(circle at 35% 30%, ${withAlpha(color, 1)} 0%, ${color} 55%, ${darken(color, 0.25)} 100%)`

  const size = 52
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        background: 'none', border: 'none', cursor: 'pointer', padding: 4,
      }}
    >
      <div style={{
        position: 'relative',
        width: size, height: size, borderRadius: '50%',
        background: orbBackground,
        border: selected ? `2px solid ${ACCENT}` : '2px solid rgba(255,255,255,0.08)',
        boxShadow: selected
          ? `0 0 18px rgba(233,30,140,0.55), inset 0 -4px 8px rgba(0,0,0,0.35)`
          : `inset 0 -3px 6px rgba(0,0,0,0.3), 0 2px 6px rgba(0,0,0,0.25)`,
        transition: 'all 0.25s',
        transform: selected ? 'scale(1.12)' : 'scale(1)',
      }}>
        {/* Specular highlight — small white dot top-left of the orb */}
        <span style={{
          position: 'absolute',
          top: variant === 'iris' ? '22%' : '18%',
          left: variant === 'iris' ? '32%' : '24%',
          width: variant === 'iris' ? 6 : 10,
          height: variant === 'iris' ? 6 : 10,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.85)',
          filter: 'blur(0.5px)',
          pointerEvents: 'none',
        }} />
      </div>
      <span style={{
        fontSize: 10, color: selected ? ACCENT : 'var(--muted-fg)',
        fontWeight: selected ? 600 : 400, transition: 'color 0.2s',
      }}>
        {label}
      </span>
    </button>
  )
}

// Lighten/darken helpers for the orb gradient.
// Accepts hex (#rgb, #rrggbb) or rgb(...) strings.
function parseColor(c: string): [number, number, number] | null {
  const m = c.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (m) {
    const h = m[1].length === 3 ? m[1].split('').map(x => x + x).join('') : m[1]
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
  }
  const rgb = c.match(/rgba?\((\d+)\D+(\d+)\D+(\d+)/i)
  if (rgb) return [+rgb[1], +rgb[2], +rgb[3]]
  return null
}
function darken(c: string, amount: number): string {
  const rgb = parseColor(c); if (!rgb) return c
  const f = 1 - Math.max(0, Math.min(1, amount))
  return `rgb(${Math.round(rgb[0] * f)}, ${Math.round(rgb[1] * f)}, ${Math.round(rgb[2] * f)})`
}
function withAlpha(c: string, _a: number): string {
  // Reserved for future tweaks; currently a passthrough so the gradient stays opaque.
  return c
}

function ChipButton({ selected, onClick, children }: {
  selected: boolean; onClick: () => void; children: React.ReactNode
}) {
  return (
    <button onClick={onClick} style={{
      padding: '10px 18px', borderRadius: 100, fontSize: 13, fontWeight: 500,
      cursor: 'pointer', transition: 'all 0.2s',
      border: `1px solid ${selected ? 'rgba(233,30,140,0.6)' : 'rgba(255,255,255,0.08)'}`,
      background: selected ? 'rgba(233,30,140,0.14)' : 'rgba(255,255,255,0.03)',
      color: selected ? ACCENT : 'var(--fg-2)',
      transform: selected ? 'scale(1.05)' : 'scale(1)',
    }}>
      {children}
    </button>
  )
}

function NavButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '16px 48px', fontSize: 16, fontWeight: 700,
        borderRadius: 14, border: 'none', cursor: 'pointer',
        background: 'linear-gradient(135deg, #e91e8c, #c026d3)',
        color: 'white',
        boxShadow: '0 6px 24px rgba(233,30,140,0.25)',
        transition: 'all 0.3s ease',
        letterSpacing: '0.3px',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'
        e.currentTarget.style.boxShadow = '0 10px 36px rgba(233,30,140,0.35)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none'
        e.currentTarget.style.boxShadow = '0 6px 24px rgba(233,30,140,0.25)'
      }}
    >
      {label}
    </button>
  )
}
