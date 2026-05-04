'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSession, type Session, RELATIONSHIP_EMOJIS, RELATIONSHIP_LABELS } from '@/lib/session'
import { Doodles, Btn, Card, Spinner } from '@/components/ui'
import dynamic from 'next/dynamic'

const GuessMovie     = dynamic(() => import('@/components/games/GuessMovie'),      { ssr: false })
const WouldYouRather = dynamic(() => import('@/components/games/WouldYouRather'),   { ssr: false })
const TruthOrDare    = dynamic(() => import('@/components/games/TruthOrDare'),      { ssr: false })
const ThisOrThat     = dynamic(() => import('@/components/games/ThisOrThat'),       { ssr: false })
const CompatQuiz     = dynamic(() => import('@/components/games/CompatQuiz'),       { ssr: false })
const LoveNotes      = dynamic(() => import('@/components/games/LoveNotes'),        { ssr: false })
const AiTrivia       = dynamic(() => import('@/components/games/AiTrivia'),         { ssr: false })

const GAME_META: Record<string, { emoji: string; label: string }> = {
  trivia: { emoji: '🧠', label: 'AI Trivia'        },
  wyr:    { emoji: '🤔', label: 'Would You Rather'  },
  tod:    { emoji: '🔥', label: 'Truth or Dare'     },
  tot:    { emoji: '🎯', label: 'This or That'      },
  compat: { emoji: '💕', label: 'Compatibility'     },
  movie:  { emoji: '🎬', label: 'Guess the Movie'   },
  love:   { emoji: '💌', label: 'Love Notes'        },
}

export default function PlayPage({ params }: { params: { sessionId: string } }) {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [activeGame, setActiveGame] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const s = await getSession(params.sessionId)
        if (s) setSession(s)
        else setNotFound(true)
      } catch (e) {
        console.error('Failed to load session:', e)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.sessionId])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <Spinner />
      <p style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>Loading session...</p>
    </div>
  )

  if (notFound) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24, textAlign: 'center' }}>
      <div style={{ fontSize: 48 }}>🔍</div>
      <h2 className="caveat" style={{ fontSize: '2rem' }}>Session not found</h2>
      <p style={{ color: 'var(--text2)' }}>This link may be expired or invalid.</p>
      <Btn onClick={() => router.push('/')}>Create a new session</Btn>
    </div>
  )

  if (!session) return null

  const goBack = () => setActiveGame(null)

  if (activeGame === 'trivia')  return <AiTrivia     session={session} onBack={goBack} />
  if (activeGame === 'wyr')     return <WouldYouRather session={session} onBack={goBack} />
  if (activeGame === 'tod')     return <TruthOrDare  session={session} onBack={goBack} />
  if (activeGame === 'tot')     return <ThisOrThat   session={session} onBack={goBack} />
  if (activeGame === 'compat')  return <CompatQuiz   session={session} onBack={goBack} />
  if (activeGame === 'movie')   return <GuessMovie   session={session} onBack={goBack} />
  if (activeGame === 'love')    return <LoveNotes    session={session} onBack={goBack} />

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      <Doodles />
      <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 500, height: 500, background: 'radial-gradient(circle, rgba(232,121,160,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 520, margin: '0 auto', padding: '60px 24px 60px' }}>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: '0.85rem', cursor: 'pointer', marginBottom: 32, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Home
        </button>

        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>{RELATIONSHIP_EMOJIS[session.relationship]}</div>
          <h1 className="caveat" style={{ fontSize: 'clamp(2rem,6vw,2.8rem)', marginBottom: 6 }}>
            {session.creatorName} & {session.partnerName}
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>{RELATIONSHIP_LABELS[session.relationship]}</p>
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
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '28px 20px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.3s cubic-bezier(.34,1.56,.64,1)',
                  animation: `fadeUp 0.5s both`,
                  animationDelay: `${i * 0.07}s`,
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

        <p style={{ textAlign: 'center', color: 'var(--text3)', marginTop: 48, fontFamily: 'Caveat, cursive', fontSize: '1rem' }}>
          made with love 💗
        </p>
      </div>
    </div>
  )
}
