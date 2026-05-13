import { useCallback, useEffect, useRef, useState } from 'react'
import Mascot from './Mascot'

const REACTION_MS = 2000

export default function Quiz({ questions }) {
  const [index, setIndex] = useState(0)
  const [mascotState, setMascotState] = useState('idle')
  const [selectedOption, setSelectedOption] = useState(null)
  const [locked, setLocked] = useState(false)
  const timeoutRef = useRef(null)

  const q = questions[index]

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const goNext = useCallback(() => {
    setMascotState('idle')
    setSelectedOption(null)
    setLocked(false)
    setIndex((i) => {
      if (i + 1 >= questions.length) return 0
      return i + 1
    })
  }, [questions.length])

  const handlePick = (optionIndex) => {
    if (locked || !q) return
    setLocked(true)
    setSelectedOption(optionIndex)

    const isCorrect = optionIndex === q.correct_index

    /* Здесь при клике по варианту ответа: переключить маскота с idle на correct (верно) или incorrect (неверно) — это триггер для визуальной реакции перед следующим шагом. */
    setMascotState(isCorrect ? 'correct' : 'incorrect')

    /* После REACTION_MS мс сбросить idle и перейти к следующему вопросу (или зациклить список). */
    timeoutRef.current = setTimeout(() => {
      goNext()
    }, REACTION_MS)
  }

  if (!q) {
    return <p className="text-center text-snText/70">Нет вопросов для этого конспекта.</p>
  }

  return (
    <div className="flex flex-1 flex-col items-center px-6 py-8">
      <p className="mb-2 text-xs text-snText/50">Конспект</p>
      <h2 className="mb-6 max-w-2xl text-center text-lg font-medium text-snText md:text-xl">{q.question}</h2>

      <div className="mb-8 flex justify-center">
        <Mascot state={mascotState} />
      </div>

      <div className="grid w-full max-w-lg grid-cols-2 gap-4">
        {q.options.map((opt, i) => {
          let cls = 'bg-sidebar hover:bg-sidebar/80'
          if (locked) {
            if (i === q.correct_index) cls = 'bg-accent'
            else if (selectedOption === i) cls = 'bg-red-900/50'
            else cls = 'bg-sidebar/60'
          } else if (selectedOption === i) cls = 'bg-accent'
          return (
            <button
              key={i}
              type="button"
              disabled={locked}
              onClick={() => handlePick(i)}
              className={`rounded-2xl border border-white/10 px-4 py-6 text-center text-lg font-medium text-snText transition ${cls}`}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}
