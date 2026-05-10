'use client'
import { useState, useEffect, useRef } from 'react'
import { db } from '@/lib/firebase'
import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore'
import { PageWrap, Card, Btn, ScoreBar, Badge, Spinner } from '@/components/ui'
import type { Session } from '@/lib/session'

interface Movie { emojis: string; answer: string; hints: string[] }
interface PlayerResult { guess: string; correct: boolean; timeMs: number }
interface RoomState {
  idx: number
  roundStartAt: number
  p1: PlayerResult | null
  p2: PlayerResult | null
  revealed: boolean
  p1Score: number
  p2Score: number
  p1TimeTotal: number
  p2TimeTotal: number
  p1Joined: boolean
}

const fallback: Movie[] = [
  { emojis: '🚢❄️💑',    answer: 'Titanic',          hints: ['1997 film','Jack & Rose','Iceberg!'] },
  { emojis: '🦁👑🌍',    answer: 'The Lion King',     hints: ['Hakuna Matata','Circle of life','Disney'] },
  { emojis: '🧊👸⛄🎵',  answer: 'Frozen',            hints: ['Let it go','Sister bond','Princess'] },
  { emojis: '🐀👨‍🍳🇫🇷', answer: 'Ratatouille',       hints: ['Anyone can cook','Paris','Tiny chef'] },
  { emojis: '🤖❤️🌱🚀',  answer: 'WALL-E',            hints: ['Lonely robot','EVE','Save the earth'] },
  { emojis: '💊🕶️🔴🔵',  answer: 'The Matrix',        hints: ['Red or blue pill','Neo','Bullet time'] },
  { emojis: '🦖🏝️🧬',    answer: 'Jurassic Park',     hints: ['Life finds a way','Dinosaurs','Theme park'] },
  { emojis: '🧙‍♂️💍🌋',  answer: 'Lord of the Rings', hints: ['One ring','Middle Earth','Hobbits'] },
]

function isCorrect(guess: string, answer: string) {
  const g = guess.trim().toLowerCase(), a = answer.toLowerCase()
  return g.includes(a) || a.includes(g)
}
function fmt(ms: number) { return ms < 1000 ? `${ms}ms` : `${(ms/1000).toFixed(1)}s` }

