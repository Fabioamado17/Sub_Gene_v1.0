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

export async function getAguaEntries() {
  const response = await axios.get(`${BASE_URL}/agua`)
  return response.data
}

export async function addAguaEntry(date, value) {
  const response = await axios.post(`${BASE_URL}/agua`, { date, value })
  return response.data
}

export async function deleteAguaEntry(id) {
  await axios.delete(`${BASE_URL}/agua/${id}`)
}

export async function getGasEntries() {
  const response = await axios.get(`${BASE_URL}/gas`)
  return response.data
}

export async function addGasEntry(date, value) {
  const response = await axios.post(`${BASE_URL}/gas`, { date, value })
  return response.data
}

export async function deleteGasEntry(id) {
  await axios.delete(`${BASE_URL}/gas/${id}`)
}

export async function getPrestacaoEntries() {
  const response = await axios.get(`${BASE_URL}/prestacao`)
  return response.data
}

export async function addPrestacaoEntry(date, value) {
  const response = await axios.post(`${BASE_URL}/prestacao`, { date, value })
  return response.data
}

export async function deletePrestacaoEntry(id) {
  await axios.delete(`${BASE_URL}/prestacao/${id}`)
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
