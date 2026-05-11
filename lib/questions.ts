export type RelationshipType = 'partner' | 'bestfriend' | 'parent' | 'sibling'

export interface WYRQuestion  { optionA: string; optionB: string }
export interface TOTQuestion  { optionA: string; optionB: string }
export interface CompatQuestion { question: string; options: string[] }
export interface MovieQuestion  { emojis: string; answer: string; hints: string[] }

// ─────────────────────────────────────────────
// UTILITY
// ─────────────────────────────────────────────

export function shuffleAndPick<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n)
}

// ─────────────────────────────────────────────
// WOULD YOU RATHER — per relationship
// ─────────────────────────────────────────────

const wyrByRelationship: Record<RelationshipType, WYRQuestion[]> = {
  partner: [
    { optionA: 'Always hold hands in public 🤝', optionB: 'Always have matching outfits 👫' },
    { optionA: 'Cook every meal together 🍳', optionB: 'Travel somewhere new every month ✈️' },
    { optionA: 'Read each other\'s minds 🧠', optionB: 'Feel each other\'s emotions 💗' },
    { optionA: 'Dance in the rain 🌧️', optionB: 'Watch every sunset together 🌅' },
    { optionA: 'Relive your first date forever 💕', optionB: 'Fast forward to growing old together 👴👵' },
    { optionA: 'Have a movie made about your love story 🎬', optionB: 'Have a song written about you 🎶' },
    { optionA: 'Live in a treehouse together 🌳', optionB: 'Live on a houseboat together ⛵' },
    { optionA: 'Never argue but also no surprises 😐', optionB: 'Sometimes argue but amazing surprises 🎁' },
    { optionA: 'Spend every evening together 🕯️', optionB: 'Have one epic date night per week 🌟' },
    { optionA: 'Know exactly what they\'re thinking 💭', optionB: 'Always be surprised by them 🎀' },
    { optionA: 'Be long distance but deeply connected 📱', optionB: 'Be close but always busy 🏃' },
    { optionA: 'Have a big dream wedding 💒', optionB: 'Elope somewhere magical 🏝️' },
  ],
  bestfriend: [
    { optionA: 'Be friends forever but never live near each other 🌍', optionB: 'Live together but drift apart in 5 years 🏠' },
    { optionA: 'Always know each other\'s secrets 🤫', optionB: 'Never fight but never share anything deep 😶' },
    { optionA: 'Go on a spontaneous road trip tomorrow 🚗', optionB: 'Plan the perfect trip 6 months from now 🗓️' },
    { optionA: 'Be each other\'s maid of honor / best man 💍', optionB: 'Be each other\'s business partners 💼' },
    { optionA: 'Always be brutally honest with each other 😬', optionB: 'Always be supportive even when wrong 🤗' },
    { optionA: 'Have a shared playlist that controls the vibe 🎵', optionB: 'Have a shared journal only you two read 📓' },
    { optionA: 'Know everything about each other\'s crushes 💘', optionB: 'Never talk about relationships, just vibes 😎' },
    { optionA: 'Travel together every year 🌏', optionB: 'Live in the same city forever 🏙️' },
    { optionA: 'Text every day but rarely meet 📱', optionB: 'Rarely text but always pick up where you left off 💬' },
    { optionA: 'Share all your food 🍕', optionB: 'Never share food but always split bills equally 💸' },
    { optionA: 'Have matching friendship tattoos 🖋️', optionB: 'Have a secret handshake only you two know 🤝' },
    { optionA: 'Be each other\'s emergency contact 🚨', optionB: 'Be each other\'s alibi 😂' },
  ],
  parent: [
    { optionA: 'Call every day for 5 minutes 📞', optionB: 'Have one long deep conversation per week 💬' },
    { optionA: 'Live in the same city forever 🏙️', optionB: 'Travel the world but video call often ✈️' },
    { optionA: 'Share every meal together when possible 🍽️', optionB: 'Explore new restaurants every time you meet 🍜' },
    { optionA: 'Watch the same shows and discuss them 📺', optionB: 'Read the same books and share thoughts 📚' },
    { optionA: 'Have a family game night every week 🎮', optionB: 'Go on a big family trip once a year 🌍' },
    { optionA: 'Always give advice when asked 🧠', optionB: 'Just listen without offering opinions 👂' },
    { optionA: 'Celebrate every small milestone 🎉', optionB: 'Make only big milestones extra special 🏆' },
    { optionA: 'Have a family group chat that\'s always active 💬', optionB: 'Surprise visits whenever possible 🚪' },
    { optionA: 'Cook family recipes together 👩‍🍳', optionB: 'Create new traditions from scratch 🌱' },
    { optionA: 'Always say I love you out loud 💗', optionB: 'Show love through actions not words 🛠️' },
    { optionA: 'Watch old family home videos together 🎥', optionB: 'Make new memories and document them 📸' },
    { optionA: 'Have a code word for "I need you" 🆘', optionB: 'Always know by instinct when something is off 💡' },
  ],
  sibling: [
    { optionA: 'Always team up against your parents 😂', optionB: 'Stay neutral and keep the peace ☮️' },
    { optionA: 'Share a room forever but be best friends 🛏️', optionB: 'Have your own space but barely talk 🚪' },
    { optionA: 'Roast each other constantly 🔥', optionB: 'Never tease but also never be that close 😐' },
    { optionA: 'Know every embarrassing story about each other 😳', optionB: 'Keep all secrets perfectly 🤐' },
    { optionA: 'Always borrow each other\'s stuff 👗', optionB: 'Have strictly your own things 🚫' },
    { optionA: 'Be in the same friend group 👥', optionB: 'Have completely separate social lives 🔀' },
    { optionA: 'Text each other memes all day 😂', optionB: 'Only talk when something important happens 📣' },
    { optionA: 'Always fight but always make up 💥💕', optionB: 'Never fight but never get that close 😶' },
    { optionA: 'Do everything together as kids 👫', optionB: 'Grow up independently and bond as adults 🤝' },
    { optionA: 'Protect each other from everything 🛡️', optionB: 'Let each other figure things out alone 🌱' },
    { optionA: 'Have inside jokes nobody else understands 😏', optionB: 'Always include others in your humor 😄' },
    { optionA: 'Be each other\'s wingman/wingwoman 💘', optionB: 'Keep romance topics completely off limits 🙅' },
  ],
}

