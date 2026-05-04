'use client'
import React from 'react'

/* ── Btn ── */
interface BtnProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  style?: React.CSSProperties
  type?: 'button' | 'submit'
}

export function Btn({ children, onClick, variant = 'primary', size = 'md', disabled, style, type = 'button' }: BtnProps) {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    fontFamily: 'Nunito, sans-serif', fontWeight: 800, borderRadius: 50,
    border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.25s cubic-bezier(.34,1.56,.64,1)',
    opacity: disabled ? 0.5 : 1,
  }
  const sizes = { sm: { padding: '8px 20px', fontSize: '0.85rem' }, md: { padding: '13px 32px', fontSize: '1rem' }, lg: { padding: '16px 40px', fontSize: '1.1rem' } }
  const variants = {
    primary: { background: 'linear-gradient(135deg,#e879a0,#a78bfa)', color: '#fff', boxShadow: '0 4px 20px rgba(232,121,160,0.4)' },
    ghost:   { background: 'rgba(255,255,255,0.06)', color: '#f0eaf8', border: '1.5px solid rgba(255,255,255,0.12)' },
    danger:  { background: 'rgba(248,113,113,0.15)', color: '#f87171', border: '1.5px solid rgba(248,113,113,0.3)' },
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
      onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.06) translateY(-2px)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
    >
      {children}
    </button>
  )
}

/* ── Card ── */
export function Card({ children, style, glow }: { children: React.ReactNode; style?: React.CSSProperties; glow?: boolean }) {
  return (
    <div style={{
      background: 'var(--card)',
      borderRadius: 'var(--radius-lg)',
      padding: 'clamp(20px,4vw,36px)',
      border: '1px solid var(--border)',
      boxShadow: glow ? 'var(--glow-pink)' : 'none',
      ...style,
    }}>
      {children}
    </div>
  )
}

/* ── PageWrap ── */
export function PageWrap({ children, onBack }: { children: React.ReactNode; onBack?: () => void }) {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', padding: '64px 16px 48px', maxWidth: 520, margin: '0 auto' }}>
      {onBack && (
        <button
          onClick={onBack}
          style={{
            position: 'absolute', top: 16, left: 16,
            background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border2)',
            borderRadius: 50, width: 40, height: 40,
            color: 'var(--pink)', fontSize: '1.1rem', fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(232,121,160,0.15)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
        >←</button>
      )}
      {children}
    </div>
  )
}

/* ── Badge ── */
export function Badge({ children, color = 'var(--pink)' }: { children: React.ReactNode; color?: string }) {
  return (
    <span style={{
      display: 'inline-block',
      background: `${color}22`,
      color,
      padding: '4px 14px',
      borderRadius: 50,
      fontSize: '0.75rem',
      fontWeight: 800,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      border: `1px solid ${color}44`,
    }}>
      {children}
    </span>
  )
}

/* ── ScoreBar ── */
export function ScoreBar({ current, total, score }: { current: number; total: number; score?: number }) {
  const pct = (current / total) * 100
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text2)', fontWeight: 700 }}>{current} / {total}</span>
        {score !== undefined && <span style={{ fontSize: '0.8rem', color: 'var(--pink)', fontWeight: 800 }}>Score: {score}</span>}
      </div>
      <div style={{ height: 4, background: 'var(--bg3)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,var(--pink),var(--purple))', borderRadius: 4, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  )
}

/* ── Loading spinner ── */
export function Spinner() {
  return (
    <div style={{
      width: 28, height: 28,
      border: '3px solid rgba(255,255,255,0.1)',
      borderTopColor: 'var(--pink)',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
      margin: '0 auto',
    }} />
  )
}

/* ── Floating doodles bg ── */
export function Doodles() {
  const items = [
    { e: '💕', x: 5,  y: 8  }, { e: '✨', x: 88, y: 12 }, { e: '🌸', x: 20, y: 75 },
    { e: '💫', x: 75, y: 65 }, { e: '🦋', x: 50, y: 5  }, { e: '🍭', x: 92, y: 45 },
    { e: '💌', x: 8,  y: 50 }, { e: '🎀', x: 60, y: 88 }, { e: '✨', x: 35, y: 40 },
    { e: '🌙', x: 80, y: 20 },
  ]
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {items.map((it, i) => (
        <span key={i} style={{
          position: 'absolute', left: `${it.x}%`, top: `${it.y}%`,
          fontSize: 13 + (i % 4) * 5,
          opacity: 0.06 + (i % 3) * 0.025,
          animation: `bob ${3 + i % 3}s ease-in-out ${i * 0.35}s infinite alternate`,
          userSelect: 'none',
        }}>{it.e}</span>
      ))}
    </div>
  )
}
