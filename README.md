# Studia — AI-Powered Learning Platform

> "The best tools for learning, powered by AI"

A complete study platform that transforms course content into structured learning materials using AI — flashcards, summaries, quizzes and more.

## Tech Stack

| Technology | Usage |
|---|---|
| TypeScript | Main language |
| Next.js | Framework & routing |
| React | UI components |
| OpenAI API | AI content generation |
| Tailwind CSS | Styling |
| Supabase / Firebase | Database & authentication |
| Vercel | Deployment |

## How it works

```
Student pastes course content or topic
              ↓
         AI Processing (GPT)
              ↓
    ┌─────────────────────────┐
    │ Flashcards              │
    │ Smart Summary           │
    │ Quiz Questions          │
    │ Key Concepts            │
    │ Mind Map Structure      │
    └─────────────────────────┘
              ↓
    Student studies efficiently
```

## Features

- **Flashcard Generator** — Auto-creates question/answer cards
- **Smart Summaries** — Condenses long content into key points
- **Quiz Mode** — Tests knowledge with AI-generated questions
- **Concept Explainer** — Simplifies complex topics
- **Progress Tracking** — Monitor study sessions

## Project Structure

```
Studia/
├── app/
│   ├── page.tsx
│   ├── dashboard/
│   ├── flashcards/
│   ├── quiz/
│   ├── summary/
│   └── api/
│       ├── flashcards/
│       ├── quiz/
│       └── summary/
├── components/
│   ├── Flashcard.tsx
│   ├── QuizCard.tsx
│   └── SummaryView.tsx
├── lib/
│   ├── openai.ts
│   └── supabase.ts
├── .env.example
├── package.json
└── tsconfig.json
```

## Getting Started

**Prerequisites:** Node.js 18+, OpenAI API key, Supabase account (optional)

```bash
git clone https://github.com/cyberhacker1210/Studia
cd Studia
npm install
cp .env.example .env
```

### Environment Variables

```env
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Example

```
Input:  "La mitose est un processus de division cellulaire..."

Output:
  Flashcard 1: Q: "Combien de phases a la mitose?" A: "4 phases"
  Flashcard 2: Q: "Qu'est-ce que la prophase?" A: "..."

  Summary: "La mitose est divisée en 4 étapes principales..."

  Quiz Q1: "Quelle phase suit la métaphase?"
```

## Author

**cyberhacker1210** — [GitHub](https://github.com/cyberhacker1210)