// ─────────────────────────────────────────────
// TRUTH — per relationship
// ─────────────────────────────────────────────

const truthByRelationship: Record<RelationshipType, string[]> = {
  partner: [
    "What's your favorite memory of us? 💭",
    "When did you first realize you had feelings for me? 💕",
    "What's one thing you've never told me? 🤫",
    "What do you love most about our relationship? 💗",
    "What song most reminds you of me? 🎵",
    "What's a habit of mine you secretly find adorable? 🥰",
    "What would you do if you saw me right now? 🏃",
    "What's your favorite inside joke we have? 😂",
    "What's the most embarrassing thing you've done to impress me? 😳",
    "If we could go anywhere right now, where would you take me? ✈️",
    "What's one thing about me that surprised you? 😮",
    "What's a small thing I do that makes your whole day better? ☀️",
    "When do you feel closest to me? 💞",
    "What's something you wish I knew without having to say it? 💌",
    "What future moment with me are you most excited about? 🌟",
  ],
  bestfriend: [
    "What's the first memory you have of us becoming real friends? 💭",
    "What's something I did that made you think 'yep, they're my person'? 🫂",
    "What's the most chaotic thing we've ever done together? 😂",
    "What's a secret you haven't told anyone but me? 🤫",
    "What do you actually think of my fashion sense? 👀",
    "What's a time I gave you terrible advice? 😬",
    "What song is our friendship anthem? 🎵",
    "What's something you always wanted to tell me but never did? 💬",
    "What's the funniest misunderstanding we've ever had? 😅",
    "If you had to describe our friendship in 3 words, what would they be? 🤔",
    "What's something I do that annoys you but you've never said? 😇",
    "What's your favorite thing we do together? 🌟",
    "What's a moment you were really proud of me? 🏆",
    "If we lived together, what would drive you crazy about me? 🏠",
    "What's one thing you hope never changes about us? 💕",
  ],
  parent: [
    "What's your earliest memory of us together? 💭",
    "What's something I did as a kid that still makes you laugh? 😂",
    "What's something you wish we talked about more? 💬",
    "What's a lesson you've learned from me? 🌱",
    "What's your favorite tradition we share? 🎉",
    "What's something you're proud of that you've never told me? 🏆",
    "What's a moment you felt really understood by me? 💗",
    "What's something you wish you'd done differently with me? 🤔",
    "What's a secret talent of mine you've always admired? ✨",
    "What does our relationship mean to you in one sentence? 💌",
    "What's something small I do that means the world to you? ☀️",
    "What's a fear about our relationship you've never voiced? 🤫",
    "What's something you want us to do together before too much time passes? ⏳",
    "What's the best advice I ever gave you? 🧠",
    "What's a moment you realized I'd grown up? 🌟",
  ],
  sibling: [
    "What's the most trouble we ever got into together? 😂",
    "What's something I did that you were secretly jealous of? 👀",
    "What's your favorite childhood memory of us? 🏡",
    "What's something embarrassing about me that you've never told anyone? 🤫",
    "What's a time I really annoyed you but you never said anything? 😤",
    "What's something you admire about me but never say out loud? 💗",
    "What's the funniest lie we told our parents together? 😅",
    "What's something you wish we did more together? 🌟",
    "What's a moment you were really proud to call me your sibling? 🏆",
    "If you could change one thing about how we grew up, what would it be? 🌱",
    "What's something about me that used to drive you crazy but now you love? 😂",
    "What's your honest opinion of my current life choices? 😬",
    "What's a secret about yourself you'd only ever tell me? 🤐",
    "What's something you think we both inherited from our family? 👨‍👩‍👧‍👦",
    "What do you think our relationship will look like in 10 years? 🔮",
  ],
}

