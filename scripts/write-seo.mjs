import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const output = join(process.cwd(), '.output', 'public')
await mkdir(output, { recursive: true })
const routes = [
  '/', '/tools', '/merge-pdf', '/split-pdf', '/jpg-to-pdf', '/rotate-pdf', '/organize-pdf', '/guides', '/about', '/contact', '/privacy-policy', '/terms',
  '/guides/how-to-merge-pdf', '/guides/is-online-pdf-merging-safe',
  '/guides/organize-pdf-files', '/guides/fix-pdf-merge-problems', '/guides/choose-pdf-order'
]
const raw = (process.env.NUXT_PUBLIC_SITE_URL || '').trim()
let origin
try {
  if (raw) {
    const url = new URL(raw)
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Invalid protocol')
    origin = url.origin
  }
} catch {
  throw new Error('NUXT_PUBLIC_SITE_URL must be a complete HTTPS website URL, for example https://yourdomain.com')
}
const robots = ['User-agent: *', 'Allow: /']
if (origin) {
  const escapeXml = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map(path => `  <url><loc>${escapeXml(origin + path)}</loc></url>`).join('\n')}\n</urlset>\n`
  await writeFile(join(output, 'sitemap.xml'), sitemap)
  robots.push(`Sitemap: ${origin}/sitemap.xml`)
  console.log(`Created sitemap for ${origin}`)
} else {
  console.warn('No NUXT_PUBLIC_SITE_URL configured. Sitemap omitted; set real domain before production launch.')
}
await writeFile(join(output, 'robots.txt'), robots.join('\n') + '\n')
