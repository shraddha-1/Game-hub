'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSession, updatePartnerName, type Session, RELATIONSHIP_EMOJIS, RELATIONSHIP_LABELS } from '@/lib/session'
import { Doodles, Btn, Card } from '@/components/ui'
import dynamic from 'next/dynamic'

const GuessMovie     = dynamic(() => import('@/components/games/GuessMovie'),     { ssr: false })
const WouldYouRather = dynamic(() => import('@/components/games/WouldYouRather'), { ssr: false })
const TruthOrDare    = dynamic(() => import('@/components/games/TruthOrDare'),    { ssr: false })
const ThisOrThat     = dynamic(() => import('@/components/games/ThisOrThat'),     { ssr: false })
const CompatQuiz     = dynamic(() => import('@/components/games/CompatQuiz'),     { ssr: false })
const LoveNotes      = dynamic(() => import('@/components/games/LoveNotes'),      { ssr: false })
const AiTrivia       = dynamic(() => import('@/components/games/AiTrivia'),       { ssr: false })

const GAME_META: Record<string, { emoji: string; label: string }> = {
  trivia: { emoji: '🧠', label: 'AI Trivia'       },
  wyr:    { emoji: '🤔', label: 'Would You Rather' },
  tod:    { emoji: '🔥', label: 'Truth or Dare'    },
  tot:    { emoji: '🎯', label: 'This or That'     },
  compat: { emoji: '💕', label: 'Compatibility'    },
  movie:  { emoji: '🎬', label: 'Guess the Movie'  },
  love:   { emoji: '💌', label: 'Love Notes'       },
}

// Who am I? Stored in sessionStorage per session so it survives page refresh
function getMyRole(sessionId: string): 'creator' | 'partner' | null {
  return sessionStorage.getItem(`role_${sessionId}`) as 'creator' | 'partner' | null
}
function setMyRole(sessionId: string, role: 'creator' | 'partner') {
  sessionStorage.setItem(`role_${sessionId}`, role)
}

