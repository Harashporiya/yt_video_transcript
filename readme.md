# YouTube Transcripter — AI-Powered Video Learning

Ever found yourself scrubbing through a 2-hour YouTube video just to find one specific answer? That's exactly why this was built.

A full-stack AI tool that pulls transcripts from any YouTube video, generates smart summaries, opens up a chat window powered by RAG, and even generates interview practice questions — like ChatGPT, but locked to that specific video.

![Landing Page](./frontend/public/home.png)

---

## ⚡ What It Does

- **Smart Transcript Extraction** — First tries official/auto-generated YouTube subtitles. Falls back to Apify scraper if YouTube blocks the request.
- **Interactive Video Q&A (RAG)** — Chunks the transcript, embeds it into Pinecone via HuggingFace, and uses Groq (Llama 3.3) to answer questions with precise context.
- **LangGraph Conditional Retrieval** — Intelligently decides whether a query needs Pinecone vector search or can be handled as a simple conversational response (greetings, identity questions, etc.) — skipping unnecessary DB calls.
- **Clean Summary & Key Takeaways** — Structured summaries so you can understand a video's core content in under 30 seconds.
- **Interview Preparation** — Generates practice questions (Easy, Medium, Hard) based on video content.
- **Payments with Razorpay** — Pro plan subscription with Monthly (₹199) and Yearly (₹999) tiers, secured via Razorpay webhooks.
- **Per-Plan Usage Limits** — Free: 1 video / 3 chats. Pro Monthly: 5 videos / 15 chats. Pro Yearly: 30 videos / 35 chats.
- **Premium Dark Mode UI** — Minimal black aesthetic, smooth animations, glassmorphism input boxes, real-time AI status indicators.

---

## 🛠️ Tech Stack

### Frontend
| Tech | Purpose |
|------|---------|
| Next.js 15 + React 19 | Framework |
| Tailwind CSS v4 | Styling + dark theme |
| NextAuth.js | Google OAuth authentication |
| Redux Toolkit | Global state (videos, payment) |
| Phosphor Icons + Lucide | Icon sets |

### Backend
| Tech | Purpose |
|------|---------|
| Node.js + Express 5 | API server |
| PostgreSQL (Neon) + Prisma 7 | Database + ORM |
| Groq API (`llama-3.3-70b-versatile`) | LLM for chat & summaries |
| HuggingFace (`BAAI/bge-small-en-v1.5`) | 384-dim text embeddings |
| Pinecone | Vector store for RAG |
| LangChain + LangGraph | AI orchestration + conditional routing |
| Razorpay | Payment gateway |
| Apify Client | Transcript fallback scraper |
| youtubei.js | Video metadata (title, thumbnail) |

---

## 🏗️ Architecture Pipeline

```
User pastes YouTube URL
        ↓
Backend fetches Video Info (title, thumbnail) via youtubei.js
        ↓
Transcript extracted (youtube-transcript → Apify fallback)
        ↓
Transcript split into chunks (RecursiveCharacterTextSplitter)
        ↓
Chunks embedded via HuggingFace (BAAI/bge-small-en-v1.5)
        ↓
Vectors stored in Pinecone (namespace = userId-videoId)
        ↓
Summary generated via Groq LLM (llama-3.3-70b-versatile)
        ↓
Video + Summary saved to PostgreSQL via Prisma
        ↓
Frontend shows chat interface ← User asks questions
        ↓
LangGraph node: Is this a simple greeting/conversational query?
   ├── YES → Answer directly (no vector search)
   └── NO  → Embed question → Pinecone similarity search → Top 5 chunks
        ↓
Groq LLM answers with context (RAG)
```

### Payment Flow

```
User clicks Upgrade → Frontend calls /api/payment/create-order
        ↓
Backend creates Razorpay order → Returns order ID to frontend
        ↓
Razorpay checkout modal opens (frontend)
        ↓
User pays → Razorpay fires webhook → /api/payment/webhook
        ↓
Backend verifies signature → Updates user plan in PostgreSQL
        ↓
User's video/chat limits upgrade immediately
```

---

## 💳 Pricing Plans

