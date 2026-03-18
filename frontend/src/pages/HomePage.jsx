import styles from './HomePage.module.css'

function HomePage({ onNavigate }) {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Gestão Fábio</h1>
        <p className={styles.subtitle}>
          Gera e incorpora legendas nos teus filmes de forma rápida e local.
        </p>
      </div>

      <div className={styles.grid}>
        <button className={styles.card} onClick={() => onNavigate('casa')}>
          <span className={styles.cardIcon}>🏠</span>
          <h2 className={styles.cardTitle}>Casa</h2>
          <p className={styles.cardDesc}>
            Controla a iluminação e outros dispositivos da casa.
          </p>
          <span className={styles.cardArrow}>→</span>
        </button>
        <button className={styles.card} onClick={() => onNavigate('movies')}>
          <span className={styles.cardIcon}>🎬</span>
          <h2 className={styles.cardTitle}>Filmes</h2>
          <p className={styles.cardDesc}>
            Gera legendas a partir de ficheiros .mkv ou incorpora um .srt existente.
          </p>
          <span className={styles.cardArrow}>→</span>
        </button>
      </div>
    </div>
  )
}

export default HomePage
