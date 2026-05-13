import { NavLink, useOutletContext, useParams } from 'react-router-dom'
import Quiz from '../components/Quiz'

export default function QuizPanel() {
  const { note } = useOutletContext()
  const { noteId } = useParams()
  const questions = note?.quizzes?.[0]?.questions ?? []

  return (
    <div className="flex h-full min-h-[60vh] flex-col">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 md:hidden">
        <NavLink to={`/notes/${noteId}`} className="text-sm text-accent">
          ← Конспект
        </NavLink>
      </div>
      <Quiz questions={questions} />
      <div className="mt-auto border-t border-white/10 p-4">
        <NavLink
          to={`/notes/${noteId}`}
          className="flex w-full items-center justify-center rounded-full bg-sidebar py-3 text-center text-sm font-semibold text-snText lg:bg-accent"
        >
          Конспект
        </NavLink>
      </div>
    </div>
  )
}