export default function GuessMovie({ session, onBack }: { session: Session; onBack: () => void }) {
  const movies: Movie[] = (session.questions?.['movie'] ?? []).length > 0 ? session.questions['movie'] : fallback

  const [myRole, setMyRole]       = useState<'p1'|'p2'|null>(null)
  const [room, setRoom]           = useState<RoomState|null>(null)
  const [guess, setGuess]         = useState('')
  const [hints, setHints]         = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]     = useState(true)
  const [elapsed, setElapsed]     = useState(0)
  const [finalDone, setFinalDone] = useState(false)
  const timerRef  = useRef<NodeJS.Timeout|null>(null)
  const prevIdx   = useRef(-1)
  const roomRef   = doc(db, 'movie_rooms', session.id)

  // assign role
  useEffect(() => {
    const init = async () => {
      const stored = sessionStorage.getItem(`movie_role_${session.id}`)
      if (stored) { setMyRole(stored as 'p1'|'p2'); setLoading(false); return }
      const snap = await getDoc(roomRef)
      const now = Date.now()
      if (!snap.exists() || !snap.data().p1Joined) {
        await setDoc(roomRef, { idx:0, roundStartAt:now, p1:null, p2:null, revealed:false, p1Score:0, p2Score:0, p1TimeTotal:0, p2TimeTotal:0, p1Joined:true })
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

  // realtime
  useEffect(() => {
    const unsub = onSnapshot(roomRef, snap => {
      if (!snap.exists()) return
      const data = snap.data() as RoomState
      setRoom(data)
      if (data.idx !== prevIdx.current) {
        prevIdx.current = data.idx
        setSubmitted(false); setGuess(''); setHints(0); setElapsed(0)
      }
    })
    return () => unsub()
  }, [])

  // live timer
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (!room || room.revealed) return
    timerRef.current = setInterval(() => setElapsed(Date.now() - room.roundStartAt), 100)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [room?.revealed, room?.roundStartAt])

  const submit = async () => {
    if (!guess.trim() || submitted || !myRole || !room) return
    const movie = movies[room.idx]
    const timeMs = Date.now() - room.roundStartAt
    const correct = isCorrect(guess, movie.answer)
    setSubmitted(true)
    const snap = await getDoc(roomRef)
    const cur = snap.data() as RoomState
    const result: PlayerResult = { guess: guess.trim(), correct, timeMs }
    const other = myRole === 'p1' ? cur.p2 : cur.p1
    await setDoc(roomRef, {
      [myRole === 'p1' ? 'p1' : 'p2']: result,
      ...(correct && myRole==='p1' ? { p1Score: cur.p1Score+1, p1TimeTotal: cur.p1TimeTotal+timeMs } : {}),
      ...(correct && myRole==='p2' ? { p2Score: cur.p2Score+1, p2TimeTotal: cur.p2TimeTotal+timeMs } : {}),
      ...(other !== null ? { revealed: true } : {}),
    }, { merge: true })
  }

  const next = async () => {
    if (!room) return
    const nextIdx = room.idx + 1
    if (nextIdx >= movies.length) { setFinalDone(true); return }
    await setDoc(roomRef, { idx:nextIdx, roundStartAt:Date.now(), p1:null, p2:null, revealed:false }, { merge: true })
  }

  const restart = async () => {
    setFinalDone(false); setSubmitted(false); setGuess(''); setHints(0)
    sessionStorage.removeItem(`movie_role_${session.id}`)
    await setDoc(roomRef, { idx:0, roundStartAt:Date.now(), p1:null, p2:null, revealed:false, p1Score:0, p2Score:0, p1TimeTotal:0, p2TimeTotal:0, p1Joined:true })
  }

  if (loading || !room) return <PageWrap onBack={onBack}><div style={{textAlign:'center',paddingTop:80}}><Spinner /></div></PageWrap>

  const p1Name = session.creatorName, p2Name = session.partnerName
  const theirName = myRole === 'p1' ? p2Name : p1Name
  const movie = movies[room.idx]

  function roundWinner() {
    if (!room!.p1 || !room!.p2) return null
    if (room!.p1.correct && room!.p2.correct)
      return room!.p1.timeMs < room!.p2.timeMs ? p1Name : room!.p2.timeMs < room!.p1.timeMs ? p2Name : 'Tie'
    if (room!.p1.correct) return p1Name
    if (room!.p2.correct) return p2Name
    return null
  }

  function finalWinner() {
    if (room!.p1Score > room!.p2Score) return `${p1Name} wins! 🏆`
    if (room!.p2Score > room!.p1Score) return `${p2Name} wins! 🏆`
    if (room!.p1TimeTotal < room!.p2TimeTotal) return `${p1Name} wins on speed! ⚡`
    if (room!.p2TimeTotal < room!.p1TimeTotal) return `${p2Name} wins on speed! ⚡`
    return "Perfect tie! 🤝"
  }

  // Final results screen
  if (finalDone) return (
    <PageWrap onBack={onBack}>
      <div style={{ textAlign:'center', paddingTop:40 }}>
        <div style={{ fontSize:56, marginBottom:16 }}>🎬</div>
        <h2 className="caveat" style={{ fontSize:'2.4rem', marginBottom:24 }}>Final Scores!</h2>
        <div style={{ display:'flex', gap:16, justifyContent:'center', marginBottom:16 }}>
          {[{name:p1Name,score:room.p1Score,time:room.p1TimeTotal,color:'var(--pink)',bg:'rgba(232,121,160,0.1)',border:'rgba(232,121,160,0.3)'},
            {name:p2Name,score:room.p2Score,time:room.p2TimeTotal,color:'var(--purple)',bg:'rgba(167,139,250,0.1)',border:'rgba(167,139,250,0.3)'}
          ].map(p => (
            <div key={p.name} style={{ background:p.bg, borderRadius:'var(--radius-lg)', padding:'24px 28px', border:`1px solid ${p.border}`, flex:1 }}>
              <p style={{ color:'var(--text3)', fontSize:'0.8rem', marginBottom:6, fontWeight:800 }}>{p.name}</p>
              <p style={{ fontSize:'2.8rem', fontWeight:900, color:p.color, lineHeight:1 }}>{p.score}</p>
              <p style={{ fontSize:'0.72rem', color:'var(--text3)', marginTop:6 }}>correct</p>
              <p style={{ fontSize:'0.78rem', color:p.color, fontWeight:700, marginTop:4 }}>
                avg {p.score > 0 ? fmt(Math.round(p.time/p.score)) : '—'}/ans
              </p>
            </div>
          ))}
        </div>
        <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'14px 20px', marginBottom:28 }}>
          <p style={{ fontWeight:800, fontSize:'1.1rem' }}>{finalWinner()}</p>
          <p style={{ fontSize:'0.78rem', color:'var(--text3)', marginTop:4 }}>Most correct → fastest total time</p>
        </div>
        <Btn onClick={restart}>Play Again 🍿</Btn>
      </div>
    </PageWrap>
  )

  const rw = roundWinner()

  return (
    <PageWrap onBack={onBack}>
      <div style={{ paddingTop:16 }}>
        <ScoreBar current={room.idx+1} total={movies.length} />
        <Badge color="var(--coral)">Guess the Movie 🎬</Badge>

        {/* Scoreboard */}
        <div style={{ display:'flex', gap:8, justifyContent:'center', margin:'12px 0' }}>
          {[{name:p1Name,score:room.p1Score,done:!!room.p1,color:'var(--pink)',bg:'rgba(232,121,160,0.1)',border:'rgba(232,121,160,0.2)'},
            {name:p2Name,score:room.p2Score,done:!!room.p2,color:'var(--purple)',bg:'rgba(167,139,250,0.1)',border:'rgba(167,139,250,0.2)'}
          ].map(p => (
            <span key={p.name} style={{ padding:'5px 14px', borderRadius:50, fontSize:'0.78rem', fontWeight:800, background:p.bg, color:p.color, border:`1px solid ${p.border}` }}>
              {p.name}: {p.score}pts {p.done ? '✓' : '⏳'}
            </span>
          ))}
        </div>

        <Card style={{ marginTop:16, textAlign:'center' }}>
          <p style={{ fontSize:'clamp(2.5rem,8vw,4rem)', letterSpacing:8, margin:'8px 0 16px', lineHeight:1.5 }}>{movie.emojis}</p>

          {/* Live timer */}
          {!room.revealed && (
            <div style={{ marginBottom:12 }}>
              <span style={{
                display:'inline-block', padding:'4px 16px', borderRadius:50,
                background: elapsed<10000 ? 'rgba(52,211,153,0.15)' : elapsed<20000 ? 'rgba(251,191,36,0.15)' : 'rgba(248,113,113,0.15)',
                border:`1px solid ${elapsed<10000 ? 'rgba(52,211,153,0.3)' : elapsed<20000 ? 'rgba(251,191,36,0.3)' : 'rgba(248,113,113,0.3)'}`,
                color: elapsed<10000 ? 'var(--teal)' : elapsed<20000 ? 'var(--amber)' : 'var(--coral)',
                fontSize:'0.9rem', fontWeight:800,
              }}>
                ⏱ {(elapsed/1000).toFixed(1)}s
              </span>
            </div>
          )}

          {hints > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center', marginBottom:16 }}>
              {movie.hints.slice(0,hints).map((h,i) => (
                <span key={i} style={{ background:'rgba(251,191,36,0.15)', border:'1px solid rgba(251,191,36,0.3)', color:'var(--amber)', padding:'4px 14px', borderRadius:50, fontSize:'0.8rem', fontWeight:700 }}>💡 {h}</span>
              ))}
            </div>
          )}

          {!room.revealed ? (
            !submitted ? (
              <>
                <input value={guess} onChange={e => setGuess(e.target.value)}
                  onKeyDown={e => e.key==='Enter' && guess.trim() && submit()}
                  placeholder="Type the movie name..." style={{ textAlign:'center', marginBottom:16, maxWidth:300 }} />
                <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
                  <Btn onClick={submit} disabled={!guess.trim()}>Submit ✓</Btn>
                  {hints < 3 && (
                    <button onClick={() => setHints(h=>h+1)} style={{ background:'rgba(251,191,36,0.12)', border:'1px solid rgba(251,191,36,0.3)', borderRadius:50, padding:'10px 20px', color:'var(--amber)', fontWeight:800, cursor:'pointer', fontSize:'0.85rem', fontFamily:'Nunito,sans-serif' }}>
                      Hint 💡
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div style={{ textAlign:'center' }}>
                <p style={{ color:'var(--text2)', fontSize:'0.9rem', marginBottom:6 }}>
                  ✓ Submitted in <strong style={{ color:'var(--teal)' }}>{fmt(elapsed)}</strong>
                </p>
                <p style={{ color:'var(--text3)', fontSize:'0.85rem' }}>⏳ Waiting for {theirName}...</p>
                <div style={{ display:'flex', gap:6, justifyContent:'center', marginTop:10 }}>
                  {[0,1,2].map(i=><div key={i} style={{ width:8, height:8, borderRadius:'50%', background:'var(--purple)', animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite` }}/>)}
                </div>
              </div>
            )
          ) : (
            <div style={{ animation:'popIn 0.4s both' }}>
              {rw && (
                <div style={{ background:rw==='Tie'?'rgba(167,139,250,0.12)':'rgba(52,211,153,0.12)', border:`1px solid ${rw==='Tie'?'rgba(167,139,250,0.3)':'rgba(52,211,153,0.3)'}`, borderRadius:'var(--radius)', padding:'10px 16px', marginBottom:16 }}>
                  <p style={{ fontWeight:800, color:rw==='Tie'?'var(--purple)':'var(--teal)', fontSize:'1rem' }}>
                    {rw==='Tie' ? '🤝 Tie!' : `⚡ ${rw} answered faster!`}
                  </p>
                </div>
              )}

              <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:16 }}>
                {[{name:p1Name,result:room.p1},{name:p2Name,result:room.p2}].map(({name,result}) => result && (
                  <div key={name} style={{ background:result.correct?'rgba(52,211,153,0.1)':'rgba(248,113,113,0.08)', border:`1px solid ${result.correct?'rgba(52,211,153,0.25)':'rgba(248,113,113,0.2)'}`, borderRadius:'var(--radius)', padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
                    <div style={{ textAlign:'left' }}>
                      <span style={{ fontSize:'0.75rem', color:'var(--text3)', fontWeight:800 }}>{name}</span>
                      <p style={{ fontWeight:800, color:result.correct?'var(--teal)':'var(--coral)', fontSize:'0.95rem', marginTop:2 }}>
                        {result.guess} {result.correct?'✓':'✗'}
                      </p>
                    </div>
                    <span style={{ fontSize:'0.8rem', fontWeight:800, padding:'4px 12px', borderRadius:50, background:result.correct?'rgba(52,211,153,0.15)':'rgba(248,113,113,0.12)', color:result.correct?'var(--teal)':'var(--coral)', flexShrink:0 }}>
                      {fmt(result.timeMs)}
                    </span>
                  </div>
                ))}
              </div>

              <p style={{ fontSize:'0.85rem', color:'var(--text3)', marginBottom:16 }}>
                Answer: <strong style={{ color:'var(--text)' }}>{movie.answer}</strong>
              </p>

              {myRole === 'p1' ? (
                <Btn onClick={next}>{room.idx+1 >= movies.length ? 'See Final Results 🏆' : 'Next Movie →'}</Btn>
              ) : (
                <p style={{ color:'var(--text2)', fontSize:'0.85rem' }}>⏳ Waiting for {p1Name} to continue...</p>
              )}
            </div>
          )}
        </Card>
      </div>
    </PageWrap>
  )
}