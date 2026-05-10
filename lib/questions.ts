// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export type RelationshipType =
  | 'partner'
  | 'bestfriend'
  | 'crush'
  | 'sibling'
  | 'parent'
  | 'colleague'

export interface WYRQuestion {
  optionA: string
  optionB: string
}

export interface TOTQuestion {
  optionA: string
  optionB: string
}

export interface CompatQuestion {
  question: string
  options: string[]
}

// ─────────────────────────────────────────────
// TEMPLATE DATA
// ─────────────────────────────────────────────

const places = [
  'Paris 🇫🇷',
  'Tokyo 🇯🇵',
  'New York 🗽',
  'Iceland ❄️',
  'Bali 🌴',
  'Santorini 🇬🇷',
  'Maldives 🏝️',
]

const foods = [
  'Pizza 🍕',
  'Sushi 🍣',
  'Tacos 🌮',
  'Pasta 🍝',
  'Ice cream 🍦',
  'Burgers 🍔',
]

const activities = [
  'Road trip 🚗',
  'Movie marathon 🎬',
  'Concert 🎵',
  'Camping ⛺',
  'Amusement park 🎢',
  'Beach day 🏖️',
]

const powers = [
  'Teleportation 🌀',
  'Mind reading 🧠',
  'Flying ✈️',
  'Time travel ⏳',
]

const emotions = [
  'romantic 💕',
  'chaotic 🤪',
  'deep 🧠',
  'funny 😂',
  'soft 🥺',
]

// ─────────────────────────────────────────────
// BASE QUESTIONS
// ─────────────────────────────────────────────

const baseWYR: WYRQuestion[] = [
  {
    optionA: 'Always cuddle during movies 🎬',
    optionB: 'Always hold hands 🤝',
  },
  {
    optionA: 'Go on a beach date 🏖️',
    optionB: 'Go on a mountain trip ⛰️',
  },
]

// ─────────────────────────────────────────────
// AUTO GENERATORS
// ─────────────────────────────────────────────

function generateWYRQuestions(): WYRQuestion[] {
  const generated: WYRQuestion[] = []

  // PLACE QUESTIONS
  for (const place of places) {
    generated.push({
      optionA: `Take a trip to ${place}`,
      optionB: `Stay home for a cozy weekend 🏠`,
    })
  }

  // FOOD QUESTIONS
  for (const food of foods) {
    generated.push({
      optionA: `Eat only ${food} forever`,
      optionB: `Never eat ${food} again`,
    })
  }

  // ACTIVITY QUESTIONS
  for (const activity of activities) {
    generated.push({
      optionA: `Do ${activity} every weekend`,
      optionB: `Never do ${activity} again`,
    })
  }

  // SUPERPOWER QUESTIONS
  for (const power of powers) {
    generated.push({
      optionA: `Have ${power}`,
      optionB: `Read emotions instantly 💭`,
    })
  }

  // EMOTION QUESTIONS
  for (const emotion of emotions) {
    generated.push({
      optionA: `Have a ${emotion} relationship`,
      optionB: `Have a peaceful 😌 relationship`,
    })
  }

  return generated
}

// ─────────────────────────────────────────────
// TRUTH GENERATOR
// ─────────────────────────────────────────────

const truthTemplates = [
  'What is your favorite memory involving',
  'What reminds you most of',
  'What is one thing you admire about',
  'What would you change about',
  'What song reminds you of',
]

const truthSubjects = [
  'our friendship 🫂',
  'our relationship 💕',
  'our chaos 😂',
  'our conversations 💬',
  'our memories 📸',
]

function generateTruthQuestions(): string[] {
  const generated: string[] = []

  for (const template of truthTemplates) {
    for (const subject of truthSubjects) {
      generated.push(`${template} ${subject}?`)
    }
  }

  return generated
}

// ─────────────────────────────────────────────
// DARE GENERATOR
// ─────────────────────────────────────────────

const dareActions = [
  'Send a selfie 📸',
  'Record a voice note 🎤',
  'Send your favorite meme 😂',
  'Write a short poem ✍️',
  'Do an impression 🎭',
]

const dareStyles = [
  'in a dramatic way',
  'while singing',
  'using emojis only',
  'without laughing',
  'in your funniest voice',
]

function generateDares(): string[] {
  const generated: string[] = []

  for (const action of dareActions) {
    for (const style of dareStyles) {
      generated.push(`${action} ${style}`)
    }
  }

  return generated
}

// ─────────────────────────────────────────────
// THIS OR THAT GENERATOR
// ─────────────────────────────────────────────

const totA = [
  'Coffee ☕',
  'Tea 🍵',
  'Beach 🏖️',
  'Mountains ⛰️',
  'Texts 📱',
]

const totB = [
  'Hot chocolate 🍫',
  'Juice 🧃',
  'Snow ❄️',
  'City 🏙️',
  'Calls 📞',
]

