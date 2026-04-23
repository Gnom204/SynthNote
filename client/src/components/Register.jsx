import { useState } from 'react'
import { Link } from 'react-router-dom'

function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      alert('Пароли не совпадают')
      return
    }
    // TODO: Implement registration logic
    console.log('Register:', { name, email, password })
  }

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Регистрация</h1>
            <p>Создайте новый аккаунт</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">Имя</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ваше имя"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Пароль</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Придумайте пароль"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Подтвердите пароль</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Повторите пароль"
                required
              />
            </div>

            <button type="submit" className="auth-button">
              Зарегистрироваться
            </button>
          </form>

          <div className="auth-footer">
            <p>Уже есть аккаунт? <Link to="/login">Войти</Link></p>
          </div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-right-content">
          <h2>Добро пожаловать!</h2>
          <p>Присоединяйтесь к сообществу Synth Note</p>
        </div>
      </div>
    </div>
  )
}

export default Register