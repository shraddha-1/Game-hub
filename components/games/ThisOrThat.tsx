'use client'
import { useState } from 'react'
import { PageWrap, Btn, ScoreBar, Badge } from '@/components/ui'
import type { Session } from '@/lib/session'

interface TOT { optionA: string; optionB: string }

const fallback: TOT[] = [
  { optionA: 'Morning person 🌅', optionB: 'Night owl 🌙' },
  { optionA: 'Beach vacation 🏖️', optionB: 'Mountain getaway ⛰️' },
  { optionA: 'Sweet 🍩', optionB: 'Spicy 🌶️' },
  { optionA: 'Road trip 🚗', optionB: 'Plane trip ✈️' },
  { optionA: 'Adopt a dog 🐕', optionB: 'Adopt a cat 🐈' },
]

export default function ThisOrThat({ session, onBack }: { session: Session; onBack: () => void }) {
  const questions: TOT[] = (session.questions['tot'] ?? []).length > 0 ? session.questions['tot'] : fallback
  const [idx, setIdx]         = useState(0)
  const [picks, setPicks]     = useState<string[]>([])
  const [chosen, setChosen]   = useState<'A'|'B'|null>(null)
  const [done, setDone]       = useState(false)

  const pick = (c: 'A'|'B') => {
    if (chosen) return
    setChosen(c)
    setPicks(p => [...p, c === 'A' ? questions[idx].optionA : questions[idx].optionB])
    setTimeout(() => {
      if (idx + 1 >= questions.length) { setDone(true) }
      else { setIdx(i => i + 1); setChosen(null) }
    }, 600)
  }

  const restart = () => { setIdx(0); setPicks([]); setChosen(null); setDone(false) }

  if (done) return (
    <PageWrap onBack={onBack}>
      <div style={{ paddingTop: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
          <h2 className="caveat" style={{ fontSize: '2.2rem', marginBottom: 6 }}>Your picks!</h2>
          <p style={{ color: 'var(--text2)', fontSize: '0.88rem' }}>Screenshot and compare with {session.partnerName}! 📸</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
          {picks.map((p, i) => (
            <div key={i} style={{
              background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
              padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text3)', fontWeight: 800, minWidth: 24 }}>Q{i+1}</span>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{p}</span>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <Btn onClick={restart}>Play Again 🔄</Btn>
        </div>
      </div>
    </PageWrap>
  )

  const q = questions[idx]
  return (
    <PageWrap onBack={onBack}>
      <div style={{ paddingTop: 16 }}>
        <ScoreBar current={idx + 1} total={questions.length} />
        <Badge color="var(--amber)">This or That 🎯</Badge>
        <h3 className="caveat" style={{ textAlign: 'center', fontSize: '2.2rem', margin: '24px 0 28px' }}>This or That?</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 380, margin: '0 auto' }}>
          {(['A','B'] as const).map(letter => {
            const opt = letter === 'A' ? q.optionA : q.optionB
            const isChosen = chosen === letter
            const notChosen = chosen !== null && !isChosen
            const col = letter === 'A' ? 'var(--peach,#fb923c)' : 'var(--purple)'
            return (
              <button
                key={letter}
                onClick={() => pick(letter)}
                style={{
                  fontFamily: 'Nunito, sans-serif',
                  background: isChosen ? `rgba(${letter === 'A' ? '251,146,60' : '167,139,250'},0.2)` : 'var(--bg3)',
                  border: isChosen ? `2px solid ${col}` : '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-lg)', padding: '28px 24px', cursor: chosen ? 'default' : 'pointer',
                  color: 'var(--text)', fontWeight: 800, fontSize: '1.1rem',
                  textAlign: 'center', transition: 'all 0.3s cubic-bezier(.34,1.56,.64,1)',
                  transform: isChosen ? 'scale(1.05)' : notChosen ? 'scale(0.95)' : 'scale(1)',
                  opacity: notChosen ? 0.4 : 1,
                }}
              >
                {opt}
              </button>
            )
          })}
        </div>
      </div>
    </PageWrap>
  )
}
