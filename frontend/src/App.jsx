import { useState, useEffect } from 'react'
import Nav from './components/Nav'
import HomePage from './pages/HomePage'
import MoviesPage from './pages/MoviesPage'
import CasaPage from './pages/CasaPage'

function App() {
  const [page, setPage] = useState('home')
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') ?? 'light'
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  function toggleTheme() {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'))
  }

  return (
    <>
      <Nav page={page} onNavigate={setPage} theme={theme} onToggleTheme={toggleTheme} />
      {page === 'home'   && <HomePage onNavigate={setPage} />}
      {page === 'casa'   && <CasaPage />}
      {page === 'movies' && <MoviesPage />}
    </>
  )
}

export default App
