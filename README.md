# MYIOI Vote Collect

A complete GitHub-backed online voting system demo with login, poll creation, user voting, admin results, and owner-managed permissions.

## Features

- Login and registration
- Roles: owner / admin / user
- Owner and admin can create and manage polls
- Users can vote once per poll
- Results visible to admins and owner
- GitHub OAuth endpoints prepared for real GitHub integration
- Local SQLite database for quick development
- Ready to deploy to Vercel + Render/Railway

## Quick start

### 1) Install dependencies

```bash
npm install
```

### 2) Start local app

```bash
npm run dev
```

This launches:
- API: http://localhost:4000
- Web: http://localhost:3000

### 3) Demo accounts

The app seeds demo users automatically:

- owner / password123
- admin / password123
- user / password123

## API endpoints

### Auth

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "alice",
  "password": "secret123",
  "role": "user"
}
```

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "alice",
  "password": "secret123"
}
```

```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Polls

```http
GET /api/polls
Authorization: Bearer <token>
```

```http
POST /api/polls
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Team lunch vote",
  "description": "Choose the preferred lunch spot.",
  "options": ["Pizza", "Sushi", "Thai"]
}
```

```http
POST /api/polls/:id/vote
Authorization: Bearer <token>
Content-Type: application/json

{
  "optionId": "..."
}
```

```http
GET /api/polls/:id/results
Authorization: Bearer <token>
```

## Environment variables

Create `.env` or use `.env.example` with:

```env
PORT=4000
JWT_SECRET=change-me-in-production
DATABASE_PATH=./data/vote.db
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_REDIRECT_URI=http://localhost:4000/api/auth/github/callback
```

## GitHub OAuth

The app includes GitHub OAuth placeholder routes:

- GET /api/auth/github-url
- GET /api/auth/github/callback

To make them real, add a GitHub OAuth App and fill in `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and `GITHUB_REDIRECT_URI`.

## Deployment

Recommended setup:

- Frontend: Vercel
- Backend: Render or Railway
- Database: Postgres in production

Local development uses SQLite by default for convenience. For production, set `DATABASE_URL` and swap to a Postgres-backed database layer if needed.

## License

MIT
