import os
import numpy as np
import pdfplumber
import faiss
from google import genai
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.utils import secure_filename

load_dotenv()

app = Flask(__name__)
app.secret_key = os.urandom(24)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024
os.makedirs('uploads', exist_ok=True)

CORS(app, supports_credentials=True)

# Initialize the new Gemini Client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL_ID = "gemini-3.1-flash-lite"
EMBED_MODEL = "text-embedding-005"

# In-memory storage (Note: clears on restart)
store = {}

# ── helpers ───────────────────────────────────────────────

def extract_text(filepath):
    text = ""
    try:
        with pdfplumber.open(filepath) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print(f"Extraction error: {e}")
    return text.strip()

def split_chunks(text, size=500, overlap=50):
    words = text.split()
    chunks, i = [], 0
    while i < len(words):
        chunks.append(" ".join(words[i:i + size]))
        i += size - overlap
    return chunks

EMBED_MODEL = "gemini-embedding-001"

def embed_texts(texts):
    response = client.models.embed_content(
        model=EMBED_MODEL,
        contents=texts
    )

    embeddings = [e.values for e in response.embeddings]
    return np.array(embeddings, dtype="float32")


def embed_query(query):
    response = client.models.embed_content(
        model=EMBED_MODEL,
        contents=[query]
    )

    vector = response.embeddings[0].values
    return np.array(vector, dtype="float32").reshape(1, -1)
def build_index(chunks):
    embeddings = embed_texts(chunks)
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings)
    return index

def search(index, chunks, query, top_k=3):
    query_vector = embed_query(query)
    distances, indices = index.search(query_vector, top_k)
    return [chunks[i] for i in indices[0] if i < len(chunks) and i != -1]

def ask_gemini(question, context_chunks):
    context = "\n\n---\n\n".join(context_chunks)
    prompt = (
        "You are a helpful assistant. Answer the question using ONLY the context below.\n"
        "If the answer is not in the context, say 'I couldn't find that in the document.'\n\n"
        f"Context:\n{context}\n\n"
        f"Question: {question}\n\n"
        "Answer:"
    )
    
    response = client.models.generate_content(
        model=MODEL_ID,
        contents=prompt
    )
    return response.text

# ── routes ────────────────────────────────────────────────

@app.route("/api/upload", methods=["POST"])
def upload():
    if 'pdf_file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['pdf_file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    try:
        text = extract_text(filepath)
        if not text:
            return jsonify({"error": "Could not extract text"}), 400

        chunks = split_chunks(text)
        faiss_index = build_index(chunks)

        # Use filename as a simple session key
        session['doc_id'] = filename
        store[filename] = {'chunks': chunks, 'index': faiss_index}

        return jsonify({"success": True, "doc_name": filename, "chunks": len(chunks)})
    finally:
        if os.path.exists(filepath):
            os.remove(filepath)

@app.route("/api/ask", methods=["POST"])
def ask():
    doc_id = session.get('doc_id')
    if not doc_id or doc_id not in store:
        return jsonify({"error": "No document loaded"}), 400

    data = request.get_json()
    question = data.get('question', '').strip()
    if not question:
        return jsonify({"error": "No question provided"}), 400

    doc = store[doc_id]
    relevant_chunks = search(doc['index'], doc['chunks'], question)
    answer = ask_gemini(question, relevant_chunks)

    return jsonify({"answer": answer})

@app.route("/api/reset", methods=["POST"])
def reset():
    doc_id = session.get('doc_id')
    if doc_id and doc_id in store:
        del store[doc_id]
    session.clear()
    return jsonify({"success": True})

if __name__ == "__main__":
    app.run(debug=True, port=5000)