# Document Q&A — RAG Chatbot

A full-stack AI-powered chatbot that lets you upload any PDF and ask questions about it in plain English. Built with a Python Flask REST API backend and a React frontend, using Google Gemini for embeddings and answers, and FAISS for vector search.

![Python](https://img.shields.io/badge/Python-3.10+-blue) ![React](https://img.shields.io/badge/React-18-61DAFB) ![Flask](https://img.shields.io/badge/Flask-3.x-black) ![Gemini](https://img.shields.io/badge/Gemini-API-orange)

---

## What it does

- Upload any PDF — research papers, contracts, reports, dissertations
- The document is split into chunks and embedded into a FAISS vector index
- Ask questions in natural language via a chat interface
- The app finds the most relevant chunks from your document and sends them to Gemini
- Answers are grounded in your document — no hallucination, no guessing

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Axios |
| Backend | Python, Flask, Flask-CORS |
| AI / LLM | Google Gemini 1.5 Flash |
| Embeddings | Google text-embedding-004 |
| Vector search | FAISS (faiss-cpu) |
| PDF parsing | pdfplumber |

---

## Project structure

```
rag-chatbot/
├── backend/
│   ├── app.py               # Flask REST API
│   ├── .env                 # API key (not committed)
│   ├── requirements.txt
│   └── uploads/             # Temp PDF storage (auto-created)
└── frontend/
    ├── package.json
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        └── components/
            ├── UploadScreen.jsx
            ├── ChatScreen.jsx
            └── Message.jsx
```

---

## Getting started

### Prerequisites

- Python 3.10+
- Node.js 18+ and npm
- A free Gemini API key from [aistudio.google.com](https://aistudio.google.com)

---

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/rag-chatbot.git
cd rag-chatbot
```

---

### 2. Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file inside `backend/`:

```
GEMINI_API_KEY=your_key_here
```

Start the Flask server:

```bash
python app.py
# Running on http://localhost:5000
```

---

### 3. Frontend setup

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## How it works

### Phase 1 — Ingestion (runs once on upload)

```
PDF → extract text → split into chunks → embed with Gemini → store in FAISS index
```

### Phase 2 — Query (runs on every question)

```
User question → embed question → search FAISS → retrieve top 3 chunks → send to Gemini → answer
```

The key idea is **Retrieval Augmented Generation (RAG)** — instead of sending the entire document to the AI (which is slow and expensive), we find only the most relevant pieces first, then ask the AI to answer from those pieces only.

---

## API endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/upload` | Upload a PDF, build FAISS index |
| `POST` | `/api/ask` | Ask a question, get an answer |
| `POST` | `/api/reset` | Clear the current document session |

### Example — upload

```bash
curl -X POST http://localhost:5000/api/upload \
  -F "pdf_file=@your_document.pdf"
```

Response:
```json
{
  "success": true,
  "doc_name": "your_document.pdf",
  "chunks": 42
}
```

### Example — ask

```bash
curl -X POST http://localhost:5000/api/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the main conclusion of this paper?"}'
```

Response:
```json
{
  "answer": "The main conclusion is..."
}
```

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Free API key from Google AI Studio |

---

## Limitations

- Document index is stored in memory — it resets if the server restarts
- One document per session at a time
- PDF must contain selectable text (scanned image PDFs are not supported)
- Max file size: 10MB

---

## Roadmap

- [ ] Persist FAISS index to disk so documents survive server restarts
- [ ] Support multiple documents simultaneously
- [ ] Show source citations — which part of the document each answer came from
- [ ] Support `.docx` and `.txt` files in addition to PDF
- [ ] Conversation history so follow-up questions work naturally
- [ ] Deploy backend to Render, frontend to Vercel

---

## Running in production

### Backend — Render (free)

```bash
# Procfile (already included)
web: gunicorn app:app
```

Push to GitHub and connect to [render.com](https://render.com). Add `GEMINI_API_KEY` as an environment variable in the Render dashboard.

### Frontend — Vercel (free)

Update the API base URL in your React components from `http://localhost:5000` to your Render backend URL, then:

```bash
npm run build
```

Push to GitHub and connect to [vercel.com](https://vercel.com). Deploys automatically on every push.

---

## Skills demonstrated

- **RAG architecture** — retrieval augmented generation pipeline
- **Vector embeddings** — semantic search with FAISS
- **REST API design** — Flask backend with clean JSON endpoints
- **React** — component-based UI with state management and async API calls
- **Full-stack separation** — independent frontend and backend services
- **PDF processing** — text extraction and chunking

---

## License

MIT
