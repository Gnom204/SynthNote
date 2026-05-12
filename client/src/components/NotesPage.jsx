/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import NoteCard from './components/NoteCard'
import CreateNotePopup from './components/CreateNotePopup'
import './NotesPage.css'

function NotesPage() {
  const [notes, setNotes] = useState([])
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  useEffect(() => {
    const savedNotes = localStorage.getItem('notes')
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes))
    }
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
      messages: []
    }
    const updatedNotes = [...notes, newNote]
    saveNotes(updatedNotes)
    setIsPopupOpen(false)
  }

  const handleDeleteNote = (id) => {
    const updatedNotes = notes.filter(note => note.id !== id)
    saveNotes(updatedNotes)
  }

  return (
    <div className="notes-page">
      <div className="notes-header">
        <h1>Мои Конспекты</h1>
        <button className="create-note-btn" onClick={() => setIsPopupOpen(true)}>
          <span>+</span> Создать конспект
        </button>
      </div>
      <div className="notes-grid">
        {notes.map(note => (
          <Link key={note.id} to={`/chat/${note.id}`} className="note-link">
            <NoteCard note={note} onDelete={handleDeleteNote} />
          </Link>
        ))}
      </div>
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