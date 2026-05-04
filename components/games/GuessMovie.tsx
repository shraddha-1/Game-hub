'use client'
import { useState } from 'react'
import { PageWrap, Card, Btn, ScoreBar, Badge } from '@/components/ui'
import type { Session } from '@/lib/session'

interface Movie { emojis: string; answer: string; hints: string[] }

const fallback: Movie[] = [
  { emojis: '🚢❄️💑', answer: 'Titanic', hints: ['1997 film','Jack & Rose','Iceberg ahead!'] },
  { emojis: '🦁👑🌍', answer: 'The Lion King', hints: ['Hakuna Matata','Circle of life','Disney classic'] },
  { emojis: '🧙‍♂️💍🌋', answer: 'Lord of the Rings', hints: ['One ring','Middle Earth','Hobbits'] },
  { emojis: '🧊👸⛄🎵', answer: 'Frozen', hints: ['Let it go','Sister bond','Disney'] },
  { emojis: '🐀👨‍🍳🇫🇷', answer: 'Ratatouille', hints: ['Anyone can cook','Paris','Tiny chef'] },
  { emojis: '💊🕶️🔴🔵', answer: 'The Matrix', hints: ['Red or blue pill','Neo','Bullet time'] },
]

export default function GuessMovie({ session, onBack }: { session: Session; onBack: () => void }) {
  const movies: Movie[] = (session.questions['movie'] ?? []).length > 0 ? session.questions['movie'] : fallback
  const [idx, setIdx]   = useState(0)
  const [guess, setGuess] = useState('')
  const [hints, setHints] = useState(0)
  const [result, setResult] = useState<'correct'|'wrong'|null>(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  const movie = movies[idx]

  const check = () => {
    const g = guess.trim().toLowerCase()
    const a = movie.answer.toLowerCase()
    if (g.includes(a) || a.includes(g)) { setResult('correct'); setScore(s => s + 1) }
    else setResult('wrong')
  }

  const next = () => {
    if (idx + 1 >= movies.length) { setDone(true); return }
    setIdx(i => i + 1); setGuess(''); setHints(0); setResult(null)
  }

  const restart = () => { setIdx(0); setGuess(''); setHints(0); setResult(null); setScore(0); setDone(false) }

  if (done) return (
    <PageWrap onBack={onBack}>
      <div style={{ textAlign: 'center', paddingTop: 60 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🎬</div>
        <h2 className="caveat" style={{ fontSize: '2.4rem', marginBottom: 8 }}>Game Over!</h2>
        <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--pink)', marginBottom: 8 }}>{score}/{movies.length}</div>
        <p style={{ color: 'var(--text2)', marginBottom: 32 }}>
          {score >= movies.length * 0.8 ? 'Movie genius! 🏆' : score >= movies.length * 0.5 ? 'Great job! 🎉' : score >= movies.length * 0.3 ? 'Not bad! 🍿' : 'Time for a movie marathon! 📺'}
        </p>
        <Btn onClick={restart}>Play Again 🍿</Btn>
      </div>
    </PageWrap>
  )

  return (
    <PageWrap onBack={onBack}>
      <div style={{ paddingTop: 16 }}>
        <ScoreBar current={idx + 1} total={movies.length} score={score} />
        <Badge color="var(--coral)">Guess the Movie 🎬</Badge>
        <Card style={{ marginTop: 20, textAlign: 'center' }}>
          <p style={{ fontSize: 'clamp(2.5rem,8vw,4rem)', letterSpacing: 8, margin: '8px 0 20px', lineHeight: 1.5 }}>{movie.emojis}</p>

          {hints > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
              {movie.hints.slice(0, hints).map((h, i) => (
                <span key={i} style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', color: 'var(--amber)', padding: '4px 14px', borderRadius: 50, fontSize: '0.8rem', fontWeight: 700 }}>
                  💡 {h}
                </span>
              ))}
            </div>
          )}

          {!result ? (
            <>
              <input
                value={guess}
                onChange={e => setGuess(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && guess.trim() && check()}
                placeholder="Type the movie name..."
                style={{ textAlign: 'center', marginBottom: 16, maxWidth: 300 }}
              />
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Btn onClick={check} disabled={!guess.trim()}>Check ✓</Btn>
                {hints < 3 && (
                  <button
                    onClick={() => setHints(h => h + 1)}
                    style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 50, padding: '10px 20px', color: 'var(--amber)', fontWeight: 800, cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'Nunito,sans-serif' }}
                  >
                    Hint 💡
                  </button>
                )}
              </div>
            </>
          ) : (
            <div style={{ animation: 'popIn 0.4s both' }}>
              <p style={{ fontSize: '1.2rem', fontWeight: 800, color: result === 'correct' ? 'var(--teal)' : 'var(--coral)', margin: '8px 0 16px' }}>
                {result === 'correct' ? '🎉 Nailed it!' : `It was "${movie.answer}" 😅`}
              </p>
              <Btn onClick={next}>{idx + 1 >= movies.length ? 'See Results 🏆' : 'Next Movie →'}</Btn>
            </div>
          )}
        </Card>
      </div>
    </PageWrap>
  )
}
