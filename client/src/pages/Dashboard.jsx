import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../apiClient'
import { useAuth } from '../AuthContext'

function ruDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return ''
  }
}

function greetingName(user) {
  if (user?.full_name) return user.full_name.split(/\s+/)[0]
  if (user?.email) return user.email.split('@')[0]
  return ''
}

function greetingPrefix() {
  const h = new Date().getHours()
  if (h < 12) return 'Доброе утро'
  if (h < 18) return 'Добрый день'
  return 'Добрый вечер'
}

export default function Dashboard() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const navigate = useNavigate()
  const [notes, setNotes] = useState([])
  const [loadError, setLoadError] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  const loadNotes = useCallback(async () => {
    if (!isAuthenticated) return
    setLoadError(null)
    try {
      const data = await apiClient.listNotes()
      setNotes(data)
    } catch (e) {
      setLoadError(e.message)
    }
  }, [isAuthenticated])

  useEffect(() => {
    loadNotes()
  }, [loadNotes])

  const onCreateClick = () => {
    if (!isAuthenticated) {
      navigate('/signup')
      return
    }
    fileRef.current?.click()
  }

  const onFile = async (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      alert('Нужен файл PDF')
      return
    }
    setUploading(true)
    try {
      const note = await apiClient.uploadPdf(f)
      navigate(`/notes/${note.id}`)
    } catch (err) {
      alert(err.message || 'Ошибка загрузки')
    } finally {
      setUploading(false)
    }
  }

  const onOpenNote = (id) => navigate(`/notes/${id}`)

  const onDeleteNote = async (e, id) => {
    e.stopPropagation()
    if (!confirm('Удалить конспект?')) return
    try {
      await apiClient.deleteNote(id)
      loadNotes()
    } catch (err) {
      alert(err.message)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sn-gradient text-snText">
        Загрузка…
      </div>
    )
  }

  const name = greetingName(user)

  return (
    <div className="min-h-screen bg-sn-gradient px-4 pb-16 pt-6 md:px-10 md:pt-8">
      <header className="mb-10 flex items-center justify-between">
        <span className="text-xl font-semibold tracking-tight text-snText">SynthNote</span>
        {isAuthenticated ? (
          <button
            type="button"
            onClick={async () => {
              await logout()
              navigate('/')
            }}
            className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs text-snText"
          >
            Выйти
          </button>
        ) : (
          <button type="button" onClick={() => navigate('/login')} className="text-sm text-snText underline">
            Войти
          </button>
        )}
      </header>

      <h1 className="mb-2 text-2xl font-bold text-snText md:text-3xl">
        {greetingPrefix()}
        {name ? ` ${name}` : ''}
      </h1>

      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-snText">Ваши конспекты</h2>
        <button
          type="button"
          onClick={onCreateClick}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-full bg-snText px-5 py-2.5 text-sm font-semibold text-primary shadow-lg disabled:opacity-60"
        >
          {uploading ? '…' : '+ Создать'}
        </button>
      </div>

      <input ref={fileRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={onFile} />

      {loadError && <p className="mb-4 text-sm text-red-200">{loadError}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <button
          type="button"
          onClick={onCreateClick}
          className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-white/20 bg-white/10 p-6 text-snText backdrop-blur transition hover:bg-white/15"
        >
          <span className="mb-3 flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-white/40 text-3xl">
            +
          </span>
          <span className="font-medium">Создать конспект</span>
        </button>

        {isAuthenticated &&
          notes.map((n) => (
            <div
              key={n.id}
              role="button"
              tabIndex={0}
              onClick={() => onOpenNote(n.id)}
              onKeyDown={(ev) => ev.key === 'Enter' && onOpenNote(n.id)}
              className="group relative min-h-[200px] cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-snDark shadow-lg"
            >
              <div
                className="absolute inset-0 bg-gradient-to-br from-primary/40 to-sidebar/80"
                style={{ backgroundImage: 'radial-gradient(circle at 30% 20%, #9199D8 0%, transparent 50%)' }}
              />
              <button
                type="button"
                className="absolute left-2 top-2 rounded-md bg-black/30 px-2 py-1 text-snText opacity-0 transition group-hover:opacity-100"
                onClick={(e) => onDeleteNote(e, n.id)}
              >
                ⋮
              </button>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
                <p className="font-semibold text-snText">{n.title}</p>
                <p className="text-xs text-snText/70">{ruDate(n.created_at)}</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
