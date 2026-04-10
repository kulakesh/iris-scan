const appConfig = {
    apiPrefix: import.meta.env.VITE_APP_API_URL,
    authenticatedEntryPath: '/home',
    unAuthenticatedEntryPath: '/initiate',
    locale: 'en',
    accessTokenPersistStrategy: 'cookies',
    enableMock: true,
    activeNavTranslation: false,
}

export default appConfig
