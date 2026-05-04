'use client'
import { useState } from 'react'
import { PageWrap, Card, Btn, Badge } from '@/components/ui'
import type { Session } from '@/lib/session'

const fallbackTruths = [
  "What's your favorite memory of us? 💭",
  "When did you first realize you liked me? 💕",
  "What's one thing you've never told me? 🤫",
  "What do you love most about our relationship? 💗",
  "If we could go anywhere right now, where would you take me? ✈️",
]
const fallbackDares = [
  "Send me the last photo in your gallery 📸",
  "Do your best impression of me 🎭",
  "Write a 4-line poem about me right now ✍️",
  "Send me your favorite meme of all time 😂",
  "Describe me using only food items 🍕",
]

export default function TruthOrDare({ session, onBack }: { session: Session; onBack: () => void }) {
  const truths: string[] = (session.questions['truth'] ?? []).length > 0 ? session.questions['truth'] : fallbackTruths
  const dares:  string[] = (session.questions['dare']  ?? []).length > 0 ? session.questions['dare']  : fallbackDares

  const [mode, setMode]       = useState<'truth'|'dare'|null>(null)
  const [current, setCurrent] = useState<string|null>(null)
  const [usedT, setUsedT]     = useState<number[]>([])
  const [usedD, setUsedD]     = useState<number[]>([])
  const [spinning, setSpinning] = useState(false)

  const pick = (type: 'truth'|'dare') => {
    setSpinning(true)
    setMode(type)
    setTimeout(() => {
      const pool  = type === 'truth' ? truths : dares
      const used  = type === 'truth' ? usedT  : usedD
      const avail = pool.map((_, i) => i).filter(i => !used.includes(i))
      const src   = avail.length > 0 ? avail : pool.map((_, i) => i)
      const pick  = src[Math.floor(Math.random() * src.length)]
      if (type === 'truth') setUsedT(u => [...u, pick])
      else                  setUsedD(u => [...u, pick])
      setCurrent(pool[pick])
      setSpinning(false)
    }, 700)
  }

  return (
    <PageWrap onBack={onBack}>
      <div style={{ paddingTop: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🔥</div>
        <h2 className="caveat" style={{ fontSize: '2.2rem', marginBottom: 4 }}>Truth or Dare</h2>
        <p style={{ color: 'var(--text2)', fontSize: '0.88rem', marginBottom: 32 }}>Tailored for {session.creatorName} & {session.partnerName} 😏</p>

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginBottom: 32 }}>
          <button
            onClick={() => pick('truth')}
            style={{
              background: 'rgba(56,189,248,0.12)', border: '1.5px solid rgba(56,189,248,0.3)',
              borderRadius: 'var(--radius-lg)', padding: '20px 28px', cursor: 'pointer',
              color: 'var(--sky)', fontWeight: 800, fontSize: '1.1rem', transition: 'all 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(56,189,248,0.22)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(56,189,248,0.12)')}
          >
            🤔 Truth
          </button>
          <button
            onClick={() => pick('dare')}
            style={{
              background: 'rgba(248,113,113,0.12)', border: '1.5px solid rgba(248,113,113,0.3)',
              borderRadius: 'var(--radius-lg)', padding: '20px 28px', cursor: 'pointer',
              color: 'var(--coral)', fontWeight: 800, fontSize: '1.1rem', transition: 'all 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.22)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.12)')}
          >
            😈 Dare
          </button>
        </div>

        {(spinning || current) && (
          <Card style={{ maxWidth: 400, margin: '0 auto', animation: spinning ? '' : 'popIn 0.4s both', textAlign: 'center', minHeight: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {spinning ? (
              <div style={{ fontSize: '2rem', animation: 'pulse 0.5s ease-in-out infinite' }}>
                {mode === 'truth' ? '🤔' : '😈'}
              </div>
            ) : (
              <>
                <Badge color={mode === 'truth' ? 'var(--sky)' : 'var(--coral)'}>{mode?.toUpperCase()}</Badge>
                <p style={{ marginTop: 16, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.6 }}>
                  {current}
                </p>
              </>
            )}
          </Card>
        )}
      </div>
    </PageWrap>
  )
}
