import { Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'

function Header() {
  const { user, logout, isAuthenticated } = useAuth()

  return (
    <header className="app-header">
      <Link to="/" className="header-title">
        SynthNote
      </Link>
      <nav className="header-nav">
        {isAuthenticated ? (
          <>
            <span className="user-info">Привет, {user?.full_name || user?.email}</span>
            <button onClick={logout} className="logout-button">
              Выйти
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Войти</Link>
            <Link to="/register" className="nav-link register">Регистрация</Link>
          </>
        )}
      </nav>
    </header>
  )
}

export default Header