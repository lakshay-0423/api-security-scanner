# API Security Scanner

A professional API security scanning tool with a cybersecurity-themed dashboard.

## Tech Stack

- **Frontend:** React (Vite), React Router, Tailwind CSS, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Auth:** JWT + bcryptjs

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
npm run dev
```

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

### Environment Variables

Create `server/.env` based on `server/.env.example`:

| Variable     | Description                          |
|-------------|--------------------------------------|
| PORT        | Server port (default: 5000)          |
| MONGO_URI   | MongoDB connection string            |
| JWT_SECRET  | Secret key for JWT signing           |
| CLIENT_URL  | Frontend URL (default: http://localhost:5173) |

## Project Structure

```
api-security-scanner/
├── client/          # React frontend
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       └── services/
└── server/          # Express backend
    ├── config/
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    └── utils/
```

## License

MIT
