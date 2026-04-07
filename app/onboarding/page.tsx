'use client'
import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// ─── Types ───────────────────────────────────────────────────────────────────
type Gender = 'woman' | 'man' | 'nonbinary'

interface FormData {
  name: string
  gender: Gender
  relationshipStyle: string
  personality: string[]
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
}

// ─── Data ────────────────────────────────────────────────────────────────────
const ACCENT = '#e91e8c'

const GENDERS = [
  { id: 'woman', label: 'Woman', img: '/onboarding/gender/woman.jpg' },
  { id: 'man', label: 'Man', img: '/onboarding/gender/man.jpg' },
  { id: 'nonbinary', label: 'Non-binary', img: '/onboarding/gender/nonbinary.jpg' },
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
  { id: '18s', label: '18–20', desc: 'Young & fresh', emoji: '🌸' },
  { id: '20s', label: '21–24', desc: 'Youthful energy', emoji: '✨' },
  { id: '25s', label: '25–29', desc: 'In their prime', emoji: '🔥' },
  { id: '30s', label: '30–35', desc: 'Confident & alluring', emoji: '💎' },
  { id: '35s', label: '36–40', desc: 'Experienced charm', emoji: '🌹' },
  { id: '40s', label: '41–45', desc: 'Mature & magnetic', emoji: '👑' },
  { id: '45s', label: '46–50', desc: 'Timeless beauty', emoji: '🍷' },
]

const ETHNICITY_LIST = [
  { id: 'scandinavian', label: 'Scandinavian', emoji: '🇸🇪' },
  { id: 'northwest_european', label: 'Western European', emoji: '🇳🇱' },
  { id: 'mediterranean', label: 'Mediterranean', emoji: '🇮🇹' },
  { id: 'east_european', label: 'Eastern European', emoji: '🇵🇱' },
  { id: 'latin', label: 'Latina / Latino', emoji: '🇧🇷' },
  { id: 'east_asian', label: 'East Asian', emoji: '🇯🇵' },
  { id: 'southeast_asian', label: 'Southeast Asian', emoji: '🇹🇭' },
  { id: 'south_asian', label: 'South Asian', emoji: '🇮🇳' },
  { id: 'middle_eastern', label: 'Middle Eastern', emoji: '🇦🇪' },
  { id: 'turkish', label: 'Turkish', emoji: '🇹🇷' },
  { id: 'persian', label: 'Persian', emoji: '🇮🇷' },
  { id: 'african', label: 'African', emoji: '🌍' },
  { id: 'caribbean', label: 'Caribbean', emoji: '🏝️' },
  { id: 'polynesian', label: 'Polynesian', emoji: '🌺' },
  { id: 'native_american', label: 'Native American', emoji: '🦅' },
  { id: 'mixed', label: 'Mixed', emoji: '🌎' },
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
  { id: 'long', label: 'Long Straight', emoji: '💇‍♀️' },
  { id: 'wavy', label: 'Wavy', emoji: '🌊' },
  { id: 'curly', label: 'Curly', emoji: '🌀' },
  { id: 'very_long', label: 'Very Long', emoji: '👸' },
  { id: 'bob', label: 'Bob', emoji: '✂️' },
  { id: 'lob', label: 'Lob', emoji: '💁‍♀️' },
  { id: 'pixie', label: 'Pixie Cut', emoji: '✨' },
  { id: 'bangs', label: 'Bangs', emoji: '🎀' },
  { id: 'curtain_bangs', label: 'Curtain Bangs', emoji: '🌸' },
  { id: 'ponytail', label: 'Ponytail', emoji: '🎗️' },
  { id: 'bun', label: 'Bun / Updo', emoji: '💫' },
  { id: 'braids', label: 'Braids', emoji: '🪢' },
  { id: 'afro', label: 'Afro', emoji: '🌟' },
  { id: 'messy', label: 'Messy', emoji: '😏' },
  { id: 'dreadlocks', label: 'Dreadlocks', emoji: '🦁' },
]
const HAIR_STYLES_MAN = [
  { id: 'short', label: 'Short', emoji: '💇‍♂️' },
  { id: 'medium', label: 'Medium', emoji: '👤' },
  { id: 'long', label: 'Long', emoji: '🧔' },
  { id: 'fade', label: 'Fade', emoji: '✂️' },
  { id: 'undercut', label: 'Undercut', emoji: '⚡' },
  { id: 'buzz', label: 'Buzz Cut', emoji: '🪒' },
  { id: 'curly', label: 'Curly', emoji: '🌀' },
  { id: 'wavy', label: 'Wavy', emoji: '🌊' },
  { id: 'textured', label: 'Textured', emoji: '🔥' },
  { id: 'cornrows', label: 'Cornrows', emoji: '🪢' },
  { id: 'dreadlocks', label: 'Dreadlocks', emoji: '🦁' },
  { id: 'messy', label: 'Messy', emoji: '😏' },
  { id: 'ponytail', label: 'Man Bun', emoji: '💫' },
  { id: 'afro', label: 'Afro', emoji: '🌟' },
]

