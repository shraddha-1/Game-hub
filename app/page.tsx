'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Btn, Card, Doodles, Spinner } from '@/components/ui'
import { generateId, saveSession, getAllSessions, deleteSessionById, type RelationshipType, RELATIONSHIP_LABELS, RELATIONSHIP_EMOJIS, type Session } from '@/lib/session'

const GAMES = [
  { id: 'trivia',  emoji: '🧠', label: 'Trivia',            desc: 'General knowledge from OpenTDB', tag: 'OpenTDB' },
  { id: 'movie',   emoji: '🎬', label: 'Guess the Movie',   desc: 'Decode emoji clues!', tag: null },
  { id: 'wyr',     emoji: '🤔', label: 'Would You Rather',  desc: 'See if you think alike', tag: null },
  { id: 'tod',     emoji: '🔥', label: 'Truth or Dare',     desc: 'Couples edition — spicy!', tag: null },
  { id: 'tot',     emoji: '🎯', label: 'This or That',      desc: 'Quick picks, compare later', tag: null },
  { id: 'compat',  emoji: '💕', label: 'Compatibility',     desc: 'How alike are you?', tag: null },
  { id: 'love',    emoji: '💌', label: 'Love Notes',        desc: 'Sweet messages to send', tag: null },
]

const RELATIONSHIPS: { value: RelationshipType; emoji: string; label: string }[] = [
  { value: 'partner',    emoji: '💕', label: 'Partner / Lover'   },
  { value: 'bestfriend', emoji: '🫂', label: 'Best Friend'       },
  { value: 'crush',      emoji: '🦋', label: 'Crush'             },
  { value: 'sibling',    emoji: '👯', label: 'Sibling'           },
  { value: 'parent',     emoji: '🏠', label: 'Parent / Child'    },
  { value: 'colleague',  emoji: '💼', label: 'Colleague'         },
]

type Step = 'landing' | 'who' | 'games' | 'generating' | 'done'

