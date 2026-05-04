# 💑 Us, the Game — Couples Game Hub

A cute game hub for long-distance couples. 100% FREE — no paid APIs needed!

## ✨ What's Inside

- **🧠 Trivia** — Powered by [OpenTDB](https://opentdb.com) (free, no key needed)
- **🎬 Guess the Movie** — 50 emoji movie puzzles (built-in)
- **🤔 Would You Rather** — 40 couples questions
- **🔥 Truth or Dare** — 40 truths + 40 dares (couples edition)
- **🎯 This or That** — 40 quick pick pairs
- **💕 Compatibility Quiz** — 20 compatibility questions
- **💌 Love Notes** — 50 sweet messages to send each other
- **Firebase** — Sessions stored in cloud, shareable links work on any device

**Total: 280+ built-in questions + unlimited trivia from OpenTDB**

---

## 🚀 Setup Guide

### Step 1: Set Up Firebase (Free, ~5 minutes)

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Create a project"**
3. Name it `couples-game-hub` → disable Analytics → Create
4. Click the **web icon** (`</>`) → name it → **Register app**
5. **Copy the config values** (apiKey, authDomain, projectId, etc.)
6. Go to **Build → Firestore Database → Create database**
7. Choose **"Start in test mode"** → pick a region → Enable

### Step 2: Run Locally

```bash
cd couples-game-hub
npm install
cp .env.local.example .env.local
```

Edit `.env.local` with your Firebase values:
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Step 3: Deploy to Netlify

1. Push code to GitHub (don't commit `.env.local`)
2. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → Import from GitHub
3. Build command: `npm run build`
4. Publish directory: `.next`
5. Add your 6 Firebase env variables under **Environment Variables**
6. Deploy!

### Step 4: Share & Play! 🎉

Send the link to your partner. Create a session, copy the shareable link, play together on a video call!

---

## 💰 Cost: $0

| Service | Free Tier |
|---------|-----------|
| Firebase Firestore | 50k reads/day, 20k writes/day |
| OpenTDB API | Unlimited, no key |
| Netlify | 100GB bandwidth/month |
| Built-in questions | ♾️ Forever free |

---

## 🔒 Firebase Security

After testing, update Firestore rules (Firebase Console → Firestore → Rules):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sessions/{sessionId} {
      allow read: if true;
      allow create: if true;
      allow delete: if true;
      allow update: if false;
    }
  }
}
```

---

Made with ❤️ for long-distance lovers
