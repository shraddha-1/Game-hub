import { NextRequest, NextResponse } from 'next/server'
import {
  wyrQuestions, truthQuestions, dareQuestions, totQuestions,
  compatQuestions, loveNotes, movieQuestions, shuffleAndPick,
} from '@/lib/questions'

export async function POST(req: NextRequest) {
  const { gameType, amount } = await req.json()

  try {
    switch (gameType) {
      // ─── OpenTDB for trivia (free, no key needed) ───
      case 'trivia': {
        const n = amount ?? 10
        const res = await fetch(
          `https://opentdb.com/api.php?amount=${n}&type=multiple&encode=url3986`
        )
        const data = await res.json()
        if (data.response_code !== 0) {
          return NextResponse.json({ error: 'OpenTDB returned no results' }, { status: 502 })
        }
        const questions = data.results.map((q: any) => {
          const options = [...q.incorrect_answers.map((a: string) => decodeURIComponent(a))]
          const correctIdx = Math.floor(Math.random() * 4)
          options.splice(correctIdx, 0, decodeURIComponent(q.correct_answer))
          return {
            question: decodeURIComponent(q.question),
            options,
            answer: correctIdx,
            emoji: getCategoryEmoji(decodeURIComponent(q.category)),
          }
        })
        return NextResponse.json({ questions })
      }

      // ─── Built-in question banks ───
      case 'movie':
        return NextResponse.json({ questions: shuffleAndPick(movieQuestions, amount ?? 12) })
      case 'wyr':
        return NextResponse.json({ questions: shuffleAndPick(wyrQuestions, amount ?? 10) })
      case 'truth':
        return NextResponse.json({ questions: shuffleAndPick(truthQuestions, amount ?? 10) })
      case 'dare':
        return NextResponse.json({ questions: shuffleAndPick(dareQuestions, amount ?? 10) })
      case 'tot':
        return NextResponse.json({ questions: shuffleAndPick(totQuestions, amount ?? 12) })
      case 'compat':
        return NextResponse.json({ questions: shuffleAndPick(compatQuestions, amount ?? 10) })
      case 'love':
        return NextResponse.json({ questions: shuffleAndPick(loveNotes, amount ?? 15) })

      default:
        return NextResponse.json({ error: 'Unknown game type' }, { status: 400 })
    }
  } catch (err) {
    console.error('Question generation error:', err)
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
  }
}

function getCategoryEmoji(cat: string): string {
  const map: Record<string, string> = {
    'General Knowledge': '🧠', 'Entertainment: Books': '📚',
    'Entertainment: Film': '🎬', 'Entertainment: Music': '🎵',
    'Entertainment: Television': '📺', 'Entertainment: Video Games': '🎮',
    'Science & Nature': '🔬', 'Science: Computers': '💻',
    'Science: Mathematics': '🔢', 'Mythology': '⚡',
    'Sports': '⚽', 'Geography': '🌍', 'History': '📜',
    'Politics': '🏛️', 'Art': '🎨', 'Celebrities': '⭐',
    'Animals': '🐾', 'Vehicles': '🚗',
  }
  for (const [key, emoji] of Object.entries(map)) {
    if (cat.includes(key)) return emoji
  }
  return '🎯'
}