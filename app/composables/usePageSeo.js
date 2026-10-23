export function usePageSeo({ title, description, path }) {
  const config = useRuntimeConfig()
  const base = String(config.public.siteUrl || '').replace(/\/+$/, '')
  const canonicalUrl = base && /^https?:\/\//.test(base) ? `${base}${path}` : null
  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogType: 'website',
    twitterCard: 'summary',
    ...(canonicalUrl ? { ogUrl: canonicalUrl } : {})
  })
  if (canonicalUrl) useHead({ link: [{ rel: 'canonical', href: canonicalUrl }] })
}
