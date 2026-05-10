export default function Message({ role, text }) {
  const isUser = role === 'user'

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '12px'
    }}>
      {!isUser && (
        <div style={styles.avatar}>AI</div>
      )}
      <div style={{
        ...styles.bubble,
        background: isUser ? '#5B4FD3' : 'white',
        color: isUser ? 'white' : '#222',
        borderBottomRightRadius: isUser ? '4px' : '12px',
        borderBottomLeftRadius: isUser ? '12px' : '4px',
        border: isUser ? 'none' : '1px solid #e5e5e5',
        marginLeft: isUser ? '0' : '8px',
        marginRight: isUser ? '0' : '0',
      }}>
        {text}
      </div>
    </div>
  )
}

const styles = {
  avatar: {
    width: '32px', height: '32px', borderRadius: '50%',
    background: '#eeedfe', color: '#5B4FD3', fontSize: '0.7rem',
    fontWeight: 700, display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexShrink: 0, alignSelf: 'flex-end'
  },
  bubble: {
    maxWidth: '75%', padding: '12px 16px',
    borderRadius: '12px', lineHeight: 1.6,
    fontSize: '0.95rem', whiteSpace: 'pre-wrap'
  }
}