| Feature | Free | Pro Monthly | Pro Yearly |
|---------|------|-------------|------------|
| Price | ₹0 | ₹199/month | ₹999/year |
| Videos | 1 total | 5 / month | 30 / year |
| Chat messages | 3 / video | 15 / video | 35 / video |
| AI Summary | ✓ | ✓ | ✓ |
| Interview Questions | ✓ | ✓ | ✓ |
| Priority support | ✗ | ✓ | ✓ |
| Early features | ✗ | ✗ | ✓ |

> Payments secured by Razorpay · No card stored · Cancel anytime

---

## 🗂️ Project Structure

```
yt/
├── backend/
│   ├── controllers/       # Route handlers (auth, youtube, payment)
│   ├── routes/            # Express route definitions
│   ├── services/          # Business logic (RAG, LangGraph, payment)
│   ├── middlewares.js      # JWT auth middleware
│   ├── lib/               # Shared clients (Prisma, Pinecone)
│   ├── utils/             # Helper functions
│   ├── prisma/
│   │   ├── schema.prisma  # DB schema (User, Video, ChatMessage, etc.)
│   │   └── migrations/
│   ├── prisma.config.ts   # Prisma 7 datasource config (DATABASE_URL here)
│   └── index.js           # Express app entry point
│
└── frontend/
    ├── src/
    │   ├── app/           # Next.js App Router pages
    │   ├── components/    # UI components (sidebar, chat, processor)
    │   ├── store/         # Redux store + slices (videoSlice, paymentSlice)
    │   ├── hooks/         # Custom hooks (usePlanStatus, use-mobile)
    │   └── lib/           # Utilities (utils.ts)
    └── public/
```

---

## 🚀 Running Locally

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:

```env
PORT=3001
DATABASE_URL="postgresql://user:password@host:5432/db_name?sslmode=require"
JWT_SECRET="your_custom_jwt_secret"
GROQ_API_KEY="your_groq_api_key"
HUGGINGFACE_API_KEY="your_huggingface_api_key"
PINECONE_API_KEY="your_pinecone_api_key"
APIFY_API_TOKEN="your_apify_api_token"
RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
RAZORPAY_WEBHOOK_SECRET="your_razorpay_webhook_secret"
LOCAL_FRONTEND_URL="http://localhost:3000"
FRONTEND_DEPLOY_URL="https://your-production-app.vercel.app"
```

Push DB schema and start:

```bash
npx prisma db push
npx prisma generate
npm run dev
```

Backend runs at `http://localhost:3001`.

> **Note (Prisma 7.x):** The `DATABASE_URL` is configured in `prisma.config.ts` — NOT in `schema.prisma`. If you see a Prisma config error on deploy, this is why.

---

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` folder:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_RAZORPAY_KEY_ID="your_razorpay_key_id"
GOOGLE_CLIENT_ID="your_google_oauth_client_id"
GOOGLE_CLIENT_SECRET="your_google_oauth_client_secret"
NEXTAUTH_SECRET="your_nextauth_secret_key"
NEXTAUTH_URL="http://localhost:3000"
```

Start the dev server:

```bash
npm run dev
```

Open `http://localhost:3000` and you're good to go!

---

## 🚢 Deployment

- **Frontend:** Deploy on [Vercel](https://vercel.com) — connect your GitHub repo and set env variables in Vercel dashboard.
- **Backend:** Deploy on [Render](https://render.com) or [Railway](https://railway.app). Set all `.env` variables in the platform dashboard.

### Important Notes

> **Pinecone:** The index must have **384 dimensions** to match the `BAAI/bge-small-en-v1.5` embedding model.

> **Razorpay Webhook:** Set the webhook URL in Razorpay Dashboard to `https://your-backend.onrender.com/api/payment/webhook`. The secret must match `RAZORPAY_WEBHOOK_SECRET`.

> **CORS:** Make sure `LOCAL_FRONTEND_URL` and `FRONTEND_DEPLOY_URL` in backend `.env` match exactly where your frontend is running, including protocol (`https://`).

> **Prisma 7 on Render:** The build command `npm install` runs `npx prisma generate` via `postinstall`. Prisma 7 reads `DATABASE_URL` from `prisma.config.ts` — make sure `DATABASE_URL` is set as an environment variable on Render.
