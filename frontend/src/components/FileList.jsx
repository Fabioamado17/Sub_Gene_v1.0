import styles from './FileList.module.css'

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FileList({ files, onDelete }) {
  if (files.length === 0) {
    return <p className={styles.empty}>Nenhum ficheiro gerado ainda.</p>
  }

  return (
    <ul className={styles.list}>
      {files.map((file) => (
        <li key={file.name} className={styles.item}>
          <div className={styles.info}>
            <span className={styles.name}>{file.name}</span>
            <span className={styles.meta}>{file.created_at} &middot; {formatSize(file.size)}</span>
          </div>
          <button className={styles.deleteBtn} onClick={() => onDelete(file.name)}>
            Apagar
          </button>
        </li>
      ))}
    </ul>
  )
}

export default FileList
