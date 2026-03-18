import { useState } from 'react'
import UploadArea from './components/UploadArea'
import { uploadMkv } from './services/api'

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

  return (
    <div>
      <h1>Gerador de Legendas</h1>
      <UploadArea onFileSelect={setFile} />

      {file && status === 'idle' && (
        <button onClick={handleSubmit}>Gerar Legendas</button>
      )}

      {status === 'uploading' && <p>A carregar... {uploadProgress}%</p>}
      {status === 'processing' && <p>A processar com Whisper...</p>}
      {status === 'done' && <p>Legendas geradas! O download iniciou automaticamente.</p>}

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}

export default App
