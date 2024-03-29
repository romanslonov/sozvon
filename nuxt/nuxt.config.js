export default {
  // Target (https://go.nuxtjs.dev/config-target)
  target: 'server',

  // Global page headers (https://go.nuxtjs.dev/config-head)
  head: {
    title: 'Sozvon – Group voice & video chat',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Video and audio calls from anywhere in the world. Created for group calls.' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.png' }
    ]
  },

  // Global CSS (https://go.nuxtjs.dev/config-css)
  css: [
  ],

  // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
  plugins: [
  ],

  // Auto import components (https://go.nuxtjs.dev/config-components)
  components: true,

  // Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
    // https://go.nuxtjs.dev/tailwindcss
    '@nuxtjs/tailwindcss'
  ],

  // Modules (https://go.nuxtjs.dev/config-modules)
  modules: [
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa'
  ],

  // Build Configuration (https://go.nuxtjs.dev/config-build)
  build: {
  },
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost'
  },
  publicRuntimeConfig: {
    SOCKET_HOST: process.env.SOCKET_HOST || 'http://localhost:4000',
    ICE_CONFIG: {
      iceTransportPolicy: 'all',
      reconnectTimer: 3000,
      iceServers: [
        { urls: 'stun:stun.sozvon.co:5349' },
        {
          urls: 'turn:turn.sozvon.co:5349',
          username: process.env.TURN_USERNAME,
          credential: process.env.TURN_PASSWORD
        }
      ]
    }
  },
  loading: {
    color: '#2a47e4'
  },
  pwa: {
    meta: {
      ogTitle: 'Sozvon – Group voice & video chat'
    }
  }
}
