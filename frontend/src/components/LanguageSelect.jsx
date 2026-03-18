import styles from './LanguageSelect.module.css'

const LANGUAGES = [
  { code: 'auto', label: 'Detecção automática' },
  { code: 'pt',   label: 'Português' },
  { code: 'en',   label: 'Inglês' },
  { code: 'es',   label: 'Espanhol' },
  { code: 'fr',   label: 'Francês' },
  { code: 'de',   label: 'Alemão' },
  { code: 'it',   label: 'Italiano' },
  { code: 'ja',   label: 'Japonês' },
  { code: 'zh',   label: 'Chinês' },
  { code: 'ru',   label: 'Russo' },
  { code: 'ar',   label: 'Árabe' },
]

function LanguageSelect({ value, onChange, disabled }) {
  return (
    <div className={styles.wrapper}>
      <label className={styles.label} htmlFor="language-select">
        Idioma do áudio
      </label>
      <select
        id="language-select"
        className={styles.select}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default LanguageSelect