export default function PlayPage({ params }: { params: { sessionId: string } }) {
  const router = useRouter()
  const [session, setSession]       = useState<Session | null>(null)
  const [activeGame, setActiveGame] = useState<string | null>(null)
  const [notFound, setNotFound]     = useState(false)

  // Name entry state (for partner)
  const [needsName, setNeedsName]   = useState(false)
  const [nameInput, setNameInput]   = useState('')
  const [savingName, setSavingName] = useState(false)

  useEffect(() => {
    const load = async () => {
      const s = await getSession(params.sessionId)
      if (!s) { setNotFound(true); return }

      // Figure out who this person is
      let role = getMyRole(params.sessionId)

      if (!role) {
        // First visit — are they the creator or partner?
        // Creator's device will have set role already via the create flow
        // Anyone else landing here is the partner
        role = 'partner'
        setMyRole(params.sessionId, role)
      }

      if (role === 'creator') {
        // Creator — already has their name in session
        setSession(s)
      } else {
        // Partner — do they have a name yet?
        if (!s.partnerName) {
          setNeedsName(true)
          setSession(s)
        } else {
          setSession(s)
        }
      }
    }
    load()
  }, [params.sessionId])

  // Creator's device: mark them as creator when they land from the done screen
  useEffect(() => {
    // If coming from creation (role not set yet), set as creator
    const role = getMyRole(params.sessionId)
    if (!role) {
      // Will be determined in the load above
    }
  }, [])

  const handleSaveName = async () => {
    if (!nameInput.trim() || !session) return
    setSavingName(true)
    await updatePartnerName(session.id, nameInput.trim())
    setSession({ ...session, partnerName: nameInput.trim() })
    setNeedsName(false)
    setSavingName(false)
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (!notFound && !session) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--pink)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  )

  // ── Not found ─────────────────────────────────────────────────────────────
  if (notFound) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24, textAlign: 'center' }}>
      <div style={{ fontSize: 48 }}>🔍</div>
      <h2 className="caveat" style={{ fontSize: '2rem' }}>Session not found</h2>
      <p style={{ color: 'var(--text2)' }}>This link may be invalid or expired.</p>
      <Btn onClick={() => router.push('/')}>Create a new session</Btn>
    </div>
  )

  // ── Partner name entry ────────────────────────────────────────────────────
  if (needsName && session) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' }}>
      <Doodles />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>{RELATIONSHIP_EMOJIS[session.relationship]}</div>
        <h2 className="caveat" style={{ fontSize: '2.4rem', marginBottom: 8 }}>
          {session.creatorName} invited you!
        </h2>
        <p style={{ color: 'var(--text2)', marginBottom: 40, fontSize: '0.95rem' }}>
          Enter your name to join the game 🎮
        </p>
        <Card>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text2)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>
            Your name
          </label>
          <input
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && nameInput.trim() && handleSaveName()}
            placeholder="Enter your name..."
            style={{ marginBottom: 20 }}
            autoFocus
          />
          <Btn
            onClick={handleSaveName}
            disabled={!nameInput.trim() || savingName}
            style={{ width: '100%' }}
          >
            {savingName ? 'Joining...' : "Let's Play! 🎉"}
          </Btn>
        </Card>
      </div>
    </div>
  )

  if (!session) return null

  const goBack = () => setActiveGame(null)

  // ── Active game ───────────────────────────────────────────────────────────
  if (activeGame === 'trivia')  return <AiTrivia       session={session} onBack={goBack} />
  if (activeGame === 'wyr')     return <WouldYouRather session={session} onBack={goBack} />
  if (activeGame === 'tod')     return <TruthOrDare    session={session} onBack={goBack} />
  if (activeGame === 'tot')     return <ThisOrThat      session={session} onBack={goBack} />
  if (activeGame === 'compat')  return <CompatQuiz     session={session} onBack={goBack} />
  if (activeGame === 'movie')   return <GuessMovie     session={session} onBack={goBack} />
  if (activeGame === 'love')    return <LoveNotes      session={session} onBack={goBack} />

  // ── Game hub ──────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      <Doodles />
      <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 500, height: 500, background: 'radial-gradient(circle, rgba(232,121,160,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 520, margin: '0 auto', padding: '60px 24px 60px' }}>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: '0.85rem', cursor: 'pointer', marginBottom: 32, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Nunito, sans-serif' }}>
          ← Home
        </button>

        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>{RELATIONSHIP_EMOJIS[session.relationship]}</div>
          <h1 className="caveat" style={{ fontSize: 'clamp(2rem,6vw,2.8rem)', marginBottom: 6 }}>
            {session.creatorName}{session.partnerName ? ` & ${session.partnerName}` : ''}
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>{RELATIONSHIP_LABELS[session.relationship]}</p>
          {!session.partnerName && (
            <p style={{ color: 'var(--text3)', fontSize: '0.8rem', marginTop: 8 }}>
              ⏳ Waiting for the other person to join via the link...
            </p>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {session.games.map((gid, i) => {
            const meta = GAME_META[gid]
            if (!meta) return null
            return (
              <button
                key={gid}
                onClick={() => setActiveGame(gid)}
                style={{
                  background: 'var(--card)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)', padding: '28px 20px',
                  cursor: 'pointer', textAlign: 'center',
                  transition: 'all 0.3s cubic-bezier(.34,1.56,.64,1)',
                  animation: 'fadeUp 0.5s both',
                  animationDelay: `${i * 0.07}s`,
                  fontFamily: 'Nunito, sans-serif',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLButtonElement
                  el.style.transform = 'translateY(-4px) scale(1.03)'
                  el.style.border = '1px solid rgba(232,121,160,0.4)'
                  el.style.boxShadow = '0 0 30px rgba(232,121,160,0.15)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLButtonElement
                  el.style.transform = 'scale(1)'
                  el.style.border = '1px solid var(--border)'
                  el.style.boxShadow = 'none'
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 10 }}>{meta.emoji}</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>{meta.label}</div>
              </button>
            )
          })}
        </div>

        <p className="caveat" style={{ textAlign: 'center', color: 'var(--text3)', marginTop: 48, fontSize: '1rem' }}>
          made with love 💗
        </p>
      </div>
    </div>
  )
}