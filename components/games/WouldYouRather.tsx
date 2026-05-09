'use client'
import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { doc, setDoc, onSnapshot, deleteDoc } from 'firebase/firestore'
import { PageWrap, Card, Btn, ScoreBar, Badge, Spinner } from '@/components/ui'
import type { Session } from '@/lib/session'

interface WYR { optionA: string; optionB: string }

interface RoundState {
  idx: number
  p1Pick: 'A' | 'B' | null
  p2Pick: 'A' | 'B' | null
  revealed: boolean
}

const fallback: WYR[] = [
  { optionA: 'Always hold hands in public 🤝', optionB: 'Always have matching outfits 👫' },
  { optionA: 'Live in a treehouse 🌳', optionB: 'Live on a houseboat ⛵' },
  { optionA: 'Only communicate through love letters 💌', optionB: 'Only communicate through songs 🎵' },
  { optionA: 'Have a pet dragon 🐉', optionB: 'Have a pet unicorn 🦄' },
  { optionA: 'Relive your first date forever 💕', optionB: 'Fast forward to growing old together 👴👵' },
]

export default function WouldYouRather({ session, onBack }: { session: Session; onBack: () => void }) {
  const questions: WYR[] = (session.questions['wyr'] ?? []).length > 0 ? session.questions['wyr'] : fallback

  // Which player am I? First person to open picks p1, second is p2
  const [myRole, setMyRole] = useState<'p1' | 'p2' | null>(null)
  const [round, setRound] = useState<RoundState>({ idx: 0, p1Pick: null, p2Pick: null, revealed: false })
  const [history, setHistory] = useState<{ same: boolean; p1: string; p2: string; q: WYR }[]>([])
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(true)

  const roomRef = doc(db, 'wyr_rooms', session.id)

  // ── On mount: join the room, claim p1 or p2 ──
  useEffect(() => {
    const join = async () => {
      const snap = await import('firebase/firestore').then(m => m.getDoc(roomRef))
      if (!snap.exists()) {
        // First person in — create room as p1
        await setDoc(roomRef, { idx: 0, p1Pick: null, p2Pick: null, revealed: false, p1Joined: true, p2Joined: false })
        setMyRole('p1')
      } else {
        const data = snap.data()
        if (!data.p2Joined) {
          // Second person — join as p2
          await setDoc(roomRef, { ...data, p2Joined: true }, { merge: true })
          setMyRole('p2')
        } else {
          // Room full — rejoin as p1 (same device reconnect)
          setMyRole('p1')
        }
      }
      setLoading(false)
    }
    join()
  }, [])

  // ── Listen to real-time room updates ──
  useEffect(() => {
    const unsub = onSnapshot(roomRef, (snap) => {
      if (!snap.exists()) return
      const data = snap.data() as RoundState
      setRound(data)
    })
    return () => unsub()
  }, [])

  // ── Pick an option ──
  const pick = async (choice: 'A' | 'B') => {
    if (!myRole) return
    const myPick = myRole === 'p1' ? 'p1Pick' : 'p2Pick'
    const current = (await import('firebase/firestore').then(m => m.getDoc(roomRef))).data() as RoundState
    if (current[myPick] !== null) return // already picked

    const updated = { ...current, [myPick]: choice }

    // If both picked, reveal
    const otherPick = myRole === 'p1' ? updated.p2Pick : updated.p1Pick
    if (otherPick !== null) {
      updated.revealed = true
    }

    await setDoc(roomRef, updated, { merge: true })
  }

  // ── Next question ──
  const next = async () => {
    const nextIdx = round.idx + 1
    if (nextIdx >= questions.length) {
      setDone(true)
      await deleteDoc(roomRef)
      return
    }
    // Add to history
    const q = questions[round.idx]
    setHistory(h => [...h, {
      same: round.p1Pick === round.p2Pick,
      p1: round.p1Pick === 'A' ? q.optionA : q.optionB,
      p2: round.p2Pick === 'A' ? q.optionA : q.optionB,
      q,
    }])
    await setDoc(roomRef, { idx: nextIdx, p1Pick: null, p2Pick: null, revealed: false }, { merge: true })
  }

  const restart = async () => {
    setDone(false)
    setHistory([])
    await setDoc(roomRef, { idx: 0, p1Pick: null, p2Pick: null, revealed: false, p1Joined: true, p2Joined: false })
  }

  if (loading) return (
    <PageWrap onBack={onBack}>
      <div style={{ textAlign: 'center', paddingTop: 80 }}>
        <Spinner />
        <p style={{ color: 'var(--text2)', marginTop: 16, fontSize: '0.9rem' }}>Joining game room...</p>
      </div>
    </PageWrap>
  )

  if (done) {
    const matches = history.filter(h => h.same).length
    return (
      <PageWrap onBack={onBack}>
        <div style={{ textAlign: 'center', paddingTop: 40 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>💑</div>
          <h2 className="caveat" style={{ fontSize: '2.4rem', marginBottom: 8 }}>Final Results!</h2>
          <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--pink)', marginBottom: 8 }}>{matches}/{history.length}</div>
          <p style={{ color: 'var(--text2)', marginBottom: 32 }}>
            {matches >= Math.ceil(history.length * 0.8) ? 'Soulmates confirmed! 😍' : matches >= Math.ceil(history.length * 0.5) ? 'Great minds think alike! 💕' : 'Opposites attract! 🧲'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32, textAlign: 'left' }}>
            {history.map((h, i) => (
              <div key={i} style={{
                background: h.same ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.08)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 16px',
              }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text3)', marginBottom: 6 }}>{h.q.optionA} vs {h.q.optionB}</p>
                <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                  {session.creatorName}: <span style={{ color: 'var(--pink)' }}>{h.p1}</span>
                  {h.same ? ' = ✅ ' : ' ≠ '}
                  {session.partnerName}: <span style={{ color: 'var(--purple)' }}>{h.p2}</span>
                </p>
              </div>
            ))}
          </div>
          <Btn onClick={restart}>Play Again 💕</Btn>
        </div>
      </PageWrap>
    )
  }

  const q = questions[round.idx]
  const myPick = myRole === 'p1' ? round.p1Pick : round.p2Pick
  const theirPick = myRole === 'p1' ? round.p2Pick : round.p1Pick
  const myName = myRole === 'p1' ? session.creatorName : session.partnerName
  const theirName = myRole === 'p1' ? session.partnerName : session.creatorName
  const p1Name = session.creatorName
  const p2Name = session.partnerName

  return (
    <PageWrap onBack={onBack}>
      <div style={{ paddingTop: 16 }}>
        <ScoreBar current={round.idx + 1} total={questions.length} />
        <Badge color="var(--purple)">Would You Rather 🤔</Badge>

        {/* Status bar */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '16px 0', flexWrap: 'wrap' }}>
          <span style={{
            padding: '6px 14px', borderRadius: 50, fontSize: '0.8rem', fontWeight: 800,
            background: round.p1Pick ? 'rgba(52,211,153,0.15)' : 'rgba(232,121,160,0.1)',
            color: round.p1Pick ? 'var(--teal)' : 'var(--pink)',
            border: `1px solid ${round.p1Pick ? 'rgba(52,211,153,0.3)' : 'rgba(232,121,160,0.2)'}`,
          }}>
            {round.p1Pick ? `✓ ${p1Name} picked` : `⏳ ${p1Name} choosing...`}
          </span>
          <span style={{
            padding: '6px 14px', borderRadius: 50, fontSize: '0.8rem', fontWeight: 800,
            background: round.p2Pick ? 'rgba(52,211,153,0.15)' : 'rgba(167,139,250,0.1)',
            color: round.p2Pick ? 'var(--teal)' : 'var(--purple)',
            border: `1px solid ${round.p2Pick ? 'rgba(52,211,153,0.3)' : 'rgba(167,139,250,0.2)'}`,
          }}>
            {round.p2Pick ? `✓ ${p2Name} picked` : `⏳ ${p2Name} choosing...`}
          </span>
        </div>

        <h3 className="caveat" style={{ textAlign: 'center', fontSize: '2rem', margin: '16px 0 24px' }}>
          Would you rather...
        </h3>

        {/* Options */}
        {!round.revealed ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {(['A', 'B'] as const).map(letter => {
              const opt = letter === 'A' ? q.optionA : q.optionB
              const isMyPick = myPick === letter
              const alreadyPicked = myPick !== null
              return (
                <button
                  key={letter}
                  onClick={() => !alreadyPicked && pick(letter)}
                  style={{
                    background: isMyPick
                      ? `rgba(${letter === 'A' ? '232,121,160' : '167,139,250'},0.25)`
                      : `rgba(${letter === 'A' ? '232,121,160' : '167,139,250'},0.08)`,
                    border: isMyPick
                      ? `2px solid ${letter === 'A' ? 'var(--pink)' : 'var(--purple)'}`
                      : `1.5px solid rgba(${letter === 'A' ? '232,121,160' : '167,139,250'},0.25)`,
                    borderRadius: 'var(--radius-lg)', padding: '22px 20px',
                    cursor: alreadyPicked ? 'default' : 'pointer',
                    color: 'var(--text)', fontWeight: 700, fontSize: '1rem', lineHeight: 1.5,
                    textAlign: 'center', transition: 'all 0.3s',
                    transform: isMyPick ? 'scale(1.02)' : 'scale(1)',
                    opacity: alreadyPicked && !isMyPick ? 0.5 : 1,
                    position: 'relative',
                  }}
                >
                  {opt}
                  {isMyPick && (
                    <span style={{
                      position: 'absolute', top: 10, right: 14,
                      fontSize: '0.75rem', fontWeight: 800,
                      color: letter === 'A' ? 'var(--pink)' : 'var(--purple)',
                    }}>
                      ✓ Your pick
                    </span>
                  )}
                </button>
              )
            })}

            {/* Waiting message */}
            {myPick && !round.revealed && (
              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <p style={{ color: 'var(--text2)', fontSize: '0.9rem', fontWeight: 600 }}>
                  ⏳ Waiting for {theirName} to pick...
                </p>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 8 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 8, height: 8, borderRadius: '50%', background: 'var(--purple)',
                      animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Reveal */
          <Card style={{ animation: 'popIn 0.4s both', textAlign: 'center' }}>
            <p style={{ fontWeight: 800, fontSize: '1.3rem', color: round.p1Pick === round.p2Pick ? 'var(--teal)' : 'var(--coral)', marginBottom: 20 }}>
              {round.p1Pick === round.p2Pick ? '🥰 You both picked the same!' : '😂 Different answers!'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              <div style={{ background: 'rgba(232,121,160,0.1)', borderRadius: 'var(--radius)', padding: '12px 16px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text3)', fontWeight: 700 }}>{p1Name}</span>
                <p style={{ fontWeight: 800, color: 'var(--pink)', marginTop: 4 }}>
                  {round.p1Pick === 'A' ? q.optionA : q.optionB}
                </p>
              </div>
              <div style={{ background: 'rgba(167,139,250,0.1)', borderRadius: 'var(--radius)', padding: '12px 16px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text3)', fontWeight: 700 }}>{p2Name}</span>
                <p style={{ fontWeight: 800, color: 'var(--purple)', marginTop: 4 }}>
                  {round.p2Pick === 'A' ? q.optionA : q.optionB}
                </p>
              </div>
            </div>
            {/* Only p1 can advance to next question */}
            {myRole === 'p1' ? (
              <Btn onClick={next}>{round.idx + 1 >= questions.length ? 'See Results 🏆' : 'Next Question →'}</Btn>
            ) : (
              <p style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>⏳ Waiting for {p1Name} to continue...</p>
            )}
          </Card>
        )}
      </div>
    </PageWrap>
  )
}