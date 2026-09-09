# Campus Companion

An AI chatbot + voice assistant for college students, handling admissions,
registration, exams, and general campus queries. Uses a two-tier RAG setup:
exact FAQ matches when available, general campus-context reasoning as a
fallback — scoped only to the college itself, never open internet knowledge.

## Setup

### 1. Server

```bash
cd server
npm install
cp .env.example .env
# add your GEMINI_API_KEY to .env
```

Edit `data/faqs.json` and `data/campus-profile.json` with your real (or
sample) college data, then generate embeddings:

```bash
npm run embed
```

This creates `data/faqs-embedded.json` — regenerate it any time you edit
`faqs.json`.

Start the server:

```bash
npm start
```

Runs on `http://localhost:5000` by default.

### 2. Client

```bash
cd client
npm install
npm start
```

Runs on `http://localhost:3000` and talks to the server at
`http://localhost:5000` (override with `REACT_APP_API_URL` in a `.env`
file inside `client/` if needed).

## How the RAG pipeline works

1. User asks a question → embedded via Gemini's `text-embedding-004`
2. Compared (cosine similarity) against pre-embedded FAQs
3. If a confident match is found (score ≥ 0.75) → answer tagged by category
   (Admissions / Registration / Exams / Campus)
4. If not → Gemini reasons from `campus-profile.json` general context only,
   answer tagged "Campus info"
5. If neither source supports a confident answer → the assistant says so
   and points to the relevant contact, instead of guessing

See `server/services/buildPrompt.js` for the exact prompt logic.

## Next steps / ideas

- Move FAQ storage from JSON to Supabase + pgvector once the FAQ list grows
- Add a login/student-profile mockup
- Expand `campus-profile.json` with department-specific policies
- Add chat history persistence
