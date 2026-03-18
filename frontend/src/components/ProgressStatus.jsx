import styles from './ProgressStatus.module.css'

function ProgressStatus({ status, progress }) {
  if (status === 'idle') return null

  return (
    <div className={styles.wrapper}>
      {status === 'uploading' && (
        <>
          <p className={styles.label}>A carregar... {progress}%</p>
          <div className={styles.barTrack}>
            <div className={styles.barFill} style={{ width: `${progress}%` }} />
          </div>
        </>
      )}

      {status === 'processing' && (
        <>
          <p className={styles.label}>A processar com Whisper...</p>
          <div className={styles.barTrack}>
            <div className={`${styles.barFill} ${styles.indeterminate}`} />
          </div>
        </>
      )}

      {status === 'done' && (
        <p className={`${styles.label} ${styles.success}`}>
          Legendas geradas! O download iniciou automaticamente.
        </p>
      )}

      {status === 'error' && null}
    </div>
  )
}

export default ProgressStatus
