import { useState } from 'react'
import UploadArea from './components/UploadArea'
import ProgressStatus from './components/ProgressStatus'
import { uploadMkv } from './services/api'
import styles from './App.module.css'

function App() {
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState(null)

  async function handleSubmit() {
    if (!file) return

    setStatus('uploading')
    setUploadProgress(0)
    setError(null)

    try {
      const blob = await uploadMkv(file, (percent) => {
        setUploadProgress(percent)
        if (percent === 100) setStatus('processing')
      })

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'legendas.srt'
      link.click()
      URL.revokeObjectURL(url)

      setStatus('done')
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Erro ao processar o ficheiro.')
      setStatus('idle')
    }
  }

  const isProcessing = status === 'uploading' || status === 'processing'

  return (
    <div>
      <h1>Gerador de Legendas</h1>
      <UploadArea onFileSelect={setFile} disabled={isProcessing} />

      {file && status === 'idle' && (
        <button className={styles.submitBtn} onClick={handleSubmit}>
          Gerar Legendas
        </button>
      )}

      <ProgressStatus status={status} progress={uploadProgress} />

      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}

export default App
