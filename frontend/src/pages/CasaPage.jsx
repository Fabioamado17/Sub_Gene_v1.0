import { useState } from 'react'
import styles from './CasaPage.module.css'

const TABS = [
  { id: 'luz', label: 'Luz' },
]

function CasaPage() {
  const [tab, setTab] = useState('luz')

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Casa</h1>

      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`${styles.tab} ${tab === t.id ? styles.active : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'luz' && (
        <div className={styles.content}>
          {/* conteúdo da aba Luz */}
        </div>
      )}
    </div>
  )
}

export default CasaPage
