# ⚔️ CodeArena

CodeArena is a competitive, AI-integrated SaaS platform for developers. Form battle rooms, sync your LeetCode progress, and get Gemini-powered code reviews.

## 🚀 Features

- **Zero-Click Auto Sync**: Connect your LeetCode username and see your daily submissions automatically.
- **Private Battle Rooms**: Compete with friends on private leaderboards.
- **Gemini AI Code Review**: Get instant feedback on your code quality, complexity, and best practices.
- **Gamification**: Earn badges like MVP, Speed Demon, and Perfect Code based on performance.
- **Staircase Podium**: Visual recognition for the top 3 room members.

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Database**: Prisma + SQLite (Local) / PostgreSQL (Prod)
- **Authentication**: NextAuth.js (Google OAuth)
- **AI**: Google Gemini Pro 1.5
- **Styling**: Tailwind CSS + Shadcn/UI

## 🏁 Getting Started

### 1. Prerequisites
- Node.js 18+
- A Google Cloud Project (for OAuth)
- A Gemini API Key

### 2. Installation
```bash
git clone <your-repo-url>
cd codearena
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

### 4. Database Setup
```bash
npx prisma db push
```

### 5. Start Development
```bash
npm run dev
```

## 📦 Production Deployment

1. **Database**: In production, it is recommended to use a managed PostgreSQL instance (like Supabase or Neon). Update `DATABASE_URL` in your env.
2. **Build**: Run `npm run build` to ensure the project compiles without errors.
3. **Deploy**: Deploy directly to Vercel or any Node.js provider.