function generateTOT(): TOTQuestion[] {
  const generated: TOTQuestion[] = []

  for (let i = 0; i < totA.length; i++) {
    generated.push({
      optionA: totA[i],
      optionB: totB[i],
    })
  }

  return generated
}

// ─────────────────────────────────────────────
// COMPAT QUESTIONS
// ─────────────────────────────────────────────

function generateCompat(): CompatQuestion[] {
  return [
    {
      question: 'Ideal weekend?',
      options: [
        'Stay home 🏠',
        'Travel ✈️',
        'Party 🎉',
        'Sleep 😴',
      ],
    },
    {
      question: 'Favorite vibe?',
      options: [
        'Romantic 💕',
        'Chaotic 😂',
        'Peaceful 😌',
        'Adventurous 🗺️',
      ],
    },
  ]
}

// ─────────────────────────────────────────────
// FINAL LARGE DATABASE
// ─────────────────────────────────────────────

export const wyrQuestions: WYRQuestion[] = [
  ...baseWYR,
  ...generateWYRQuestions(),
]

export const truthQuestions: string[] = [
  ...generateTruthQuestions(),
]

export const dareQuestions: string[] = [
  ...generateDares(),
]

export const totQuestions: TOTQuestion[] = [
  ...generateTOT(),
]

export const compatQuestions: CompatQuestion[] = [
  ...generateCompat(),
]

// ─────────────────────────────────────────────
// OPTIONAL: ENSURE 200+ QUESTIONS
// ─────────────────────────────────────────────

while (wyrQuestions.length < 200) {
  wyrQuestions.push(...generateWYRQuestions())
}

while (truthQuestions.length < 200) {
  truthQuestions.push(...generateTruthQuestions())
}

while (dareQuestions.length < 200) {
  dareQuestions.push(...generateDares())
}

while (totQuestions.length < 200) {
  totQuestions.push(...generateTOT())
}

// ─────────────────────────────────────────────
// UTILITY
// ─────────────────────────────────────────────

export function shuffleAndPick<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

// ─────────────────────────────────────────────
// LOVE NOTES
// ─────────────────────────────────────────────

export const loveNotes: string[] = [
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
  "You're my safe place 🏡💕",
]

// ─────────────────────────────────────────────
// MOVIE QUESTIONS
// ─────────────────────────────────────────────

export interface MovieQuestion {
  emojis: string
  answer: string
  hints: string[]
}

export const movieQuestions: MovieQuestion[] = [
  { emojis: '🚢❄️💑',    answer: 'Titanic',           hints: ['1997 film', 'Jack & Rose', 'Iceberg!'] },
  { emojis: '🦁👑🌍',    answer: 'The Lion King',      hints: ['Hakuna Matata', 'Circle of life', 'Disney'] },
  { emojis: '🧊👸⛄🎵',  answer: 'Frozen',             hints: ['Let it go', 'Sister bond', 'Princess'] },
  { emojis: '🐀👨‍🍳🇫🇷', answer: 'Ratatouille',        hints: ['Anyone can cook', 'Paris', 'Tiny chef'] },
  { emojis: '🤖❤️🌱🚀',  answer: 'WALL-E',             hints: ['Lonely robot', 'EVE', 'Save the earth'] },
  { emojis: '💊🕶️🔴🔵',  answer: 'The Matrix',         hints: ['Red or blue pill', 'Neo', 'Bullet time'] },
  { emojis: '🦖🏝️🧬',    answer: 'Jurassic Park',      hints: ['Life finds a way', 'Dinosaurs', 'Theme park'] },
  { emojis: '🧙‍♂️💍🌋',  answer: 'Lord of the Rings',  hints: ['One ring', 'Middle Earth', 'Hobbits'] },
  { emojis: '🕷️🦸‍♂️🏙️', answer: 'Spider-Man',         hints: ['With great power', 'Web slinger', 'NYC'] },
  { emojis: '🌹👹📚🕯️',  answer: 'Beauty and the Beast', hints: ['Tale as old as time', 'Enchanted rose', 'Be our guest'] },
  { emojis: '🧑‍🚀🪐⭐',   answer: 'Interstellar',       hints: ['Wormhole', 'Love transcends time', 'Space dad'] },
  { emojis: '🐠🐡🌊',    answer: 'Finding Nemo',        hints: ['Just keep swimming', 'Clownfish', 'Ocean adventure'] },
  { emojis: '🧸🤠🐍',    answer: 'Toy Story',           hints: ['To infinity', 'Woody & Buzz', 'Pixar classic'] },
  { emojis: '🦇🃏😂',    answer: 'The Dark Knight',     hints: ['Why so serious', 'Joker', 'Gotham'] },
  { emojis: '👻🍕🗗🍕',   answer: 'Ghostbusters',        hints: ['Who ya gonna call', 'Slimer', 'NYC ghosts'] },
]