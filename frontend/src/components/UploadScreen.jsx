import { useState } from 'react'
import axios from 'axios'

export default function UploadScreen({ onUploaded }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [file, setFile] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('pdf_file', file)

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/upload`,

        formData,
        { withCredentials: true }
      )
      onUploaded(res.data.doc_name)
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Document Q&A</h1>
        <p style={styles.sub}>
          Upload any PDF and ask questions about it in plain English.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={styles.dropzone}>
            <input
              type="file"
              accept=".pdf"
              onChange={e => setFile(e.target.files[0])}
              style={styles.fileInput}
              id="file-input"
            />
            <label htmlFor="file-input" style={styles.dropLabel}>
              {file ? (
                <span style={{ color: '#5B4FD3', fontWeight: 500 }}>
                  {file.name}
                </span>
              ) : (
                <>
                  <span style={styles.dropIcon}>📄</span>
                  <span>Click to select a PDF</span>
                  <span style={styles.dropSub}>Max 10MB</span>
                </>
              )}
            </label>
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button
            type="submit"
            disabled={!file || loading}
            style={{
              ...styles.button,
              opacity: (!file || loading) ? 0.6 : 1,
              cursor: (!file || loading) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Processing document...' : 'Upload and start chatting →'}
          </button>

          {loading && (
            <p style={styles.loadingNote}>
              Building your document index — this takes 15–30 seconds
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flex: 1, background: '#f5f5f5', padding: '20px'
  },
  card: {
    background: 'white', borderRadius: '16px', padding: '40px',
    width: '100%', maxWidth: '500px', boxShadow: '0 2px 20px rgba(0,0,0,0.08)'
  },
  title: { fontSize: '1.8rem', fontWeight: 700, margin: '0 0 8px', color: '#111' },
  sub: { color: '#666', marginBottom: '32px', lineHeight: 1.5 },
  dropzone: { marginBottom: '20px' },
  fileInput: { display: 'none' },
  dropLabel: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: '8px', padding: '32px',
    border: '2px dashed #ddd', borderRadius: '10px', cursor: 'pointer',
    color: '#888', fontSize: '0.95rem', transition: 'border-color 0.2s',
    minHeight: '120px'
  },
  dropIcon: { fontSize: '2rem' },
  dropSub: { fontSize: '0.8rem', color: '#bbb' },
  button: {
    width: '100%', padding: '13px', background: '#5B4FD3', color: 'white',
    border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 500,
    transition: 'background 0.2s'
  },
  loadingNote: {
    textAlign: 'center', color: '#888', fontSize: '0.85rem', marginTop: '12px'
  },
  error: { color: '#e53e3e', fontSize: '0.9rem', marginBottom: '12px' }
}