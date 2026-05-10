'use client'
import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore'
import { PageWrap, Btn, ScoreBar, Badge, Spinner } from '@/components/ui'
import type { Session } from '@/lib/session'

interface TOT { optionA: string; optionB: string }
interface RoomState {
  idx: number
  p1Picks: string[]   // full history of picks
  p2Picks: string[]
  p1Joined: boolean
}

const fallback: TOT[] = [
  { optionA: 'Morning person 🌅',  optionB: 'Night owl 🌙'         },
  { optionA: 'Beach vacation 🏖️',  optionB: 'Mountain getaway ⛰️'  },
  { optionA: 'Sweet 🍩',            optionB: 'Spicy 🌶️'             },
  { optionA: 'Road trip 🚗',        optionB: 'Plane trip ✈️'        },
  { optionA: 'Adopt a dog 🐕',      optionB: 'Adopt a cat 🐈'       },
  { optionA: 'Netflix marathon 🎬', optionB: 'Go out & explore 🗺️'  },
  { optionA: 'Texts first 📱',      optionB: 'Calls first 📞'       },
  { optionA: 'Big party 🎉',        optionB: 'Quiet dinner for two 🕯️' },
  { optionA: 'Coffee ☕',           optionB: 'Tea 🍵'               },
  { optionA: 'Window seat ✈️',      optionB: 'Aisle seat 💺'        },
  { optionA: 'Early planner 📅',    optionB: 'Spontaneous 🎲'       },
  { optionA: 'Saver 💰',            optionB: 'Spender on experiences 🎡' },
]

