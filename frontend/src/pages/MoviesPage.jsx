import { useState, useEffect, useCallback } from 'react'
import UploadArea from '../components/UploadArea'
import ProgressStatus from '../components/ProgressStatus'
import FileList from '../components/FileList'
import LanguageSelect from '../components/LanguageSelect'
import { uploadMkv, embedSubtitles, getFiles, deleteFile } from '../services/api'
import styles from './MoviesPage.module.css'

const CARDS = [
  { id: 'generate', label: 'Gerar Legendas',      icon: '🎙️', desc: 'Gera um ficheiro .srt a partir de um vídeo .mkv usando reconhecimento de voz.' },
  { id: 'embed',    label: 'Incorporar Legendas',  icon: '🎬', desc: 'Incorpora um ficheiro .srt existente num vídeo .mkv.' },
]

function MoviesPage() {
  const [section, setSection] = useState(null)
  const [mkvFile, setMkvFile] = useState(null)
  const [srtFile, setSrtFile] = useState(null)
  const [status, setStatus] = useState('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState(null)
  const [language, setLanguage] = useState('pt')
  const [files, setFiles] = useState([])

  const fetchFiles = useCallback(async () => {
    try { setFiles(await getFiles()) } catch {}
  }, [])

  useEffect(() => { fetchFiles() }, [fetchFiles])

  function handleBack() {
    setSection(null)
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
      if (section === 'generate') {
        const blob = await uploadMkv(mkvFile, language, (percent) => {
          setUploadProgress(percent)
          if (percent === 100) setStatus('processing')
        })
        downloadBlob(blob, blob.name ?? 'legendas.srt')
      } else {
        const blob = await embedSubtitles(mkvFile, srtFile, (percent) => {
          setUploadProgress(percent)
          if (percent === 100) setStatus('processing')
        })
        downloadBlob(blob, blob.name ?? 'video_legendado.mkv')
      }
      setStatus('done')
      fetchFiles()
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Erro ao processar os ficheiros.')
      setStatus('idle')
    }
  }

  async function handleDelete(filename) {
    try {
      await deleteFile(filename)
      setFiles((prev) => prev.filter((f) => f.name !== filename))
    } catch {
      setError('Erro ao apagar o ficheiro.')
    }
  }

  const isProcessing = status === 'uploading' || status === 'processing'
  const canSubmit = section === 'generate' ? !!mkvFile : !!mkvFile && !!srtFile

  if (section) {
    const card = CARDS.find((c) => c.id === section)
    return (
      <div className={styles.page}>
        <div className={styles.sectionHeader}>
          <button className={styles.backBtn} onClick={handleBack}>← Filmes</button>
          <h1 className={styles.title}>{card.icon} {card.label}</h1>
        </div>

        {section === 'generate' && (
          <>
            <UploadArea
              key="generate-mkv"
              label="Arrasta um ficheiro .mkv para aqui"
              accept=".mkv"
              onFileSelect={setMkvFile}
              disabled={isProcessing}
            />
            <LanguageSelect value={language} onChange={setLanguage} disabled={isProcessing} />
          </>
        )}

        {section === 'embed' && (
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
            {section === 'generate' ? 'Gerar Legendas' : 'Incorporar Legendas'}
          </button>
        )}

        <ProgressStatus status={status} progress={uploadProgress} />
        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.filesSection}>
          <h2 className={styles.filesTitle}>Ficheiros gerados</h2>
          <FileList files={files} onDelete={handleDelete} />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Filmes</h1>
      <div className={styles.grid}>
        {CARDS.map((card) => (
          <button key={card.id} className={styles.card} onClick={() => setSection(card.id)}>
            <span className={styles.cardIcon}>{card.icon}</span>
            <span className={styles.cardTitle}>{card.label}</span>
            <span className={styles.cardDesc}>{card.desc}</span>
          </button>
        ))}
      </div>

      <div className={styles.filesSection}>
        <h2 className={styles.filesTitle}>Ficheiros gerados</h2>
        <FileList files={files} onDelete={handleDelete} />
      </div>
    </div>
  )
}

export default MoviesPage
