# Badminton Tournament Manager

A modern web application for managing team-based badminton tournaments.

## Features

- Team Builder with drag & drop
- Team Dashboard
- Round Manager
- Match Scoring
- Tournament Standings

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB database (local or MongoDB Atlas)

### Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure MongoDB:**
   - Copy `.env.example` to `.env.local`
   - Add your MongoDB connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
   ```
   Or for local MongoDB:
   ```
   MONGODB_URI=mongodb://localhost:27017/badminton-tournament
   ```

3. **Start the development server:**
```bash
npm run dev
```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- MongoDB with Mongoose
- Zustand (state management)
- HTML5 Drag & Drop API

## API Routes

- `GET /api/players` - Fetch all players
- `POST /api/players` - Create/update players
- `GET /api/teams` - Fetch all teams
- `POST /api/teams` - Create team
- `PUT /api/teams` - Update team
- `GET /api/rounds` - Fetch all rounds
- `POST /api/rounds` - Create round
- `PUT /api/rounds` - Update round

