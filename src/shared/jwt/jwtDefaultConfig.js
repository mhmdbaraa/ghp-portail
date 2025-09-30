export default {
  loginEndpoint: '/authentication/login/',
  registerEndpoint: '/authentication/register/',
  refreshEndpoint: '/authentication/refresh/',
  logoutEndpoint: '/authentication/logout/',

  tokenType: 'Bearer',

  storageTokenKeyName: 'accessToken',
  storageRefreshTokenKeyName: 'refreshToken'
}
