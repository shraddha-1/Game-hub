'use client'
import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore'
import { PageWrap, Card, Btn, Badge, Spinner } from '@/components/ui'
import type { Session } from '@/lib/session'

interface RoomState {
  currentTurn: 'p1' | 'p2'
  mode: 'truth' | 'dare' | null
  current: string | null
  pickerName: string | null
  targetName: string | null
  p1Joined: boolean
  roundCount: number
}

const fallbackTruths = [
  "What's your favorite memory of us? 💭",
  "When did you first realize you liked me? 💕",
  "What's one thing you've never told me? 🤫",
  "What do you love most about our relationship? 💗",
  "If we could go anywhere right now, where? ✈️",
  "What song most reminds you of me? 🎵",
  "What's a habit of mine you secretly find adorable? 🥰",
  "What would you do if you saw me right now? 🏃",
  "What's your favorite inside joke we have? 😂",
  "What's the most embarrassing thing you've done for me? 😳",
]
const fallbackDares = [
  "Send me the last photo in your gallery 📸",
  "Do your best impression of me 🎭",
  "Write a 4-line poem about me right now ✍️",
  "Send me your favorite meme of all time 😂",
  "Describe me using only food items 🍕",
  "Change your profile pic to a silly selfie for 1 hour 🤳",
  "Send a voice note saying 'I miss you' in 3 different accents 🗣️",
  "Record yourself doing a little dance 💃",
  "Send me a drawing of us (stick figures OK!) 🎨",
  "Text me something you've been too shy to say 💌",
]

function getRandom(pool: string[], used: number[]) {
  const avail = pool.map((_, i) => i).filter(i => !used.includes(i))
  const src = avail.length > 0 ? avail : pool.map((_, i) => i)
  const idx = src[Math.floor(Math.random() * src.length)]
  return { text: pool[idx], idx }
}

