import tailwindcss from '@tailwindcss/vite'

// Google allows site ownership verification via the google-adsense-account meta tag.
// Ads are NOT loaded unless ENABLE_LIVE_ADS=true is set explicitly after site approval
// and after the operator has configured appropriate consent/privacy settings.
const adsenseClient = String(process.env.NUXT_PUBLIC_ADSENSE_CLIENT_ID || '').trim()
const validAdSenseClient = /^ca-pub-\d{16}$/.test(adsenseClient)
const liveAdsEnabled = validAdSenseClient && process.env.NUXT_PUBLIC_ENABLE_LIVE_ADS === 'true'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  vite: { plugins: [tailwindcss()] },
  runtimeConfig: {
    public: {
      siteUrl: '',
      contactEmail: '',
      adsenseClientId: '',
      enableLiveAds: false
    }
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: [
        '/', '/merge-pdf', '/guides', '/about', '/contact', '/privacy-policy', '/terms',
        '/guides/how-to-merge-pdf', '/guides/is-online-pdf-merging-safe',
        '/guides/organize-pdf-files', '/guides/fix-pdf-merge-problems',
        '/guides/choose-pdf-order'
      ]
    }
  },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#f8fafc' },
        ...(validAdSenseClient ? [{ name: 'google-adsense-account', content: adsenseClient }] : [])
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap' }
      ],
      script: liveAdsEnabled ? [
        { async: true, src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`, crossorigin: 'anonymous' }
      ] : []
    }
  }
})
