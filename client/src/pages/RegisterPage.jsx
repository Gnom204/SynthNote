import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import apiClient from '../apiClient'
import { useAuth } from '../AuthContext'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [err, setErr] = useState('')
  const [pending, setPending] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    setPending(true)
    try {
      const tokens = await apiClient.register(email, password, fullName)
      login(tokens.access_token)
      navigate('/')
    } catch (ex) {
      setErr(ex.message || 'Ошибка')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-sn-gradient">
      <div className="flex flex-1 flex-col bg-[#EFEFEF] px-6 py-10 md:rounded-r-3xl md:px-12 md:py-16">
        <Link to="/" className="mb-6 text-sm font-medium text-primary">
          ← На главную
        </Link>
        <div className="mx-auto w-full max-w-md flex-1">
          <h1 className="mb-2 text-2xl font-bold text-black">Регистрация</h1>
          <p className="mb-8 text-sm text-muted">Создайте аккаунт SynthNote</p>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-black">Имя</label>
              <input
                className="w-full rounded-xl border border-[#D1D1D1] bg-white px-4 py-3 text-black outline-none focus:border-primary"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-black">Email</label>
              <input
                type="email"
                required
                className="w-full rounded-xl border border-[#D1D1D1] bg-white px-4 py-3 text-black outline-none focus:border-primary"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-black">Пароль</label>
              <input
                type="password"
                required
                minLength={8}
                className="w-full rounded-xl border border-[#D1D1D1] bg-white px-4 py-3 text-black outline-none focus:border-primary"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            {err && <p className="text-sm text-red-600">{err}</p>}
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-full bg-primary py-3.5 font-semibold text-white disabled:opacity-60"
            >
              {pending ? '…' : 'Зарегистрироваться'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-muted">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="font-semibold text-primary underline">
              Войти
            </Link>
          </p>
        </div>
      </div>
      <div className="relative hidden flex-1 items-center justify-center md:flex">
        <p className="select-none text-[12rem] font-black text-white/15">SN</p>
      </div>
    </div>
  )
}