export default function ThisOrThat({ session, onBack }: { session: Session; onBack: () => void }) {
  const questions: TOT[] = (session.questions?.['tot'] ?? []).length > 0 ? session.questions['tot'] : fallback

  const [myRole, setMyRole]   = useState<'p1'|'p2'|null>(null)
  const [room, setRoom]       = useState<RoomState|null>(null)
  const [chosen, setChosen]   = useState<'A'|'B'|null>(null)
  const [loading, setLoading] = useState(true)
  const [done, setDone]       = useState(false)
  const roomRef = doc(db, 'tot_rooms', session.id)

  // assign role
  useEffect(() => {
    const init = async () => {
      const stored = sessionStorage.getItem(`tot_role_${session.id}`)
      if (stored) { setMyRole(stored as 'p1'|'p2'); setLoading(false); return }
      const snap = await getDoc(roomRef)
      if (!snap.exists() || !snap.data().p1Joined) {
        await setDoc(roomRef, { idx:0, p1Picks:[], p2Picks:[], p1Joined:true })
        sessionStorage.setItem(`tot_role_${session.id}`, 'p1')
        setMyRole('p1')
      } else {
        sessionStorage.setItem(`tot_role_${session.id}`, 'p2')
        setMyRole('p2')
      }
      setLoading(false)
    }
    init()
  }, [])

  // realtime
  useEffect(() => {
    const unsub = onSnapshot(roomRef, snap => {
      if (snap.exists()) setRoom(snap.data() as RoomState)
    })
    return () => unsub()
  }, [])

  // Reset chosen when a new question is synced
  const myPicks = room ? (myRole==='p1' ? room.p1Picks : room.p2Picks) : []
  const theirPicks = room ? (myRole==='p1' ? room.p2Picks : room.p1Picks) : []
  const currentIdx = myPicks.length
  const theirIdx   = theirPicks.length

  // auto-advance chosen state when my pick is confirmed
  useEffect(() => { setChosen(null) }, [currentIdx])

  const pick = async (letter: 'A'|'B') => {
    if (chosen || !myRole || !room) return
    setChosen(letter)
    const opt = letter==='A' ? questions[currentIdx].optionA : questions[currentIdx].optionB
    const newPicks = [...myPicks, opt]
    await setDoc(roomRef, {
      [myRole==='p1' ? 'p1Picks' : 'p2Picks']: newPicks,
    }, { merge: true })
  }

  const restart = async () => {
    setDone(false); setChosen(null)
    sessionStorage.removeItem(`tot_role_${session.id}`)
    await setDoc(roomRef, { idx:0, p1Picks:[], p2Picks:[], p1Joined:true })
  }

  if (loading || !room) return <PageWrap onBack={onBack}><div style={{textAlign:'center',paddingTop:80}}><Spinner /></div></PageWrap>

  const bothDone = myPicks.length >= questions.length && theirPicks.length >= questions.length
  const p1Name = session.creatorName, p2Name = session.partnerName
  const theirName = myRole==='p1' ? p2Name : p1Name

  // Summary screen
  if (bothDone || done) {
    const p1Picks = myRole==='p1' ? myPicks : theirPicks
    const p2Picks = myRole==='p2' ? myPicks : theirPicks
    const matches = questions.map((q,i) => {
      const a = p1Picks[i], b = p2Picks[i]
      return a && b && a === b
    })
    const matchCount = matches.filter(Boolean).length

    return (
      <PageWrap onBack={onBack}>
        <div style={{ paddingTop:24 }}>
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🎯</div>
            <h2 className="caveat" style={{ fontSize:'2.2rem', marginBottom:6 }}>Results!</h2>
            <p style={{ color:'var(--text2)', fontSize:'0.9rem' }}>
              You matched on <strong style={{ color:'var(--pink)' }}>{matchCount}/{questions.length}</strong> questions!
            </p>
            <p style={{ color:'var(--text3)', fontSize:'0.82rem', marginTop:4 }}>
              {matchCount >= Math.ceil(questions.length*0.8) ? 'Basically the same person 😍' : matchCount >= Math.ceil(questions.length*0.5) ? 'More alike than different! 💕' : 'Opposites really do attract! 🧲'}
            </p>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:28 }}>
            {questions.map((q, i) => {
              const p1Pick = p1Picks[i], p2Pick = p2Picks[i]
              const match = p1Pick && p2Pick && p1Pick === p2Pick
              return (
                <div key={i} style={{ background: match ? 'rgba(52,211,153,0.08)' : 'var(--bg3)', border:`1px solid ${match?'rgba(52,211,153,0.25)':'var(--border)'}`, borderRadius:'var(--radius)', padding:'12px 16px' }}>
                  <p style={{ fontSize:'0.72rem', color:'var(--text3)', marginBottom:8, fontWeight:700 }}>Q{i+1}</p>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
                    <span style={{ padding:'4px 12px', borderRadius:50, fontSize:'0.82rem', fontWeight:700, background:'rgba(232,121,160,0.12)', color:'var(--pink)', border:'1px solid rgba(232,121,160,0.2)' }}>
                      {p1Name}: {p1Pick ?? '—'}
                    </span>
                    <span style={{ color: match ? 'var(--teal)' : 'var(--text3)', fontWeight:800, fontSize:'0.9rem' }}>
                      {match ? '= ✅' : '≠'}
                    </span>
                    <span style={{ padding:'4px 12px', borderRadius:50, fontSize:'0.82rem', fontWeight:700, background:'rgba(167,139,250,0.12)', color:'var(--purple)', border:'1px solid rgba(167,139,250,0.2)' }}>
                      {p2Name}: {p2Pick ?? '—'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ textAlign:'center' }}>
            <Btn onClick={restart}>Play Again 🔄</Btn>
          </div>
        </div>
      </PageWrap>
    )
  }

  // My questions done, waiting for them
  if (myPicks.length >= questions.length) return (
    <PageWrap onBack={onBack}>
      <div style={{ textAlign:'center', paddingTop:80 }}>
        <div style={{ fontSize:48, marginBottom:16, animation:'pulse 1.5s ease-in-out infinite' }}>⏳</div>
        <h3 className="caveat" style={{ fontSize:'2rem', marginBottom:8 }}>You're done!</h3>
        <p style={{ color:'var(--text2)' }}>Waiting for {theirName}... ({theirPicks.length}/{questions.length})</p>
        <Spinner />
      </div>
    </PageWrap>
  )

  const q = questions[currentIdx]

  return (
    <PageWrap onBack={onBack}>
      <div style={{ paddingTop:16 }}>
        <ScoreBar current={currentIdx+1} total={questions.length} />
        <Badge color="var(--amber)">This or That 🎯</Badge>

        {/* Live progress */}
        <div style={{ display:'flex', gap:8, justifyContent:'center', margin:'12px 0' }}>
          <span style={{ padding:'5px 14px', borderRadius:50, fontSize:'0.78rem', fontWeight:800, background:'rgba(232,121,160,0.1)', color:'var(--pink)', border:'1px solid rgba(232,121,160,0.2)' }}>
            You: {currentIdx}/{questions.length}
          </span>
          <span style={{ padding:'5px 14px', borderRadius:50, fontSize:'0.78rem', fontWeight:800, background:'rgba(167,139,250,0.1)', color:'var(--purple)', border:'1px solid rgba(167,139,250,0.2)' }}>
            {theirName}: {theirIdx}/{questions.length}
          </span>
        </div>

        <h3 className="caveat" style={{ textAlign:'center', fontSize:'2.2rem', margin:'20px 0 24px' }}>This or That?</h3>

        {/* Their current pick (if they've answered this one already) */}
        {theirPicks[currentIdx] && (
          <div style={{ textAlign:'center', marginBottom:16, animation:'fadeUp 0.3s both' }}>
            <span style={{ display:'inline-block', padding:'6px 16px', borderRadius:50, fontSize:'0.82rem', fontWeight:800, background:'rgba(167,139,250,0.12)', color:'var(--purple)', border:'1px solid rgba(167,139,250,0.2)' }}>
              👀 {theirName} picked: {theirPicks[currentIdx]}
            </span>
          </div>
        )}

        <div style={{ display:'flex', flexDirection:'column', gap:16, maxWidth:380, margin:'0 auto' }}>
          {(['A','B'] as const).map(letter => {
            const opt = letter==='A' ? q.optionA : q.optionB
            const isChosen = chosen===letter
            const notChosen = chosen!==null && !isChosen
            const theirPick = theirPicks[currentIdx]
            const theyChoseThis = theirPick === opt

            return (
              <button key={letter} onClick={() => pick(letter)} style={{
                fontFamily:'Nunito, sans-serif',
                background: isChosen
                  ? `rgba(${letter==='A'?'251,146,60':'167,139,250'},0.25)`
                  : theyChoseThis && !chosen
                    ? `rgba(${letter==='A'?'251,146,60':'167,139,250'},0.1)`
                    : 'var(--bg3)',
                border: isChosen
                  ? `2px solid ${letter==='A'?'#fb923c':'var(--purple)'}`
                  : theyChoseThis && !chosen
                    ? `1.5px dashed ${letter==='A'?'rgba(251,146,60,0.5)':'rgba(167,139,250,0.5)'}`
                    : '1.5px solid var(--border)',
                borderRadius:'var(--radius-lg)', padding:'28px 24px',
                cursor: chosen ? 'default' : 'pointer',
                color:'var(--text)', fontWeight:800, fontSize:'1.05rem',
                textAlign:'center', transition:'all 0.3s cubic-bezier(.34,1.56,.64,1)',
                transform: isChosen?'scale(1.05)':notChosen?'scale(0.95)':'scale(1)',
                opacity: notChosen ? 0.4 : 1,
                position:'relative',
              }}>
                {opt}
                {/* Their pick indicator */}
                {theyChoseThis && !chosen && (
                  <span style={{ position:'absolute', top:8, right:12, fontSize:'0.7rem', color:'var(--purple)', fontWeight:800 }}>
                    👀 {theirName}
                  </span>
                )}
                {/* Match indicator after I pick */}
                {isChosen && theyChoseThis && (
                  <span style={{ display:'block', fontSize:'0.78rem', color:'var(--teal)', marginTop:6, fontWeight:800 }}>
                    ✅ Same as {theirName}!
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </PageWrap>
  )
}