export default function HomePage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('landing')
  const [creatorName, setCreatorName] = useState('')
  const [partnerName, setPartnerName] = useState('')
  const [relationship, setRelationship] = useState<RelationshipType | null>(null)
  const [selectedGames, setSelectedGames] = useState<string[]>(['trivia', 'movie', 'wyr', 'tod'])
  const [sessions, setSessions] = useState<Session[]>([])
  const [genStatus, setGenStatus] = useState('')
  const [sessionId, setSessionId] = useState('')

  useEffect(() => {
    loadSessions()
  }, [step])

  const loadSessions = async () => {
    try { setSessions(await getAllSessions()) } catch {}
  }

  const toggleGame = (id: string) => {
    setSelectedGames(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id])
  }

  const generateQuestions = async (games: string[]) => {
    const questions: Record<string, any[]> = {}
    const gameTypes = games.flatMap(g => g === 'tod' ? ['truth', 'dare'] : [g])
    const labels: Record<string, string> = {
      trivia: 'trivia', movie: 'movie', wyr: 'would you rather',
      truth: 'truth', dare: 'dare', tot: 'this or that',
      compat: 'compatibility', love: 'love notes',
    }
    for (const gt of gameTypes) {
      setGenStatus(`Loading ${labels[gt] ?? gt} questions... ✨`)
      try {
        const res = await fetch('/api/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameType: gt }),
        })
        const data = await res.json()
        questions[gt] = data.questions ?? []
      } catch { questions[gt] = [] }
    }
    return questions
  }

  const handleCreate = async () => {
    if (!relationship || !creatorName.trim() || !partnerName.trim() || selectedGames.length === 0) return
    setStep('generating')
    const sid = generateId()
    setSessionId(sid)
    const questions = await generateQuestions(selectedGames)
    const session: Session = {
      id: sid, creatorName: creatorName.trim(), partnerName: partnerName.trim(),
      relationship, games: selectedGames, createdAt: Date.now(), questions,
    }
    await saveSession(session)
    setSessions(prev => [session, ...prev])
    setStep('done')
  }

  const copyLink = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/play/${id}`)
  }

  /* ── LANDING ── */
  if (step === 'landing') return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      <Doodles />
      <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 560, margin: '0 auto', padding: '80px 24px 60px', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: 24, margin: '0 auto 32px', background: 'linear-gradient(135deg,rgba(232,121,160,0.3),rgba(167,139,250,0.3))', border: '1px solid rgba(232,121,160,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, boxShadow: '0 0 60px rgba(167,139,250,0.2)' }}>💑</div>
        <h1 className="caveat fade-up" style={{ fontSize: 'clamp(2.6rem,7vw,4rem)', lineHeight: 1.1, marginBottom: 12 }}>Us, the Game</h1>
        <p className="fade-up" style={{ fontSize: '1.05rem', color: 'var(--text2)', marginBottom: 48, animationDelay: '0.1s' }}>
          Cute games for couples — 100% free, no sign-up needed.<br />Create a session. Share the link. Play together!
        </p>
        <div className="fade-up" style={{ animationDelay: '0.2s', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <Btn size="lg" onClick={() => setStep('who')} style={{ width: 260 }}>Create a Session ✨</Btn>
          {sessions.length > 0 && (
            <Btn variant="ghost" onClick={() => document.getElementById('sessions')?.scrollIntoView({ behavior: 'smooth' })}>
              Past sessions ({sessions.length})
            </Btn>
          )}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 56 }}>
          {['100% Free', '7 game modes', 'Shareable links', 'OpenTDB trivia', '200+ couples questions'].map(f => (
            <span key={f} style={{ padding: '7px 16px', borderRadius: 50, background: 'var(--bg3)', border: '1px solid var(--border)', fontSize: '0.82rem', color: 'var(--text2)', fontWeight: 700 }}>{f}</span>
          ))}
        </div>
        {sessions.length > 0 && (
          <div id="sessions" style={{ marginTop: 80, textAlign: 'left' }}>
            <h2 style={{ fontSize: '1rem', color: 'var(--text2)', fontWeight: 800, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Past Sessions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {sessions.map(s => (
                <div key={s.id} style={{ background: 'var(--card)', borderRadius: 'var(--radius)', padding: '16px 20px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ fontSize: 28 }}>{RELATIONSHIP_EMOJIS[s.relationship]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: 2 }}>{s.creatorName} & {s.partnerName}</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>{RELATIONSHIP_LABELS[s.relationship]} · {s.games.length} games</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <Btn size="sm" onClick={() => router.push(`/play/${s.id}`)}>Play</Btn>
                    <Btn size="sm" variant="ghost" onClick={() => copyLink(s.id)}>Copy</Btn>
                    <Btn size="sm" variant="danger" onClick={async () => { await deleteSessionById(s.id); setSessions(p => p.filter(x => x.id !== s.id)) }}>✕</Btn>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  /* ── WHO ── */
  if (step === 'who') return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative' }}>
      <Doodles />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 520, margin: '0 auto', padding: '64px 24px 48px' }}>
        <button onClick={() => setStep('landing')} style={{ background: 'none', border: 'none', color: 'var(--text2)', fontSize: '0.9rem', cursor: 'pointer', marginBottom: 32, fontWeight: 700 }}>← Back</button>
        <h2 className="caveat" style={{ fontSize: '2.4rem', marginBottom: 8 }}>Who are you playing with?</h2>
        <p style={{ color: 'var(--text2)', marginBottom: 36, fontSize: '0.95rem' }}>Enter your names and pick your relationship.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 32 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your name</label>
            <input value={creatorName} onChange={e => setCreatorName(e.target.value)} placeholder="e.g. Alex" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Their name</label>
            <input value={partnerName} onChange={e => setPartnerName(e.target.value)} placeholder="e.g. Sam" />
          </div>
        </div>
        <p style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text2)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Relationship</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 40 }}>
          {RELATIONSHIPS.map(r => (
            <button key={r.value} onClick={() => setRelationship(r.value)} style={{
              background: relationship === r.value ? 'linear-gradient(135deg,rgba(232,121,160,0.25),rgba(167,139,250,0.25))' : 'var(--bg3)',
              border: relationship === r.value ? '1.5px solid var(--pink)' : '1.5px solid var(--border)',
              borderRadius: 'var(--radius)', padding: '18px 10px', cursor: 'pointer', transition: 'all 0.2s',
              transform: relationship === r.value ? 'scale(1.03)' : 'scale(1)', textAlign: 'center',
            }}>
              <div style={{ fontSize: 26, marginBottom: 6 }}>{r.emoji}</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: relationship === r.value ? 'var(--pink2)' : 'var(--text2)', lineHeight: 1.3 }}>{r.label}</div>
            </button>
          ))}
        </div>
        <Btn size="lg" onClick={() => setStep('games')} disabled={!creatorName.trim() || !partnerName.trim() || !relationship} style={{ width: '100%' }}>
          Next: Pick Games →
        </Btn>
      </div>
    </div>
  )

  /* ── GAMES ── */
  if (step === 'games') return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative' }}>
      <Doodles />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 520, margin: '0 auto', padding: '64px 24px 48px' }}>
        <button onClick={() => setStep('who')} style={{ background: 'none', border: 'none', color: 'var(--text2)', fontSize: '0.9rem', cursor: 'pointer', marginBottom: 32, fontWeight: 700 }}>← Back</button>
        <h2 className="caveat" style={{ fontSize: '2.4rem', marginBottom: 8 }}>Pick your games</h2>
        <p style={{ color: 'var(--text2)', marginBottom: 36, fontSize: '0.95rem' }}>Select at least one game for your session.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 40 }}>
          {GAMES.map(g => {
            const on = selectedGames.includes(g.id)
            return (
              <button key={g.id} onClick={() => toggleGame(g.id)} style={{
                background: on ? 'linear-gradient(135deg,rgba(232,121,160,0.2),rgba(167,139,250,0.2))' : 'var(--bg3)',
                border: on ? '1.5px solid var(--purple)' : '1.5px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '20px 14px', cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.2s', position: 'relative', transform: on ? 'scale(1.02)' : 'scale(1)',
              }}>
                {on && (<div style={{ position: 'absolute', top: 10, right: 10, width: 20, height: 20, borderRadius: '50%', background: 'var(--purple)', color: '#fff', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>✓</div>)}
                <div style={{ fontSize: 28, marginBottom: 8 }}>{g.emoji}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: on ? 'var(--purple2)' : 'var(--text)', marginBottom: 3 }}>{g.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{g.desc}</div>
                {g.tag && <span style={{ marginTop: 8, display: 'inline-block', fontSize: '0.65rem', fontWeight: 800, background: 'rgba(52,211,153,0.15)', color: 'var(--teal)', padding: '2px 8px', borderRadius: 50 }}>{g.tag} 🌐</span>}
              </button>
            )
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text3)' }}>{selectedGames.length} selected</span>
          <button onClick={() => setSelectedGames(GAMES.map(g => g.id))} style={{ background: 'none', border: 'none', color: 'var(--text2)', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 700 }}>Select all</button>
        </div>
        <Btn size="lg" onClick={handleCreate} disabled={selectedGames.length === 0} style={{ width: '100%' }}>
          Create Session ✨
        </Btn>
      </div>
    </div>
  )

  /* ── GENERATING ── */
  if (step === 'generating') return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: 24 }}>
      <div style={{ fontSize: 48, animation: 'pulse 1.5s ease-in-out infinite' }}>✨</div>
      <h2 className="caveat" style={{ fontSize: '2rem', textAlign: 'center' }}>Setting up your session...</h2>
      <Spinner />
      <p style={{ color: 'var(--text2)', fontSize: '0.9rem', textAlign: 'center', maxWidth: 280 }}>{genStatus}</p>
    </div>
  )

  /* ── DONE ── */
  if (step === 'done') {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/play/${sessionId}` : ''
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16, animation: 'popIn 0.5s both' }}>🎉</div>
          <h2 className="caveat" style={{ fontSize: '2.4rem', marginBottom: 8 }}>Session ready!</h2>
          <p style={{ color: 'var(--text2)', marginBottom: 40 }}>Share this link with {partnerName} and play together!</p>
          <Card style={{ marginBottom: 24 }}>
            <div style={{ background: 'var(--bg3)', borderRadius: 12, padding: '14px 18px', marginBottom: 16, fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text2)', wordBreak: 'break-all', textAlign: 'left' }}>{url}</div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Btn onClick={() => copyLink(sessionId)}>Copy Link 📋</Btn>
              <Btn variant="ghost" onClick={() => router.push(`/play/${sessionId}`)}>Play Now →</Btn>
            </div>
          </Card>
          <Btn variant="ghost" onClick={() => { setStep('landing'); setCreatorName(''); setPartnerName(''); setRelationship(null); setSelectedGames(['trivia', 'movie', 'wyr', 'tod']) }}>
            Create another session
          </Btn>
        </div>
      </div>
    )
  }

  return null
}
