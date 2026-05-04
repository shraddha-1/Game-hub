'use client'
import { useState } from 'react'
import { PageWrap, Card, Btn, ScoreBar, Badge } from '@/components/ui'
import type { Session } from '@/lib/session'

interface WYR { optionA: string; optionB: string; emoji?: string }

const fallback: WYR[] = [
  { optionA: 'Always hold hands in public 🤝', optionB: 'Always have matching outfits 👫', emoji: '💑' },
  { optionA: 'Live in a treehouse 🌳', optionB: 'Live on a houseboat ⛵', emoji: '🏡' },
  { optionA: 'Only communicate through love letters 💌', optionB: 'Only communicate through songs 🎵', emoji: '💬' },
  { optionA: 'Have a pet dragon 🐉', optionB: 'Have a pet unicorn 🦄', emoji: '✨' },
  { optionA: 'Relive your first hangout forever 💕', optionB: 'Fast forward to growing old together 👴👵', emoji: '⏳' },
]

export default function WouldYouRather({ session, onBack }: { session: Session; onBack: () => void }) {
  const questions: WYR[] = (session.questions['wyr'] ?? []).length > 0 ? session.questions['wyr'] : fallback
  const [idx, setIdx] = useState(0)
  const [p1Pick, setP1Pick] = useState<'A'|'B'|null>(null)
  const [p2Pick, setP2Pick] = useState<'A'|'B'|null>(null)
  const [turn, setTurn] = useState<1|2>(1)
  const [history, setHistory] = useState<{same:boolean}[]>([])
  const [done, setDone] = useState(false)

  const q = questions[idx]

  const pick = (choice: 'A'|'B') => {
    if (turn === 1) { setP1Pick(choice); setTurn(2) }
    else {
      setP2Pick(choice)
      setHistory(h => [...h, { same: p1Pick === choice }])
    }
  }

  const next = () => {
    if (idx + 1 >= questions.length) { setDone(true); return }
    setIdx(i => i + 1); setP1Pick(null); setP2Pick(null); setTurn(1)
  }

  const restart = () => { setIdx(0); setP1Pick(null); setP2Pick(null); setTurn(1); setHistory([]); setDone(false) }

  const bothPicked = p1Pick !== null && p2Pick !== null

  if (done) {
    const matches = history.filter(h => h.same).length
    return (
      <PageWrap onBack={onBack}>
        <div style={{ textAlign: 'center', paddingTop: 60 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>💑</div>
          <h2 className="caveat" style={{ fontSize: '2.4rem', marginBottom: 8 }}>Results!</h2>
          <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--pink)', marginBottom: 8 }}>{matches}/{history.length}</div>
          <p style={{ color: 'var(--text2)', marginBottom: 32 }}>
            {matches >= Math.ceil(history.length * 0.8) ? 'Soulmates confirmed! 😍' : matches >= Math.ceil(history.length * 0.5) ? 'Great minds think alike! 💕' : 'Opposites attract! 🧲'}
          </p>
          <Btn onClick={restart}>Play Again 💕</Btn>
        </div>
      </PageWrap>
    )
  }

  return (
    <PageWrap onBack={onBack}>
      <div style={{ paddingTop: 16 }}>
        <ScoreBar current={idx + 1} total={questions.length} />
        <Badge color="var(--purple)">Would You Rather 🤔</Badge>
        <div style={{ textAlign: 'center', margin: '20px 0 8px' }}>
          <span style={{
            display: 'inline-block', padding: '6px 18px', borderRadius: 50, fontSize: '0.82rem', fontWeight: 800,
            background: turn === 1 ? 'rgba(232,121,160,0.15)' : 'rgba(167,139,250,0.15)',
            color: turn === 1 ? 'var(--pink)' : 'var(--purple)',
            border: `1px solid ${turn === 1 ? 'rgba(232,121,160,0.3)' : 'rgba(167,139,250,0.3)'}`,
          }}>
            {bothPicked ? 'Reveal!' : turn === 1 ? `👤 ${session.creatorName}'s turn` : `👤 ${session.partnerName}'s turn (no peeking!)`}
          </span>
        </div>
        <h3 className="caveat" style={{ textAlign: 'center', fontSize: '2rem', margin: '16px 0 24px' }}>Would you rather...</h3>

        {!bothPicked ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {(['A','B'] as const).map(letter => {
              const opt = letter === 'A' ? q.optionA : q.optionB
              const col = letter === 'A' ? 'var(--pink)' : 'var(--purple)'
              return (
                <button
                  key={letter}
                  onClick={() => pick(letter)}
                  style={{
                    background: `rgba(${letter === 'A' ? '232,121,160' : '167,139,250'},0.08)`,
                    border: `1.5px solid rgba(${letter === 'A' ? '232,121,160' : '167,139,250'},0.25)`,
                    borderRadius: 'var(--radius-lg)', padding: '22px 20px', cursor: 'pointer',
                    color: 'var(--text)', fontWeight: 700, fontSize: '1rem', lineHeight: 1.5,
                    textAlign: 'center', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.02)'; (e.currentTarget as HTMLButtonElement).style.background = `rgba(${letter === 'A' ? '232,121,160' : '167,139,250'},0.18)` }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLButtonElement).style.background = `rgba(${letter === 'A' ? '232,121,160' : '167,139,250'},0.08)` }}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        ) : (
          <Card style={{ animation: 'popIn 0.4s both', textAlign: 'center' }}>
            <p style={{ fontWeight: 800, fontSize: '1.2rem', color: p1Pick === p2Pick ? 'var(--teal)' : 'var(--coral)', marginBottom: 16 }}>
              {p1Pick === p2Pick ? '🥰 Same answer!' : '😂 Different answers!'}
            </p>
            <p style={{ color: 'var(--text)', marginBottom: 6, fontSize: '0.9rem' }}>
              👤 {session.creatorName}: <strong>{p1Pick === 'A' ? q.optionA : q.optionB}</strong>
            </p>
            <p style={{ color: 'var(--text)', marginBottom: 20, fontSize: '0.9rem' }}>
              👤 {session.partnerName}: <strong>{p2Pick === 'A' ? q.optionA : q.optionB}</strong>
            </p>
            <Btn onClick={next}>{idx + 1 >= questions.length ? 'See Results 🏆' : 'Next →'}</Btn>
          </Card>
        )}
      </div>
    </PageWrap>
  )
}