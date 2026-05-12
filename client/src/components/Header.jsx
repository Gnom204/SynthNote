import { Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'

function Header() {
  const { user, logout, isAuthenticated } = useAuth()

  return (
    <header className="app-header">
      <div className="header-content">
        <Link to="/" className="header-title">
          <span className="logo-icon">📝</span>
          SynthNote
        </Link>
        <nav className="header-nav">
          {isAuthenticated ? (
            <>
              <div className="user-info">
                <span className="user-avatar">👤</span>
                <span className="user-greeting">
                  {user?.full_name ? `Привет, ${user.full_name}` : `Привет, ${user?.email}`}
                </span>
              </div>
              <button onClick={logout} className="logout-button">
                <span className="logout-icon">🚪</span>
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link login-link">
                <span className="login-icon">🔐</span>
                Войти
              </Link>
              <Link to="/register" className="nav-link register register-link">
                <span className="register-icon">✨</span>
                Регистрация
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header