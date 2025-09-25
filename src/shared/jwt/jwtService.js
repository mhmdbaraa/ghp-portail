import axiosInstance from '../services/axiosInstance'
import jwtDefaultConfig from './jwtDefaultConfig'

export default class JwtService {
  constructor(jwtOverrideConfig) {
    this.jwtConfig = { ...jwtDefaultConfig, ...(jwtOverrideConfig || {}) }
    this.isAlreadyFetchingAccessToken = false
    this.subscribers = []

    axiosInstance.interceptors.request.use(
      config => {
        const accessToken = this.getToken()
        if (accessToken) {
          config.headers.Authorization = `${this.jwtConfig.tokenType} ${accessToken}`
        }
        return config
      },
      error => Promise.reject(error)
    )

    axiosInstance.interceptors.response.use(
      response => response,
      error => {
        const { config, response } = error
        const originalRequest = config
        if (response && response.status === 401) {
          if (!this.isAlreadyFetchingAccessToken) {
            this.isAlreadyFetchingAccessToken = true
            this.refreshToken().then(r => {
              this.isAlreadyFetchingAccessToken = false
              this.setToken(r.data.accessToken)
              this.setRefreshToken(r.data.refreshToken)
              this.onAccessTokenFetched(r.data.accessToken)
            })
          }
          const retryOriginalRequest = new Promise(resolve => {
            this.addSubscriber(accessToken => {
              originalRequest.headers.Authorization = `${this.jwtConfig.tokenType} ${accessToken}`
              resolve(axiosInstance(originalRequest))
            })
          })
          return retryOriginalRequest
        }
        return Promise.reject(error)
      }
    )
  }

  onAccessTokenFetched(accessToken) {
    this.subscribers = this.subscribers.filter(callback => callback(accessToken))
  }

  addSubscriber(callback) {
    this.subscribers.push(callback)
  }

  getToken() {
    return localStorage.getItem(this.jwtConfig.storageTokenKeyName)
  }

  getRefreshToken() {
    return localStorage.getItem(this.jwtConfig.storageRefreshTokenKeyName)
  }

  setToken(value) {
    localStorage.setItem(this.jwtConfig.storageTokenKeyName, value)
  }

  setRefreshToken(value) {
    localStorage.setItem(this.jwtConfig.storageRefreshTokenKeyName, value)
  }

  login(data) {
    return axiosInstance.post(this.jwtConfig.loginEndpoint, data)
  }

  register(data) {
    return axiosInstance.post(this.jwtConfig.registerEndpoint, data)
  }

  logout() {
    return axiosInstance.post(this.jwtConfig.logoutEndpoint)
  }

  refreshToken() {
    return axiosInstance.post(this.jwtConfig.refreshEndpoint, {
      refresh: this.getRefreshToken()
    })
  }
}
