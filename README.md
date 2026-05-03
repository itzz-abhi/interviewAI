# InterviewAI

AI-powered mock interview platform: multi-round interviews (theory, resume-based, DSA-style questions, HR), automated scoring and feedback via **Groq**, optional **coding problems** with local run/submit, and **Google sign-in** (Firebase on the client, JWT session on the server).

## Features

- **Mock interviews** tailored to role, experience, resume text, and round type
- **Rounds**: theory (5 questions), resume-based non-tech (5), coding/DSA prompts (2), HR with time limits
- **Answer evaluation** with score, feedback, pass/fail hints, and round flow control
- **Final report** (overall score, grade, strengths, improvements, round-wise summary)
- **Interview history** stored per user in MongoDB
- **Coding page**: curated problems (e.g. Two Sum, Valid Parentheses) with Monaco editor; run/submit uses local toolchains when installed (`node`, `python`, `javac`/`java`, `gcc`/`g++`, `csc`)

## Tech stack

| Area | Stack |
|------|--------|
| Frontend | React 19, Vite 8, React Router 7, Redux Toolkit, Tailwind CSS 4, Framer Motion, Monaco Editor, Firebase Auth |
| Backend | Node.js, Express 5, MongoDB (Mongoose), JWT (httpOnly cookie), Groq (Llama 3.3) |
| AI | Groq API — question generation, evaluation, report |

## Repository layout

```
InterviewAI_Project/
├── interviewai-backend/    # Express API
├── interviewai-frontend/   # Vite + React SPA
└── README.md
```

## Prerequisites

- **Node.js** (LTS recommended)
- **MongoDB** (local or Atlas URI)
- **Groq API key** — [Groq Console](https://console.groq.com/)
- **Firebase** project with **Google** sign-in enabled (for the frontend)
- Optional (for full **coding** run/submit on the server): Node, Python, JDK, GCC/G++, .NET SDK — depending on languages you enable

## Environment variables

### Backend (`interviewai-backend/.env`)

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `PORT` | Server port (e.g. `5000`) |
| `JWT_SECRET` | Secret for signing JWT cookies |
| `GROQ_API_KEY` | Groq API key |
| `CLIENT_URL` | Frontend origin for CORS (e.g. `http://localhost:5173`) |

### Frontend (`interviewai-frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_SERVER_URL` | Backend base URL (e.g. `http://localhost:5000`) |
| `VITE_FIREBASE_APIKEY` | Firebase Web API key |

> Keep `.env` files **out of git**. This repo’s `.gitignore` already ignores `.env`.

## Setup

### 1. Clone and install

```bash
git clone https://github.com/itzz-abhi/interviewAI.git
cd interviewAI
```

**Backend**

```bash
cd interviewai-backend
npm install
```

Create `interviewai-backend/.env` with the variables above.

**Frontend**

```bash
cd ../interviewai-frontend
npm install
```

Create `interviewai-frontend/.env` with `VITE_*` variables.

### 2. Run locally

**Terminal 1 — API**

```bash
cd interviewai-backend
npm run dev
```

**Terminal 2 — SPA**

```bash
cd interviewai-frontend
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). Ensure `CLIENT_URL` matches that origin and `VITE_SERVER_URL` points at your API (including port).

### 3. Production build (frontend)

```bash
cd interviewai-frontend
npm run build
npm run preview   # optional local preview of dist/
```

## API overview (backend)

Base path: `/api`

| Prefix | Auth | Purpose |
|--------|------|---------|
| `/api/auth` | — | `POST /google` (body: user from Firebase), `POST /logout` |
| `/api/interview` | JWT cookie | Questions, evaluate, report, history, save |
| `/api/coding` | — | `POST /generate`, `/run`, `/submit` |

For authenticated routes, the browser must send cookies (`credentials: 'include'` from Axios/fetch).

## Scripts

| Package | Command | Description |
|---------|---------|-------------|
| Backend | `npm run dev` | Nodemon + `server.js` |
| Backend | `npm start` | Node `server.js` |
| Frontend | `npm run dev` | Vite dev server |
| Frontend | `npm run build` | Production build |
| Frontend | `npm run lint` | ESLint |

## License

Specify your license here if you add one (e.g. MIT).

---

**Author:** [@itzz-abhi](https://github.com/itzz-abhi)
