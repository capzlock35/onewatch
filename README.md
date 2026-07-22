# Onewatch

Netflix-style streaming platform — frontend-only.

- **Frontend** — React 19 + TypeScript, Vite, TanStack Router, Zustand, Tailwind CSS v4, Shadcn/UI
- **Player** — Vidking iframe embed
- **Metadata** — TMDB API (called directly from the client)

## Project structure

```
project-root/
├── frontend/               React app
├── docker-compose.yml      Optional: run the frontend in a container
└── README.md
```

## Getting started

```bash
cd frontend
npm install
npm run dev
```

Then open http://localhost:5173.

Or run the frontend in Docker:

```bash
docker compose up -d        # serves the frontend on http://localhost:5173
```

## Environment

Frontend secrets live in `frontend/.env` (gitignored); `frontend/.env.example` documents the keys.

| Key                  | Where used        |
| -------------------- | ----------------- |
| `VITE_TMDB_API_KEY`  | Frontend → TMDB   |
| `VITE_TMDB_BASE_URL` | Frontend → TMDB   |

## Design

Dark Netflix-style UI. Accent `#e50914` (Netflix red), background `#141414`.
