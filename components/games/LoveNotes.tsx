'use client'
import { useState } from 'react'
import { PageWrap, Card, Btn } from '@/components/ui'
import type { Session } from '@/lib/session'

const fallbackNotes = [
  "I fall in love with you a little more every single day 💕",
  "You're my favorite notification 📱❤️",
  "Distance means nothing when someone means everything 🌍💗",
  "You make me smile even from miles away 😊",
  "My heart is wherever you are 💌",
  "Thinking of you is my favorite hobby 💭",
  "You're worth every mile 🛤️",
  "Can't wait for the day I don't have to say goodbye 🤞",
  "Our story is my favorite one 📖",
  "You're the best part of my day ☀️",
  "I love you more than yesterday, less than tomorrow 💫",
  "Sending virtual hugs that I wish were real 🤗",
  "You + Me = Better than WiFi 📶",
  "Missing you is my cardio 😅❤️",
]

export default function LoveNotes({ session, onBack }: { session: Session; onBack: () => void }) {
  const notes: string[] = (session.questions['love'] ?? []).length > 0 ? session.questions['love'] : fallbackNotes
  const [note, setNote]   = useState<string|null>(null)
  const [anim, setAnim]   = useState(false)
  const [copied, setCopied] = useState(false)

  const generate = () => {
    setAnim(true)
    setCopied(false)
    setTimeout(() => {
      setNote(notes[Math.floor(Math.random() * notes.length)])
      setAnim(false)
    }, 500)
  }

  const copy = () => {
    if (note) { navigator.clipboard.writeText(note); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  }

  return (
    <PageWrap onBack={onBack}>
      <div style={{ paddingTop: 60, textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>💌</div>
        <h2 className="caveat" style={{ fontSize: '2.2rem', marginBottom: 4 }}>Love Notes</h2>
        <p style={{ color: 'var(--text2)', fontSize: '0.88rem', marginBottom: 36 }}>
          For {session.creatorName} & {session.partnerName} 💕
        </p>

        <Card style={{
          maxWidth: 400, margin: '0 auto 28px',
          minHeight: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, rgba(232,121,160,0.12), rgba(167,139,250,0.12))',
          border: '1px solid rgba(232,121,160,0.2)',
        }}>
          {anim ? (
            <div style={{ fontSize: '2rem', animation: 'pulse 0.4s ease-in-out infinite' }}>💌</div>
          ) : note ? (
            <p className="caveat" style={{ fontSize: 'clamp(1.2rem,4vw,1.6rem)', lineHeight: 1.6, animation: 'popIn 0.4s both', color: 'var(--text)' }}>
              {note}
            </p>
          ) : (
            <p style={{ color: 'var(--text3)', fontSize: '0.9rem' }}>Tap below to get a love note ↓</p>
          )}
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <Btn onClick={generate}>{note ? 'Another one 💕' : 'Generate Love Note 💌'}</Btn>
          {note && (
            <button
              onClick={copy}
              style={{ background: 'none', border: 'none', color: copied ? 'var(--teal)' : 'var(--text2)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 700, fontFamily: 'Nunito,sans-serif' }}
            >
              {copied ? '✓ Copied!' : '📋 Copy to clipboard'}
            </button>
          )}
        </div>
      </div>
    </PageWrap>
  )
}
