import styles from './HomePage.module.css'

function HomePage({ onNavigate }) {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Gestão de Despesas</h1>
        <p className={styles.subtitle}></p>
      </div>

      <div className={styles.grid}>
        <button className={styles.card} onClick={() => onNavigate('casa')}>
          <span className={styles.cardIcon}>🏠</span>
          <h2 className={styles.cardTitle}>Casa</h2>
          <p className={styles.cardDesc}>
            Controla a iluminação e outros dispositivos da casa.
          </p>
        </button>
        <button className={styles.card} onClick={() => onNavigate('financas')}>
          <span className={styles.cardIcon}>📊</span>
          <h2 className={styles.cardTitle}>Finanças</h2>
          <p className={styles.cardDesc}>
            Saldo mensal e registo de ordenado.
          </p>
        </button>
        <button className={styles.card} onClick={() => onNavigate('movies')}>
          <span className={styles.cardIcon}>🎬</span>
          <h2 className={styles.cardTitle}>Filmes</h2>
          <p className={styles.cardDesc}>
            Gera legendas a partir de ficheiros .mkv ou incorpora um .srt existente.
          </p>
        </button>
      </div>
    </div>
  )
}

export default HomePage
