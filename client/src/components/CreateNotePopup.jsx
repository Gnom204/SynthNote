import { useState } from 'react'
import './CreateNotePopup.css'

function CreateNotePopup({ onClose, onCreate }) {
  const [title, setTitle] = useState('')

  const [imagePreview, setImagePreview] = useState(null)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (title.trim()) {
      const imageUrl = imagePreview || null
      onCreate(title.trim(), imageUrl)
      setTitle('')
      setImagePreview(null)
    }
  }

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <h2>Создать новый конспект</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="note-title">Название конспекта</label>
            <input
              id="note-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите название..."
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="note-image">Изображение (опционально)</label>
            <input
              id="note-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
          </div>
          <div className="popup-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Отмена
            </button>
            <button type="submit" className="create-btn">
              Создать
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateNotePopup