import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import Login from './components/Login'
import Register from './components/Register'

function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [file, setFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const uploadFile = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await fetch('https://api.x.ai/v1/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_XAI_API_KEY || 'YOUR_XAI_API_KEY'}`
      },
      body: formData
    })
    if (!response.ok) {
      throw new Error('File upload failed')
    }
    const data = await response.json()
    return data.id
  }

  const sendMessage = async () => {
    if (input.trim() || file) {
      const userMessage = { text: input, sender: 'user', file: file ? file.name : null }
      setMessages(prev => [...prev, userMessage])
      setInput('')
      setIsLoading(true)

      try {
        let fileId = null
        if (file) {
          fileId = await uploadFile(file)
          setFile(null)
        }

        const response = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_XAI_API_KEY || 'YOUR_XAI_API_KEY'}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'grok-2-1212',
            messages: [{ role: 'user', content: input, ...(fileId && { file_id: fileId }) }]
          })
        })

        if (!response.ok) {
          throw new Error('API request failed')
        }

        const data = await response.json()
        const aiResponse = data.choices[0].message.content
        setMessages(prev => [...prev, { text: aiResponse, sender: 'ai' }])
      } catch (error) {
        console.error('Error:', error)
        setMessages(prev => [...prev, { text: 'Sorry, there was an error processing your request.', sender: 'ai' }])
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-content">
          <h1>AI Assistant</h1>
          <p>Ask me anything</p>
        </div>
        <div className="header-nav">
          <Link to="/login" className="nav-link">Войти</Link>
          <Link to="/register" className="nav-link register">Регистрация</Link>
        </div>
      </div>

      <div className="messages-area">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <h2>Welcome to AI Chat</h2>
            <p>Start a conversation by typing a message below.</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              <div className="message-content">
                {msg.file && <div className="attached-file">📎 {msg.file}</div>}
                {msg.text}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="input-area">
        <div className="file-input-container">
          <input
            type="file"
            id="file-input"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            accept="image/*,text/*,.pdf"
          />
          <label htmlFor="file-input" className="file-button">
            📎
          </label>
          {file && <span className="file-name">{file.name}</span>}
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message here..."
          rows="1"
        />
        <button
          onClick={sendMessage}
          disabled={(!input.trim() && !file) || isLoading}
          className="send-button"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Chat />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  )
}

export default App