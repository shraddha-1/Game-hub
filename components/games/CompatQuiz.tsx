'use client'
import { useState } from 'react'
import { PageWrap, Card, Btn, ScoreBar, Badge } from '@/components/ui'
import type { Session } from '@/lib/session'

interface CQ { question: string; options: string[] }

const fallback: CQ[] = [
  { question: "It's Saturday night. Ideal date?", options: ['Netflix & snacks 🍿','Fancy dinner 🍷','Game night 🎮','Stargazing 🌌'] },
  { question: 'Love language?', options: ['Words 💬','Touch 🤗','Gifts 🎁','Quality Time ⏰'] },
  { question: 'Dream home?', options: ['City penthouse 🏙️','Beach house 🏖️','Mountain cabin 🏔️','Countryside cottage 🌻'] },
  { question: "What's most important?", options: ['Trust 🤝','Humor 😂','Adventure 🗺️','Communication 💬'] },
]

const optColors = ['rgba(232,121,160,0.15)','rgba(167,139,250,0.15)','rgba(52,211,153,0.15)','rgba(251,191,36,0.15)']
const optBorders = ['rgba(232,121,160,0.4)','rgba(167,139,250,0.4)','rgba(52,211,153,0.4)','rgba(251,191,36,0.4)']

export default function CompatQuiz({ session, onBack }: { session: Session; onBack: () => void }) {
  const questions: CQ[] = (session.questions['compat'] ?? []).length > 0 ? session.questions['compat'] : fallback
  const [qi, setQi]         = useState(0)
  const [p1Ans, setP1Ans]   = useState<number[]>([])
  const [p2Ans, setP2Ans]   = useState<number[]>([])
  const [phase, setPhase]   = useState<'p1'|'p2'|'results'>('p1')
  const [chosen, setChosen] = useState<number|null>(null)

  const pick = (oi: number) => {
    if (chosen !== null) return
    setChosen(oi)
    setTimeout(() => {
      if (phase === 'p1') {
        const na = [...p1Ans, oi]
        setP1Ans(na)
        if (qi + 1 >= questions.length) { setPhase('p2'); setQi(0) }
        else setQi(q => q + 1)
      } else {
        const na = [...p2Ans, oi]
        setP2Ans(na)
        if (qi + 1 >= questions.length) setPhase('results')
        else setQi(q => q + 1)
      }
      setChosen(null)
    }, 400)
  }

  const restart = () => { setQi(0); setP1Ans([]); setP2Ans([]); setPhase('p1'); setChosen(null) }

  if (phase === 'results') {
    const matches = p1Ans.filter((a, i) => a === p2Ans[i]).length
    const pct = Math.round((matches / questions.length) * 100)
    const circumference = 2 * Math.PI * 52
    const offset = circumference - (pct / 100) * circumference
    return (
      <PageWrap onBack={onBack}>
        <div style={{ paddingTop: 40, textAlign: 'center' }}>
          {/* radial progress */}
          <svg width="130" height="130" viewBox="0 0 130 130" style={{ display: 'block', margin: '0 auto 16px' }}>
            <circle cx="65" cy="65" r="52" fill="none" stroke="var(--bg3)" strokeWidth="10" />
            <circle cx="65" cy="65" r="52" fill="none"
              stroke="url(#grad)" strokeWidth="10" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset}
              transform="rotate(-90 65 65)" style={{ transition: 'stroke-dashoffset 1s ease' }} />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--pink)" />
                <stop offset="100%" stopColor="var(--purple)" />
              </linearGradient>
            </defs>
            <text x="65" y="62" textAnchor="middle" fill="var(--text)" fontFamily="Nunito,sans-serif" fontWeight="900" fontSize="24">{pct}%</text>
            <text x="65" y="80" textAnchor="middle" fill="var(--text2)" fontFamily="Nunito,sans-serif" fontWeight="700" fontSize="11">compatible</text>
          </svg>
          <h2 className="caveat" style={{ fontSize: '2.2rem', marginBottom: 8 }}>Compatibility!</h2>
          <p style={{ color: 'var(--text2)', marginBottom: 32, fontSize: '0.95rem' }}>
            {pct >= 80 ? 'Made for each other! 😍' : pct >= 50 ? 'Beautiful balance! 💕' : 'Opposites attract! 🧲'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32, textAlign: 'left' }}>
            {questions.map((q, i) => (
              <div key={i} style={{ background: p1Ans[i] === p2Ans[i] ? 'rgba(52,211,153,0.1)' : 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 14px' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text3)', marginBottom: 4 }}>{q.question}</p>
                <p style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                  👤 {q.options[p1Ans[i]]} {p1Ans[i] === p2Ans[i] ? '= ✅' : '≠'} {p1Ans[i] !== p2Ans[i] && `👤 ${q.options[p2Ans[i]]}`}
                </p>
              </div>
            ))}
          </div>
          <Btn onClick={restart}>Play Again 💕</Btn>
        </div>
      </PageWrap>
    )
  }

  const q = questions[qi]
  return (
    <PageWrap onBack={onBack}>
      <div style={{ paddingTop: 16 }}>
        <ScoreBar current={qi + 1} total={questions.length} />
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <span style={{
            display: 'inline-block', padding: '6px 18px', borderRadius: 50, fontSize: '0.82rem', fontWeight: 800,
            background: phase === 'p1' ? 'rgba(232,121,160,0.15)' : 'rgba(167,139,250,0.15)',
            color: phase === 'p1' ? 'var(--pink)' : 'var(--purple)',
          }}>
            {phase === 'p1' ? `👤 ${session.creatorName}` : `👤 ${session.partnerName} (no peeking!)`}
          </span>
        </div>
        <h3 className="caveat" style={{ textAlign: 'center', fontSize: '1.8rem', margin: '20px 0 24px' }}>{q.question}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {q.options.map((opt, oi) => (
            <button
              key={oi}
              onClick={() => pick(oi)}
              style={{
                background: chosen === oi ? optColors[oi].replace('0.15','0.35') : optColors[oi],
                border: `1.5px solid ${optBorders[oi]}`,
                borderRadius: 'var(--radius)', padding: '18px 12px',
                cursor: chosen !== null ? 'default' : 'pointer',
                color: 'var(--text)', fontWeight: 700, fontSize: '0.9rem',
                textAlign: 'center', lineHeight: 1.4,
                transition: 'all 0.2s',
                transform: chosen === oi ? 'scale(1.05)' : 'scale(1)',
                fontFamily: 'Nunito, sans-serif',
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </PageWrap>
  )
}
