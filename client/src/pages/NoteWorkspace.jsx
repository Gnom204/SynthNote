import { useCallback, useEffect, useState, useRef } from 'react'
import { NavLink, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import apiClient from '../apiClient'

export default function NoteWorkspace() {
  const { noteId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const isQuizRoute = /\/notes\/[^/]+\/quiz\/?$/.test(location.pathname)
  const [note, setNote] = useState(null)
  const [list, setList] = useState([])
  const [error, setError] = useState(null)
  const fileRef = useRef(null)

  const reload = useCallback(async () => {
    const [n, l] = await Promise.all([apiClient.getNote(noteId), apiClient.listNotes()])
    setNote(n)
    setList(l)
  }, [noteId])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await reload()
        setError(null)
      } catch (e) {
        if (!cancelled) setError(e.message || 'Ошибка')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [reload])

  const onAddPdf = async (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    try {
      const n = await apiClient.uploadPdf(f)
      navigate(`/notes/${n.id}`)
    } catch (ex) {
      alert(ex.message)
    }
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-sn-gradient px-6 text-snText">
        <p className="mb-4">{error}</p>
        <button type="button" className="rounded-full bg-white px-6 py-2 text-primary" onClick={() => navigate('/')}>
          На главную
        </button>
      </div>
    )
  }

  if (!note) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sn-gradient text-snText">
        Загрузка…
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sn-gradient px-3 pb-6 pt-4 md:px-8 md:pb-10 md:pt-6">
      <header className="mb-4 flex items-center justify-between md:mb-6">
        <button type="button" onClick={() => navigate('/')} className="text-lg font-semibold text-snText">
          SynthNote
        </button>
      </header>

      <div className="flex flex-col gap-4 lg:flex-row">
        <aside className="flex min-h-[50vh] w-full flex-col rounded-2xl border border-white/10 bg-sidebar/90 p-4 backdrop-blur lg:min-h-[70vh] lg:w-[min(30%,320px)] lg:shrink-0">
          <div className="mb-4 flex items-center gap-2">
            <NavLink
              to={`/notes/${note.id}`}
              end
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium ${isActive ? 'bg-accent text-snText' : 'text-snText/80'}`
              }
            >
              Конспект
            </NavLink>
            <NavLink
              to={`/notes/${note.id}/quiz`}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium ${isActive ? 'bg-accent text-snText' : 'text-snText/80'}`
              }
            >
              Quiz
            </NavLink>
            <span className="ml-auto text-snText/40">▣</span>
          </div>

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="mb-4 w-full rounded-xl border border-dashed border-white/30 py-3 text-sm text-snText/90"
          >
            Добавить источник
          </button>
          <input ref={fileRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={onAddPdf} />

          <div className="mb-4 max-h-64 space-y-2 overflow-y-auto rounded-xl border border-white/10 p-2">
            {list.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(`/notes/${item.id}`)}
                className={`flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left text-sm ${
                  item.id === note.id ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
              >
                <span className="shrink-0 text-snText/60">📄</span>
                <span className="line-clamp-2 text-snText">{item.title}</span>
              </button>
            ))}
          </div>

          {isQuizRoute ? (
            <NavLink
              to={`/notes/${note.id}`}
              className="mt-auto w-full rounded-full bg-accent py-3 text-center text-sm font-semibold text-snText"
            >
              Конспект
            </NavLink>
          ) : (
            <NavLink
              to={`/notes/${note.id}/quiz`}
              className="mt-auto w-full rounded-full bg-accent py-3 text-center text-sm font-semibold text-snText"
            >
              Quiz
            </NavLink>
          )}
        </aside>

        <section className="min-h-[60vh] flex-1 overflow-hidden rounded-2xl border border-white/10 bg-snDark shadow-xl">
          <Outlet context={{ note, list, reload }} />
        </section>
      </div>

    </div>
  )
}
