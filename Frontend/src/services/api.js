import axios from 'axios'

// Strip trailing slash from API base URL if provided
const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const API_URL = rawUrl.replace(/\/+$/, '')

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
})

// Attach Bearer token from localStorage for all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