export default function TruthOrDare({ session, onBack }: { session: Session; onBack: () => void }) {
  const truths = (session.questions?.['truth'] ?? []).length > 0 ? session.questions['truth'] : fallbackTruths
  const dares  = (session.questions?.['dare']  ?? []).length > 0 ? session.questions['dare']  : fallbackDares

  const [myRole, setMyRole]     = useState<'p1' | 'p2' | null>(null)
  const [room, setRoom]         = useState<RoomState | null>(null)
  const [loading, setLoading]   = useState(true)
  const [usedT, setUsedT]       = useState<number[]>([])
  const [usedD, setUsedD]       = useState<number[]>([])
  const [spinning, setSpinning] = useState(false)

  const roomRef = doc(db, 'tod_rooms', session.id)

  // ── Assign role ────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const stored = sessionStorage.getItem(`tod_role_${session.id}`)
      if (stored) { setMyRole(stored as 'p1' | 'p2'); setLoading(false); return }
      const snap = await getDoc(roomRef)
      if (!snap.exists() || !snap.data().p1Joined) {
        await setDoc(roomRef, {
          currentTurn: 'p1', mode: null, current: null,
          pickerName: null, targetName: null,
          p1Joined: true, roundCount: 0,
        })
        sessionStorage.setItem(`tod_role_${session.id}`, 'p1')
        setMyRole('p1')
      } else {
        sessionStorage.setItem(`tod_role_${session.id}`, 'p2')
        setMyRole('p2')
      }
      setLoading(false)
    }
    init()
  }, [])

  // ── Realtime listener ──────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(roomRef, snap => {
      if (snap.exists()) setRoom(snap.data() as RoomState)
    })
    return () => unsub()
  }, [])

  const isMyTurn = myRole !== null && room?.currentTurn === myRole

  // ── Pick truth or dare (only on your turn) ─────────────────────────────────
  const pick = async (type: 'truth' | 'dare') => {
    if (!isMyTurn || spinning || !myRole || room?.current) return
    setSpinning(true)
    setTimeout(async () => {
      const pool = type === 'truth' ? truths : dares
      const used = type === 'truth' ? usedT : usedD
      const { text, idx } = getRandom(pool, used)
      if (type === 'truth') setUsedT(u => [...u, idx])
      else setUsedD(u => [...u, idx])
      const myName = myRole === 'p1' ? session.creatorName : session.partnerName
      await setDoc(roomRef, {
        mode: type, current: text,
        pickerName: myName, targetName: myName,  // you pick for yourself
      }, { merge: true })
      setSpinning(false)
    }, 700)
  }

  // ── Target marks done → switches turn ─────────────────────────────────────
  const markDone = async () => {
    if (!room) return
    await setDoc(roomRef, {
      currentTurn: room.currentTurn === 'p1' ? 'p2' : 'p1',
      mode: null, current: null,
      pickerName: null, targetName: null,
      roundCount: (room.roundCount ?? 0) + 1,
    }, { merge: true })
  }

  if (loading || !room) return (
    <PageWrap onBack={onBack}>
      <div style={{ textAlign: 'center', paddingTop: 80 }}><Spinner /></div>
    </PageWrap>
  )

  const myName    = myRole === 'p1' ? session.creatorName : session.partnerName
  const turnName  = room.currentTurn === 'p1' ? session.creatorName : session.partnerName

  return (
    <PageWrap onBack={onBack}>
      <div style={{ paddingTop: 24, textAlign: 'center' }}>

        <div style={{ fontSize: 48, marginBottom: 8 }}>🔥</div>
        <h2 className="caveat" style={{ fontSize: '2.2rem', marginBottom: 4 }}>Truth or Dare</h2>
        <p style={{ color: 'var(--text2)', fontSize: '0.88rem', marginBottom: 20 }}>
          {session.creatorName} & {session.partnerName} 😏
        </p>

        {/* ── Turn indicator ── */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          padding: '10px 24px', borderRadius: 50, marginBottom: 24,
          background: isMyTurn ? 'rgba(232,121,160,0.12)' : 'rgba(167,139,250,0.1)',
          border: `1.5px solid ${isMyTurn ? 'rgba(232,121,160,0.35)' : 'rgba(167,139,250,0.3)'}`,
          transition: 'all 0.4s',
        }}>
          <span style={{
            width: 9, height: 9, borderRadius: '50%', display: 'inline-block', flexShrink: 0,
            background: isMyTurn ? 'var(--pink)' : 'var(--purple)',
            boxShadow: `0 0 8px ${isMyTurn ? 'var(--pink)' : 'var(--purple)'}`,
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
          <span style={{ fontWeight: 800, fontSize: '0.92rem', color: isMyTurn ? 'var(--pink)' : 'var(--purple)' }}>
            {isMyTurn ? '🎯 Your turn — Truth or Dare?' : `⏳ Waiting for ${turnName} to choose...`}
          </span>
        </div>

        {/* ── Player pills ── */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 28 }}>
          {([
            { name: session.creatorName, role: 'p1' as const },
            { name: session.partnerName, role: 'p2' as const },
          ]).map(p => {
            const isActive = room.currentTurn === p.role
            const isMe = myRole === p.role
            return (
              <div key={p.role} style={{
                padding: '8px 18px', borderRadius: 50, fontWeight: 800, fontSize: '0.82rem',
                background: isActive ? (isMe ? 'rgba(232,121,160,0.15)' : 'rgba(167,139,250,0.15)') : 'var(--bg3)',
                color: isActive ? (isMe ? 'var(--pink)' : 'var(--purple)') : 'var(--text3)',
                border: `1.5px solid ${isActive ? (isMe ? 'rgba(232,121,160,0.4)' : 'rgba(167,139,250,0.4)') : 'var(--border)'}`,
                transition: 'all 0.3s',
              }}>
                {isActive ? '🎯 ' : ''}{p.name}{isMe ? ' (you)' : ''}
              </div>
            )
          })}
        </div>

        {/* ── Buttons — only usable on your turn when no card is active ── */}
        <div style={{
          display: 'flex', gap: 14, justifyContent: 'center', marginBottom: 28,
          opacity: isMyTurn && !room.current ? 1 : 0.25,
          pointerEvents: isMyTurn && !room.current ? 'auto' : 'none',
          transition: 'opacity 0.3s',
        }}>
          <button onClick={() => pick('truth')} style={{
            background: 'rgba(56,189,248,0.12)', border: '1.5px solid rgba(56,189,248,0.3)',
            borderRadius: 'var(--radius-lg)', padding: '20px 28px', cursor: 'pointer',
            color: 'var(--sky)', fontWeight: 800, fontSize: '1.1rem', transition: 'all 0.2s',
            fontFamily: 'Nunito, sans-serif',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(56,189,248,0.22)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(56,189,248,0.12)')}>
            🤔 Truth
          </button>
          <button onClick={() => pick('dare')} style={{
            background: 'rgba(248,113,113,0.12)', border: '1.5px solid rgba(248,113,113,0.3)',
            borderRadius: 'var(--radius-lg)', padding: '20px 28px', cursor: 'pointer',
            color: 'var(--coral)', fontWeight: 800, fontSize: '1.1rem', transition: 'all 0.2s',
            fontFamily: 'Nunito, sans-serif',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.22)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.12)')}>
            😈 Dare
          </button>
        </div>

        {/* Waiting hint when not your turn */}
        {!isMyTurn && !room.current && (
          <p style={{ color: 'var(--text3)', fontSize: '0.88rem', marginBottom: 16 }}>
            Waiting for {turnName} to pick...
          </p>
        )}

        {/* Spinning */}
        {spinning && (
          <Card style={{ maxWidth: 400, margin: '0 auto', textAlign: 'center', minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: '2rem', animation: 'pulse 0.5s ease-in-out infinite' }}>🎲</div>
          </Card>
        )}

        {/* ── Active card ── */}
        {!spinning && room.current && (
          <Card style={{ maxWidth: 420, margin: '0 auto', animation: 'popIn 0.4s both', textAlign: 'center' }}>

            {/* Context line */}
            <span style={{
              display: 'inline-block', padding: '4px 14px', borderRadius: 50, marginBottom: 14,
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
              fontSize: '0.78rem', color: 'var(--text3)', fontWeight: 700,
            }}>
              {room.pickerName} chose {room.mode} 🎯
            </span>

            <Badge color={room.mode === 'truth' ? 'var(--sky)' : 'var(--coral)'}>
              {room.mode?.toUpperCase()}
            </Badge>

            <p style={{ marginTop: 18, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.7, marginBottom: 24 }}>
              {room.current}
            </p>

            {/* The OTHER person (not the one doing the task) decides when done */}
            {myName !== room.targetName ? (
              <Btn onClick={markDone}>
                ✅ Done! Next turn →
              </Btn>
            ) : (
              <p style={{ color: 'var(--text3)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                Waiting for {myRole === 'p1' ? session.partnerName : session.creatorName} to confirm...
              </p>
            )}
          </Card>
        )}

        {room.roundCount > 0 && (
          <p style={{ marginTop: 28, color: 'var(--text3)', fontSize: '0.78rem' }}>
            {room.roundCount} round{room.roundCount !== 1 ? 's' : ''} completed
          </p>
        )}

      </div>
    </PageWrap>
  )
}