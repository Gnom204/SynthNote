import './NoteCard.css'

function NoteCard({ note, onDelete }) {
  const handleDelete = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onDelete(note.id)
  }

  return (
    <div className="note-card">
      {note.image && <img src={note.image} alt={note.title} className="note-image" />}
      <div className="note-content">
        <h3 className="note-title">{note.title}</h3>
        <p className="note-messages-count">
          {note.messages ? note.messages.length : 0} сообщений
        </p>
      </div>
      <button className="delete-note-btn" onClick={handleDelete}>
        ×
      </button>
    </div>
  )
}

export default NoteCard