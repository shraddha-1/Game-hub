'use client'
import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore'
import { PageWrap, Spinner } from '@/components/ui'
import type { Session } from '@/lib/session'

interface CQ { question: string; options: string[] }
interface RoomState { p1Answers: number[]; p2Answers: number[]; currentQ: number; phase: 'playing'|'results' }

const fallback: CQ[] = [
  { question:"Ideal Saturday night date?", options:['Netflix & snacks 🍿','Fancy dinner 🍷','Game night 🎮','Stargazing 🌌'] },
  { question:'Love language?', options:['Words 💬','Touch 🤗','Gifts 🎁','Quality Time ⏰'] },
  { question:'Dream home?', options:['City penthouse 🏙️','Beach house 🏖️','Mountain cabin 🏔️','Countryside cottage 🌻'] },
  { question:"What's most important in a relationship?", options:['Trust 🤝','Humor 😂','Adventure 🗺️','Communication 💬'] },
  { question:'Ideal vacation?', options:['Resort & relax 🏨','Backpacking 🎒','City culture 🏛️','Staycation 🏡'] },
  { question:'How do you handle disagreements?', options:['Talk right away 🗣️','Take space first 🚶','Write it down 📝','Hug it out 🤗'] },
  { question:'Your ideal morning?', options:['Sleep in late 😴','Early workout 🏃','Slow coffee & music ☕','Brunch with people 🥞'] },
  { question:'Pick a superpower for your relationship!', options:['Teleportation 🌀','Mind reading 🧠','Time travel ⏳','Freeze time ❄️'] },
  { question:'How do you show love?', options:['Cook for them 🍳','Long hugs 🤗','Surprise gifts 🎁','Quality time together ⏰'] },
  { question:'Biggest green flag?', options:['Makes me laugh 😂','Always honest 🤝','Super ambitious 🚀','Remembers small things 💌'] },
]

const optEmojiBg = ['rgba(232,121,160,0.15)','rgba(167,139,250,0.15)','rgba(52,211,153,0.15)','rgba(251,191,36,0.15)']
const optEmojiColor = ['var(--pink)','var(--purple)','var(--teal)','var(--amber)']
const optBorder = ['rgba(232,121,160,0.4)','rgba(167,139,250,0.4)','rgba(52,211,153,0.4)','rgba(251,191,36,0.4)']

