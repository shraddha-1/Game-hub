'use client'
import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { doc, setDoc, onSnapshot } from 'firebase/firestore'
import { PageWrap, Card, Btn, ScoreBar, Badge, Spinner } from '@/components/ui'
import type { Session } from '@/lib/session'

interface Movie { emojis: string; answer: string; hints: string[] }
interface RoomState { idx: number; p1Guess: string|null; p2Guess: string|null; p1Correct: boolean|null; p2Correct: boolean|null; revealed: boolean; p1Score: number; p2Score: number }

const fallback: Movie[] = [
  { emojis: '🚢❄️💑', answer: 'Titanic', hints: ['1997 film','Jack & Rose','Iceberg!'] },
  { emojis: '🦁👑🌍', answer: 'The Lion King', hints: ['Hakuna Matata','Circle of life','Disney'] },
  { emojis: '🧊👸⛄🎵', answer: 'Frozen', hints: ['Let it go','Sister bond','Disney princess'] },
  { emojis: '🐀👨‍🍳🇫🇷', answer: 'Ratatouille', hints: ['Anyone can cook','Paris','Tiny chef'] },
  { emojis: '🤖❤️🌱🚀', answer: 'WALL-E', hints: ['Lonely robot','EVE','Save the earth'] },
]

export default function GuessMovie({ session, onBack }: { session: Session; onBack: () => void }) {
  const movies: Movie[] = (session.questions['movie'] ?? []).length > 0 ? session.questions['movie'] : fallback

  const [myRole, setMyRole]   = useState<'p1'|'p2'|null>(null)
  const [room, setRoom]       = useState<RoomState>({ idx: 0, p1Guess: null, p2Guess: null, p1Correct: null, p2Correct: null, revealed: false, p1Score: 0, p2Score: 0 })
  const [guess, setGuess]     = useState('')
  const [hints, setHints]     = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [done, setDone]       = useState(false)

  const roomRef = doc(db, 'movie_rooms', session.id)

  useEffect(() => {
    const init = async () => {
      const { getDoc } = await import('firebase/firestore')
      const stored = sessionStorage.getItem(`movie_role_${session.id}`)
      if (stored) { setMyRole(stored as 'p1'|'p2'); setLoading(false); return }
      const snap = await getDoc(roomRef)
      if (!snap.exists() || !snap.data().p1Joined) {
        await setDoc(roomRef, { idx: 0, p1Guess: null, p2Guess: null, p1Correct: null, p2Correct: null, revealed: false, p1Score: 0, p2Score: 0, p1Joined: true })
        sessionStorage.setItem(`movie_role_${session.id}`, 'p1')
        setMyRole('p1')
      } else {
        sessionStorage.setItem(`movie_role_${session.id}`, 'p2')
        setMyRole('p2')
      }
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    const unsub = onSnapshot(roomRef, snap => {
      if (snap.exists()) {
        const data = snap.data() as RoomState
        setRoom(data)
        // Reset submission state when new round starts
        if (data.idx !== room.idx) { setSubmitted(false); setGuess(''); setHints(0) }
      }
    })
    return () => unsub()
  }, [room.idx])

  const submit = async () => {
    if (!guess.trim() || submitted || !myRole) return
    const movie = movies[room.idx]
    const g = guess.trim().toLowerCase()
    const a = movie.answer.toLowerCase()
    const correct = g.includes(a) || a.includes(g)
    setSubmitted(true)

    const { getDoc } = await import('firebase/firestore')
    const snap = await getDoc(roomRef)
    const current = snap.data() as RoomState

    const update: any = {
      [myRole === 'p1' ? 'p1Guess' : 'p2Guess']: guess.trim(),
      [myRole === 'p1' ? 'p1Correct' : 'p2Correct']: correct,
      ...(correct && myRole === 'p1' ? { p1Score: (current.p1Score ?? 0) + 1 } : {}),
      ...(correct && myRole === 'p2' ? { p2Score: (current.p2Score ?? 0) + 1 } : {}),
    }

    const otherGuess = myRole === 'p1' ? current.p2Guess : current.p1Guess
    if (otherGuess !== null) update.revealed = true

    await setDoc(roomRef, update, { merge: true })
  }

  const next = async () => {
    const nextIdx = room.idx + 1
    if (nextIdx >= movies.length) { setDone(true); return }
    await setDoc(roomRef, { idx: nextIdx, p1Guess: null, p2Guess: null, p1Correct: null, p2Correct: null, revealed: false }, { merge: true })
  }

  const restart = async () => {
    setDone(false); setSubmitted(false); setGuess(''); setHints(0)
    sessionStorage.removeItem(`movie_role_${session.id}`)
    await setDoc(roomRef, { idx: 0, p1Guess: null, p2Guess: null, p1Correct: null, p2Correct: null, revealed: false, p1Score: 0, p2Score: 0, p1Joined: true })
  }

  if (loading) return <PageWrap onBack={onBack}><div style={{ textAlign: 'center', paddingTop: 80 }}><Spinner /></div></PageWrap>

  const p1Name = session.creatorName
  const p2Name = session.partnerName

  if (done) {
    return (
      <PageWrap onBack={onBack}>
        <div style={{ textAlign: 'center', paddingTop: 40 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎬</div>
          <h2 className="caveat" style={{ fontSize: '2.4rem', marginBottom: 16 }}>Final Scores!</h2>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 28 }}>
            <div style={{ background: 'rgba(232,121,160,0.1)', borderRadius: 'var(--radius)', padding: '20px 28px', border: '1px solid rgba(232,121,160,0.2)' }}>
              <p style={{ color: 'var(--text3)', fontSize: '0.8rem', marginBottom: 4 }}>{p1Name}</p>
              <p style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--pink)' }}>{room.p1Score}</p>
            </div>
            <div style={{ background: 'rgba(167,139,250,0.1)', borderRadius: 'var(--radius)', padding: '20px 28px', border: '1px solid rgba(167,139,250,0.2)' }}>
              <p style={{ color: 'var(--text3)', fontSize: '0.8rem', marginBottom: 4 }}>{p2Name}</p>
              <p style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--purple)' }}>{room.p2Score}</p>
            </div>
          </div>
          <p style={{ color: 'var(--text2)', marginBottom: 28 }}>
            {room.p1Score === room.p2Score ? "It's a tie! 🤝" : room.p1Score > room.p2Score ? `${p1Name} wins! 🏆` : `${p2Name} wins! 🏆`}
          </p>
          <Btn onClick={restart}>Play Again 🍿</Btn>
        </div>
      </PageWrap>
    )
  }

  const movie = movies[room.idx]
  const myGuess = myRole === 'p1' ? room.p1Guess : room.p2Guess
  const theirGuess = myRole === 'p1' ? room.p2Guess : room.p1Guess
  const myScore = myRole === 'p1' ? room.p1Score : room.p2Score
  const theirScore = myRole === 'p1' ? room.p2Score : room.p1Score
  const theirName = myRole === 'p1' ? p2Name : p1Name

  return (
    <PageWrap onBack={onBack}>
      <div style={{ paddingTop: 16 }}>
        <ScoreBar current={room.idx + 1} total={movies.length} score={myScore} />
        <Badge color="var(--coral)">Guess the Movie 🎬</Badge>

        {/* Scores */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '12px 0' }}>
          <span style={{ padding: '5px 14px', borderRadius: 50, fontSize: '0.78rem', fontWeight: 800, background: 'rgba(232,121,160,0.1)', color: 'var(--pink)', border: '1px solid rgba(232,121,160,0.2)' }}>
            {p1Name}: {room.p1Score} pts {room.p1Guess ? '✓' : '⏳'}
          </span>
          <span style={{ padding: '5px 14px', borderRadius: 50, fontSize: '0.78rem', fontWeight: 800, background: 'rgba(167,139,250,0.1)', color: 'var(--purple)', border: '1px solid rgba(167,139,250,0.2)' }}>
            {p2Name}: {room.p2Score} pts {room.p2Guess ? '✓' : '⏳'}
          </span>
        </div>

        <Card style={{ marginTop: 16, textAlign: 'center' }}>
          <p style={{ fontSize: 'clamp(2.5rem,8vw,4rem)', letterSpacing: 8, margin: '8px 0 20px', lineHeight: 1.5 }}>{movie.emojis}</p>

          {hints > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
              {movie.hints.slice(0, hints).map((h: string, i: number) => (
                <span key={i} style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', color: 'var(--amber)', padding: '4px 14px', borderRadius: 50, fontSize: '0.8rem', fontWeight: 700 }}>
                  💡 {h}
                </span>
              ))}
            </div>
          )}

          {!room.revealed ? (
            <>
              {!submitted ? (
                <>
                  <input value={guess} onChange={e => setGuess(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && guess.trim() && submit()}
                    placeholder="Type the movie name..." style={{ textAlign: 'center', marginBottom: 16, maxWidth: 300 }} />
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Btn onClick={submit} disabled={!guess.trim()}>Submit ✓</Btn>
                    {hints < 3 && (
                      <button onClick={() => setHints(h => h + 1)} style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 50, padding: '10px 20px', color: 'var(--amber)', fontWeight: 800, cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'Nunito,sans-serif' }}>
                        Hint 💡
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: 'var(--text2)', fontSize: '0.9rem', marginBottom: 8 }}>Your guess: <strong>{myGuess}</strong></p>
                  <p style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>⏳ Waiting for {theirName}...</p>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 8 }}>
                    {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--purple)', animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ animation: 'popIn 0.4s both' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                <div style={{ background: room.p1Correct ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.08)', borderRadius: 'var(--radius)', padding: '10px 14px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text3)', fontWeight: 700 }}>{p1Name}</span>
                  <p style={{ fontWeight: 800, color: room.p1Correct ? 'var(--teal)' : 'var(--coral)', marginTop: 2 }}>
                    {room.p1Guess} {room.p1Correct ? '✓' : '✗'}
                  </p>
                </div>
                <div style={{ background: room.p2Correct ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.08)', borderRadius: 'var(--radius)', padding: '10px 14px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text3)', fontWeight: 700 }}>{p2Name}</span>
                  <p style={{ fontWeight: 800, color: room.p2Correct ? 'var(--teal)' : 'var(--coral)', marginTop: 2 }}>
                    {room.p2Guess} {room.p2Correct ? '✓' : '✗'}
                  </p>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text3)' }}>Answer: <strong style={{ color: 'var(--text)' }}>{movie.answer}</strong></p>
              </div>
              {myRole === 'p1' ? (
                <Btn onClick={next}>{room.idx + 1 >= movies.length ? 'See Results 🏆' : 'Next Movie →'}</Btn>
              ) : (
                <p style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>⏳ Waiting for {p1Name} to continue...</p>
              )}
            </div>
          )}
        </Card>
      </div>
    </PageWrap>
  )
}