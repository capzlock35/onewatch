# Frontend

React 19 + TypeScript + Vite + TanStack Router + Zustand + Tailwind CSS v4 + Shadcn-style UI.

## Develop

```bash
npm install
npm run dev
```

Visit http://localhost:5173.

## Env

Copy `.env.example` to `.env` and set:

- `VITE_TMDB_API_KEY` — TMDB v3 API key
- `VITE_TMDB_BASE_URL` — `https://api.themoviedb.org/3`

## Structure

```
src/
├── app/routes/         File-based TanStack routes
├── pages/              Page components (loaded by routes)
├── components/
│   ├── ui/             Shadcn-style primitives
│   ├── shared/         Cross-cutting (PlayerModal, ProtectedRoute)
│   ├── layout/         Navbar, Footer
│   ├── movie/          MovieCard, MovieRow, HeroBanner
│   └── tv/             EpisodeSelector
├── services/           TMDB clients (movie, tv, search, discover, …)
├── store/              Zustand stores (auth, movie, watchlist, player, theme)
├── hooks/              Custom hooks
├── lib/                utils, tmdb helpers
├── types/              Shared TS types
└── main.tsx            Entry — RouterProvider + StrictMode
```
