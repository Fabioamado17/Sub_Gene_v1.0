import axios from 'axios'

const BASE_URL = 'http://localhost:8000'

export async function uploadMkv(file, onProgress) {
  const formData = new FormData()
  formData.append('file', file)

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
