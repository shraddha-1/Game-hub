'use client'
import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { doc, setDoc, onSnapshot } from 'firebase/firestore'
import { PageWrap, Btn, ScoreBar, Spinner } from '@/components/ui'
import type { Session } from '@/lib/session'

interface CQ { question: string; options: string[] }
interface RoomState { p1Answers: number[]; p2Answers: number[]; currentQ: number; phase: 'playing'|'results' }

const fallback: CQ[] = [
  { question: "Ideal Saturday night date?", options: ['Netflix & snacks 🍿','Fancy dinner 🍷','Game night 🎮','Stargazing 🌌'] },
  { question: 'Love language?', options: ['Words 💬','Touch 🤗','Gifts 🎁','Quality Time ⏰'] },
  { question: 'Dream home?', options: ['City penthouse 🏙️','Beach house 🏖️','Mountain cabin 🏔️','Countryside cottage 🌻'] },
  { question: "What's most important in a relationship?", options: ['Trust 🤝','Humor 😂','Adventure 🗺️','Communication 💬'] },
  { question: 'Ideal vacation?', options: ['Resort & relax 🏨','Backpacking 🎒','City culture 🏛️','Staycation 🏡'] },
  { question: 'How do you handle disagreements?', options: ['Talk right away 🗣️','Take space first 🚶','Write it down 📝','Hug it out 🤗'] },
]

const optColors = ['rgba(232,121,160,0.15)','rgba(167,139,250,0.15)','rgba(52,211,153,0.15)','rgba(251,191,36,0.15)']
const optBorders = ['rgba(232,121,160,0.4)','rgba(167,139,250,0.4)','rgba(52,211,153,0.4)','rgba(251,191,36,0.4)']