const EYE_COLORS = [
  { id: 'blue', label: 'Blue', color: '#4a90d9' },
  { id: 'green', label: 'Green', color: '#4a9d6b' },
  { id: 'hazel', label: 'Hazel', color: '#8b6914' },
  { id: 'brown', label: 'Brown', color: '#6b3a1a' },
  { id: 'dark_brown', label: 'Dark Brown', color: '#3a1a0a' },
  { id: 'grey', label: 'Grey', color: '#808080' },
  { id: 'amber', label: 'Amber', color: '#c4720a' },
]

const PERSONALITIES = [
  { id: 'Playful', emoji: '🎮' }, { id: 'Romantic', emoji: '🌹' },
  { id: 'Flirty', emoji: '😘' }, { id: 'Caring', emoji: '🤗' },
  { id: 'Mysterious', emoji: '🌙' }, { id: 'Funny', emoji: '😂' },
  { id: 'Passionate', emoji: '🔥' }, { id: 'Adventurous', emoji: '🌍' },
  { id: 'Calm', emoji: '🌿' }, { id: 'Energetic', emoji: '⚡' },
  { id: 'Intellectual', emoji: '📚' }, { id: 'Empathic', emoji: '🫂' },
  { id: 'Dominant', emoji: '👑' }, { id: 'Submissive', emoji: '🦋' },
  { id: 'Sarcastic', emoji: '😏' }, { id: 'Sweet', emoji: '🍬' },
  { id: 'Confident', emoji: '💪' }, { id: 'Shy', emoji: '🙈' },
  { id: 'Creative', emoji: '🎨' }, { id: 'Protective', emoji: '🛡️' },
]

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

  const [data, setData] = useState<FormData>({
    name: '', gender: 'woman', relationshipStyle: 'lover',
    personality: [], age: '25s', ethnicity: 'northwest_european',
    build: 'slim', skinTone: 'fair', hairColor: 'brown',
    hairLength: 'long', eyeColor: 'brown', clothingStyle: 'casual',
    vibe: 'sweet', breastSize: 'cup-c', assSize: 'medium', dickSize: 'average',
  })

  const set = useCallback((key: string, val: string | string[]) => {
    setData(prev => ({ ...prev, [key]: val }))
  }, [])

  function togglePersonality(trait: string) {
    setData(prev => ({
      ...prev,
      personality: prev.personality.includes(trait)
        ? prev.personality.filter(t => t !== trait)
        : [...prev.personality, trait].slice(0, 5),
    }))
  }

  // Steps: gender-specific flow
  const totalSteps = 9
  const goNext = () => { setAnimDir('forward'); setStep(s => Math.min(s + 1, totalSteps)) }
  const goBack = () => { setAnimDir('back'); setStep(s => Math.max(s - 1, 1)) }

  async function handleCreate() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    setLoading(true)

    const appearance = {
      gender: data.gender, age: data.age, ethnicity: data.ethnicity,
      build: data.build, skinTone: data.skinTone, hairColor: data.hairColor,
      hairLength: data.hairLength, eyeColor: data.eyeColor, clothingStyle: data.clothingStyle,
      ...(data.gender === 'woman' || data.gender === 'nonbinary' ? { breastSize: data.breastSize, assSize: data.assSize } : {}),
      ...(data.gender === 'man' ? { dickSize: data.dickSize } : {}),
    }

    const { data: companion, error } = await supabase
      .from('companions')
      .insert({
        user_id: user.id,
        name: data.name,
        relationship_style: data.relationshipStyle,
        personality: { traits: data.personality, gender: data.gender, vibe: data.vibe },
        appearance,
      })
      .select()
      .single()

    if (error || !companion) {
      console.error(error)
      setLoading(false)
      return
    }

    setCreatedCompanionId(companion.id)
    setGenerating(true)
    try {
      const res = await fetch('/api/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companionId: companion.id, appearance, emotion: 'neutral' }),
      })
      const result = await res.json()
      if (result.url) setAvatarUrl(result.url)
    } catch (e) {
      console.error('Avatar gen failed:', e)
    }
    setGenerating(false)
    setLoading(false)
    setAnimDir('forward')
    setStep(9)
  }

  async function handleRegenerateAvatar() {
    if (!createdCompanionId) return
    setRegenerating(true)
    const appearance = {
      gender: data.gender, age: data.age, ethnicity: data.ethnicity,
      build: data.build, skinTone: data.skinTone, hairColor: data.hairColor,
      hairLength: data.hairLength, eyeColor: data.eyeColor, clothingStyle: data.clothingStyle,
      ...(data.gender === 'woman' || data.gender === 'nonbinary' ? { breastSize: data.breastSize, assSize: data.assSize } : {}),
      ...(data.gender === 'man' ? { dickSize: data.dickSize } : {}),
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
      {step < 9 && (
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
            {step} / 8
          </div>
        </div>
      )}

      {/* ── Progress bar ── (hidden on preview step) */}
      {step < 9 && (
        <div style={{ display: 'flex', gap: 3, padding: '0 24px', marginTop: -1 }}>
          {Array.from({ length: 8 }).map((_, i) => (
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
            subtitle="Choose who you want to connect with."
          >
            <ImageGrid cols={3}>
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
          </StepContainer>
        )}

        {/* STEP 2 — Relationship */}
        {step === 2 && (
          <StepContainer
            title="What's the vibe?"
            subtitle="What kind of connection are you looking for?"
          >
            <ImageGrid cols={3}>
              {RELATIONSHIPS.map(r => (
                <ImageCard
                  key={r.id}
                  img={r.img}
                  label={r.label}
                  sublabel={r.desc}
                  selected={data.relationshipStyle === r.id}
                  onClick={() => { set('relationshipStyle', r.id); goNext() }}
                  aspectRatio="3/4"
                />
              ))}
            </ImageGrid>
          </StepContainer>
        )}

        {/* STEP 3 — Age */}
        {step === 3 && (
          <StepContainer
            title="How old?"
            subtitle="Choose an age range for your SenseMate."
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, width: '100%' }}>
              {AGES.map(a => {
                const selected = data.age === a.id
                return (
                  <button key={a.id} onClick={() => { set('age', a.id); goNext() }} style={{
                    padding: '20px 16px', borderRadius: 16, cursor: 'pointer',
                    background: selected ? 'rgba(233,30,140,0.15)' : 'rgba(255,255,255,0.03)',
                    border: selected ? '2px solid rgba(233,30,140,0.6)' : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: selected ? '0 0 20px rgba(233,30,140,0.2)' : 'none',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    transition: 'all 0.2s',
                    color: '#fff',
                  }}>
                    <span style={{ fontSize: 28 }}>{a.emoji}</span>
                    <span style={{ fontSize: 18, fontWeight: 700 }}>{a.label}</span>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{a.desc}</span>
                  </button>
                )
              })}
            </div>
          </StepContainer>
        )}

        {/* STEP 4 — Ethnicity */}
        {step === 4 && (
          <StepContainer
            title="Ethnicity"
            subtitle="What look are you drawn to?"
          >
            <ImageGrid cols={4}>
              {ETHNICITY_LIST.map(e => {
                const genderFolder = data.gender === 'man' ? 'man' : 'woman'
                return (
                  <ImageCard
                    key={e.id}
                    img={`/onboarding/ethnicity/${genderFolder}/${e.id}.jpg`}
                    label={`${e.emoji} ${e.label}`}
                    selected={data.ethnicity === e.id}
                    onClick={() => { set('ethnicity', e.id); goNext() }}
                    aspectRatio="3/4"
                    small
                  />
                )
              })}
            </ImageGrid>
          </StepContainer>
        )}

        {/* STEP 5 — Build + Body */}
        {step === 5 && (
          <StepContainer
            title="Body type"
            subtitle="Choose the physique you prefer."
          >
            {/* Build */}
            <div style={{ marginBottom: 32 }}>
              <SectionTitle>Build</SectionTitle>
              <ImageGrid cols={data.gender === 'woman' ? 5 : 4}>
                {(data.gender === 'man' ? BUILDS_MAN : BUILDS_WOMAN).map(b => (
                  <ImageCard
                    key={b.id}
                    img={b.img}
                    label={b.label}
                    selected={data.build === b.id}
                    onClick={() => set('build', b.id)}
                    aspectRatio="3/4"
                    small
                  />
                ))}
              </ImageGrid>
            </div>

            {/* Breast size (woman/nonbinary) */}
            {(data.gender === 'woman' || data.gender === 'nonbinary') && (
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

            {/* Dick size (man) */}
            {data.gender === 'man' && (
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
            )}

            <NavButton onClick={goNext} label="Continue →" />
          </StepContainer>
        )}

        {/* STEP 6 — Features (skin, hair, eyes) */}
        {step === 6 && (
          <StepContainer
            title="Features"
            subtitle="Fine-tune the details."
          >
            <div style={{ width: '100%', maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 28 }}>
              {/* Skin tone */}
              <div>
                <SectionTitle>Skin Tone</SectionTitle>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {SKIN_TONES.map(s => (
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
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(data.gender === 'man' ? HAIR_STYLES_MAN : HAIR_STYLES_WOMAN).map(h => (
                    <ChipButton key={h.id} selected={data.hairLength === h.id} onClick={() => set('hairLength', h.id)}>
                      {h.emoji} {h.label}
                    </ChipButton>
                  ))}
                </div>
              </div>

              {/* Eye color */}
              <div>
                <SectionTitle>Eye Color</SectionTitle>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {EYE_COLORS.map(e => (
                    <ColorCircle
                      key={e.id}
                      color={e.color}
                      label={e.label}
                      selected={data.eyeColor === e.id}
                      onClick={() => set('eyeColor', e.id)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 32 }}>
              <NavButton onClick={goNext} label="Continue →" />
            </div>
          </StepContainer>
        )}

        {/* STEP 7 — Style & Vibe */}
        {step === 7 && (
          <StepContainer
            title="Style & Vibe"
            subtitle="How does your SenseMate dress and act?"
          >
            <div style={{ marginBottom: 32 }}>
              <SectionTitle>Clothing Style</SectionTitle>
              <ImageGrid cols={4}>
                {(data.gender === 'man' ? CLOTHING_MAN : CLOTHING_WOMAN).map(c => (
                  <ImageCard
                    key={c.id}
                    img={c.img}
                    label={c.label}
                    selected={data.clothingStyle === c.id}
                    onClick={() => set('clothingStyle', c.id)}
                    aspectRatio="3/4"
                    small
                  />
                ))}
              </ImageGrid>
            </div>

            <div style={{ marginBottom: 32 }}>
              <SectionTitle>Vibe</SectionTitle>
              <ImageGrid cols={3}>
                {VIBES.map(v => (
                  <ImageCard
                    key={v.id}
                    img={v.img}
                    label={v.label}
                    selected={data.vibe === v.id}
                    onClick={() => set('vibe', v.id)}
                    aspectRatio="3/4"
                    small
                  />
                ))}
              </ImageGrid>
            </div>

            <NavButton onClick={goNext} label="Almost done →" />
          </StepContainer>
        )}

        {/* STEP 8 — Name & Personality */}
        {step === 8 && (
          <StepContainer
            title="Final touches"
            subtitle="Give your SenseMate a name and personality."
          >
            <div style={{ width: '100%', maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 28 }}>
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

              {/* Personality traits */}
              <div>
                <SectionTitle>Personality <span style={{ color: 'var(--muted-fg)', fontWeight: 400, fontSize: 13 }}>— pick up to 5</span></SectionTitle>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {PERSONALITIES.map(trait => {
                    const sel = data.personality.includes(trait.id)
                    return (
                      <button
                        key={trait.id}
                        onClick={() => togglePersonality(trait.id)}
                        style={{
                          padding: '10px 18px', borderRadius: 100, cursor: 'pointer',
                          fontSize: 14, fontWeight: 500,
                          display: 'flex', alignItems: 'center', gap: 7,
                          border: `1px solid ${sel ? 'rgba(233,30,140,0.6)' : 'rgba(255,255,255,0.08)'}`,
                          background: sel ? 'rgba(233,30,140,0.15)' : 'rgba(255,255,255,0.03)',
                          color: sel ? ACCENT : 'var(--fg-2)',
                          transition: 'all 0.2s',
                          transform: sel ? 'scale(1.04)' : 'scale(1)',
                        }}
                      >
                        <span>{trait.emoji}</span> {trait.id}
                      </button>
                    )
                  })}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted-fg)', marginTop: 8 }}>
                  {data.personality.length}/5 selected
                </div>
              </div>

              {/* Create button */}
              <button
                onClick={handleCreate}
                disabled={!data.name.trim() || loading}
                style={{
                  width: '100%', padding: '18px', fontSize: 17, fontWeight: 700,
                  borderRadius: 16, border: 'none', cursor: 'pointer',
                  background: data.name.trim()
                    ? 'linear-gradient(135deg, #e91e8c, #c026d3, #7c3aed)'
                    : 'rgba(255,255,255,0.06)',
                  color: data.name.trim() ? 'white' : 'var(--muted-fg)',
                  boxShadow: data.name.trim()
                    ? '0 8px 32px rgba(233,30,140,0.3), 0 0 60px rgba(233,30,140,0.1)'
                    : 'none',
                  transition: 'all 0.3s ease',
                  letterSpacing: '0.5px',
                }}
              >
                Create {data.name || 'SenseMate'} ✨
              </button>
            </div>
          </StepContainer>
        )}

        {/* ─── Step 9: Preview ─────────────────────────────────────────── */}
        {step === 9 && (
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

              {/* Trait pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 8 }}>
                {data.personality.map(trait => (
                  <span key={trait} style={{
                    padding: '6px 16px', borderRadius: 100, fontSize: 13, fontWeight: 500,
                    background: 'rgba(233,30,140,0.1)', border: '1px solid rgba(233,30,140,0.2)',
                    color: ACCENT,
                  }}>
                    {trait}
                  </span>
                ))}
                <span style={{
                  padding: '6px 16px', borderRadius: 100, fontSize: 13, fontWeight: 500,
                  background: 'rgba(91,66,243,0.1)', border: '1px solid rgba(91,66,243,0.2)',
                  color: '#8b7cf7',
                }}>
                  {RELATIONSHIPS.find(r => r.id === data.relationshipStyle)?.label || data.relationshipStyle}
                </span>
              </div>

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

                {/* Regenerate photo */}
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
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StepContainer({ title, subtitle, children }: {
  title: string; subtitle: string; children: React.ReactNode
}) {
  return (
    <div style={{ width: '100%', maxWidth: 900, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
    <div className="onb-image-grid" style={{
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

function ColorCircle({ color, label, selected, onClick }: {
  color: string; label: string; selected: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        background: 'none', border: 'none', cursor: 'pointer', padding: 4,
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: '50%', background: color,
        border: selected ? `3px solid ${ACCENT}` : '3px solid rgba(255,255,255,0.1)',
        boxShadow: selected ? `0 0 16px rgba(233,30,140,0.5)` : 'none',
        transition: 'all 0.25s',
        transform: selected ? 'scale(1.15)' : 'scale(1)',
      }} />
      <span style={{
        fontSize: 10, color: selected ? ACCENT : 'var(--muted-fg)',
        fontWeight: selected ? 600 : 400, transition: 'color 0.2s',
      }}>
        {label}
      </span>
    </button>
  )
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
