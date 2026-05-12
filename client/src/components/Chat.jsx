/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import './Chat.css'

function Chat() {
  const { id: noteId } = useParams()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [files, setFiles] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [noteTitle, setNoteTitle] = useState('')

  useEffect(() => {
    if (noteId) {
      const savedNotes = JSON.parse(localStorage.getItem('notes') || '[]')
      const note = savedNotes.find(n => n.id === noteId)
      if (note) {
        setMessages(note.messages || [])
        setNoteTitle(note.title)
      }
    }
  }, [noteId])

  useEffect(() => {
    if (noteId && messages.length > 0) {
      const savedNotes = JSON.parse(localStorage.getItem('notes') || '[]')
      const updatedNotes = savedNotes.map(note =>
        note.id === noteId ? { ...note, messages } : note
      )
      localStorage.setItem('notes', JSON.stringify(updatedNotes))
    }
  }, [messages, noteId])

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    if (selectedFiles.length > 0) {
      setFiles(prev => [...prev, ...selectedFiles])
    }
  }

  const uploadFiles = async (files) => {
    const uploadPromises = files.map(async (file) => {
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
        throw new Error(`File upload failed for ${file.name}`)
      }
      const data = await response.json()
      return { id: data.id, name: file.name }
    })
    return Promise.all(uploadPromises)
  }

  const sendMessage = async () => {
    if (input.trim() || files.length > 0) {
      const fileNames = files.map(f => f.name)
      const userMessage = { text: input, sender: 'user', files: fileNames, timestamp: new Date().toISOString() }
      setMessages(prev => [...prev, userMessage])
      setInput('')
      const currentFiles = [...files]
      setFiles([])
      setIsLoading(true)

      try {
        let fileData = []
        if (currentFiles.length > 0) {
          fileData = await uploadFiles(currentFiles)
        }

        const messageContent = {
          role: 'user',
          content: input
        }

        // Add multiple file_ids if there are multiple files
        if (fileData.length > 0) {
          messageContent.file_ids = fileData.map(f => f.id)
        }

        const response = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_XAI_API_KEY || 'YOUR_XAI_API_KEY'}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'grok-2-1212',
            messages: [messageContent]
          })
        })

        if (!response.ok) {
          throw new Error('API request failed')
        }

        const data = await response.json()
        const aiResponse = data.choices[0].message.content
        setMessages(prev => [...prev, { text: aiResponse, sender: 'ai', timestamp: new Date().toISOString() }])
      } catch (error) {
        console.error('Error:', error)
        setMessages(prev => [...prev, { text: 'Sorry, there was an error processing your request.', sender: 'ai', timestamp: new Date().toISOString() }])
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
          <div className="header-icon">🤖</div>
          <div>
            <h1>{noteTitle || 'AI Assistant'}</h1>
            <p>Ask me anything</p>
          </div>
        </div>
      </div>

      <div className="chat-main">
        <div className="files-panel">
          <div className="files-header">
            <h3>Источники {files.length > 0 && `(${files.length})`}</h3>
          </div>
          <div className="files-content">
            <div className="file-upload-section">
              <input
                type="file"
                id="file-input"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept="image/*,text/*,.pdf"
                multiple
              />
              <label htmlFor="file-input" className="file-upload-button">
                <span className="upload-icon">📎</span>
                <span className="upload-text">Добавить файлы</span>
              </label>
            </div>

            {files.length > 0 && (
              <div className="attached-files-list">
                {files.map((file, index) => (
                  <div key={index} className="attached-file-info">
                    <div className="file-icon">📄</div>
                    <div className="file-details">
                      <div className="file-name-display">{file.name}</div>
                      <div className="file-size">{(file.size / 1024).toFixed(1)} KB</div>
                    </div>
                    <button
                      className="remove-file-btn"
                      onClick={() => {
                        setFiles(prev => prev.filter((_, i) => i !== index))
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="messages-section">
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
                    {msg.files && msg.files.length > 0 && (
                      <div className="attached-files">
                        {msg.files.map((fileName, fileIndex) => (
                          <div key={fileIndex} className="attached-file">📎 {fileName}</div>
                        ))}
                      </div>
                    )}
                    {msg.text}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="input-area">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              rows="1"
            />
            <button
              onClick={sendMessage}
              disabled={(!input.trim() && files.length === 0) || isLoading}
              className="send-button"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat