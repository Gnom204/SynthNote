import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useOutletContext } from 'react-router-dom'

export default function NotePanel() {
  const { note } = useOutletContext()

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8">
      <h1 className="mb-6 text-2xl font-bold text-snText md:text-3xl">{note.title}</h1>
      <article className="markdown-body max-w-3xl space-y-4 leading-relaxed text-snText/90 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-4 [&_h3]:text-lg [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-3 [&_ul]:list-disc [&_ul]:pl-6">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.summary}</ReactMarkdown>
      </article>
    </div>
  )
}
