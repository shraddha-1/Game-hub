'use client'
import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { doc, setDoc, onSnapshot } from 'firebase/firestore'
import { PageWrap, Card, Btn, Badge, Spinner } from '@/components/ui'
import type { Session } from '@/lib/session'

interface RoomState { mode: 'truth'|'dare'|null; current: string|null; picker: string|null }

const fallbackTruths = [
  "What's your favorite memory of us? 💭",
  "When did you first realize you liked me? 💕",
  "What's one thing you've never told me? 🤫",
  "What do you love most about our relationship? 💗",
  "If we could go anywhere right now, where? ✈️",
]
const fallbackDares = [
  "Send me the last photo in your gallery 📸",
  "Do your best impression of me 🎭",
  "Write a 4-line poem about me right now ✍️",
  "Send me your favorite meme 😂",
  "Describe me using only food 🍕",
]

export default function TruthOrDare({ session, onBack }: { session: Session; onBack: () => void }) {
  const truths = (session.questions['truth'] ?? []).length > 0 ? session.questions['truth'] : fallbackTruths
  const dares  = (session.questions['dare']  ?? []).length > 0 ? session.questions['dare']  : fallbackDares

  const [myName, setMyName] = useState('')
  const [room, setRoom]     = useState<RoomState>({ mode: null, current: null, picker: null })
  const [usedT, setUsedT]   = useState<number[]>([])
  const [usedD, setUsedD]   = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  const roomRef = doc(db, 'tod_rooms', session.id)

  useEffect(() => {
    // Assign name based on join order
    const stored = sessionStorage.getItem(`tod_name_${session.id}`)
    if (stored) { setMyName(stored); setLoading(false); return }
    const snap$ = import('firebase/firestore').then(m => m.getDoc(roomRef)).then(snap => {
      let name = session.creatorName
      if (snap.exists() && snap.data().p1Name) name = session.partnerName
      sessionStorage.setItem(`tod_name_${session.id}`, name)
      setMyName(name)
      setDoc(roomRef, { mode: null, current: null, picker: null, p1Name: session.creatorName }, { merge: true })
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    const unsub = onSnapshot(roomRef, snap => {
      if (snap.exists()) setRoom(snap.data() as RoomState)
    })
    return () => unsub()
  }, [])

  const pick = async (type: 'truth'|'dare') => {
    const pool = type === 'truth' ? truths : dares
    const used = type === 'truth' ? usedT : usedD
    const avail = pool.map((_: any, i: number) => i).filter((i: number) => !used.includes(i))
    const src = avail.length > 0 ? avail : pool.map((_: any, i: number) => i)
    const idx = src[Math.floor(Math.random() * src.length)]
    if (type === 'truth') setUsedT(u => [...u, idx])
    else setUsedD(u => [...u, idx])
    await setDoc(roomRef, { mode: type, current: pool[idx], picker: myName }, { merge: true })
  }

  const clear = async () => {
    await setDoc(roomRef, { mode: null, current: null, picker: null }, { merge: true })
  }

  if (loading) return (
    <PageWrap onBack={onBack}>
      <div style={{ textAlign: 'center', paddingTop: 80 }}><Spinner /></div>
    </PageWrap>
  )

  return (
    <PageWrap onBack={onBack}>
      <div style={{ paddingTop: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🔥</div>
        <h2 className="caveat" style={{ fontSize: '2.2rem', marginBottom: 4 }}>Truth or Dare</h2>
        <p style={{ color: 'var(--text2)', fontSize: '0.88rem', marginBottom: 8 }}>
          {session.creatorName} & {session.partnerName} 😏
        </p>

        {/* Live status */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
          <span style={{ padding: '5px 14px', borderRadius: 50, fontSize: '0.78rem', fontWeight: 800, background: 'rgba(232,121,160,0.1)', color: 'var(--pink)', border: '1px solid rgba(232,121,160,0.2)' }}>
            👤 {myName} (you)
          </span>
          <span style={{ padding: '5px 14px', borderRadius: 50, fontSize: '0.78rem', fontWeight: 800, background: 'rgba(167,139,250,0.1)', color: 'var(--purple)', border: '1px solid rgba(167,139,250,0.2)' }}>
            👤 {myName === session.creatorName ? session.partnerName : session.creatorName}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginBottom: 28 }}>
          <button onClick={() => pick('truth')} style={{ background: 'rgba(56,189,248,0.12)', border: '1.5px solid rgba(56,189,248,0.3)', borderRadius: 'var(--radius-lg)', padding: '20px 28px', cursor: 'pointer', color: 'var(--sky)', fontWeight: 800, fontSize: '1.1rem', transition: 'all 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(56,189,248,0.22)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(56,189,248,0.12)')}>
            🤔 Truth
          </button>
          <button onClick={() => pick('dare')} style={{ background: 'rgba(248,113,113,0.12)', border: '1.5px solid rgba(248,113,113,0.3)', borderRadius: 'var(--radius-lg)', padding: '20px 28px', cursor: 'pointer', color: 'var(--coral)', fontWeight: 800, fontSize: '1.1rem', transition: 'all 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.22)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.12)')}>
            😈 Dare
          </button>
        </div>

        {room.current && (
          <Card style={{ maxWidth: 400, margin: '0 auto', animation: 'popIn 0.4s both', textAlign: 'center' }}>
            {room.picker && (
              <p style={{ fontSize: '0.78rem', color: 'var(--text3)', marginBottom: 8, fontWeight: 700 }}>
                🎲 {room.picker} picked {room.mode}
              </p>
            )}
            <Badge color={room.mode === 'truth' ? 'var(--sky)' : 'var(--coral)'}>{room.mode?.toUpperCase()}</Badge>
            <p style={{ marginTop: 16, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.6 }}>
              {room.current}
            </p>
            <button onClick={clear} style={{ marginTop: 16, background: 'none', border: 'none', color: 'var(--text3)', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'Nunito,sans-serif', fontWeight: 700 }}>
              ✕ Clear
            </button>
          </Card>
        )}

        {!room.current && (
          <p style={{ color: 'var(--text3)', fontSize: '0.85rem', marginTop: 8 }}>
            ⏳ Waiting for someone to pick...
          </p>
        )}
      </div>
    </PageWrap>
  )
}