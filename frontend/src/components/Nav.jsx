import styles from './Nav.module.css'

function Nav({ page, onNavigate, theme, onToggleTheme }) {
  return (
    <nav className={styles.nav}>
      <button className={styles.brand} onClick={() => onNavigate('home')}>
        Gestão Fábio
      </button>
      <div className={styles.right}>
        <button
          className={`${styles.link} ${page === 'casa' ? styles.active : ''}`}
          onClick={() => onNavigate('casa')}
        >
          Casa
        </button>
        <button
          className={`${styles.link} ${page === 'movies' ? styles.active : ''}`}
          onClick={() => onNavigate('movies')}
        >
          Filmes
        </button>
        <button className={styles.themeBtn} onClick={onToggleTheme} title="Alternar tema">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </nav>
  )
}

export default Nav
