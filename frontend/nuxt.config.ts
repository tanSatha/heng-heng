// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  modules: ['@nuxt/ui', '@pinia/nuxt'],
  app: {
    head: {
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800;900&display=swap',
        },
      ],
    },
  },

  runtimeConfig: {
    public: {
      supabase: {
        url: process.env.SUPABASE_URL,
        key: process.env.SUPABASE_KEY,
      },
      apiBase: process.env.API_BASE || 'http://localhost:4000',
    },
  },
  future: {
    compatibilityVersion: 4,
  },
  css: ['~/assets/css/main.css'],
  build: {
    transpile: ['v-calendar', '@popperjs/core']
  }
})
