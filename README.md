# Spelling Bee

A modular, full-stack NYT Spelling Bee clone built with the MERN stack and TypeScript.

## Overview

Spelling Bee is a word puzzle game where players form words from a set of seven letters. One letter is the "center" letter that must be used in every word. Words must be at least 4 letters long, and letters can be reused. A special "pangram" uses all seven letters and earns bonus points.

## Features

- **Daily Puzzle** — One global puzzle per day, same for all players (resets at 8 AM UTC)
- **Practice Mode** — Generate additional puzzles (1/day for free users, 10/day for paid)
- **Scoring System** — 4-letter words = 1 point, longer words = 1 point per letter, pangrams = length + 7 bonus
- **Leaderboards** — Daily, weekly, and all-time rankings
- **Friend System** — Add friends, compare scores, send invites
- **Authentication** — Powered by Clerk
- **Three Difficulty Levels** — Easy (50), Medium (60), Hard (70) word lists from SCOWL

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS v4, Zustand |
| Backend | Express 5, TypeScript, Mongoose |
| Database | MongoDB (Atlas) |
| Auth | Clerk |
| Monorepo | Turborepo, npm workspaces |
| Validation | Zod (shared SSOT) |
| Testing | Vitest, React Testing Library |

## Project Structure

```
spelling-bee/
├── packages/
│   ├── shared/           # Types, Zod schemas, utilities (SSOT)
│   ├── server/           # Express API server
│   └── client/           # React + Vite frontend
├── scripts/              # Build tools (dictionary generation)
├── Dockerfile            # Multi-stage production build
├── docker-compose.yml    # Production deployment
├── turbo.json            # Turborepo configuration
└── tsconfig.base.json    # Shared TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- MongoDB Atlas account (or local MongoDB)
- Clerk account (for authentication)

### Installation

```bash
# Clone the repository
git clone https://github.com/BDubDesigns/spelling-bee.git
cd spelling-bee

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Clerk and MongoDB credentials

# Start development servers
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Clerk (server)
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# MongoDB
MONGODB_URI=mongodb+srv://...

# Server
PORT=3000
```

Create a `packages/client/.env` file:

```env
# Clerk (client)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

## Development

```bash
# Start all services in development mode
npm run dev

# Run type checking across all packages
npm run typecheck

# Run linting across all packages
npm run lint

# Run tests across all packages
npm run test

# Build all packages
npm run build
```

## Deployment

### Docker (Recommended)

The application is designed to be deployed as a single Docker container:

```bash
# Build and run with Docker Compose
docker compose up --build
```

### Coolify (Self-hosted)

For production deployment on a VPS with Coolify:

1. Push to your Git repository
2. Connect Coolify to your repository
3. Set the following environment variables in Coolify:
   - `CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `MONGODB_URI`
4. Deploy

### Manual Deployment

```bash
# Build all packages
npm run build

# Start the production server
NODE_ENV=production node packages/server/dist/index.js
```

## Architecture

The codebase follows a strict layered architecture:

- **Routes** — HTTP endpoint definitions and middleware attachment
- **Controllers** — Request/response handling and payload extraction
- **Services** — Core business logic (called by controllers)
- **Models** — Mongoose schemas and database interactions

Shared logic (types, validation, utilities) lives in the `shared` package and is imported by both server and client, ensuring a single source of truth.

## Dictionary

The word list is generated from [SCOWL](https://github.com/en-wl/wordlist) (Spell Checker Oriented Word Lists) at three sizes:

- **Size 50 (Easy)** — 60,954 common words
- **Size 60 (Medium)** — 78,351 standard words (default)
- **Size 70 (Hard)** — 126,398 words including less common ones

The dictionaries are committed to the repository for reproducibility. To regenerate:

```bash
# Clone SCOWL to c:\opencode\scowl\
# Then run the build script
python -X utf8 scripts/generate-dictionaries.py
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/puzzle/today` | Get today's daily puzzle |
| GET | `/api/puzzle/:id` | Get a specific puzzle |
| POST | `/api/puzzle/generate` | Generate a practice puzzle |
| POST | `/api/puzzle/submit` | Submit a word for validation |
| GET | `/api/leaderboard/:timeframe` | Get leaderboard (daily/weekly/allTime) |
| GET | `/api/social/friends` | Get user's friends list |
| GET | `/api/social/requests` | Get pending friend requests |
| POST | `/api/social/request` | Send a friend request |
| POST | `/api/social/respond` | Accept/decline a friend request |

## License

MIT
