export default {
  loginEndpoint: '/auth/login/',
  registerEndpoint: '/auth/register/',
  refreshEndpoint: '/auth/refresh/',
  logoutEndpoint: '/auth/logout/',

  tokenType: 'Bearer',

  storageTokenKeyName: 'accessToken',
  storageRefreshTokenKeyName: 'refreshToken'
}