// ─────────────────────────────────────────────
// DARE — per relationship
// ─────────────────────────────────────────────

const dareByRelationship: Record<RelationshipType, string[]> = {
  partner: [
    "Send me the last photo in your gallery 📸",
    "Write a 4-line poem about me right now ✍️",
    "Send a voice note saying 'I miss you' in 3 different accents 🗣️",
    "Do your best impression of me 🎭",
    "Change your profile pic to a silly selfie for 1 hour 🤳",
    "Record yourself dancing to our song 💃",
    "Describe me using only food items 🍕",
    "Send me a drawing of us together (stick figures OK!) 🎨",
    "Text me something you've been too shy to say 💌",
    "Send your most embarrassing photo 😬",
    "Send a voice note singing my favorite line from our song 🎵",
    "Tell me 3 things you love about me without using the word 'love' 💭",
    "Re-enact your favorite memory of us 🎬",
    "Send me what you're wearing right now 👀",
    "Write me a 10-word love letter 💕",
  ],
  bestfriend: [
    "Send the last meme you saved 😂",
    "Do your best impression of me 🎭",
    "Send an ugly selfie right now 🤪",
    "Text your crush 'hey' right now (screenshot required) 💘",
    "Send your most embarrassing photo from 3 years ago 😬",
    "Describe me as a food dish 🍕",
    "Change your bio to something I choose for 1 hour ✏️",
    "Send a voice note of you singing terribly 🎵",
    "Show me your most recent Google search 🔍",
    "Post a throwback photo of us with a nice caption 📸",
    "Send me a voice note roasting yourself 🔥",
    "Draw me in 30 seconds and send it 🎨",
    "Share the last 5 songs you listened to 🎧",
    "Send me your screen time report this week 📱",
    "Tell me 3 things you've never told anyone else 🤫",
  ],
  parent: [
    "Share a childhood photo of yourself 📸",
    "Tell me your most embarrassing story from when you were my age 😂",
    "Send me a voice note of you singing a song from your youth 🎵",
    "Show me your favorite photo on your phone 📱",
    "Teach me something in the next 2 minutes 📚",
    "Tell me about the proudest moment of your life 🏆",
    "Share a piece of advice you wish someone gave you earlier 💡",
    "Do an impression of me as a kid 🎭",
    "Show me what you were listening to this week 🎧",
    "Draw what our family looks like to you in 30 seconds 🎨",
    "Tell me one thing you've changed your mind about over the years 🌱",
    "Share your honest reaction to my current lifestyle 😬",
    "Text me your favorite memory of us right now 💌",
    "Tell me something you've always wanted to do but haven't yet ✨",
    "Give me your best piece of relationship advice 💗",
  ],
  sibling: [
    "Send the most embarrassing photo you have of me 😂",
    "Do your best impression of our parents 🎭",
    "Tell me a secret you've kept from me until now 🤫",
    "Send me the most chaotic meme in your camera roll 😂",
    "Show me your search history from today 🔍",
    "Recreate your most embarrassing childhood memory 😅",
    "Post a photo of us with an embarrassing caption for 30 minutes 📸",
    "Text our parent something random and screenshot their reaction 😬",
    "Send me a voice note roasting me in the nicest way 🔥",
    "Send the ugliest selfie you can take right now 🤪",
    "Tell me your honest opinion of my friends 👀",
    "Reveal the weirdest thing you did when we were kids 🌀",
    "Show me what's actually on your secret Pinterest board 📌",
    "Send me your Spotify wrapped if you haven't already 🎵",
    "Draw our family from memory in 60 seconds 🎨",
  ],
}

