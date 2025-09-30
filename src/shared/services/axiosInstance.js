import axios from 'axios'

// Dynamic API URL based on environment
const getApiBaseUrl = () => {
  // If we're in development and accessing from network, use the current host
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return `http://${window.location.hostname}:8000/api`
  }
  // Default to localhost for local development
  return 'http://localhost:8000/api'
}

const API_BASE_URL = getApiBaseUrl()

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false
})

const refreshToken = async () => {
  const refreshTokenValue = window.localStorage.getItem('refreshToken')
  const response = await axios.post(`${API_BASE_URL}/authentication/refresh/`, {
    refresh: refreshTokenValue
  })
  return response.data.tokens.access
}

axiosInstance.interceptors.request.use(
  async config => {
    const accessToken = window.localStorage.getItem('accessToken')
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  error => Promise.reject(error)
)

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const accessToken = await refreshToken()
        window.localStorage.setItem('accessToken', accessToken)
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        // Refresh failed, redirect to login
        window.localStorage.removeItem('accessToken')
        window.localStorage.removeItem('refreshToken')
        window.localStorage.removeItem('userData')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
