import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import Message from './Message'

export default function ChatScreen({ docName, onReset }) {
  const [messages, setMessages] = useState([
    { role: 'bot', text: `Document loaded: ${docName}\n\nAsk me anything about it.` }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendQuestion = async () => {
    const question = input.trim()
    if (!question || loading) return

    setMessages(prev => [...prev, { role: 'user', text: question }])
    setInput('')
    setLoading(true)

    try {
      const res = await axios.post(
        'http://localhost:5000/api/ask',
        { question },
        { withCredentials: true }
      )
      setMessages(prev => [...prev, { role: 'bot', text: res.data.answer }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'bot',
        text: 'Something went wrong. Please try again.'
      }])
    }

    setLoading(false)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendQuestion()
    }
  }

  return (
    <div style={styles.wrapper}>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <span style={styles.headerTitle}>Document Q&A</span>
          <span style={styles.headerDoc}>{docName}</span>
        </div>
        <button onClick={onReset} style={styles.resetBtn}>
          Upload new document
        </button>
      </div>

      {/* Messages */}
      <div style={styles.messages}>
        {messages.map((msg, i) => (
          <Message key={i} role={msg.role} text={msg.text} />
        ))}
        {loading && (
          <Message role="bot" text="Searching document..." />
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={styles.inputArea}>
        <div style={styles.inputRow}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask a question about your document..."
            rows={1}
            style={styles.textarea}
            disabled={loading}
          />
          <button
            onClick={sendQuestion}
            disabled={!input.trim() || loading}
            style={{
              ...styles.sendBtn,
              opacity: (!input.trim() || loading) ? 0.5 : 1,
              cursor: (!input.trim() || loading) ? 'not-allowed' : 'pointer'
            }}
          >
            Send
          </button>
        </div>
        <p style={styles.hint}>Press Enter to send · Shift+Enter for new line</p>
      </div>

    </div>
  )
}

const styles = {
  wrapper: {
    display: 'flex', flexDirection: 'column', height: '100vh', background: '#f5f5f5'
  },
  header: {
    background: '#5B4FD3', color: 'white', padding: '14px 24px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
  },
  headerTitle: { fontWeight: 600, fontSize: '1rem' },
  headerDoc: {
    marginLeft: '10px', opacity: 0.75, fontSize: '0.85rem', fontWeight: 400
  },
  resetBtn: {
    background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
    color: 'white', padding: '6px 14px', borderRadius: '6px',
    fontSize: '0.85rem', cursor: 'pointer'
  },
  messages: {
    flex: 1, overflowY: 'auto', padding: '24px',
    maxWidth: '800px', width: '100%', margin: '0 auto', alignSelf: 'stretch'
  },
  inputArea: {
    background: 'white', borderTop: '1px solid #e5e5e5',
    padding: '16px 24px'
  },
  inputRow: {
    display: 'flex', gap: '10px', maxWidth: '800px', margin: '0 auto'
  },
  textarea: {
    flex: 1, padding: '10px 14px', border: '1.5px solid #ddd',
    borderRadius: '8px', fontSize: '0.95rem', resize: 'none',
    fontFamily: 'system-ui, sans-serif', outline: 'none', lineHeight: 1.5
  },
  sendBtn: {
    background: '#5B4FD3', color: 'white', border: 'none',
    padding: '10px 22px', borderRadius: '8px', fontSize: '0.95rem',
    fontWeight: 500, alignSelf: 'flex-end'
  },
  hint: { color: '#bbb', fontSize: '0.78rem', marginTop: '8px', textAlign: 'center' }
}