// ─────────────────────────────────────────────
// THIS OR THAT — per relationship
// ─────────────────────────────────────────────

const totByRelationship: Record<RelationshipType, TOTQuestion[]> = {
  partner: [
    { optionA: 'Morning person 🌅', optionB: 'Night owl 🌙' },
    { optionA: 'Beach vacation 🏖️', optionB: 'Mountain getaway ⛰️' },
    { optionA: 'Sweet 🍩', optionB: 'Spicy 🌶️' },
    { optionA: 'Netflix at home 🎬', optionB: 'Dinner out 🍷' },
    { optionA: 'Texts 📱', optionB: 'Calls 📞' },
    { optionA: 'Big romantic gesture 💐', optionB: 'Small daily acts of love 🫶' },
    { optionA: 'Matching outfits 👫', optionB: 'Totally different styles 🎨' },
    { optionA: 'Plan everything ahead 📅', optionB: 'Spontaneous always 🎲' },
    { optionA: 'Dog person 🐕', optionB: 'Cat person 🐈' },
    { optionA: 'Cook at home 🍳', optionB: 'Order in 📦' },
    { optionA: 'Save money 💰', optionB: 'Spend on experiences 🎡' },
    { optionA: 'City life 🏙️', optionB: 'Countryside peace 🌻' },
  ],
  bestfriend: [
    { optionA: 'Text all day 📱', optionB: 'Call for hours 📞' },
    { optionA: 'Same music taste 🎵', optionB: 'Completely different tastes 🎸' },
    { optionA: 'Brutally honest 😬', optionB: 'Kindly diplomatic 🌸' },
    { optionA: 'Night out 🌃', optionB: 'Night in 🛋️' },
    { optionA: 'Share everything 🤝', optionB: 'Clear personal boundaries 🚫' },
    { optionA: 'Friends since childhood 🧒', optionB: 'Friends as adults 🧑' },
    { optionA: 'Gym together 🏋️', optionB: 'Eat everything together 🍕' },
    { optionA: 'Same friend group 👥', optionB: 'Separate circles who sometimes mix 🔀' },
    { optionA: 'Road trip 🚗', optionB: 'Fly somewhere fancy ✈️' },
    { optionA: 'Roast each other 🔥', optionB: 'Hype each other up 📣' },
    { optionA: 'Know each other\'s passwords 🔑', optionB: 'Total privacy 🔒' },
    { optionA: 'Matching friendship item 💎', optionB: 'No need for symbols, just vibes ✨' },
  ],
  parent: [
    { optionA: 'Call every day 📞', optionB: 'Text when needed 📱' },
    { optionA: 'Family dinners always 🍽️', optionB: 'Quality over quantity ✨' },
    { optionA: 'Give advice freely 🧠', optionB: 'Only advise when asked 🤐' },
    { optionA: 'Share everything 💬', optionB: 'Keep some things private 🔒' },
    { optionA: 'Surprise visits 🚪', optionB: 'Always plan ahead 📅' },
    { optionA: 'Old family traditions 🏡', optionB: 'Create new ones 🌱' },
    { optionA: 'Watch same shows together 📺', optionB: 'Recommend shows to each other 🎬' },
    { optionA: 'Travel together 🌍', optionB: 'Holiday gatherings at home 🏠' },
    { optionA: 'Say I love you out loud 💗', optionB: 'Show it through actions 🛠️' },
    { optionA: 'Early riser 🌅', optionB: 'Late nights 🌙' },
    { optionA: 'Home cooked meals 🍳', optionB: 'Treat yourselves out 🍜' },
    { optionA: 'Look through old photos 📸', optionB: 'Make new memories now 🌟' },
  ],
  sibling: [
    { optionA: 'Older sibling energy 👆', optionB: 'Younger sibling chaos 😂' },
    { optionA: 'Share a room 🛏️', optionB: 'Own space always 🚪' },
    { optionA: 'Borrow clothes freely 👗', optionB: 'Don\'t touch my stuff 🚫' },
    { optionA: 'Same music taste 🎵', optionB: 'Completely different 🎸' },
    { optionA: 'Tell on each other 🗣️', optionB: 'Always cover for each other 🛡️' },
    { optionA: 'Same friend group 👥', optionB: 'Separate lives 🔀' },
    { optionA: 'Compete with each other 🏆', optionB: 'Always support each other 💪' },
    { optionA: 'Roast each other constantly 🔥', optionB: 'Keep it civil 😇' },
    { optionA: 'Inside jokes nobody gets 😏', optionB: 'Always explain the joke 😄' },
    { optionA: 'Team up against parents 😂', optionB: 'Every person for themselves 😅' },
    { optionA: 'Alike in every way 👯', optionB: 'Complete opposites ☯️' },
    { optionA: 'Know all each other\'s secrets 🤫', optionB: 'Separate lives, close hearts 💗' },
  ],
}

