import { useState } from 'react'
import UploadScreen from './components/UploadScreen'
import ChatScreen from './components/ChatScreen'

export default function App() {
  const [docName, setDocName] = useState(null)

  const handleUploaded = (name) => setDocName(name)

  const handleReset = async () => {
    await fetch('http://localhost:5000/api/reset', {
      method: 'POST',
      credentials: 'include'
    })
    setDocName(null)
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!docName
        ? <UploadScreen onUploaded={handleUploaded} />
        : <ChatScreen docName={docName} onReset={handleReset} />
      }
    </div>
  )
}