export default function CompatQuiz({ session, onBack }: { session: Session; onBack: () => void }) {
  // Use session questions if we have enough, otherwise pad with fallback
  const sessionQ: CQ[] = session.questions?.['compat'] ?? []
  const questions: CQ[] = sessionQ.length >= 10
    ? sessionQ
    : [...sessionQ, ...fallback.filter(f => !sessionQ.some(s => s.question === f.question))].slice(0, 10)

  const [myRole, setMyRole]     = useState<'p1'|'p2'|null>(null)
  const [myAnswers, setMyAnswers]= useState<number[]>([])
  const [room, setRoom]         = useState<RoomState>({ p1Answers:[], p2Answers:[], currentQ:0, phase:'playing' })
  const [chosen, setChosen]     = useState<number|null>(null)
  const [loading, setLoading]   = useState(true)
  const [waiting, setWaiting]   = useState(false)

  const roomRef = doc(db, 'compat_rooms', session.id)

  useEffect(() => {
    const init = async () => {
      const stored = sessionStorage.getItem(`compat_role_${session.id}`)
      if (stored) { setMyRole(stored as 'p1'|'p2'); setLoading(false); return }
      const snap = await getDoc(roomRef)
      if (!snap.exists() || !snap.data().p1Joined) {
        await setDoc(roomRef, { p1Answers:[], p2Answers:[], currentQ:0, phase:'playing', p1Joined:true, p2Joined:false })
        sessionStorage.setItem(`compat_role_${session.id}`, 'p1')
        setMyRole('p1')
      } else {
        await setDoc(roomRef, { p2Joined:true }, { merge:true })
        sessionStorage.setItem(`compat_role_${session.id}`, 'p2')
        setMyRole('p2')
      }
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    const unsub = onSnapshot(roomRef, snap => {
      if (snap.exists()) setRoom(snap.data() as RoomState)
    })
    return () => unsub()
  }, [])

  const pick = async (oi: number) => {
    if (chosen !== null || waiting) return
    setChosen(oi)
    const newAnswers = [...myAnswers, oi]
    setMyAnswers(newAnswers)
    const snap = await getDoc(roomRef)
    const cur = snap.data() as RoomState
    const update: any = { [myRole==='p1'?'p1Answers':'p2Answers']: newAnswers }
    const otherAnswers = myRole==='p1' ? cur.p2Answers : cur.p1Answers
    const bothAnsweredThis = otherAnswers.length >= newAnswers.length
    if (newAnswers.length >= questions.length && bothAnsweredThis) update.phase = 'results'
    else if (bothAnsweredThis) update.currentQ = newAnswers.length
    await setDoc(roomRef, update, { merge:true })
    setTimeout(() => {
      setChosen(null)
      if (newAnswers.length < questions.length) setWaiting(otherAnswers.length < newAnswers.length)
    }, 400)
  }

  useEffect(() => {
    const otherAnswers = myRole==='p1' ? room.p2Answers : room.p1Answers
    if (otherAnswers.length >= myAnswers.length) setWaiting(false)
  }, [room, myRole, myAnswers])

  const restart = async () => {
    sessionStorage.removeItem(`compat_role_${session.id}`)
    setMyAnswers([]); setChosen(null); setWaiting(false)
    await setDoc(roomRef, { p1Answers:[], p2Answers:[], currentQ:0, phase:'playing', p1Joined:true, p2Joined:false })
  }

  if (loading) return <PageWrap onBack={onBack}><div style={{textAlign:'center',paddingTop:80}}><Spinner /></div></PageWrap>

  // Results
  if (room.phase==='results' && room.p1Answers.length>=questions.length && room.p2Answers.length>=questions.length) {
    const matches = room.p1Answers.filter((a,i) => a===room.p2Answers[i]).length
    const pct = Math.round((matches/questions.length)*100)
    const circumference = 2*Math.PI*54
    const offset = circumference - (pct/100)*circumference

    return (
      <div style={{ minHeight:'100vh', background:'var(--bg)', padding:'60px 20px 40px', maxWidth:480, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:36 }}>
          {/* Animated ring */}
          <svg width="140" height="140" viewBox="0 0 140 140" style={{ display:'block', margin:'0 auto 20px', filter:'drop-shadow(0 0 20px rgba(232,121,160,0.3))' }}>
            <circle cx="70" cy="70" r="54" fill="none" stroke="var(--bg3)" strokeWidth="12" />
            <circle cx="70" cy="70" r="54" fill="none" stroke="url(#g)" strokeWidth="12" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset}
              transform="rotate(-90 70 70)" style={{ transition:'stroke-dashoffset 1.2s cubic-bezier(.34,1.56,.64,1)' }} />
            <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e879a0"/><stop offset="100%" stopColor="#a78bfa"/>
            </linearGradient></defs>
            <text x="70" y="65" textAnchor="middle" fill="var(--text)" fontFamily="Nunito,sans-serif" fontWeight="900" fontSize="26">{pct}%</text>
            <text x="70" y="83" textAnchor="middle" fill="var(--text2)" fontFamily="Nunito,sans-serif" fontWeight="700" fontSize="11">compatible</text>
          </svg>

          <h2 className="caveat" style={{ fontSize:'2.6rem', marginBottom:6 }}>
            {pct>=80?'Made for each other! 😍':pct>=50?'Beautiful balance! 💕':'Opposites attract! 🧲'}
          </h2>
          <p style={{ color:'var(--text2)', fontSize:'0.9rem', marginBottom:32 }}>{matches} out of {questions.length} same answers</p>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:32 }}>
          {questions.map((q,i) => {
            const match = room.p1Answers[i]===room.p2Answers[i]
            return (
              <div key={i} style={{ background:match?'rgba(52,211,153,0.08)':'var(--bg3)', border:`1px solid ${match?'rgba(52,211,153,0.25)':'var(--border)'}`, borderRadius:16, padding:'14px 16px' }}>
                <p style={{ fontSize:'0.75rem', color:'var(--text3)', marginBottom:8, fontWeight:700 }}>{q.question}</p>
                <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                  <span style={{ padding:'4px 12px', borderRadius:50, fontSize:'0.8rem', fontWeight:800, background:'rgba(232,121,160,0.12)', color:'var(--pink)' }}>{session.creatorName}: {q.options[room.p1Answers[i]]}</span>
                  <span style={{ color:match?'var(--teal)':'var(--text3)', fontWeight:800 }}>{match?'✅':'≠'}</span>
                  <span style={{ padding:'4px 12px', borderRadius:50, fontSize:'0.8rem', fontWeight:800, background:'rgba(167,139,250,0.12)', color:'var(--purple)' }}>{session.partnerName}: {q.options[room.p2Answers[i]]}</span>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:10, alignItems:'center' }}>
          <button onClick={restart} style={{ padding:'16px 40px', borderRadius:50, background:'linear-gradient(135deg,#e879a0,#a78bfa)', border:'none', color:'#fff', fontFamily:'Nunito,sans-serif', fontWeight:900, fontSize:'1rem', cursor:'pointer', boxShadow:'0 4px 24px rgba(232,121,160,0.4)' }}>Play Again 💕</button>
          <button onClick={onBack} style={{ background:'none', border:'none', color:'var(--text3)', cursor:'pointer', fontFamily:'Nunito,sans-serif', fontWeight:700, fontSize:'0.9rem' }}>← Back</button>
        </div>
      </div>
    )
  }

  // Waiting for partner to finish
  if (myAnswers.length >= questions.length) {
    const otherAnswers = myRole==='p1' ? room.p2Answers : room.p1Answers
    const otherName = myRole==='p1' ? session.partnerName : session.creatorName
    return (
      <PageWrap onBack={onBack}>
        <div style={{ textAlign:'center', paddingTop:80 }}>
          <div style={{ fontSize:56, marginBottom:16, animation:'pulse 1.5s ease-in-out infinite' }}>💕</div>
          <h3 className="caveat" style={{ fontSize:'2rem', marginBottom:8 }}>You're done!</h3>
          <p style={{ color:'var(--text2)', fontSize:'0.9rem' }}>Waiting for {otherName}... ({otherAnswers.length}/{questions.length})</p>
          <Spinner />
        </div>
      </PageWrap>
    )
  }

  const currentIdx = myAnswers.length
  const q = questions[currentIdx]
  const otherAnswers = myRole==='p1' ? room.p2Answers : room.p1Answers
  const otherName = myRole==='p1' ? session.partnerName : session.creatorName

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }}>
        <div style={{ position:'absolute', top:'-20%', left:'-10%', width:'60vw', height:'60vw', borderRadius:'50%', background:'radial-gradient(circle,rgba(232,121,160,0.07) 0%,transparent 70%)' }} />
        <div style={{ position:'absolute', bottom:'-10%', right:'-10%', width:'50vw', height:'50vw', borderRadius:'50%', background:'radial-gradient(circle,rgba(167,139,250,0.07) 0%,transparent 70%)' }} />
      </div>

      <div style={{ position:'relative', zIndex:1, maxWidth:480, margin:'0 auto', padding:'56px 20px 40px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <button onClick={onBack} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:50, width:40, height:40, color:'var(--pink)', fontSize:'1.1rem', fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>←</button>
          <h1 className="caveat" style={{ fontSize:'2rem', margin:0, background:'linear-gradient(135deg,#e879a0,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Compatibility 💕</h1>
          <span style={{ fontSize:'0.82rem', fontWeight:800, color:'var(--text3)' }}>{currentIdx+1}/{questions.length}</span>
        </div>

        {/* Dual progress */}
        <div style={{ display:'flex', gap:8, marginBottom:28 }}>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
              <span style={{ fontSize:'0.72rem', fontWeight:800, color:'var(--pink)' }}>You</span>
              <span style={{ fontSize:'0.72rem', color:'var(--text3)' }}>{myAnswers.length}/{questions.length}</span>
            </div>
            <div style={{ height:6, background:'var(--bg3)', borderRadius:6, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${(myAnswers.length/questions.length)*100}%`, background:'linear-gradient(90deg,#e879a0,#f97316)', borderRadius:6, transition:'width 0.4s ease' }} />
            </div>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
              <span style={{ fontSize:'0.72rem', fontWeight:800, color:'var(--purple)' }}>{otherName}</span>
              <span style={{ fontSize:'0.72rem', color:'var(--text3)' }}>{otherAnswers.length}/{questions.length}</span>
            </div>
            <div style={{ height:6, background:'var(--bg3)', borderRadius:6, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${(otherAnswers.length/questions.length)*100}%`, background:'linear-gradient(90deg,#a78bfa,#38bdf8)', borderRadius:6, transition:'width 0.4s ease' }} />
            </div>
          </div>
        </div>

        {/* Question */}
        <div style={{ background:'var(--card)', borderRadius:24, padding:'24px', border:'1px solid var(--border)', marginBottom:20, textAlign:'center' }}>
          <p className="caveat" style={{ fontSize:'clamp(1.4rem,4vw,1.8rem)', color:'var(--text)', margin:0, lineHeight:1.4 }}>{q.question}</p>
        </div>

        {/* Options grid */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
          {q.options.map((opt:string, oi:number) => (
            <button key={oi} onClick={() => pick(oi)} style={{
              background: chosen===oi ? optEmojiBg[oi].replace('0.15','0.35') : optEmojiBg[oi],
              border:`2px solid ${chosen===oi ? optEmojiColor[oi] : optBorder[oi]}`,
              borderRadius:20, padding:'20px 12px',
              cursor: chosen!==null||waiting ? 'default' : 'pointer',
              color:'var(--text)', fontWeight:700, fontSize:'0.88rem',
              textAlign:'center', lineHeight:1.4,
              transition:'all 0.25s cubic-bezier(.34,1.56,.64,1)',
              transform: chosen===oi ? 'scale(1.05)' : 'scale(1)',
              fontFamily:'Nunito,sans-serif',
              boxShadow: chosen===oi ? `0 4px 20px ${optBorder[oi]}` : 'none',
              opacity: waiting ? 0.7 : 1,
            }}>
              {opt}
            </button>
          ))}
        </div>

        {waiting && (
          <div style={{ textAlign:'center', padding:'12px', background:'rgba(255,255,255,0.03)', borderRadius:14, border:'1px dashed var(--border)' }}>
            <div style={{ display:'flex', gap:6, justifyContent:'center', alignItems:'center' }}>
              {[0,1,2].map(i=><div key={i} style={{ width:8,height:8,borderRadius:'50%',background:'var(--purple)',animation:`pulse 1.2s ease-in-out ${i*0.25}s infinite` }}/>)}
              <span style={{ color:'var(--text3)', fontSize:'0.85rem', marginLeft:8 }}>Waiting for {otherName}...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}