// ─────────────────────────────────────────────
// COMPAT — per relationship
// ─────────────────────────────────────────────

const compatByRelationship: Record<RelationshipType, CompatQuestion[]> = {
  partner: [
    { question: 'Ideal Saturday night date?', options: ['Netflix & snacks 🍿', 'Fancy dinner out 🍷', 'Game night 🎮', 'Stargazing 🌌'] },
    { question: 'Your love language?', options: ['Words of affirmation 💬', 'Physical touch 🤗', 'Gifts 🎁', 'Quality time ⏰'] },
    { question: 'Dream home together?', options: ['City penthouse 🏙️', 'Beach house 🏖️', 'Mountain cabin 🏔️', 'Countryside cottage 🌻'] },
    { question: 'Most important in a relationship?', options: ['Trust 🤝', 'Humor 😂', 'Romance 💕', 'Communication 💬'] },
    { question: 'How do you argue?', options: ['Talk right away 🗣️', 'Need space first 🚶', 'Write it down 📝', 'Hug it out 🤗'] },
    { question: 'Ideal morning together?', options: ['Lazy sleep in 😴', 'Early walk 🌅', 'Coffee & music ☕', 'Big brunch 🥞'] },
    { question: 'Relationship superpower?', options: ['Teleportation 🌀', 'Mind reading 🧠', 'Time travel ⏳', 'Freeze this moment ❄️'] },
    { question: 'How do you show love?', options: ['Cook for them 🍳', 'Long hugs 🤗', 'Surprise gifts 🎁', 'Plan special days ✨'] },
    { question: 'Biggest green flag?', options: ['Makes me laugh 😂', 'Always honest 🤝', 'Remembers small things 💌', 'Checks in randomly 📱'] },
    { question: 'Dream vacation together?', options: ['Maldives beach 🏝️', 'Europe adventure 🗺️', 'Japan 🇯🇵', 'Road trip anywhere 🚗'] },
  ],
  bestfriend: [
    { question: 'Our friendship vibe?', options: ['Chaotic duo 😂', 'Calm & steady 😌', 'Always adventurous 🗺️', 'Deep talkers 🧠'] },
    { question: 'How do we fight?', options: ['Hash it out immediately 🗣️', 'Give space then talk 🚶', 'Pretend it didn\'t happen 😬', 'We never really fight 😇'] },
    { question: 'Go-to hangout?', options: ['Food, always food 🍕', 'Watch something together 🎬', 'Go out & explore 🌃', 'Just talk for hours 💬'] },
    { question: 'Our friendship in a movie genre?', options: ['Comedy 😂', 'Coming-of-age drama 🎭', 'Action adventure 💥', 'Wholesome feel-good 🌻'] },
    { question: 'Honesty policy?', options: ['100% brutal truth 😬', 'Kind but honest 🌸', 'Only if they ask 🤐', 'Depends on the situation 🤔'] },
    { question: 'Who texts first usually?', options: ['Me', 'Them', 'Both at same time 😂', 'Neither, we just know'] },
    { question: 'Ideal friend trip?', options: ['Beach 🏖️', 'City break 🏙️', 'Mountains 🏔️', 'Road trip with no plan 🚗'] },
    { question: 'How long could we go without talking?', options: ['A day max 📱', 'A week, we\'re secure 😌', 'A month, still solid 💪', 'Years, we always come back ♾️'] },
    { question: 'Biggest thing that keeps us close?', options: ['Shared memories 📸', 'Same sense of humor 😂', 'We just get each other 🧠', 'Effort from both sides 🤝'] },
    { question: 'Energy when together?', options: ['Loud & everywhere 🎉', 'Chill & cozy 🛋️', 'Productive besties 💼', 'Emotional support mode 🫂'] },
  ],
  parent: [
    { question: 'How do we communicate best?', options: ['Long phone calls 📞', 'Daily texts 📱', 'In person always 🏠', 'Voice notes 🎤'] },
    { question: 'Favorite thing to do together?', options: ['Cook & eat 🍽️', 'Watch something 📺', 'Just talk 💬', 'Go somewhere together 🚗'] },
    { question: 'How do we handle disagreements?', options: ['Talk it out immediately 🗣️', 'Give it time 🕐', 'Agree to disagree 🤝', 'One of us always gives in 😅'] },
    { question: 'Most important to you in family?', options: ['Honesty 🤝', 'Togetherness 👨‍👩‍👧', 'Support 💪', 'Humor 😂'] },
    { question: 'How do you show love?', options: ['Words & affirmations 💬', 'Doing things for them 🛠️', 'Quality time ⏰', 'Little check-ins 📱'] },
    { question: 'Ideal family tradition?', options: ['Weekly dinners 🍽️', 'Annual trip 🌍', 'Holiday rituals 🎄', 'Random spontaneous plans 🎲'] },
    { question: 'What matters most in your relationship?', options: ['Trust & honesty 🤝', 'Always being there 💗', 'Respecting differences 🌱', 'Making each other laugh 😂'] },
    { question: 'Best memories are from?', options: ['Everyday moments 🌅', 'Big celebrations 🎉', 'Hard times faced together 💪', 'Travel & adventures 🌍'] },
    { question: 'Family vibe?', options: ['Loud & lively 🎉', 'Calm & grounded 😌', 'Funny & chaotic 😂', 'Deep & thoughtful 🧠'] },
    { question: 'What we\'d change about how we communicate?', options: ['Talk more often 📱', 'Be more honest 🤝', 'Listen more 👂', 'Nothing, it\'s perfect 💗'] },
  ],
  sibling: [
    { question: 'Sibling dynamic?', options: ['Best friends 💕', 'Friendly rivals 🏆', 'Polar opposites 🔀', 'Chaos duo 😂'] },
    { question: 'Biggest source of sibling conflict?', options: ['Borrowing stuff 👗', 'Attention from parents 👀', 'Different life choices 🌱', 'We don\'t really fight 😇'] },
    { question: 'Favorite sibling memory?', options: ['Getting in trouble together 😅', 'Holidays at home 🏡', 'A specific trip 🌍', 'Just a random day together 💬'] },
    { question: 'How do we resolve arguments?', options: ['Fight then forget 💥', 'Talk it through 🗣️', 'One person always caves 😂', 'Mum/Dad steps in 😬'] },
    { question: 'Our vibe in public?', options: ['Embarrass each other 😂', 'Hype each other up 📣', 'Pretend not to know each other 😅', 'Natural teammates 🤝'] },
    { question: 'Most similar thing about us?', options: ['Humor 😂', 'Values 🧭', 'How we handle stress 😤', 'Our taste in everything 🎨'] },
    { question: 'Biggest difference between us?', options: ['Personality 🌗', 'Lifestyle 🌀', 'Ambition & goals 🚀', 'Social energy 👥'] },
    { question: 'What keeps us close?', options: ['Shared history 📸', 'Genuine love 💗', 'Habit 😂', 'We just get each other 🧠'] },
    { question: 'Sibling superpower?', options: ['Reading each other\'s moods 🧠', 'Making each other laugh 😂', 'Brutal honesty 🔥', 'Always having each other\'s back 🛡️'] },
    { question: 'Ideal sibling day?', options: ['Old movies & junk food 🎬🍕', 'Go somewhere fun 🎢', 'Just hang & talk 💬', 'Cook family recipes 🍳'] },
  ],
}

