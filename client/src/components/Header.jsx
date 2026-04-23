import { Link } from 'react-router-dom'

function Header() {
  return (
    <header className="app-header">
      <Link to="/" className="header-title">
        SynthNote
      </Link>
    </header>
  )
}

export default Header