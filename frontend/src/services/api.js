import axios from 'axios'

const BASE_URL = 'http://localhost:8000'

export async function uploadMkv(file, language, onProgress) {
  const formData = new FormData()
  formData.append('file', file)
  if (language && language !== 'auto') {
    formData.append('language', language)
  }

  const response = await axios.post(`${BASE_URL}/upload`, formData, {
    responseType: 'blob',
    onUploadProgress: (event) => {
      if (event.total) {
        const percent = Math.round((event.loaded / event.total) * 100)
        onProgress(percent)
      }
    },
  })

  return response.data
}

export async function getFiles() {
  const response = await axios.get(`${BASE_URL}/files`)
  return response.data
}

export async function deleteFile(filename) {
  await axios.delete(`${BASE_URL}/files/${encodeURIComponent(filename)}`)
}

export async function getLuzEntries() {
  const response = await axios.get(`${BASE_URL}/luz`)
  return response.data
}

export async function addLuzEntry(date, value) {
  const response = await axios.post(`${BASE_URL}/luz`, { date, value })
  return response.data
}

export async function deleteLuzEntry(id) {
  await axios.delete(`${BASE_URL}/luz/${id}`)
}

export async function embedSubtitles(mkv, srt, onProgress) {
  const formData = new FormData()
  formData.append('mkv', mkv)
  formData.append('srt', srt)

  const response = await axios.post(`${BASE_URL}/embed`, formData, {
    responseType: 'blob',
    onUploadProgress: (event) => {
      if (event.total) {
        const percent = Math.round((event.loaded / event.total) * 100)
        onProgress(percent)
      }
    },
  })

  return response.data
}