// ─────────────────────────────────────────────
// PUBLIC GETTERS — used by page.tsx
// ─────────────────────────────────────────────

export function getQuestionsForRelationship(rel: RelationshipType) {
  // Normalise — only 4 types now
  const r: RelationshipType = (['partner','bestfriend','parent','sibling'] as RelationshipType[]).includes(rel as RelationshipType)
    ? rel as RelationshipType
    : 'partner'

  return {
    wyrQuestions:    wyrByRelationship[r],
    truthQuestions:  truthByRelationship[r],
    dareQuestions:   dareByRelationship[r],
    totQuestions:    totByRelationship[r],
    compatQuestions: compatByRelationship[r],
  }
}

// ─────────────────────────────────────────────
// FLAT EXPORTS (for legacy / API route use)
// ─────────────────────────────────────────────

export const wyrQuestions    = Object.values(wyrByRelationship).flat()
export const truthQuestions  = Object.values(truthByRelationship).flat()
export const dareQuestions   = Object.values(dareByRelationship).flat()
export const totQuestions    = Object.values(totByRelationship).flat()
export const compatQuestions = Object.values(compatByRelationship).flat()

// ─────────────────────────────────────────────
// LOVE NOTES (same for all)
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
// MOVIE QUESTIONS (same for all)
// ─────────────────────────────────────────────

