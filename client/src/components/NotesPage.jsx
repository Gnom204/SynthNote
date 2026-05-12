/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import NoteCard from './NoteCard'
import CreateNotePopup from './CreateNotePopup'
import './NotesPage.css'

function NotesPage() {
  const [notes, setNotes] = useState([])
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedNotes = localStorage.getItem('notes')
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes))
    }
    // Simulate loading
    setTimeout(() => setIsLoading(false), 300)
  }, [])

  const saveNotes = (newNotes) => {
    setNotes(newNotes)
    localStorage.setItem('notes', JSON.stringify(newNotes))
  }

  const handleCreateNote = (title, image) => {
    const newNote = {
      id: Date.now().toString(),
      title,
      image,
      messages: [],
      createdAt: new Date().toISOString()
    }
    const updatedNotes = [newNote, ...notes] // Add new note to the beginning
    saveNotes(updatedNotes)
    setIsPopupOpen(false)
  }

  const handleDeleteNote = (id) => {
    const updatedNotes = notes.filter(note => note.id !== id)
    saveNotes(updatedNotes)
  }

  if (isLoading) {
    return (
      <div className="notes-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Загрузка конспектов...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="notes-page">
      <div className="notes-header">
        <div className="header-content">
          <h1>Мои Конспекты</h1>
          <p className="header-subtitle">
            {notes.length === 0 ? 'Создайте свой первый конспект' : `${notes.length} конспект${notes.length === 1 ? '' : notes.length < 5 ? 'а' : 'ов'}`}
          </p>
        </div>
        <button className="create-note-btn" onClick={() => setIsPopupOpen(true)}>
          <span className="plus-icon">+</span>
          <span className="btn-text">Создать конспект</span>
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h2>У вас пока нет конспектов</h2>
          <p>Начните с создания первого конспекта для организации ваших идей</p>
          <button className="create-first-note-btn" onClick={() => setIsPopupOpen(true)}>
            <span className="plus-icon">+</span>
            Создать первый конспект
          </button>
        </div>
      ) : (
        <div className="notes-grid">
          {notes.map((note, index) => (
            <Link
              key={note.id}
              to={`/chat/${note.id}`}
              className="note-link"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <NoteCard note={note} onDelete={handleDeleteNote} />
            </Link>
          ))}
        </div>
      )}

      {isPopupOpen && (
        <CreateNotePopup
          onClose={() => setIsPopupOpen(false)}
          onCreate={handleCreateNote}
        />
      )}
    </div>
  )
}

export default NotesPage