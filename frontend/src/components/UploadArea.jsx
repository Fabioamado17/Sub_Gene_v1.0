import { useState, useRef } from 'react'
import styles from './UploadArea.module.css'

function UploadArea({ onFileSelect, disabled = false, accept = '.mkv', label = 'Arrasta um ficheiro para aqui' }) {
  const [dragging, setDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  function validateAndSelect(file) {
    const ext = accept.replace('.', '')
    if (!file.name.toLowerCase().endsWith(accept)) {
      setError(`Apenas ficheiros .${ext} são suportados.`)
      setSelectedFile(null)
      onFileSelect(null)
      return
    }
    setError(null)
    setSelectedFile(file)
    onFileSelect(file)
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (file) validateAndSelect(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) validateAndSelect(file)
  }

  function handleDragOver(e) {
    e.preventDefault()
    setDragging(true)
  }

  function handleDragLeave() {
    setDragging(false)
  }

  return (
    <div
      className={`${styles.area} ${dragging ? styles.dragging : ''} ${disabled ? styles.disabled : ''}`}
      onClick={() => !disabled && inputRef.current.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className={styles.hiddenInput}
        onChange={handleFileChange}
      />

      {selectedFile ? (
        <p className={styles.filename}>{selectedFile.name}</p>
      ) : (
        <>
          <p className={styles.instruction}>{label}</p>
          <p className={styles.or}>ou clica para selecionar</p>
        </>
      )}

      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}

export default UploadArea
