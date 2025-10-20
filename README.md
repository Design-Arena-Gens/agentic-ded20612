# Daily Routine & Tasks Reminder

A focused habit-building companion that keeps recurring routines organized across the week, highlights what is due today, and tracks completion streaks. Built with Next.js and designed for quick deployment to Vercel.

## Features

- Persistent routine library with per-day scheduling and priority levels
- Smart today view with completion tracking, lateness cues, and quick actions
- Upcoming reminders panel surfacing tasks starting within the next two hours
- Weekly planner to audit or adjust any day’s routine lineup
- Local storage persistence so routines stay intact between visits

## Tech Stack

- Next.js 14 (App Router, React 18)
- TypeScript for type safety
- Zustand for lightweight client-side state with persistence
- date-fns for scheduling utilities
- Custom CSS (glassmorphism-inspired dark theme)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000`.
3. Create an optimized production build:
   ```bash
   npm run build
   npm start
   ```

## Project Structure

```
.
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   └── page.tsx
├── components/
│   └── task-form.tsx
├── lib/
│   ├── date-utils.ts
│   ├── store.ts
│   └── types.ts
├── public/
├── package.json
└── README.md
```

## Deployment

The app is production-ready for Vercel. After running `npm run build`, deploy with:

```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-ded20612
```

## License

MIT © 2024
