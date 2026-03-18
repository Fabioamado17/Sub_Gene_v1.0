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

export async function updateLuzEntry(id, date, value) {
  const response = await axios.patch(`${BASE_URL}/luz/${id}`, { date, value })
  return response.data
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

export async function updateAguaEntry(id, date, value) {
  const response = await axios.patch(`${BASE_URL}/agua/${id}`, { date, value })
  return response.data
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

export async function updateGasEntry(id, date, value) {
  const response = await axios.patch(`${BASE_URL}/gas/${id}`, { date, value })
  return response.data
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

export async function updatePrestacaoEntry(id, date, value) {
  const response = await axios.patch(`${BASE_URL}/prestacao/${id}`, { date, value })
  return response.data
}

export async function getTelevisaoEntries() {
  const response = await axios.get(`${BASE_URL}/televisao`)
  return response.data
}

export async function addTelevisaoEntry(date, value) {
  const response = await axios.post(`${BASE_URL}/televisao`, { date, value })
  return response.data
}

export async function deleteTelevisaoEntry(id) {
  await axios.delete(`${BASE_URL}/televisao/${id}`)
}

export async function updateTelevisaoEntry(id, date, value) {
  const response = await axios.patch(`${BASE_URL}/televisao/${id}`, { date, value })
  return response.data
}

export async function getOrdenadoEntries() {
  const response = await axios.get(`${BASE_URL}/ordenado`)
  return response.data
}

export async function addOrdenadoEntry(date, value) {
  const response = await axios.post(`${BASE_URL}/ordenado`, { date, value })
  return response.data
}

export async function updateOrdenadoEntry(id, date, value) {
  const response = await axios.patch(`${BASE_URL}/ordenado/${id}`, { date, value })
  return response.data
}

export async function deleteOrdenadoEntry(id) {
  await axios.delete(`${BASE_URL}/ordenado/${id}`)
}

export async function getComprasEntries() {
  const response = await axios.get(`${BASE_URL}/compras_entries`)
  return response.data
}

export async function addComprasEntry(date, store, value) {
  const response = await axios.post(`${BASE_URL}/compras_entries`, { date, store, value })
  return response.data
}

export async function updateComprasEntry(id, date, store, value) {
  const response = await axios.patch(`${BASE_URL}/compras_entries/${id}`, { date, store, value })
  return response.data
}

export async function deleteComprasEntry(id) {
  await axios.delete(`${BASE_URL}/compras_entries/${id}`)
}

export async function getCompras() {
  const response = await axios.get(`${BASE_URL}/compras`)
  return response.data
}

export async function addCompra(name, quantity) {
  const response = await axios.post(`${BASE_URL}/compras`, { name, quantity })
  return response.data
}

export async function toggleCompra(id) {
  const response = await axios.patch(`${BASE_URL}/compras/${id}/toggle`)
  return response.data
}

export async function deleteCompra(id) {
  await axios.delete(`${BASE_URL}/compras/${id}`)
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
