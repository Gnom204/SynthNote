import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import Dashboard from './pages/Dashboard'
import SignUp from './pages/SignUp'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import NoteWorkspace from './pages/NoteWorkspace'
import NotePanel from './pages/NotePanel'
import QuizPanel from './pages/QuizPanel'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/notes/:noteId" element={<NoteWorkspace />}>
            <Route index element={<NotePanel />} />
            <Route path="quiz" element={<QuizPanel />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
