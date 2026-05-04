import { db } from './firebase'
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  orderBy,
  getDocs,
  limit,
} from 'firebase/firestore'

export type RelationshipType = 'partner' | 'bestfriend' | 'parent' | 'sibling' | 'colleague' | 'crush'

export interface Session {
  id: string
  creatorName: string
  partnerName: string
  relationship: RelationshipType
  games: string[]
  createdAt: number
  questions: Record<string, any[]>
}

export const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  partner:    'Partner / Lover',
  bestfriend: 'Best Friend',
  parent:     'Parent / Child',
  sibling:    'Sibling',
  colleague:  'Colleague / Coworker',
  crush:      'Crush',
}

export const RELATIONSHIP_EMOJIS: Record<RelationshipType, string> = {
  partner:    '💕',
  bestfriend: '🫂',
  parent:     '🏠',
  sibling:    '👯',
  colleague:  '💼',
  crush:      '🦋',
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 9)
}

// ─── Firebase CRUD ───

export async function saveSession(session: Session): Promise<void> {
  await setDoc(doc(db, 'sessions', session.id), session)
}

export async function getSession(id: string): Promise<Session | null> {
  const snap = await getDoc(doc(db, 'sessions', id))
  if (snap.exists()) return snap.data() as Session
  return null
}

export async function getAllSessions(): Promise<Session[]> {
  const q = query(collection(db, 'sessions'), orderBy('createdAt', 'desc'), limit(50))
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data() as Session)
}

export async function deleteSessionById(id: string): Promise<void> {
  await deleteDoc(doc(db, 'sessions', id))
}
