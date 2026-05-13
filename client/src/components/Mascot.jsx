export default function Mascot({ state = 'idle' }) {
  const mouth =
    state === 'correct' ? (
      <path d="M 50 88 Q 60 98 70 88" stroke="#1B1B1B" strokeWidth="3" fill="none" strokeLinecap="round" />
    ) : state === 'incorrect' ? (
      <path d="M 50 92 Q 60 82 70 92" stroke="#1B1B1B" strokeWidth="3" fill="none" strokeLinecap="round" />
    ) : (
      <path d="M 52 90 L 68 90" stroke="#1B1B1B" strokeWidth="3" strokeLinecap="round" />
    )

  const eyes =
    state === 'correct' ? (
      <>
        <path d="M 44 58 Q 48 54 52 58" stroke="#1B1B1B" strokeWidth="3" fill="none" />
        <path d="M 68 58 Q 72 54 76 58" stroke="#1B1B1B" strokeWidth="3" fill="none" />
      </>
    ) : state === 'incorrect' ? (
      <>
        <line x1="44" y1="54" x2="52" y2="62" stroke="#1B1B1B" strokeWidth="3" strokeLinecap="round" />
        <line x1="52" y1="54" x2="44" y2="62" stroke="#1B1B1B" strokeWidth="3" strokeLinecap="round" />
        <line x1="68" y1="54" x2="76" y2="62" stroke="#1B1B1B" strokeWidth="3" strokeLinecap="round" />
        <line x1="76" y1="54" x2="68" y2="62" stroke="#1B1B1B" strokeWidth="3" strokeLinecap="round" />
      </>
    ) : (
      <>
        <circle cx="48" cy="58" r="5" fill="#1B1B1B" />
        <circle cx="72" cy="58" r="5" fill="#1B1B1B" />
      </>
    )

  return (
    <svg viewBox="0 0 120 140" className="h-36 w-28 shrink-0" aria-hidden>
      <ellipse cx="60" cy="22" rx="10" ry="36" fill="#2a2a3a" />
      <ellipse cx="60" cy="22" rx="6" ry="30" fill="#1F1935" />
      <ellipse cx="100" cy="22" rx="10" ry="36" fill="#2a2a3a" />
      <ellipse cx="100" cy="22" rx="6" ry="30" fill="#1F1935" />
      <rect x="28" y="32" width="64" height="72" rx="28" fill="#f5f5f5" stroke="#313767" strokeWidth="2" />
      {eyes}
      {mouth}
      <rect x="40" y="100" width="40" height="10" rx="4" fill="#9199D8" opacity="0.6" />
    </svg>
  )
}
