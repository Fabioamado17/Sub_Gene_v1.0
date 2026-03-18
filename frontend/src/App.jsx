import { useState } from 'react'
import UploadArea from './components/UploadArea'
import ProgressStatus from './components/ProgressStatus'
import Tabs from './components/Tabs'
import { uploadMkv, embedSubtitles } from './services/api'
import styles from './App.module.css'

function App() {
  const [tab, setTab] = useState('generate')
  const [mkvFile, setMkvFile] = useState(null)
  const [srtFile, setSrtFile] = useState(null)
  const [status, setStatus] = useState('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState(null)

  function handleTabChange(newTab) {
    setTab(newTab)
    setMkvFile(null)
    setSrtFile(null)
    setStatus('idle')
    setError(null)
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  async function handleSubmit() {
    setStatus('uploading')
    setUploadProgress(0)
    setError(null)

    try {
      if (tab === 'generate') {
        const blob = await uploadMkv(mkvFile, (percent) => {
          setUploadProgress(percent)
          if (percent === 100) setStatus('processing')
        })
        downloadBlob(blob, 'legendas.srt')
      } else {
        const blob = await embedSubtitles(mkvFile, srtFile, (percent) => {
          setUploadProgress(percent)
          if (percent === 100) setStatus('processing')
        })
        downloadBlob(blob, 'video_legendado.mkv')
      }
      setStatus('done')
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Erro ao processar os ficheiros.')
      setStatus('idle')
    }
  }

  const isProcessing = status === 'uploading' || status === 'processing'
  const canSubmit = tab === 'generate' ? !!mkvFile : !!mkvFile && !!srtFile

  return (
    <div>
      <h1>Gerador de Legendas</h1>

      <Tabs active={tab} onChange={handleTabChange} />

      {tab === 'generate' && (
        <UploadArea
          key="generate-mkv"
          label="Arrasta um ficheiro .mkv para aqui"
          accept=".mkv"
          onFileSelect={setMkvFile}
          disabled={isProcessing}
        />
      )}

      {tab === 'embed' && (
        <>
          <UploadArea
            key="embed-mkv"
            label="Arrasta o ficheiro .mkv para aqui"
            accept=".mkv"
            onFileSelect={setMkvFile}
            disabled={isProcessing}
          />
          <div className={styles.separator}>+</div>
          <UploadArea
            key="embed-srt"
            label="Arrasta o ficheiro .srt para aqui"
            accept=".srt"
            onFileSelect={setSrtFile}
            disabled={isProcessing}
          />
        </>
      )}

      {canSubmit && status === 'idle' && (
        <button className={styles.submitBtn} onClick={handleSubmit}>
          {tab === 'generate' ? 'Gerar Legendas' : 'Incorporar Legendas'}
        </button>
      )}

      <ProgressStatus status={status} progress={uploadProgress} />

      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}

export default App