export default function CompatQuiz({ session, onBack }: { session: Session; onBack: () => void }) {
  const questions: CQ[] = (session.questions['compat'] ?? []).length > 0 ? session.questions['compat'] : fallback

  const [myRole, setMyRole]     = useState<'p1'|'p2'|null>(null)
  const [myAnswers, setMyAnswers] = useState<number[]>([])
  const [room, setRoom]         = useState<RoomState>({ p1Answers: [], p2Answers: [], currentQ: 0, phase: 'playing' })
  const [chosen, setChosen]     = useState<number|null>(null)
  const [loading, setLoading]   = useState(true)
  const [waiting, setWaiting]   = useState(false)

  const roomRef = doc(db, 'compat_rooms', session.id)

  useEffect(() => {
    const init = async () => {
      const { getDoc } = await import('firebase/firestore')
      const stored = sessionStorage.getItem(`compat_role_${session.id}`)
      if (stored) { setMyRole(stored as 'p1'|'p2'); setLoading(false); return }
      const snap = await getDoc(roomRef)
      if (!snap.exists() || !snap.data().p1Joined) {
        await setDoc(roomRef, { p1Answers: [], p2Answers: [], currentQ: 0, phase: 'playing', p1Joined: true, p2Joined: false })
        sessionStorage.setItem(`compat_role_${session.id}`, 'p1')
        setMyRole('p1')
      } else {
        await setDoc(roomRef, { p2Joined: true }, { merge: true })
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

    const { getDoc } = await import('firebase/firestore')
    const snap = await getDoc(roomRef)
    const current = snap.data() as RoomState

    const update: any = {
      [myRole === 'p1' ? 'p1Answers' : 'p2Answers']: newAnswers,
    }

    const otherAnswers = myRole === 'p1' ? current.p2Answers : current.p1Answers
    const bothAnsweredThis = otherAnswers.length >= newAnswers.length

    if (newAnswers.length >= questions.length && bothAnsweredThis) {
      update.phase = 'results'
    } else if (bothAnsweredThis) {
      update.currentQ = newAnswers.length
    }

    await setDoc(roomRef, update, { merge: true })

    setTimeout(() => {
      setChosen(null)
      if (newAnswers.length < questions.length) setWaiting(otherAnswers.length < newAnswers.length)
    }, 400)
  }

  // Check if waiting for partner
  useEffect(() => {
    const otherAnswers = myRole === 'p1' ? room.p2Answers : room.p1Answers
    if (otherAnswers.length >= myAnswers.length) setWaiting(false)
  }, [room, myRole, myAnswers])

  const restart = async () => {
    sessionStorage.removeItem(`compat_role_${session.id}`)
    setMyAnswers([])
    setChosen(null)
    setWaiting(false)
    await setDoc(roomRef, { p1Answers: [], p2Answers: [], currentQ: 0, phase: 'playing', p1Joined: true, p2Joined: false })
  }

  if (loading) return (
    <PageWrap onBack={onBack}><div style={{ textAlign: 'center', paddingTop: 80 }}><Spinner /></div></PageWrap>
  )

  if (room.phase === 'results' && room.p1Answers.length >= questions.length && room.p2Answers.length >= questions.length) {
    const matches = room.p1Answers.filter((a, i) => a === room.p2Answers[i]).length
    const pct = Math.round((matches / questions.length) * 100)
    const circumference = 2 * Math.PI * 52
    const offset = circumference - (pct / 100) * circumference
    return (
      <PageWrap onBack={onBack}>
        <div style={{ paddingTop: 40, textAlign: 'center' }}>
          <svg width="130" height="130" viewBox="0 0 130 130" style={{ display: 'block', margin: '0 auto 16px' }}>
            <circle cx="65" cy="65" r="52" fill="none" stroke="var(--bg3)" strokeWidth="10" />
            <circle cx="65" cy="65" r="52" fill="none" stroke="url(#grad)" strokeWidth="10" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset} transform="rotate(-90 65 65)"
              style={{ transition: 'stroke-dashoffset 1s ease' }} />
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
          <p style={{ color: 'var(--text2)', marginBottom: 28, fontSize: '0.95rem' }}>
            {pct >= 80 ? 'Made for each other! 😍' : pct >= 50 ? 'Beautiful balance! 💕' : 'Opposites attract! 🧲'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28, textAlign: 'left' }}>
            {questions.map((q, i) => (
              <div key={i} style={{ background: room.p1Answers[i] === room.p2Answers[i] ? 'rgba(52,211,153,0.1)' : 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 14px' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text3)', marginBottom: 4 }}>{q.question}</p>
                <p style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                  <span style={{ color: 'var(--pink)' }}>{session.creatorName}: {q.options[room.p1Answers[i]]}</span>
                  {room.p1Answers[i] === room.p2Answers[i] ? ' ✅ ' : ' ≠ '}
                  <span style={{ color: 'var(--purple)' }}>{session.partnerName}: {q.options[room.p2Answers[i]]}</span>
                </p>
              </div>
            ))}
          </div>
          <Btn onClick={restart}>Play Again 💕</Btn>
        </div>
      </PageWrap>
    )
  }

  // Waiting for both to finish
  if (myAnswers.length >= questions.length) {
    const otherAnswers = myRole === 'p1' ? room.p2Answers : room.p1Answers
    const otherName = myRole === 'p1' ? session.partnerName : session.creatorName
    return (
      <PageWrap onBack={onBack}>
        <div style={{ textAlign: 'center', paddingTop: 80 }}>
          <div style={{ fontSize: 48, marginBottom: 16, animation: 'pulse 1.5s ease-in-out infinite' }}>💕</div>
          <h3 className="caveat" style={{ fontSize: '2rem', marginBottom: 8 }}>You're done!</h3>
          <p style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>Waiting for {otherName} to finish... ({otherAnswers.length}/{questions.length})</p>
          <Spinner />
        </div>
      </PageWrap>
    )
  }

  const currentIdx = myAnswers.length
  const q = questions[currentIdx]
  const otherAnswers = myRole === 'p1' ? room.p2Answers : room.p1Answers
  const otherName = myRole === 'p1' ? session.partnerName : session.creatorName

  return (
    <PageWrap onBack={onBack}>
      <div style={{ paddingTop: 16 }}>
        <ScoreBar current={currentIdx + 1} total={questions.length} />

        {/* Both progress */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '12px 0' }}>
          <span style={{ padding: '5px 14px', borderRadius: 50, fontSize: '0.78rem', fontWeight: 800, background: 'rgba(232,121,160,0.1)', color: 'var(--pink)', border: '1px solid rgba(232,121,160,0.2)' }}>
            You: {myAnswers.length}/{questions.length}
          </span>
          <span style={{ padding: '5px 14px', borderRadius: 50, fontSize: '0.78rem', fontWeight: 800, background: 'rgba(167,139,250,0.1)', color: 'var(--purple)', border: '1px solid rgba(167,139,250,0.2)' }}>
            {otherName}: {otherAnswers.length}/{questions.length}
          </span>
        </div>

        <h3 className="caveat" style={{ textAlign: 'center', fontSize: '1.8rem', margin: '20px 0 24px' }}>{q.question}</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {q.options.map((opt: string, oi: number) => (
            <button key={oi} onClick={() => pick(oi)} style={{
              background: chosen === oi ? optColors[oi].replace('0.15','0.35') : optColors[oi],
              border: `1.5px solid ${optBorders[oi]}`,
              borderRadius: 'var(--radius)', padding: '18px 12px',
              cursor: chosen !== null || waiting ? 'default' : 'pointer',
              color: 'var(--text)', fontWeight: 700, fontSize: '0.9rem',
              textAlign: 'center', lineHeight: 1.4, transition: 'all 0.2s',
              transform: chosen === oi ? 'scale(1.05)' : 'scale(1)',
              fontFamily: 'Nunito, sans-serif',
              opacity: waiting ? 0.6 : 1,
            }}>
              {opt}
            </button>
          ))}
        </div>

        {waiting && (
          <p style={{ textAlign: 'center', color: 'var(--text3)', fontSize: '0.85rem', marginTop: 16 }}>
            ⏳ Waiting for {otherName} to answer this one...
          </p>
        )}
      </div>
    </PageWrap>
  )
}