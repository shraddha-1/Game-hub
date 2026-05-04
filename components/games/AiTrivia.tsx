'use client'
import { useState } from 'react'
import { PageWrap, Card, Btn, ScoreBar, Badge, Spinner } from '@/components/ui'
import type { Session } from '@/lib/session'

interface Q { question: string; options: string[]; answer: number; emoji: string }

export default function AiTrivia({ session, onBack }: { session: Session; onBack: () => void }) {
  const questions: Q[] = session.questions['trivia'] ?? []
  const [idx, setIdx] = useState(0)
  const [chosen, setChosen] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  if (questions.length === 0) return (
    <PageWrap onBack={onBack}>
      <div style={{ textAlign: 'center', paddingTop: 80 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <p style={{ color: 'var(--text2)' }}>No trivia questions were generated. Try creating a new session.</p>
        <Btn onClick={onBack} style={{ marginTop: 24 }}>Go Back</Btn>
      </div>
    </PageWrap>
  )

  const q = questions[idx]

  const pick = (i: number) => {
    if (chosen !== null) return
    setChosen(i)
    if (i === q.answer) setScore(s => s + 1)
  }

  const next = () => {
    if (idx + 1 >= questions.length) { setDone(true); return }
    setIdx(i => i + 1)
    setChosen(null)
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100)
    return (
      <PageWrap onBack={onBack}>
        <div style={{ textAlign: 'center', paddingTop: 60 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🧠</div>
          <h2 className="caveat" style={{ fontSize: '2.4rem', marginBottom: 8 }}>Trivia Done!</h2>
          <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--pink)', marginBottom: 8 }}>{pct}%</div>
          <p style={{ color: 'var(--text2)', marginBottom: 32 }}>
            {score}/{questions.length} correct · {pct >= 80 ? 'Genius! 🏆' : pct >= 50 ? 'Nice work! 🎉' : 'Keep learning! 📚'}
          </p>
          <Btn onClick={() => { setIdx(0); setChosen(null); setScore(0); setDone(false) }}>Play Again 🔄</Btn>
        </div>
      </PageWrap>
    )
  }

  const optColors = ['var(--pink)', 'var(--purple)', 'var(--teal)', 'var(--amber)']

  return (
    <PageWrap onBack={onBack}>
      <div style={{ paddingTop: 16 }}>
        <ScoreBar current={idx + 1} total={questions.length} score={score} />
        <Badge>AI Trivia 🧠</Badge>
        <Card style={{ marginTop: 20 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>{q.emoji}</div>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.5, color: 'var(--text)' }}>{q.question}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {q.options.map((opt, oi) => {
              const isChosen = chosen === oi
              const isCorrect = oi === q.answer
              const revealed = chosen !== null
              let bg = 'var(--bg3)'
              let border = 'var(--border)'
              let color = 'var(--text)'
              if (revealed && isCorrect) { bg = 'rgba(52,211,153,0.15)'; border = 'rgba(52,211,153,0.5)'; color = 'var(--teal)' }
              else if (revealed && isChosen) { bg = 'rgba(248,113,113,0.15)'; border = 'rgba(248,113,113,0.5)'; color = 'var(--coral)' }
              return (
                <button
                  key={oi}
                  onClick={() => pick(oi)}
                  style={{
                    background: bg, border: `1.5px solid ${border}`, borderRadius: 'var(--radius)',
                    padding: '14px 18px', color, fontWeight: 700, fontSize: '0.95rem',
                    textAlign: 'left', cursor: revealed ? 'default' : 'pointer',
                    transition: 'all 0.25s', display: 'flex', alignItems: 'center', gap: 12,
                  }}
                >
                  <span style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: `${optColors[oi]}22`, border: `1.5px solid ${optColors[oi]}55`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', fontWeight: 800, flexShrink: 0, color: optColors[oi],
                  }}>
                    {['A','B','C','D'][oi]}
                  </span>
                  {opt}
                  {revealed && isCorrect && <span style={{ marginLeft: 'auto' }}>✓</span>}
                  {revealed && isChosen && !isCorrect && <span style={{ marginLeft: 'auto' }}>✗</span>}
                </button>
              )
            })}
          </div>
          {chosen !== null && (
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <p style={{ fontSize: '1rem', fontWeight: 700, color: chosen === q.answer ? 'var(--teal)' : 'var(--coral)', marginBottom: 16 }}>
                {chosen === q.answer ? '🎉 Correct!' : `❌ Correct answer: ${q.options[q.answer]}`}
              </p>
              <Btn onClick={next}>{idx + 1 >= questions.length ? 'See Results 🏆' : 'Next →'}</Btn>
            </div>
          )}
        </Card>
      </div>
    </PageWrap>
  )
}