export interface MovieQuestion { emojis: string; answer: string; hints: string[] }

export const movieQuestions: MovieQuestion[] = [
  { emojis: '🚢❄️💑',    answer: 'Titanic',              hints: ['1997 film', 'Jack & Rose', 'Iceberg!'] },
  { emojis: '🦁👑🌍',    answer: 'The Lion King',         hints: ['Hakuna Matata', 'Circle of life', 'Disney'] },
  { emojis: '🧊👸⛄🎵',  answer: 'Frozen',                hints: ['Let it go', 'Sister bond', 'Princess'] },
  { emojis: '🐀👨‍🍳🇫🇷', answer: 'Ratatouille',           hints: ['Anyone can cook', 'Paris', 'Tiny chef'] },
  { emojis: '🤖❤️🌱🚀',  answer: 'WALL-E',                hints: ['Lonely robot', 'EVE', 'Save the earth'] },
  { emojis: '💊🕶️🔴🔵',  answer: 'The Matrix',            hints: ['Red or blue pill', 'Neo', 'Bullet time'] },
  { emojis: '🦖🏝️🧬',    answer: 'Jurassic Park',         hints: ['Life finds a way', 'Dinosaurs', 'Theme park'] },
  { emojis: '🧙‍♂️💍🌋',  answer: 'Lord of the Rings',     hints: ['One ring', 'Middle Earth', 'Hobbits'] },
  { emojis: '🕷️🦸‍♂️🏙️', answer: 'Spider-Man',            hints: ['With great power', 'Web slinger', 'NYC'] },
  { emojis: '🌹👹📚🕯️',  answer: 'Beauty and the Beast',  hints: ['Tale as old as time', 'Enchanted rose', 'Be our guest'] },
  { emojis: '🧑‍🚀🪐⭐',   answer: 'Interstellar',          hints: ['Wormhole', 'Love transcends time', 'Space dad'] },
  { emojis: '🐠🐡🌊',    answer: 'Finding Nemo',           hints: ['Just keep swimming', 'Clownfish', 'Ocean'] },
  { emojis: '🧸🤠🐍',    answer: 'Toy Story',              hints: ['To infinity', 'Woody & Buzz', 'Pixar'] },
  { emojis: '🦇🃏😂',    answer: 'The Dark Knight',        hints: ['Why so serious', 'Joker', 'Gotham'] },
  { emojis: '🐻❄️🌨️🏔️', answer: 'Brother Bear',           hints: ['Disney', 'Transformation', 'Alaska'] },
]