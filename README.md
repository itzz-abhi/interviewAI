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
| `CROSS_ORIGIN_COOKIES` | Set to `true` when the SPA and API use different hosts (e.g. Vercel + Render). Uses `SameSite=None` + `Secure` so JWT cookies work. Omit or `false` for local dev. |
| `NODE_ENV` | Use `production` on hosted APIs (sets secure cookies when not using cross-origin flag alone). |

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

## Deployment

Typical setup: **MongoDB Atlas** (database) + **Render** or **Railway** (Node API) + **Vercel** or **Netlify** (static frontend). All URLs must use **HTTPS** in production.

### 1. MongoDB Atlas

1. Create a cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Database Access: create a user; Network Access: allow `0.0.0.0/0` (or your host’s IPs) for a quick start.
3. Connect → Drivers → copy the URI and set `MONGODB_URI` on the backend (replace `<password>`).

### 2. Backend (example: Render Web Service)

1. Push this repo to GitHub.
2. [Render](https://render.com) → **New +** → **Web Service** → connect the repo.
3. **Root Directory:** `interviewai-backend`
4. **Build Command:** `npm install`
5. **Start Command:** `npm start`
6. **Environment** (example):

   | Key | Value |
   |-----|--------|
   | `MONGODB_URI` | Atlas connection string |
   | `PORT` | Render sets `PORT` automatically — use `process.env.PORT` (already in code). |
   | `JWT_SECRET` | Long random string |
   | `GROQ_API_KEY` | From Groq |
   | `CLIENT_URL` | Your **frontend** URL, e.g. `https://your-app.vercel.app` (no trailing slash) |
   | `NODE_ENV` | `production` |
   | `CROSS_ORIGIN_COOKIES` | `true` if frontend is on a **different domain** than the API (e.g. Vercel + Render) |

7. Deploy and copy the service URL, e.g. `https://interviewai-api.onrender.com`.

**Note:** The coding “run/submit” features expect compilers/runtimes (`node`, `python`, `javac`, `gcc`, etc.) on the server. Default Render images may not include all of them; only **Node** is guaranteed. For full judge support you’d need a custom Docker image or a dedicated runner.

**Cold starts:** Free Render tiers spin down after idle; first request can be slow.

### 3. Frontend (example: Vercel)

1. [Vercel](https://vercel.com) → **Add New** → **Project** → import the repo.
2. **Root Directory:** `interviewai-frontend`
3. **Framework Preset:** Vite  
4. **Environment Variables:**

   | Key | Value |
   |-----|--------|
   | `VITE_SERVER_URL` | Backend URL, e.g. `https://interviewai-api.onrender.com` (no `/api` suffix) |
   | `VITE_FIREBASE_APIKEY` | Same as local Firebase Web API key |

5. Deploy and open the production URL.

### 4. Firebase (Google sign-in)

In [Firebase Console](https://console.firebase.google.com) → **Authentication** → **Settings** → **Authorized domains**, add:

- Your Vercel domain (e.g. `your-app.vercel.app`)
- Custom domain if you use one

### 5. CORS and cookies checklist

- `CLIENT_URL` on the server must **exactly** match the browser origin of the SPA (scheme + host + port if any).
- If frontend and backend are on **different** registrable domains, set `CROSS_ORIGIN_COOKIES=true` on the API (see table above).
- All interview/auth Axios calls already use `withCredentials: true` where needed.

### 6. After deploy

```bash
# Rebuild frontend if you change VITE_* only — trigger redeploy on Vercel
# Backend: change env on Render → Manual Deploy
```

## License

Specify your license here if you add one (e.g. MIT).

---

**Author:** [@itzz-abhi](https://github.com/itzz-abhi)
