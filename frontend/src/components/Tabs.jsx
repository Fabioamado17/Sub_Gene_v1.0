import styles from './Tabs.module.css'

function Tabs({ active, onChange }) {
  const tabs = [
    { id: 'generate', label: 'Gerar Legendas' },
    { id: 'embed',    label: 'Incorporar Legendas' },
  ]

  return (
    <div className={styles.tabs}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`${styles.tab} ${active === tab.id ? styles.active : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default Tabs
