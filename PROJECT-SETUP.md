# Tennis App - Project Setup Instructions

## Folder Structure

```
tennis-app/
├── frontend/                 # React app
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API calls
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── backend/                  # Node/Express server
│   ├── src/
│   │   ├── routes/          # API route definitions
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── db/              # Database connection
│   │   └── app.js
│   ├── package.json
│   └── .env.example
├── database-schema.sql       # PostgreSQL schema
└── tennis-app-CLAUDE.md      # This file
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL installed locally
- npm or yarn

### Backend Setup

1. Create backend folder and install dependencies:
```bash
mkdir backend
cd backend
npm init -y
npm install express cors dotenv pg
npm install -D nodemon
```

2. Create PostgreSQL database:
```bash
createdb tennis_app
psql tennis_app < ../database-schema.sql
```

3. Create `.env` file in backend:
```
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/tennis_app
NODE_ENV=development
```

### Frontend Setup

1. Create React app with Vite:
```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install axios react-router-dom
```

## API Endpoints (Backend - Phase 1)

### Authentication
- `POST /api/auth/login` - Login with phone/email
- `POST /api/auth/register` - Register new player
- `DELETE /api/auth/account` - Delete account

### Players
- `GET /api/players/:id` - Get player profile
- `PUT /api/players/:id` - Update profile

### Matches
- `GET /api/matches` - Get all matches (with filters)
- `POST /api/matches` - Create new match
- `GET /api/matches/:id` - Get match details
- `DELETE /api/matches/:id` - Cancel match (organizer only)

### Match Registrations
- `POST /api/matches/:id/join` - Join a match (registered or waitlist)
- `DELETE /api/matches/:id/leave` - Remove self from match
- `GET /api/players/:id/matches` - Get player's matches

## Running the App

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

Then visit http://localhost:5173

## Next Steps

1. Set up the backend server with basic endpoints
2. Create database connection
3. Build login/register page
4. Build calendar view
5. Connect frontend to backend

Ask Claude Code to help with each step!
